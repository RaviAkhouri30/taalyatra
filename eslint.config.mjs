// @ts-check
/**
 * ESLint flat config for Taal Yatra.
 *
 * Encodes the CLAUDE.md rules as lint errors so they are enforced, not just documented:
 * file size, SOLID-friendly class shape, Angular best practices, Sonar code smells,
 * security patterns and the "RxJS only, no Promises" policy.
 */
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import security from 'eslint-plugin-security';
import prettier from 'eslint-config-prettier';

/** Max lines per file (rule 6). Blank lines and comments do not count as code. */
const MAX_LINES = { max: 300, skipBlankLines: true, skipComments: true };

/**
 * Promise usage is banned in production code (rule 11).
 * SDK adapters in core/backends wrap Promise APIs with defer(), and specs are exempt (rule 12).
 */
const NO_PROMISE_SYNTAX = [
  { selector: 'AwaitExpression', message: 'Use RxJS instead of await (CLAUDE.md §7).' },
  {
    selector: 'FunctionDeclaration[async=true]',
    message: 'Use RxJS instead of async functions (CLAUDE.md §7).',
  },
  {
    selector: 'FunctionExpression[async=true]',
    message: 'Use RxJS instead of async functions (CLAUDE.md §7).',
  },
  {
    selector: 'ArrowFunctionExpression[async=true]',
    message: 'Use RxJS instead of async functions (CLAUDE.md §7).',
  },
  {
    selector: "NewExpression[callee.name='Promise']",
    message: 'Use new Observable() instead of new Promise (CLAUDE.md §7).',
  },
  {
    selector: "MemberExpression[object.name='Promise']",
    message: 'Use RxJS combinators instead of Promise statics (CLAUDE.md §7).',
  },
  {
    selector: "CallExpression[callee.property.name='then']",
    message: 'Use RxJS pipe() instead of .then() (CLAUDE.md §7).',
  },
];

export default defineConfig(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      '.angular/**',
      'playwright-report/**',
      'test-results/**',
      '.scannerwork/**',
      // Design prototype exported from the design canvas — reference material, not app source.
      'design/**',
    ],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
      sonarjs.configs.recommended,
      security.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      // ---- Clean code limits (rule 6, CLAUDE.md §8) ----
      'max-lines': ['error', MAX_LINES],
      'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      'sonarjs/cognitive-complexity': ['error', 15],
      'no-console': 'error',
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1],
          ignoreEnums: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
        },
      ],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-restricted-syntax': ['error', ...NO_PROMISE_SYNTAX],

      // ---- OOP / SOLID shape (rules 2-3, CLAUDE.md §5) ----
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit' }],
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/member-ordering': 'error',
      // Angular classes are configured by decorators, so an empty decorated class is valid.
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'import', format: null },
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase'] },
        { selector: 'objectLiteralProperty', format: null },
      ],

      // ---- Angular practices (rules 4-5, 18, CLAUDE.md §6) ----
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-signal-model': 'error',
      '@angular-eslint/prefer-output-emitter-ref': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-service-decorator': 'error',
      '@angular-eslint/prefer-host-metadata-property': 'error',
      '@angular-eslint/no-implicit-take-until-destroyed': 'error',
      '@angular-eslint/no-uncalled-signals': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/component-max-inline-declarations': 'error',
      '@angular-eslint/consistent-component-styles': 'error',
      '@angular-eslint/relative-url-prefix': 'error',
    },
  },
  {
    // SDK adapters are the single place allowed to touch Promise-returning SDKs (wrapped in defer()).
    files: ['src/app/core/backends/**/*.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    // bootstrapApplication() returns a Promise; main.ts is the framework entry point.
    files: ['src/main.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    // Tests may use async/await and Promises (rule 12) and long describe blocks.
    files: ['**/*.spec.ts', 'e2e/**/*.ts', 'playwright.config.ts'],
    rules: {
      'no-restricted-syntax': 'off',
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'sonarjs/no-hardcoded-passwords': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      'max-lines': ['error', MAX_LINES],
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'error',
      '@angular-eslint/template/no-inline-styles': 'error',
      '@angular-eslint/template/no-any': 'error',
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/use-track-by-function': 'off',
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/no-interpolation-in-attributes': 'error',
    },
  },
  {
    files: ['**/*.mjs', '**/*.js'],
    extends: [eslint.configs.recommended],
  },
  // Formatting is owned by Prettier; disable conflicting stylistic rules last.
  prettier,
);
