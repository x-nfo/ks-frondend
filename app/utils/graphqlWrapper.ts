import { type DocumentNode, print } from "graphql";
import { getSdk } from "../generated/graphql";
import { getSession, commitSession } from "../sessions";
import { getApiUrl } from "../constants";

export interface QueryOptions {
    request: Request;
}

export interface GraphqlResponse<Response> {
    errors: any[];
    data: Response;
}

export type WithHeaders<T> = T & { _headers: Headers };

const AUTH_TOKEN_SESSION_KEY = "authToken";

async function sendQuery<Response, Variables = {}>(options: {
    query: string;
    variables?: Variables;
    headers?: Headers;
    request?: Request;
}): Promise<GraphqlResponse<Response> & { headers: Headers }> {
    const headers = new Headers(options.headers);
    const req = options.request;
    headers.append("Content-Type", "application/json");

    if (req) {
        const cookieHeader = req.headers.get("Cookie");
        const session = await getSession(cookieHeader);
        const token = session.get(AUTH_TOKEN_SESSION_KEY);
        if (token) {
            headers.append("Authorization", `Bearer ${token}`);
        }
    }

    return fetch(getApiUrl(), {
        method: "POST",
        body: JSON.stringify({ query: options.query, variables: options.variables }),
        headers,
    }).then(async (res) => ({
        ...(await res.json()),
        headers: res.headers,
    }));
}

// Temporary implementation until codegen runs
const requester = async <R, V>(
    doc: DocumentNode,
    vars?: V,
    options?: { headers?: Headers; request?: Request }
): Promise<R & { _headers: Headers }> => {
    return sendQuery<R, V>({
        query: print(doc),
        variables: vars,
        ...options,
    }).then(async (response) => {
        const token = response.headers.get("vendure-auth-token");
        const headers = new Headers();
        if (token && options?.request) {
            const session = await getSession(options.request.headers.get("Cookie"));
            session.set(AUTH_TOKEN_SESSION_KEY, token);
            headers.set("Set-Cookie", await commitSession(session));
        }

        if (response.errors) {
            console.error("GraphQL Error:", JSON.stringify(response.errors, null, 2));
            throw new Error(JSON.stringify(response.errors[0]));
        }
        return { ...response.data, _headers: headers };
    });
};

export const sdk = getSdk<QueryOptions>(requester);
