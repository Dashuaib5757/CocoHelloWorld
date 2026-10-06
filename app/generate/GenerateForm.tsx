'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GenerateForm() {
    const router = useRouter()
    const [topic, setTopic] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [done, setDone] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        setError('')
        setDone(false)
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Something went wrong.')
            } else {
                setDone(true)
                setTopic('')
                router.refresh()
            }
        } catch {
            setError('Network problem. Try again.')
        }
        setLoading(false)
    }

    return (
        <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Pick a topic
            </label>
            <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="the L train, midterms, pigeons..."
                style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem' }}
            />
            <button onClick={handleGenerate} disabled={loading || topic.trim().length < 2}>
                {loading ? 'Thinking...' : 'Make me a joke'}
            </button>

            {error && <p style={{ marginTop: '1rem' }}>{error}</p>}
            {done && <p style={{ marginTop: '1rem' }}>Done! Your joke is at the top of the feed below.</p>}
        </div>
    )
}