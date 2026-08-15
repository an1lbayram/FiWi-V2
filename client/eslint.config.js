import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      ...react.configs.recommended.rules,
      // Only the two long-standing hooks rules — not the full v7
      // "recommended" set, which also pulls in newer React Compiler-era
      // rules (e.g. set-state-in-effect) that flag normal, working
      // socket-setup/initial-fetch patterns this codebase intentionally uses.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['**/*.test.{js,jsx}', 'src/test/**'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    }
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'dev-dist/**']
  }
];
