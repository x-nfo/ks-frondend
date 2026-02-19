import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";

export async function action({ request, context }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return data({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context?.cloudflare?.env as any;
    const secret = env?.CACHE_PURGE_SECRET;
    const authHeader = request.headers.get("Authorization");

    if (!secret || authHeader !== `Bearer ${secret}`) {
        return data({ error: "Unauthorized" }, { status: 401 });
    }

    const kv = env?.KV_CACHE as KVNamespace | undefined;
    if (!kv) {
        return data({ error: "KV not available" }, { status: 500 });
    }

    try {
        let deletedCount = 0;
        let cursor: string | undefined;

        do {
            const listResult = await kv.list({ prefix: "gql_cache_", cursor, limit: 1000 });
            await Promise.all(listResult.keys.map(key => kv.delete(key.name)));
            deletedCount += listResult.keys.length;
            cursor = listResult.list_complete ? undefined : listResult.cursor;
        } while (cursor);

        return data({ success: true, purgedKeys: deletedCount });
    } catch (error: any) {
        console.error("Cache purge error:", error);
        return data({ error: "Failed to purge cache" }, { status: 500 });
    }
}
