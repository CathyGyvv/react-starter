const OFF = 0
const WARN = 1
const ERROR = 2

module.exports = {
    env: {
        browser: true,
        es2020: true,
        node: true,
    },
    extends: [
        'airbnb',
        'airbnb/hooks',
        'plugin:react/recommended',
        'plugin:unicorn/recommended',
        'plugin:promise/recommended',
        'plugin:@typescript-eslint/recommended',
        'stylelint-config-standard', 'stylelint-config-rational-order',
        // other configs ...
        'prettier',
        'prettier/@typescript-eslint',
        'prettier/react',
        'prettier/unicorn',
        'stylelint-config-prettier'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 11,
        sourceType: 'module',
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.tsx', '.ts', '.js', '.json'],
            },
            typescript: {},
        },
    },
    plugins: ['react', 'unicorn', 'promise', '@typescript-eslint', 'stylelint-order', 'stylelint-declaration-block-no-ignored-properties'],
    rules: {
        // 具体添加的其他规则大家可查看我的 github 查看
        // https://github.com/vortesnail/react-ts-quick-starter/blob/master/.eslintrc.js
        'plugin/declaration-block-no-ignored-properties': true,
        'comment-empty-line-before': null,
        'declaration-empty-line-before': null,
        'function-name-case': 'lower',
        'no-descending-specificity': null,
        'no-invalid-double-slash-comments': null,
        'rule-empty-line-before': 'always',

    },
    ignoreFiles: ['node_modules/**/*', 'build/**/*'],

}
