import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@vasuagent/core": fileURLToPath(
        new URL("./packages/core/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["packages/*/tests/**/*.test.ts"],
    coverage: { provider: "v8", reporter: ["text", "json"] },
  },
});
