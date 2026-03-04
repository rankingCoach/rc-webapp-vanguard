module.exports = {
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'perf', section: 'Performance', hidden: true },
    { type: 'refactor', section: 'Refactoring', hidden: true },
    { type: 'chore', section: 'Chores', hidden: true },
    { type: 'test', section: 'Tests', hidden: true },
    { type: 'style', section: 'Style', hidden: true },
  ],
  commitUrlFormat: 'https://bitbucket.org/rankingcoach/rc-webapp-vanguard/commits/{{hash}}',
  compareUrlFormat:
    'https://bitbucket.org/rankingcoach/rc-webapp-vanguard/branches/compare/{{currentTag}}%0D{{previousTag}}#diff',
};
