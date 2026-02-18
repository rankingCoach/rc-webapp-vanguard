import * as readline from 'node:readline';

import standardVersion from 'standard-version';

import { getDefaultOptions } from './helpers/get-default-options.mjs';

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,

    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    }),
  );
}

// Options are the same as command line, except camelCase
// standardVersion returns a Promise
const options = getDefaultOptions();
const dryRun = options['dry-run'];
const doGenerate = (dryRun) => {
  standardVersion({
    noVerify: true,
    infile: 'CHANGELOG.md',
    silent: false,
    dryRun: dryRun,
    commitUrlFormat: 'https://github.com/rankingCoach/rc-webapp-vanguard/commits/{{hash}}',
    compareUrlFormat:
      'https://github.com/rankingCoach/rc-webapp-vanguard/branches/compare/{{currentTag}}%0D{{previousTag}}#diff',
  })
    .then((data) => {
      // standard-version is done
      console.log(data);
    })
    .catch((err) => {
      console.error(`standard-version failed with message: ${err.message}`);
    });
};

if (dryRun) {
  doGenerate(dryRun);
} else {
  askQuestion('Password?').then((res) => {
    if (res === 'asd') {
      doGenerate(false);
    }
  });
}
