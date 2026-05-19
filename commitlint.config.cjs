/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'chore', 'refactor', 'style', 'test', 'perf']],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    'scope-empty': [0],
    'scope-case': [2, 'always', 'lower-case'],

    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 100],

    'header-max-length': [2, 'always', 150],

    'body-leading-blank': [2, 'always'],

    'footer-leading-blank': [2, 'always'],
  },

  // Ignore merge commits - they don't follow conventional commit format
  ignores: [
    /**
     * @param {string} commit
     * @returns {boolean}
     */
    (commit) => /^(Merge|Merged)\s/.test(commit),
  ],
};
