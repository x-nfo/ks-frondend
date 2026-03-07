import type { QueryOptions } from "../../utils/graphqlWrapper";
import { gql } from "graphql-request";
import { GraphQLClient } from "graphql-request";
import { getApiUrl } from "../../constants";

const GET_SITE_SETTINGS = gql`
  query getSiteSettings {
    siteSettings {
      underConstruction
      countdownDate
    }
  }
`;

/**
 * Fetches siteSettings WITHOUT KV cache so that the under construction
 * toggle takes effect immediately on every request.
 */
export async function getSiteSettings(
  options?: QueryOptions,
): Promise<{ underConstruction: boolean; countdownDate?: string | null }> {
  try {
    const apiUrl = options?.apiUrl || getApiUrl();
    const client = new GraphQLClient(apiUrl);
    const data = await client.request<{
      siteSettings: { underConstruction: boolean; countdownDate?: string | null };
    }>(GET_SITE_SETTINGS);
    return data.siteSettings;
  } catch (e: any) {
    const isMissingQueryError =
      e?.response?.errors?.[0]?.message?.includes(
        'Cannot query field "siteSettings" on type "Query"',
      );

    if (!isMissingQueryError) {
      console.error("[getSiteSettings] error:", e);
    }

    // Fail open: if we can't reach the API or the query isn't implemented, show real site
    return { underConstruction: false, countdownDate: null };
  }
}
