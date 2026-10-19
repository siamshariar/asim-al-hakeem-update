export const date = (date) => {
    const d = new Date(date)
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
    const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d)
    const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d)

    let formatted = `${mo} ${da}, ${ye}`
    return formatted
};

export const youtubeViews = (value) => {
    const count = Number(value);
    if (!Number.isFinite(count) || count < 0) {
        return "0";
    }

    return new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: count >= 1000 ? 1 : 0,
    }).format(count);
};

// YouTube titles end with the channel name and sometimes a flag emoji
export const cleanVideoTitle = (title = "") =>
    String(title)
        .replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, "")
        .replace(/\s*\|\|\s*assim al ?hakeem\s*$/i, "")
        .replace(/\s+assim al ?hakeem\s*$/i, "")
        .replace(/\s{2,}/g, " ")
        .trim();
