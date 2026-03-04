import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/migrate.ts"],
  format: ["esm"],
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
  target: "node22",
});
