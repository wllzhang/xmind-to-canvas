import tsparser from "@typescript-eslint/parser";
import tseslint from "@typescript-eslint/eslint-plugin";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
  ...obsidianmd.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: {
        console: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "obsidianmd": obsidianmd,
    },
    // Optional project overrides
    // Only add rules here if you need to override the recommended config
    rules: {
      // Example: override unused vars from "warn" to "error" if needed
      // "@typescript-eslint/no-unused-vars": ["error", { "args": "none" }],
    },
  },
]);

