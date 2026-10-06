'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function VoteButtons({
                                        jokeId,
                                        initialScore,
                                        initialVote,
                                    }: {
    jokeId: number
    initialScore: number
    initialVote: number
}) {
    const supabase = createClient()
    const router = useRouter()
    const [score, setScore] = useState(initialScore)
    const [vote, setVote] = useState(initialVote)
    const [error, setError] = useState('')

    const cast = async (value: 1 | -1) => {
        if (value === vote) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }
        const { error } = await supabase
            .from('joke_votes')
            .upsert(
                { joke_id: jokeId, user_id: user.id, value },
                { onConflict: 'joke_id,user_id' }
            )
        if (error) {
            setError(error.message)
            return
        }
        setScore(score - vote + value)
        setVote(value)
        setError('')
        router.refresh()
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.8rem' }}>
            <button className={`vote-btn ${vote === 1 ? 'active' : ''}`} onClick={() => cast(1)}>
                🤣 Ha!
            </button>
            <strong>{score}</strong>
            <button className={`vote-btn ${vote === -1 ? 'active' : ''}`} onClick={() => cast(-1)}>
                😐 Not feeling it
            </button>
            {error && <span>{error}</span>}
        </div>
    )
}