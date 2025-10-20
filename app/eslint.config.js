// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const js = require('@eslint/js');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'build/**',
      '.expo/**',
      'android/**',
      'ios/**',
      'coverage/**',
    ],
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], 
  },
  js.configs.recommended,
]);
