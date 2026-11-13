import { afterEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ load: vi.fn(), istanbul: vi.fn(() => ({ name: 'test-istanbul' })), onwarn: vi.fn() }));
vi.mock('vite', async (original) => ({ ...await original<typeof import('vite')>(), loadConfigFromFile: mocks.load }));
vi.mock('vite-plugin-istanbul', () => ({ default: mocks.istanbul }));
vi.mock('../.storybook/vite-plugin-tsgo-checker.ts', () => ({ tsgoChecker: () => ({ name: 'test-tsgo-checker' }) }));
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

async function resolved(configType: 'PRODUCTION' | 'DEVELOPMENT', istanbul = false, v8 = false, sharedWarnings = false) {
  vi.resetModules();
  vi.stubEnv('VANGUARD_ISTANBUL_COVERAGE', istanbul ? '1' : '');
  vi.stubEnv('VANGUARD_V8_COVERAGE', v8 ? '1' : '');
  const shared = {
    build: { lib: { entry: 'src/index.ts' }, outDir: 'dist', rollupOptions: { ...(sharedWarnings ? { onwarn: mocks.onwarn } : {}), external: ['react'], output: { preserveModules: true } } },
    plugins: ['vite:dts', 'vite-plugin-tsgo-checker', 'vite-plugin-asset-analyzer', 'vite-tsconfig-paths', 'vite:vue-jsx', 'ignore-dynamic-import-warning'].map(name => ({ name })),
    resolve: { alias: { '@vanguard': '/shared/src/core' } },
    css: { modules: { generateScopedName: '[local]_[hash:base64:2]' } },
    esbuild: { keepNames: false }, optimizeDeps: { include: ['shared-dependency'] },
  };
  mocks.load.mockResolvedValue({ config: shared });
  const config = (await import('../.storybook/main')).default;
  const builder = { build: { outDir: 'storybook-static', sourcemap: false }, plugins: [{ name: 'storybook-builder' }] };
  const result = await config.viteFinal!(builder, { configType } as Parameters<NonNullable<typeof config.viteFinal>>[1]);
  return { config, result, shared, names: result.plugins?.flat().map(p => p && typeof p === 'object' && 'name' in p ? p.name : '') ?? [] };
}

for (const mode of ['PRODUCTION', 'DEVELOPMENT'] as const) {
  test(`normal ${mode} Storybook keeps builder output and shared transforms without library plugins or coverage`, async () => {
    const { config, result, shared, names } = await resolved(mode);
    if (mode === 'DEVELOPMENT') expect(config.addons).not.toContain('@storybook/addon-coverage');
    expect(result.build).toEqual({ outDir: 'storybook-static', sourcemap: false });
    expect(names).toContain('storybook-builder');
    expect(names).toContain('vite-tsconfig-paths');
    expect(names).toContain('vite:vue-jsx');
    expect(names).toContain('ignore-dynamic-import-warning');
    expect(names.filter(n => n === 'test-tsgo-checker')).toHaveLength(1);
    expect(names).not.toContain('vite:dts');
    expect(names).not.toContain('vite-plugin-tsgo-checker');
    expect(names).not.toContain('vite-plugin-asset-analyzer');
    expect(result.css).toEqual(shared.css);
    expect(result.esbuild).toEqual(shared.esbuild);
    expect(result.optimizeDeps).toEqual(shared.optimizeDeps);
    expect(result.resolve?.alias).toMatchObject({ '@vanguard': '/shared/src/core' });
    expect(shared.build.rollupOptions.external).toEqual(['react']);
    expect(config.addons).not.toContain('@storybook/addon-coverage');
    expect(mocks.istanbul).not.toHaveBeenCalled();
  });
}
test('explicit Istanbul coverage enables both instrumentation paths', async () => {
  const { config, names } = await resolved('PRODUCTION', true);
  expect(config.addons).toContain('@storybook/addon-coverage');
  expect(names).toContain('test-istanbul');
  expect(mocks.istanbul).toHaveBeenCalledTimes(1);
});
test('V8 coverage takes precedence over Istanbul and preserves original-source mapping', async () => {
  const { config, names } = await resolved('PRODUCTION', true, true);
  expect(config.addons).not.toContain('@storybook/addon-coverage');
  expect(names).not.toContain('test-istanbul');
  expect(names).not.toContain('vite:vue-jsx');
  expect(mocks.istanbul).not.toHaveBeenCalled();
});

test('preserves the shared warning policy without importing library output settings', async () => {
  const { result, shared } = await resolved('PRODUCTION', false, false, true);
  expect(result.build?.rollupOptions?.onwarn).toBe(shared.build.rollupOptions.onwarn);
  expect(result.build?.lib).toBeUndefined();
  expect(result.build?.rollupOptions?.output).toBeUndefined();
});
