import type { CSSProperties } from "react";

type Bubble = {
    content: string;
    left: number;
    size: number;
    duration: number;
    delay: number;
    text?: boolean;
};

const BUBBLES: Bubble[] = [
    { content: "🫧", left: 5, size: 70, duration: 22, delay: 0 },
    { content: "no sad faces", left: 12, size: 110, duration: 28, delay: 3, text: true },
    { content: "🐠", left: 22, size: 80, duration: 24, delay: 8 },
    { content: "🪼", left: 31, size: 90, duration: 30, delay: 1 },
    { content: "pun intended", left: 40, size: 105, duration: 26, delay: 12, text: true },
    { content: "🫧", left: 49, size: 60, duration: 20, delay: 5 },
    { content: "🐙", left: 58, size: 85, duration: 27, delay: 9 },
    { content: "snort responsibly", left: 67, size: 115, duration: 31, delay: 2, text: true },
    { content: "🐟", left: 76, size: 75, duration: 23, delay: 14 },
    { content: "ha.", left: 84, size: 80, duration: 21, delay: 6, text: true },
    { content: "🫧", left: 92, size: 65, duration: 25, delay: 10 },
    { content: "🦀", left: 17, size: 75, duration: 29, delay: 16 },
];

export default function Bubbles() {
    return (
        <div aria-hidden="true">
            {BUBBLES.map((b, i) => (
                <div
                    key={i}
                    className="bubble"
                    style={
                        {
                            left: `${b.left}%`,
                            width: b.size,
                            height: b.size,
                            animationDuration: `${b.duration}s`,
                            animationDelay: `-${b.delay}s`,
                            fontSize: b.text ? "0.8rem" : `${b.size * 0.5}px`,
                            fontWeight: b.text ? "bold" : "normal",
                        } as CSSProperties
                    }
                >
                    {b.content}
                </div>
            ))}
        </div>
    );
}
