// typescript@7 (native Go compiler) no longer ships the JS compiler API
// (ts.createProgram etc. are undefined). These tools still drive that API —
// vite-plugin-dts emits the published dist/types with it — so they get their
// own TS 5 copy while the root `typescript` stays on 7. A packageExtensions
// entry is not enough: they declare `typescript` as a peer, and pnpm resolves
// peers from the root, so the peer has to be turned into a regular dependency.
const TS_API_CONSUMERS = new Set(['vite-plugin-dts', '@vue/language-core', 'vite-plugin-checker']);
const TS_API_VERSION = '5.9.3';

function readPackage(pkg) {
  if (TS_API_CONSUMERS.has(pkg.name)) {
    if (pkg.peerDependencies) delete pkg.peerDependencies.typescript;
    if (pkg.peerDependenciesMeta) delete pkg.peerDependenciesMeta.typescript;
    pkg.dependencies = { ...pkg.dependencies, typescript: TS_API_VERSION };
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };
