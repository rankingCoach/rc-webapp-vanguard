import { defineConfig, build, Connect, UserConfig, mergeConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { esbuildCommonjs } from "@originjs/vite-plugin-commonjs";
// import { customConfigPlugin, onVIteBuildEnd } from "./scripts/rsync-config";
import { resolve } from "path";
import checker from "vite-plugin-checker";
import { tsgoChecker } from "./.storybook/vite-plugin-tsgo-checker";
// @ts-ignore
import path from "path";
//import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import dts from "vite-plugin-dts";
import Aliases from "ts-alias";
// @ts-ignore
import vitePluginAssetAnalyzer from "./scripts/vite-plugin-asset-analyzer.js";
// @ts-ignore
const VanguardConfig = require("./scripts/vanguard-config.js");

const aliases = new Aliases();
const formattedAliases = {};
for (const key in aliases.typescript) {
  const formattedKey = key.replace("/*", "");
  formattedAliases[formattedKey] = path.resolve(__dirname, aliases.typescript[key][0]);
}

// Load Vanguard configuration to determine build options
const vanguardConfig = new VanguardConfig();
const userConfig = vanguardConfig.loadConfig();
const buildOptions = userConfig.buildOptions || {};

// TODO!!!: Uncomment TanStackRouter when working on React Single-app
// import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

export const BaseViteConfig: UserConfig = {
  // depending on your application, base can also be "/"
  base: "",

  // test: {
  //   globals: true,
  //   include: ["**/_*.spec.?(m)[jt]s?(x)"], // Only include stories files
  // },
  plugins: [
    // cssInjectedByJsPlugin({topExecutionPriority: false}),
    // onVIteBuildEnd(),
    vitePluginAssetAnalyzer(),
    // react(),
    viteTsconfigPaths(),
    // customConfigPlugin(),
    // Use TypeScript 7 (tsgo) for type checking instead of vite-plugin-checker
    tsgoChecker({
      tsconfigPath: "./tsconfig.lib.json",
      root: __dirname,
      overlay: true,
    }),
    dts({
      entryRoot: "src", // Where your types are located
      outDir: "dist/types", // Where to output .d.ts files
      insertTypesEntry: true, // Creates a `types` entry in package.json
      tsconfigPath: resolve(__dirname, "./tsconfig.lib.json"),
      // Note: vite-plugin-dts needs the TS JS compiler API, which TS 7 dropped -- it gets its own TS 5 copy via .pnpmfile.cjs
      // This is acceptable as .d.ts generation is separate from type checking
      compilerOptions: {
        declarationMap: false, // Disable .dts.map files
      },
    }),

    {
      name: "filter-dev-warnings",
      apply: "serve",
      configureServer(server) {
        const originalWarn = server.config.logger.warn;
        server.config.logger.warn = (warning, ...args) => {
          // Check if the warning is the one you want to ignore
          if (warning.includes("/src/custom-hooks/use-dynamic-import/use-dynamic-import")) {
            return;
          }
          // Otherwise, use the default warning behavior
          originalWarn.call(server.config.logger, warning, ...args);
        };
      },
    },
    {
      name: "ignore-dynamic-import-warning",
      enforce: "pre",
      load(id) {
        if (id.includes("/use-dynamic-import.webpack")) {
          return "export const useDynamicImportWebpack = () => ''"; // Return an empty module
        }
      },
    },
  ],
  css: {
    preprocessorOptions: {
      scss: {
        //additionalData: `@use "@/styles/general.module.scss";`, // Auto-import styles if needed globally
      },
    },
    modules: {
      localsConvention: "camelCase",
      generateScopedName: "[local]_[hash:base64:2]",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
      plugins: [esbuildCommonjs(["redux-persist-expire"])],
    },
  },
  esbuild: {
    // applies to transforms and the esbuild minifier
    drop: ["console", "debugger"],
    pure: ["console.log"],
    legalComments: "none",
    keepNames: false,
  },
  build: {
    minify: buildOptions.minify !== false ? "esbuild" : false,
    sourcemap: false, // Disable sourcemap generation to prevent .js.map/.mjs.map files
    lib: {
      entry: "src/index.ts", // Path to your main export file
      name: "vanguard", // Your library name
      formats: ["es"],
      // fileName: () => 'index.js', // Use index.js for consistency
    },
    // watch: {},
    commonjsOptions: {
      transformMixedEsModules: false,
    },
    rollupOptions: {
      // input: getViteEntryFiles,

      onwarn(warning, warn) {
        // Check if the warning is the one you want to ignore and silence it
        if (warning.message.includes("use-dynamic-import")) {
          // You could include more specific conditions to target the exact warning
          return;
        }
        // Otherwise pass all other warnings to the default handler
        warn(warning);
      },
      external: ["react", "react-dom", "react-redux", "@reduxjs/toolkit", "react-is", "react/jsx-runtime", "imask", "react-imask"],

      output: {
        // inlineDynamicImports: false,
        //
        entryFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          if (name && name.includes('/')) {
            const parts = name.split('/');
            const componentName = parts[parts.length - 1] === 'index' ? parts[parts.length - 2] : parts[parts.length - 1];
            return 'index-' + componentName + '.js';
          }
          return '[name].js';
        },
        // assetFileNames: (info) => {
        //   if (info.name?.split(".")[1] === "css") {
        //     return "[name].[ext]";
        //   }
        //   return "assets/[name]-[hash][extname]";
        // },
        // Disable manual chunks to keep everything in main bundle for simple imports
        // This allows tree shaking to work with the main "vanguard" import
        manualChunks: undefined,
        preserveModules: true,
        preserveModulesRoot: "src",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-redux": "ReactRedux",
          "react-is": "ReactIs",
        },
        // dir: "dist",
        format: "es",
        compact: true,
      },
      onLog(level, log, handler) {
        // @ts-ignore
        if (log.cause && log.cause.message === `Can't resolve original location of error.`) {
          return;
        }
        handler(level, log);
      },
    },
  },
  publicDir: "src/custom-hooks/use-dynamic-import/assets",

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    "window.BUILD_SYSTEM": JSON.stringify("vite"),
  },

  resolve: {
    alias: {
      "/jump": resolve("../jump"),
      "/vanguard": resolve("../vanguard"),
      "@": path.resolve(__dirname, "./src"),
      "@config": path.resolve(__dirname, "./src/config"),
      src: path.resolve(__dirname, "./src"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      ...formattedAliases,
    },
  },
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    fs: {
      allow: [".."],
    },
    // this sets a default port to 3000
    port: 3000,
  },
};

export default defineConfig(
  mergeConfig(BaseViteConfig, {
    plugins: [],
  }),
);
