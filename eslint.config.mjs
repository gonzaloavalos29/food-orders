import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/node_modules/**',
      '.yarn/**',
      '**/storybook-static/**',
      '**/*.d.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Backend (Node): console permitido solo con directiva explícita.
  {
    files: ['apps/backend/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'no-console': 'error',
    },
  },

  // Frontend (navegador + React).
  {
    files: ['apps/frontend/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Scripts y archivos de configuración (Node, JS/mjs).
  {
    files: ['scripts/**/*.{js,mjs}', '**/*.config.{js,mjs,ts}', '**/prisma/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
  },

  // Tests: globals de Vitest/Jest inyectados en runtime.
  {
    files: ['**/*.{test,spec}.{ts,tsx}', '**/test/**', '**/__test-helpers__/**'],
    languageOptions: { globals: { ...globals.node } },
  },
);
