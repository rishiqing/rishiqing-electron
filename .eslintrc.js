module.exports = {
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended',
    'prettier',
  ],
  rules: [
    {
      'vue/multi-word-component-names': 'off',
    },
  ],
}
