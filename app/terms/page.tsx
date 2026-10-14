export const metadata = {
    title: 'Terms of Service | Joke Ocean',
}

export default function TermsPage() {
    return (
        <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
            <div className="rule-card" style={{ '--accent': '#a78bfa' } as React.CSSProperties}>
                <h1 style={{ marginTop: 0 }}>Terms of Service</h1>
                <p>Last updated: October 14, 2026</p>
                <p>
                    Joke Ocean is a student class project. By using it you agree to these simple terms.
                </p>

                <h2>Be kind</h2>
                <p>
                    Don&apos;t try to generate hateful, harassing or harmful content. We may remove any
                    joke, meme or account that breaks this rule.
                </p>

                <h2>AI-made content</h2>
                <p>
                    Jokes and images are created by AI and may be silly, wrong or not funny. Voting is how
                    the community decides what rises.
                </p>

                <h2>Limits</h2>
                <p>
                    There is a daily limit on how many jokes each person can generate. We may change or
                    stop the site at any time.
                </p>

                <h2>No warranty</h2>
                <p>
                    The site is provided as is, with no promises that it will always work or be available.
                </p>

                <h2>Contact</h2>
                <p>Questions? Email cocochen2357@gmail.com.</p>
            </div>
        </main>
    )
}