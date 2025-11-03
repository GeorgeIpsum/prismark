import { defineConfig } from "vitest/config";

// biome-ignore lint/style/noDefaultExport: <needed for vitest config>
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
  },
});
