'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const CURSOR_OPTIONS = [
    { value: 'default', label: '🖱️ Default' },
    { value: 'sparkle', label: '✨ Sparkle' },
    { value: 'cat', label: '🐱 Cat' },
    { value: 'pixel', label: '👾 Pixel Arrow' },
]

export default function ProfilePage() {
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [cursorStyle, setCursorStyle] = useState('default')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url, cursor_style')
                .eq('id', user.id)
                .single()

            if (data) {
                setFirstName(data.first_name || '')
                setLastName(data.last_name || '')
                setCursorStyle(data.cursor_style || 'default')
                setAvatarUrl(data.avatar_url)
            }
            setLoading(false)
        }
        loadProfile()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        setMessage('')

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        let newAvatarUrl = avatarUrl

        if (avatarFile) {
            const filePath = `${user.id}/avatar`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, { upsert: true, contentType: avatarFile.type })

            if (uploadError) {
                setMessage(`Upload error: ${uploadError.message}`)
                setSaving(false)
                return
            }

            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            newAvatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                first_name: firstName,
                last_name: lastName,
                cursor_style: cursorStyle,
                avatar_url: newAvatarUrl,
            })
            .eq('id', user.id)

        setSaving(false)

        if (error) {
            setMessage(`Error: ${error.message}`)
        } else {
            setMessage('Saved!')
            setAvatarUrl(newAvatarUrl)
            router.push('/dashboard')
        }
    }

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '480px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
                Hold up. Who even are you?
            </h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                By continuing, you agree to be mildly known by this website.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Legal-ish first name
                </label>
                <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Last Name
                </label>
                <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Upload photographic evidence you exist
                </label>
                {avatarUrl && (
                    <img
                        src={avatarUrl}
                        alt="avatar"
                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.5rem' }}
                    />
                )}
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Choose your weapon
                </label>
                <select
                    value={cursorStyle}
                    onChange={(e) => setCursorStyle(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                    {CURSOR_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#111',
                    color: 'white',
                    cursor: 'pointer',
                }}
            >
                {saving ? 'Saving...' : 'Save profile'}
            </button>

            {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
        </div>
    )
}