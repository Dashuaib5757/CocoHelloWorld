import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import VoteButtons from '../generate/VoteButtons'

type Vote = { value: number; user_id: string }

// What share of the funny (or unfunny) jokes make it to the very top (or bottom).
const TOP_SHARE = 0.3

const CREW_INFO: Record<string, { emoji: string; name: string }> = {
    octopus: { emoji: '🐙', name: 'Octopus' },
    pufferfish: { emoji: '🐡', name: 'Pufferfish' },
    shark: { emoji: '🦈', name: 'Shark' },
    jellyfish: { emoji: '🪼', name: 'Jellyfish' },
    crab: { emoji: '🦀', name: 'Crab' },
}

const ZONES = [
    {
        key: 'surface',
        emoji: '☀️',
        title: 'The Surface',
        note: 'The funniest jokes, ranked',
        depth: '0 m',
        color: '#0b3954',
        empty: 'Nobody has made it up here yet. Get a joke some 🤣 votes.',
    },
    {
        key: 'shallows',
        emoji: '🐠',
        title: 'The Shallows',
        note: 'Getting there',
        depth: '30 m',
        color: '#0b3954',
        empty: 'Quiet in the shallows.',
    },
    {
        key: 'twilight',
        emoji: '🌊',
        title: 'Twilight',
        note: 'Undecided. New jokes start here, so cast your vote',
        depth: '200 m',
        color: '#ffffff',
        empty: 'Every joke has been judged. Go make a new one.',
    },
    {
        key: 'midnight',
        emoji: '🌑',
        title: 'Midnight',
        note: 'Not feeling it',
        depth: '1,000 m',
        color: '#e8f6ff',
        empty: 'Nothing is sinking right now.',
    },
    {
        key: 'abyss',
        emoji: '🕳️',
        title: 'The Abyss',
        note: 'The very worst, ranked',
        depth: '4,000 m',
        color: '#e8f6ff',
        empty: 'The abyss is empty. For now.',
    },
]

