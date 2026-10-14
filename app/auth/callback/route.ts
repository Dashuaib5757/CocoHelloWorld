import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // After login, land in the Joke Ocean (only allow paths on this site)
    const requested = searchParams.get('next') ?? '/ocean'
    const next = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/ocean'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('first_name, last_name')
                    .eq('id', user.id)
                    .single()

                // Names missing? Send them to the "Who even are you?" form
                if (!profile?.first_name || !profile?.last_name) {
                    return NextResponse.redirect(`${origin}/profile`)
                }
            }
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    return NextResponse.redirect(`${origin}/login`)
}