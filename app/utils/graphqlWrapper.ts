import { type DocumentNode } from "graphql";
import { GraphQLClient } from "graphql-request";
import { getSdk } from "../generated/graphql";
import { getSession, commitSession } from "../sessions";
import { getApiUrl } from "../constants";

export interface QueryOptions {
    request?: Request;
    kv?: KVNamespace;
    cacheTTL?: number; // In seconds
    apiUrl?: string; // Override API URL
    headers?: Headers;
}

export type WithHeaders<T> = T & { _headers: Headers };

const AUTH_TOKEN_SESSION_KEY = "authToken";

async function getHeaders(request?: Request): Promise<Headers> {
    const headers = new Headers();
    if (request) {
        const cookieHeader = request.headers.get("Cookie");
        const session = await getSession(cookieHeader);
        const token = session.get(AUTH_TOKEN_SESSION_KEY);
        if (token) {
            headers.append("Authorization", `Bearer ${token}`);
        }
    }
    return headers;
}

/**
 * Simple hash function for cache keys
 */
function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

const requester = async <R, V extends object>(
    doc: DocumentNode,
    vars?: V,
    options?: QueryOptions
): Promise<R & { _headers: Headers }> => {
    const customHeaders = await getHeaders(options?.request);
    if (options?.headers) {
        options.headers.forEach((value, key) => {
            customHeaders.set(key, value);
        });
    }

    // Determine if we should attempt caching
    // We only cache Queries, not Mutations. graphql-request DocNode has types but let's be safe.
    const isQuery = (doc.definitions[0] as any).operation === 'query';
    const kv = options?.kv;
    let cacheKey = "";

    if (isQuery && kv) {
        const queryStr = (doc.loc?.source.body || JSON.stringify(doc));
        cacheKey = `gql_cache_${hashString(queryStr + JSON.stringify(vars || {}))}`;

        try {
            const cached = await kv.get(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached) as R;
                const resHeaders = new Headers();
                resHeaders.set("X-Cache", "HIT");
                return { ...parsed, _headers: resHeaders };
            }
        } catch (e) {
            // Only log if it's not a noise error or if we're not in dev
            if (!(e instanceof Error && e.message.includes('fetch failed')) || !import.meta.env.DEV) {
                console.warn("KV Cache Read Error:", e);
            }
        }
    }

    const client = new GraphQLClient(options?.apiUrl || getApiUrl(), {
        headers: customHeaders,
    });

    return client.rawRequest<R, V>(doc as any, vars as any).then(async (response) => {
        const token = response.headers.get("vendure-auth-token");
        const resHeaders = new Headers();

        // Pass through all response headers
        response.headers.forEach((v, k) => resHeaders.set(k, v));

        if (token && options?.request) {
            const session = await getSession(options.request.headers.get("Cookie"));
            session.set(AUTH_TOKEN_SESSION_KEY, token);
            resHeaders.set("Set-Cookie", await commitSession(session));
        }

        if (response.errors) {
            console.error("GraphQL Error:", JSON.stringify(response.errors, null, 2));
            throw new Error(JSON.stringify(response.errors[0]));
        }

        // Store in cache if appropriate
        if (isQuery && kv && cacheKey) {
            try {
                // Default TTL 1 hour if not specified
                const ttl = options?.cacheTTL || 3600;
                await kv.put(cacheKey, JSON.stringify(response.data), { expirationTtl: ttl });
                resHeaders.set("X-Cache", "MISS (Wrote to Cache)");
            } catch (e) {
                console.warn("KV Cache Write Error:", e);
            }
        }

        return { ...response.data, _headers: resHeaders };
    });
};

export const sdk = getSdk<QueryOptions>(requester as any);
