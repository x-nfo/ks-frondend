/**
 * Strips HTML tags from a string.
 */
export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, "").trim();
}

/**
 * Truncates a string to a specific length and adds an ellipsis if needed.
 */
export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + "...";
}
