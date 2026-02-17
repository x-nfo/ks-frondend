import { createPagesFunctionHandler } from "@react-router/cloudflare";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

// @ts-ignore - virtual module resolved at build time
const build = () => import("virtual:react-router/server-build");

export const onRequest = createPagesFunctionHandler({ build });
