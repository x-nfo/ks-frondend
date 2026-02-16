import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  plugins: [cloudflareDevProxy(), tailwindcss(), reactRouter(), tsconfigPaths()],

  server: {
    port: 8002,
  },
  optimizeDeps: {
    include: ["@headlessui/react", "@heroicons/react/24/outline", "@heroicons/react/24/solid"],
  },
  resolve: {
    alias: {
      "@remix-run/react": "react-router",
      "@remix-run/server-runtime": path.resolve(process.cwd(), "app/compat/remix-server-runtime.ts"),
    },
  },
  ssr: {
    noExternal: ["remix-validated-form", "@remix-validated-form/with-zod"],
  },
});
