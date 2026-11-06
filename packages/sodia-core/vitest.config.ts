import { createRequire } from "node:module";
import { dirname } from "node:path";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
  },
  resolve: {
    // Edge-function sources (supabase/functions) use Deno-style bare imports.
    alias: {
      zod: dirname(require.resolve("zod/package.json")),
    },
  },
});
