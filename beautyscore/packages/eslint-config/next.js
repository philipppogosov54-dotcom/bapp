import js from "@eslint/js";
import { globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import pluginNext from "@next/eslint-plugin-next";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nextJsConfig = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      "react/react-in-jsx-scope": "off",
    },
  },
  // Data Flow & Business Logic Rules
  {
    rules: {
      // Prevent hardcoded mock data in production code
      // Warn on variables named 'mock', 'Mock', 'MOCK', 'dummy', 'fake'
      "no-restricted-syntax": [
        "warn",
        {
          selector: "VariableDeclarator[id.name=/^(mock|Mock|MOCK|dummy|fake|DUMMY|FAKE)/]",
          message: "Avoid mock/dummy/fake data in production code. Use API hooks instead.",
        },
        {
          selector: "Property[key.name=/^(mock|Mock|MOCK|dummy|fake|DUMMY|FAKE)/]",
          message: "Avoid mock/dummy/fake properties in production code.",
        },
      ],
      // Prevent console.log in production (allow console.error, console.warn)
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Enforce consistent return types
      "@typescript-eslint/explicit-function-return-type": "off",
      // Warn on unused variables (but allow underscore prefix)
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
    },
  },
];
