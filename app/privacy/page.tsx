export const metadata = {
    title: 'Privacy Policy | Joke Ocean',
}

export default function PrivacyPage() {
    return (
        <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
            <div className="rule-card" style={{ '--accent': '#2ec4b6' } as React.CSSProperties}>
                <h1 style={{ marginTop: 0 }}>Privacy Policy</h1>
                <p>Last updated: October 14, 2026</p>
                <p>
                    Joke Ocean is a student class project. This page explains, in plain words, what
                    the site does with your information.
                </p>

                <h2>What we collect</h2>
                <ul>
                    <li>Your name, email address and profile picture from Google when you sign in.</li>
                    <li>The details you add yourself: first name, last name, photo, crew and cursor choice.</li>
                    <li>The topics you type, the jokes and memes generated from them, and your votes.</li>
                </ul>

                <h2>How we use it</h2>
                <ul>
                    <li>To log you in and show your profile.</li>
                    <li>To generate jokes and memes and to rank them in the Joke Ocean.</li>
                    <li>To count votes and show the crew standings.</li>
                </ul>

                <h2>Who sees it</h2>
                <p>
                    Jokes, memes, topics, crew badges and vote totals are visible to anyone who visits
                    the site. Your email address is not shown to other visitors. We do not sell your
                    information.
                </p>

                <h2>Services we use</h2>
                <p>
                    Your data is stored with Supabase. Topics you type are sent to Google Gemini and
                    Cloudflare Workers AI to create jokes and images. Hosting is provided by Vercel.
                </p>

                <h2>Deleting your data</h2>
                <p>
                    To have your account and content deleted, email cocochen2357@gmail.com and we will
                    remove it.
                </p>
            </div>
        </main>
    )
}