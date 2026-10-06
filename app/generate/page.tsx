import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { createClient } from '@/lib/supabase/server'
import GenerateForm from './GenerateForm'
import VoteButtons from './VoteButtons'

const COLORS = ['#ff5a5f', '#ffc93c', '#2ec4b6', '#a78bfa', '#ff9f1c']

type Vote = { value: number; user_id: string }

export default async function GeneratePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: jokes } = await supabase
        .from('jokes')
        .select('id, topic, content, created_at, joke_votes(value, user_id)')
        .order('created_at', { ascending: false })
        .limit(20)

    return (
        <div style={{ padding: '2rem', maxWidth: '560px', margin: '0 auto' }}>
            <Link href="/">← Home</Link>
            <h1 style={{ fontSize: '2rem', margin: '1rem 0 1.5rem' }}>Jake Lab</h1>
            <GenerateForm />

            <h2 style={{ fontSize: '1.5rem', margin: '2.5rem 0 1rem' }}>Fresh from the lab</h2>
            {(!jokes || jokes.length === 0) && <p>No jokes yet. Be the first.</p>}

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {jokes?.map((joke, index) => {
                    const votes = (joke.joke_votes ?? []) as Vote[]
                    const score = votes.reduce((sum, v) => sum + v.value, 0)
                    const mine = votes.find((v) => v.user_id === user.id)?.value ?? 0
                    return (
                        <li
                            key={joke.id}
                            className="rule-card"
                            style={{ '--accent': COLORS[index % COLORS.length] } as CSSProperties}
                        >
                            <small>Topic: {joke.topic}</small>
                            <p style={{ margin: '0.5rem 0 0' }}>{joke.content}</p>
                            <VoteButtons jokeId={joke.id} initialScore={score} initialVote={mine} />
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}