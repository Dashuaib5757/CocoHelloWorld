import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', user.id)
        .single()

    const name = profile?.first_name || 'Mystery Guest'

    return (
        <div style={{ padding: '2rem', maxWidth: '520px', margin: '3rem auto', textAlign: 'center' }}>
            {profile?.avatar_url && (
                <img
                    src={profile.avatar_url}
                    alt="avatar"
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }}
                />
            )}
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                {name} has entered the building.
            </h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                Act natural. Everyone, act natural.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link
                    href="/profile"
                    style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '8px',
                        background: '#111',
                        color: 'white',
                        textDecoration: 'none',
                    }}
                >
                    Edit your file
                </Link>
                <LogoutButton />
            </div>
        </div>
    )
}