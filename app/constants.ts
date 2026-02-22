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
