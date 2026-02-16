import { useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "../root";

export type RootLoaderData = Awaited<ReturnType<typeof rootLoader>>;

export function useRootLoader() {
    return useRouteLoaderData<RootLoaderData>("root");
}
