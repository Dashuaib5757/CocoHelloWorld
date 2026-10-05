const EMOJI: Record<string, string> = {
    sparkle: '✨',
    cat: '🐱',
    pixel: '👾',
}

export function applyCursor(style: string | null | undefined) {
    const id = 'custom-cursor-style'
    document.getElementById(id)?.remove()

    const emoji = style ? EMOJI[style] : undefined
    if (!emoji) return

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><text y="26" font-size="26">${emoji}</text></svg>`
    const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}") 4 4, auto`

    const el = document.createElement('style')
    el.id = id
    el.textContent = `*, *::before, *::after { cursor: ${url} !important; }`
    document.head.appendChild(el)
}