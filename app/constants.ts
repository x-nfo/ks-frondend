export const APP_META_TITLE = "Vendure React Router Storefront";
export const APP_META_DESCRIPTION =
    "A headless commerce storefront starter kit built with React Router & Vendure";
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
