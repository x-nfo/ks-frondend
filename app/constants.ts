export const APP_META_TITLE = "Karima";
export const APP_META_TAGLINE = "Faithfully Beautiful";
export const APP_META_DESCRIPTION =
    "Karima menghadirkan koleksi busana muslim syar'i premium yang memadukan kesantunan dan keanggunan. Temukan Abaya, khimar, dan set syar'i eksklusif di sini.";
export const DEMO_API_URL = "http://localhost:3000/shop-api";
export let API_URL =
    typeof process !== "undefined"
        ? process.env.VENDURE_API_URL ?? DEMO_API_URL
        : (typeof window !== "undefined" && (window as any).ENV?.VENDURE_API_URL)
        || DEMO_API_URL;

export function getApiUrl() {
    return API_URL;
}

export function setApiUrl(apiUrl: string) {
    API_URL = apiUrl;
}

export const COLOR_MAP: Record<string, string> = {
    black: "#000000",
    navy: "#373557",
    choco: "#a68483",
    almond: "#dbc5ba",
    wood: "#e4cacd",
    terracotta: "#99422f",
    "dusty pink": "#ca7f86",
    olive: "#635b49",
    moss: "#988076",
    sage: "#ceb49c",
    tosca: "#a2a09e",
    jeans: "#6d85b8",
    blue: "#86a5ce",
    "light blue": "#d4e4f6",
    plum: "#714053",
    ruby: "#704052",
    "dark choco": "#522e28",
    "as grey": "#c2b7ba",
    "ash grey": "#c2b7ba",
    "dusty rose": "#c0576c",
    peach: "#bf847e",
    periwinkle: "#4c509d",
    "dark greyv": "#65636d",
    "rose wood": "#a14b5e",
    "electric blue": "#2f57a0",
    lilac: "#a688a4",
    "denim coconut": "#4d5c80",
    beige: "#d9c8a8",
    "navy steel": "#2e324d",
    mauve: "#786d75",
    "errplant": "#6c6298",
    "steel blue": "#49659f",
    moca: "#b89f86",
    "sky blue": "#7d91b3",
    "pearl grey": "#97a6bb",
};
