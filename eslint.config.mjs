import tsparser from "@typescript-eslint/parser";
import tseslint from "@typescript-eslint/eslint-plugin";
import obsidianmd from "eslint-plugin-obsidianmd";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: {
        // Add any globals you need
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "obsidianmd": obsidianmd,
    },
    rules: {
      // ESLint recommended rules
      "no-unused-vars": "off",
      "no-prototype-builtins": "off",
      
      // TypeScript ESLint rules
      "@typescript-eslint/no-unused-vars": ["error", { "args": "none" }],
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-function": "off",
      
      // Obsidian recommended rules
      ...obsidianmd.configs.recommended,
    },
  },
];

