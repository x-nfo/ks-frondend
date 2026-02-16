
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: "http://localhost:3000/shop-api",
    documents: ["app/**/*.{ts,tsx}", "!app/generated/**/*"],
    generates: {
        "app/generated/graphql.ts": {
            plugins: ["typescript", "typescript-operations", "typescript-generic-sdk"],
            config: {
                useTypeImports: true,
                avoidOptionals: false,
            }
        }
    }
};

export default config;
