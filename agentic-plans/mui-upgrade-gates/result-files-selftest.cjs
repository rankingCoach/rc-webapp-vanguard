const assert = require('node:assert/strict');
const {failedFiles,setupFailures} = require('./result-files.cjs');
const fixture = {numFailedTestSuites:3,testResults:[{name:'one.spec.ts',status:'failed',assertionResults:[
 {ancestorTitles:['outer','inner'],status:'failed'}, {ancestorTitles:['outer','another'],status:'failed'}
]},{name:'green.spec.ts',status:'passed',assertionResults:[{status:'passed'}]}]};
assert.equal(failedFiles(fixture).length,1);
assert.deepEqual(setupFailures(fixture),[]);
assert.equal(setupFailures({testResults:[{name:'setup.spec.ts',status:'failed',assertionResults:[]}]}).length,1);
console.log('PASS: nested failing describes count as one failed file; empty setup failures are distinct');
