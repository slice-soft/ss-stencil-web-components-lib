import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['node_modules', 'dist', '.stencil', 'coverage', 'out', 'loader', 'www', '**/*.spec.{jsx,tsx}', '**/*.e2e.{js,ts}']),
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], plugins: { js }, extends: ['js/recommended'] },
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {
    files: ['**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^h$', // ignora exactamente "h"
          argsIgnorePattern: '^_', // opcional, ignora args que empiezan por _
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);
