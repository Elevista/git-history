module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser : 'babel-eslint'
  },
  extends: [
    'plugin:vue/recommended',
    'standard'
  ],
  plugins: [
    'vue',
    'import'
  ],
  // add your custom rules here
  rules: {
    'prefer-const': 'error',
    'no-var': 'error',
    'vue/no-v-html': 'off',
    'prefer-template': 'error',
    'vue/require-prop-types': 'off',
    'vue/require-default-prop':'off',
    'vue/html-closing-bracket-newline':'off',
    'vue/max-attributes-per-line': ['error', {
      'singleline': 4,
      'multiline': {
        'max': 4,
        'allowFirstLine': true
      }
    }], 
    'vue/singleline-html-element-content-newline': 'off',
    'vue/component-name-in-template-casing':['error', 'PascalCase', { 'ignores': [] }]
  }
}
