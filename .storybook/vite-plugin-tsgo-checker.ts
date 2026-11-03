import { Plugin } from 'vite';
import { spawn } from 'child_process';
import path from 'path';

interface TsgoCheckerOptions {
  tsconfigPath?: string;
  root?: string;
  overlay?: boolean;
}

export function tsgoChecker(options: TsgoCheckerOptions = {}): Plugin {
  const { tsconfigPath = './tsconfig.json', root = process.cwd(), overlay = true } = options;

  let isChecking = false;

  const runTypeCheck = () => {
    if (isChecking) return;

    isChecking = true;

    const configPath = path.resolve(root, tsconfigPath);

    // Use npx tsc (TypeScript 7 = the native Go compiler) for type checking
    const tsgoProcess = spawn('npx', ['tsc', '--noEmit', '--project', configPath], {
      cwd: root,
      stdio: 'pipe',
    });

    let errorOutput = '';

    tsgoProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    tsgoProcess.on('close', (code) => {
      isChecking = false;

      if (code !== 0 && errorOutput) {
        // Log TypeScript errors
        console.error('\n🔍 TypeScript 7 (tsgo) Type Check Results:');
        console.error(errorOutput);
      } else {
        console.log('✅ TypeScript 7 (tsgo) type check passed');
      }
    });

    tsgoProcess.on('error', (error) => {
      isChecking = false;
      console.error('❌ Failed to run tsgo:', error.message);
    });
  };

  return {
    name: 'vite-plugin-tsgo-checker',
    apply: 'serve', // Only apply in development

    buildStart() {
      // Run initial type check
      runTypeCheck();
    },

    handleHotUpdate(ctx) {
      // Run type check on file changes
      if (ctx.file.endsWith('.ts') || ctx.file.endsWith('.tsx')) {
        runTypeCheck();
      }
    },
  };
}
