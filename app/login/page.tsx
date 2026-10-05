'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const supabase = createClient()

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Welcome</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Sign in to continue</p>
            <button
                onClick={handleLogin}
                style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    background: 'white',
                    cursor: 'pointer',
                }}
            >
                Sign in with Google
            </button>
        </div>
    )
}
