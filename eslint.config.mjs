import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config({
  files: ['src/**/*.ts'],
  ignores: [ "node_modules", "dist" ],
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommended,
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "caughtErrorsIgnorePattern": "^_" }
    ],
    "no-empty": [
      "error", 
      { "allowEmptyCatch": true }
    ]
  }
});