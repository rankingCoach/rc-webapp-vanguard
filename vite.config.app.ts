import { defineConfig, build, Connect, UserConfig, mergeConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { esbuildCommonjs } from "@originjs/vite-plugin-commonjs";
// import { customConfigPlugin, onVIteBuildEnd } from "./scripts/rsync-config";
import { resolve } from "path";
import checker from "vite-plugin-checker";
// @ts-ignore
import path from "path";
//import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import dts from "vite-plugin-dts";
import Aliases from "ts-alias";

const aliases = new Aliases();
const formattedAliases = {};
for (let key in aliases.typescript) {
  const formattedKey = key.replace("/*", "");
  formattedAliases[formattedKey] = path.resolve(__dirname, aliases.typescript[key][0]);
}

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
    // react(),
    viteTsconfigPaths(),
    // customConfigPlugin(),
    checker({
      // e.g. use TypeScript check
      typescript: {
        // We use this custom config mainly to start the testing from App.tsx
        //If we use the general config we get allot of errors we do not need
        tsconfigPath: resolve(__dirname, "./tsconfig.app.json"),
      },
      overlay: true,
    }),
    dts({
      entryRoot: "src", // Where your types are located
      outDir: "dist-app/types", // Where to output .d.ts files
      insertTypesEntry: true, // Creates a `types` entry in package.json
      tsconfigPath: resolve(__dirname, "./tsconfig.app.json"),
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
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: "src/index.ts", // Path to your main export file
      name: "vanguard", // Your library name
      fileName: (format) => `index.${format}.js`, // Dynamic filenames for each format
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
      external: ["react", "react-dom", "react-redux", "@reduxjs/toolkit"],

      output: {
        // inlineDynamicImports: false,
        //
        // entryFileNames: "[name].bundle.js",
        // assetFileNames: (info) => {
        //   if (info.name?.split(".")[1] === "css") {
        //     return "[name].[ext]";
        //   }
        //   return "assets/[name]-[hash][extname]";
        // },
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-redux": "ReactRedux",
          "@reduxjs/toolkit": "RTK",
        },
        // dir: "dist",
        // format: "es",
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
    plugins: [react()],
  }),
);
