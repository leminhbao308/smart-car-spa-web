import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Disable no-explicit-any rule
      "@typescript-eslint/no-explicit-any": "off",
      // Disable no-unused-vars rule
      "@typescript-eslint/no-unused-vars": "off",
      // Disable react-hooks/exhaustive-deps rule
      "react-hooks/exhaustive-deps": "off",
      // Disable react/no-unescaped-entities rule
      "react/no-unescaped-entities": "off",
      // Disable @next/next/no-img-element rule
      "@next/next/no-img-element": "off",
      // Disable no-empty-object-type rule
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];

export default eslintConfig;
