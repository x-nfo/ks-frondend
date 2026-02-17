import { type DocumentNode } from "graphql";
import { GraphQLClient } from "graphql-request";
import { getSdk } from "../generated/graphql";
import { getSession, commitSession } from "../sessions";
import { getApiUrl } from "../constants";

export interface QueryOptions {
    request: Request;
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

// Temporary implementation until codegen runs
const requester = async <R, V>(
    doc: DocumentNode,
    vars?: V,
    options?: { headers?: Headers; request?: Request }
): Promise<R & { _headers: Headers }> => {
    const customHeaders = await getHeaders(options?.request);
    if (options?.headers) {
        options.headers.forEach((value, key) => {
            customHeaders.set(key, value);
        });
    }

    const client = new GraphQLClient(getApiUrl(), {
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

        return { ...response.data, _headers: resHeaders };
    });
};

export const sdk = getSdk<QueryOptions>(requester);
