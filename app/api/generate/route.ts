import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'

const DAILY_LIMIT = 10

const FORMATS = [
    'a one-liner with a surprising twist at the end',
    'a setup and punchline, where the punchline is a double meaning',
    'a deadpan observation that is painfully true',
    'an exaggeration so extreme it becomes absurd',
]

function buildPrompt(topic: string, format: string) {
    return `You are a sharp stand-up comedy writer. Write ONE joke about: "${topic}".
Format: ${format}.

Rules for the joke:
- Under 22 words. One clear idea. A double meaning or a twist.
- Joke about situations and objects, never about types of people.
- No complaining, no meanness, nothing offensive.
- Audience: college students in New York City.

Then write a picture prompt for a funny cartoon illustration that goes with the joke:
- Describe a single simple scene with one clear subject.
- Colorful cartoon style.
- No real people, no famous characters or brands.
- Do NOT put any words or letters in the picture.

Reply with ONLY valid JSON in exactly this shape:
{"joke": "the joke text", "image_prompt": "the picture description"}`
}

async function askGemini(prompt: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const models = [
        process.env.GEMINI_MODEL || 'gemini-3.5-flash',
        process.env.GEMINI_FALLBACK_MODEL,
    ].filter(Boolean) as string[]

    let lastError = ''
    for (const model of models) {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    contents: prompt,
                    config: { responseMimeType: 'application/json' },
                })
                const parsed = JSON.parse(response.text ?? '')
                if (typeof parsed.joke === 'string' && parsed.joke.trim()) {
                    return {
                        joke: parsed.joke.trim() as string,
                        imagePrompt: String(parsed.image_prompt ?? '').trim(),
                    }
                }
                lastError = 'The AI sent back an empty joke.'
            } catch (e) {
                lastError = e instanceof Error ? e.message : 'Unknown AI error'
                const retryable = /503|UNAVAILABLE|overloaded|high demand/i.test(lastError)
                if (!retryable) break
            }
        }
    }
    throw new Error(lastError)
}

async function makeMemeBytes(imagePrompt: string): Promise<Buffer | null> {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const token = process.env.CLOUDFLARE_API_TOKEN
    if (!accountId || !token || !imagePrompt) return null

    const fullPrompt = `${imagePrompt}. Colorful funny cartoon illustration, clean simple composition, no text, no words, no letters, no watermark, no signature.`

    try {
        const res = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: fullPrompt, steps: 4 }),
            }
        )
        if (!res.ok) return null
        const json = await res.json()
        const base64: string | undefined = json?.result?.image ?? json?.image
        if (!base64) return null
        return Buffer.from(base64, 'base64')
    } catch {
        return null
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Please log in first.' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const topic = String(body.topic ?? '').trim()
    if (topic.length < 2 || topic.length > 100) {
        return NextResponse.json(
            { error: 'Topic must be between 2 and 100 characters.' },
            { status: 400 }
        )
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await supabase
        .from('jokes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', since)
    if ((count ?? 0) >= DAILY_LIMIT) {
        return NextResponse.json(
            { error: `Daily limit reached (${DAILY_LIMIT} jokes per day). Come back tomorrow!` },
            { status: 429 }
        )
    }

    const format = FORMATS[Math.floor(Math.random() * FORMATS.length)]
    const prompt = buildPrompt(topic, format)

    let joke: string
    let imagePrompt: string
    try {
        const result = await askGemini(prompt)
        joke = result.joke
        imagePrompt = result.imagePrompt
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ error: `AI error: ${message}` }, { status: 500 })
    }

    // Meme picture: if anything goes wrong we still save the joke without one.
    let imageUrl: string | null = null
    const bytes = await makeMemeBytes(imagePrompt)
    if (bytes) {
        const path = `${user.id}/${Date.now()}.jpg`
        const { error: uploadError } = await supabase.storage
            .from('memes')
            .upload(path, bytes, { contentType: 'image/jpeg' })
        if (!uploadError) {
            imageUrl = supabase.storage.from('memes').getPublicUrl(path).data.publicUrl
        }
    }

    const { data, error } = await supabase
        .from('jokes')
        .insert({
            user_id: user.id,
            topic,
            prompt: `${prompt}\n\nIMAGE PROMPT: ${imagePrompt}`,
            content: joke,
            image_url: imageUrl,
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ joke: data })
}