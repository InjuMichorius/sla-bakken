const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores(['dist/*', '.expo/*', 'node_modules/*']),
  expoConfig,
  {
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]);
