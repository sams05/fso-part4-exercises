module.exports = {
  'env': {
    'commonjs': true,
    'es2021': true,
    'node': true
  },
  'plugins': [
    '@stylistic/js'
  ],
  'extends': 'eslint:recommended',
  'overrides': [
    {
      'env': {
        'node': true
      },
      'files': [
        '.eslintrc.{js,cjs}'
      ],
      'parserOptions': {
        'sourceType': 'script'
      }
    }
  ],
  'parserOptions': {
    'ecmaVersion': 'latest'
  },
  'rules': {
    '@stylistic/js/indent': [
      'error',
      2
    ],
    '@stylistic/js/linebreak-style': [
      'error',
      'unix'
    ],
    '@stylistic/js/quotes': [
      'error',
      'single'
    ],
    '@stylistic/js/semi': [
      'error',
      'never'
    ],
    'eqeqeq': 'error',
    '@stylistic/js/no-trailing-spaces': 'error',
    '@stylistic/js/object-curly-spacing': ['error', 'always'],
    '@stylistic/js/arrow-spacing': [
      'error', { 'before': true, 'after': true }
    ],
    'no-console': 0
  }
}
