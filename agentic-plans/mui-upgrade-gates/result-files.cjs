// File counts come from per-file results, not Jest-compatible nested-suite totals.
exports.failedFiles = report => report.testResults.filter(f => f.status === 'failed' || f.assertionResults.some(a => a.status === 'failed'));
exports.setupFailures = report => exports.failedFiles(report).filter(f => !f.assertionResults.some(a => a.status === 'failed'));
