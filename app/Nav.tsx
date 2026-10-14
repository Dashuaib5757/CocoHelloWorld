import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Nav() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <nav className="site-nav">
            <div className="site-nav-links">
                <Link href="/">🏠 Home</Link>
                <Link href="/ocean">🌊 Joke Ocean</Link>
                <Link href="/generate">🧪 Jake Lab</Link>
            </div>
            <div className="site-nav-links">
                {user ? (
                    <>
                        <Link href="/profile">👤 Profile</Link>
                        <Link href="/dashboard">Dashboard</Link>
                    </>
                ) : (
                    <Link href="/login">Log in</Link>
                )}
            </div>
        </nav>
    )
}