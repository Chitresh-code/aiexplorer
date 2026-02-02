import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import js from "@eslint/js";

/**
 * Enhanced ESLint configuration for production-grade code quality
 * 
 * This configuration enforces:
 * - React and Next.js best practices
 * - TypeScript type safety
 * - Accessibility standards
 * - Performance optimizations
 * - Code consistency through strict linting rules
 */
const eslintConfig = defineConfig([
  js.configs.recommended,
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Enforce stricter React rules
      "react/jsx-key": "error",
      "react/no-array-index-key": "warn",
      "react/no-unescaped-entities": "error",
      "react/prop-types": "off", // TypeScript handles this
      
      // Enforce TypeScript best practices
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      
      // General code quality rules
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "no-debugger": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "no-implicit-coercion": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      
      // Code organization and consistency
      "sort-imports": [
        "warn",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    ".git/**",
    "dist/**",
  ]),
]);

export default eslintConfig;
