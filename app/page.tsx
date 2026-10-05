import Link from "next/link";
import type { CSSProperties } from "react";
import { createClient } from "@/lib/supabase/server";

const COLORS = ["#ff5a5f", "#ffc93c", "#2ec4b6", "#a78bfa", "#ff9f1c"];

export default async function Home() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: items, error } = await supabase
        .from("helloworld")
        .select("*")
        .order("id");

    return (
        <div style={{ padding: "2rem", maxWidth: "640px", margin: "0 auto" }}>
            <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
                {user ? (
                    <Link href="/dashboard">Dashboard</Link>
                ) : (
                    <Link href="/login">Prove you&apos;re not a raccoon</Link>
                )}
            </div>

            <h1 style={{ fontSize: "2.4rem", marginBottom: "0.5rem" }}>
                Welcome to the Funny Business
            </h1>
            <p style={{ marginBottom: "2rem", fontSize: "1.1rem" }}>
                Please laugh responsibly. Rules apply.
            </p>

            {error && <p>Error loading data: {error.message}</p>}

            <ul style={{ listStyle: "none", padding: 0 }}>
                {items?.map((item, index) => (
                    <li
                        key={item.id}
                        className="rule-card"
                        style={{ "--accent": COLORS[index % COLORS.length] } as CSSProperties}
                    >
                        <h2 style={{ fontSize: "1.2rem", margin: 0 }}>{item.name}</h2>
                        <p style={{ margin: "0.5rem 0 0" }}>{item.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}