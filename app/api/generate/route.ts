import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'

const DAILY_LIMIT = 10

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Please log in first.' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const topic = typeof body.topic === 'string' ? body.topic.trim() : ''
    if (topic.length < 2 || topic.length > 100) {
        return NextResponse.json(
            { error: 'Topic must be between 2 and 100 characters.' },
            { status: 400 }
        )
    }

    // Protect the free AI quota: limit each user per day
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await supabase
        .from('jokes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', since)
    if ((count ?? 0) >= DAILY_LIMIT) {
        return NextResponse.json(
            { error: `Daily limit of ${DAILY_LIMIT} jokes reached. Come back tomorrow.` },
            { status: 429 }
        )
    }

    const formats = [
        'a question-and-answer pun, where the setup is a question and the punchline is a pun',
        'a deadpan one-liner with a surprise twist in the last few words',
        'a joke that starts "I told my..." and where the final word flips the meaning',
        'a two-line exchange between two characters where the second line is the punchline',
    ]
    const format = formats[Math.floor(Math.random() * formats.length)]

    const prompt = `You are a sharp stand-up comedy writer. The topic is: "${topic}".
Write the joke as ${format}.
Silently draft 5 versions, then output only the funniest one.
Rules:
- Under 22 words
- Build the joke on ONE clear idea or double meaning that links the setup to the punchline
- Someone reading it must understand why it is funny right away. Never combine unrelated ideas at random
- Prefer wordplay or a real everyday observation over absurd mashups
- No complaining, no scene-setting, and make fun of situations and objects, never of types of people
- Clean language
- The audience is college students in New York City
Output only the joke text.`

    let text: string | undefined
    const models = [
        process.env.GEMINI_MODEL || 'gemini-3.5-flash',
        process.env.GEMINI_FALLBACK_MODEL,
    ].filter(Boolean) as string[]

    let lastError = ''
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    for (const model of models) {
        for (let attempt = 0; attempt < 3 && !text; attempt++) {
            try {
                const response = await ai.models.generateContent({ model, contents: prompt })
                text = response.text?.trim()
            } catch (e) {
                lastError = e instanceof Error ? e.message : 'unknown error'
                const busy = lastError.includes('503') || lastError.includes('UNAVAILABLE')
                if (!busy) break
                await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
            }
        }
        if (text) break
    }

    if (!text) {
        return NextResponse.json(
            { error: lastError ? `AI error: ${lastError}` : 'The AI returned nothing. Try again.' },
            { status: 502 }
        )
    }

    const { data, error } = await supabase
        .from('jokes')
        .insert({ user_id: user.id, topic, prompt, content: text })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: `Save error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ joke: data })
}