import pluginVue from 'eslint-plugin-vue'

/**
 This converts older eslint modules into the new Flat Config system
 */
import { FlatCompat } from '@eslint/eslintrc'

let compat = new FlatCompat()

// while eslint and prettier can run in tandem, it is more
//efficient to run their processes seperately: ESLint for code quality, Prettier for formatting
//that's why we turn off formatting for ESLint
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'src',
    files: ['**/*.{js,vue}'],
    languageOptions: {
      globals: {
        process: 'readonly', // ✅ Define process globally
      },
    },
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },
  ...pluginVue.configs['flat/essential'],
  skipFormatting,
  ...compat.extends('plugin:vue-pug/vue3-recommended'),
  {
    rules: {
      // Vue best practices
      'vue/multi-word-component-names': 'off', // Allow single-word component names
      'vue/no-unused-vars': 'warn', // Catch unused variables in templates

      // Code quality (not formatting)
      'no-console': ['error', { allow: ['warn', 'error'] }], // Warn on console.log
      'no-unused-vars': [
        'warn',
        {
          args: 'none', // Allow unused function parameters
          vars: 'all', // Still enforce unused variable checks elsewhere
          ignoreRestSiblings: true, // Allow unused variables in object destructuring if the rest (`...rest`) is used
        },
      ],
      'no-var': 'error', // Enforce `let`/`const` over `var`
      'init-declarations': ['error', 'always'], // Enforce that variables are assigned a value on declaration
      'no-undef': 'error', // Disallow use of undeclared variables
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    },
  },
]