export default async function OceanPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data } = await supabase
        .from('jokes')
        .select('id, topic, content, image_url, crew, created_at, joke_votes(value, user_id)')
        .order('created_at', { ascending: false })
        .limit(80)

    const jokes = (data ?? []).map((joke) => {
        const votes = (joke.joke_votes ?? []) as Vote[]
        const score = votes.reduce((sum, v) => sum + v.value, 0)
        const mine = user ? votes.find((v) => v.user_id === user.id)?.value ?? 0 : 0
        return { ...joke, score, mine }
    })

    // Rank everything: best score first, newest first when tied.
    const byBest = [...jokes].sort(
        (a, b) =>
            b.score - a.score ||
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    const positives = byBest.filter((j) => j.score > 0)
    const negatives = byBest.filter((j) => j.score < 0).reverse() // worst first

    const surfaceCount = positives.length ? Math.max(1, Math.ceil(positives.length * TOP_SHARE)) : 0
    const abyssCount = negatives.length ? Math.max(1, Math.ceil(negatives.length * TOP_SHARE)) : 0

    // Which zone does each joke belong to?
    const zoneOf = new Map<string | number, string>()
    jokes.forEach((j) => {
        if (j.score === 0) zoneOf.set(j.id, 'twilight')
    })
    positives.forEach((j, i) => zoneOf.set(j.id, i < surfaceCount ? 'surface' : 'shallows'))
    negatives.forEach((j, i) => zoneOf.set(j.id, i < abyssCount ? 'abyss' : 'midnight'))

    const standings = Object.entries(CREW_INFO)
        .map(([key, info]) => {
            const crewJokes = jokes.filter((j) => j.crew === key)
            return {
                key,
                ...info,
                count: crewJokes.length,
                points: crewJokes.reduce((sum, j) => sum + j.score, 0),
            }
        })
        .sort((a, b) => b.points - a.points || b.count - a.count)
    const maxPoints = Math.max(1, ...standings.map((s) => s.points))

    return (
        <div className="ocean">
            <div className="ocean-bg" />
            <div className="ocean-inner">
                <Link href="/">← Home</Link>
                <h1 style={{ fontSize: '2.6rem', margin: '1rem 0 0.4rem', color: '#0b3954' }}>
                    Joke Ocean
                </h1>
                <p style={{ margin: 0, color: '#0b3954', fontSize: '1.1rem' }}>
                    Vote 🤣 and a joke floats up. Vote 😐 and it sinks.
                </p>
                <p style={{ margin: '0.6rem 0 0' }}>
                    <Link href="/generate">Make a joke in the Jake Lab →</Link>
                    {!user && (
                        <>
                            {' · '}
                            <Link href="/login">Log in to vote</Link>
                        </>
                    )}
                </p>

                <div className="crew-board">
                    <h2>🏁 Crew standings</h2>
                    <ol>
                        {standings.map((c, i) => {
                            const pct = c.points > 0 ? Math.max(6, Math.round((c.points / maxPoints) * 100)) : 4
                            return (
                                <li key={c.key}>
                                    <div className="crew-row">
                                        <span>
                                            {i === 0 && c.points > 0 ? '👑' : `${i + 1}.`} {c.emoji} {c.name}
                                        </span>
                                        <span>
                                            {c.points} pts
                                            <small>
                                                {c.count} {c.count === 1 ? 'joke' : 'jokes'}
                                            </small>
                                        </span>
                                    </div>
                                    <div className="crew-track">
                                        <div className="crew-fill" style={{ width: `${pct}%` }} />
                                    </div>
                                </li>
                            )
                        })}
                    </ol>
                    <p className="crew-hint">
                        <Link href={user ? '/profile' : '/login'}>
                            {user ? 'Change your crew' : 'Log in to join a crew'}
                        </Link>
                    </p>
                </div>

                {ZONES.map((zone) => {
                    let inZone = byBest.filter((j) => zoneOf.get(j.id) === zone.key)
                    if (zone.key === 'abyss') inZone = [...inZone].reverse() // deepest first

                    return (
                        <section key={zone.key} className={`zone zone-${zone.key}`}>
                            <div className="zone-head" style={{ color: zone.color }}>
                                <h2 style={{ margin: 0, fontSize: '1.6rem', color: zone.color }}>
                                    {zone.emoji} {zone.title}
                                </h2>
                                <span className="zone-depth">{zone.depth} down · {zone.note}</span>
                            </div>

                            {inZone.length === 0 ? (
                                <div className="ocean-empty" style={{ color: zone.color }}>
                                    {zone.empty}
                                </div>
                            ) : (
                                <div className="zone-grid">
                                    {inZone.map((joke, i) => {
                                        const crew = joke.crew ? CREW_INFO[joke.crew as string] : null
                                        const rank = zone.key === 'surface' ? `#${i + 1} · ` : ''
                                        return (
                                            <div
                                                key={joke.id}
                                                className="ocean-card"
                                                style={{ animationDelay: `${(i % 5) * -1.2}s` }}
                                            >
                                                {joke.image_url && (
                                                    <img
                                                        src={joke.image_url}
                                                        alt={`Meme for the joke about ${joke.topic}`}
                                                        loading="lazy"
                                                        style={{
                                                            width: '100%',
                                                            aspectRatio: '1 / 1',
                                                            objectFit: 'cover',
                                                            borderRadius: 18,
                                                            display: 'block',
                                                            marginBottom: '0.7rem',
                                                        }}
                                                    />
                                                )}
                                                <div className="crew-badge">
                                                    {rank}
                                                    {crew ? `${crew.emoji} ${crew.name} crew` : '🫧 Drifter'}
                                                </div>
                                                <br />
                                                <small>Topic: {joke.topic}</small>
                                                <p style={{ margin: '0.4rem 0 0' }}>{joke.content}</p>
                                                <VoteButtons
                                                    jokeId={joke.id}
                                                    initialScore={joke.score}
                                                    initialVote={joke.mine}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </section>
                    )
                })}
            </div>
        </div>
    )
}