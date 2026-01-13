import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
    globals: true,
    environment: "node",
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
});
