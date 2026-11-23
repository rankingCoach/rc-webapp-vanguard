const VanguardConfig = require('./vanguard-config');

/**
 * Vite plugin for basic asset information (selective build functionality removed)
 */
function vitePluginAssetAnalyzer(options = {}) {
  const config = new VanguardConfig();
  let isProduction = false;

  return {
    name: 'vite-plugin-asset-analyzer',
    
    configResolved(resolvedConfig) {
      isProduction = resolvedConfig.command === 'build';
    },

    buildStart() {
      if (!isProduction) return;
      console.log('🚀 Building with full asset support...');
    },

    generateBundle(outputOptions, bundle) {
      if (!isProduction) return;

      // Create a simple summary file in the bundle
      try {
        this.emitFile({
          type: 'asset',
          fileName: 'vanguard-asset-analysis.json',
          source: JSON.stringify({
            // Reproducible output: a build time only when the build pins one (SOURCE_DATE_EPOCH).
            ...(process.env.SOURCE_DATE_EPOCH ? { timestamp: new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString() } : {}),
            mode: 'full',
            buildOptimization: {
              enabled: false,
              reason: 'Selective build functionality removed - all assets included'
            }
          }, null, 2)
        });
      } catch (error) {
        console.warn('⚠️  Could not generate asset analysis summary:', error.message);
      }
    }
  };
}

module.exports = vitePluginAssetAnalyzer;