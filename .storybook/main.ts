import type { StorybookConfig } from "@storybook/react-vite";
import type { UserConfig } from "vite";
// import type { AddonOptionsVite } from "@storybook/addon-coverage";
// @ts-ignore
import path from "path";
import { fileURLToPath } from "node:url";
//import Inspect from "vite-plugin-inspect";

//Do not delete this mocks Router
// import * as Mock from "../src/__mocks__/function_mocks/@tanstack/RouterMock";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_BASE = path.resolve(__dirname, "../src");
// import { visualizer } from "rollup-plugin-visualizer";

import { createMockAliases } from "./create-mock-alias.ts";
// import visualizer from "rollup-plugin-visualizer";
import { createMissingAssetsPlugin } from "./vite-plugin-missing-assets.ts";
import { tsgoChecker } from "./vite-plugin-tsgo-checker.ts";

// const coverageConfig: AddonOptionsVite = {
// istanbul: {
// include: ['**/stories/**'],
// exclude: ['**/exampleDirectory/**'],
// },
// };
const ignoredFolders = ["__model_mocks__", "@stores"];

const mockAliases = createMockAliases(SRC_BASE, ignoredFolders);

const config: StorybookConfig = {
  stories: [
    "../src/core/**/_*.stories.@(js|jsx|mjs|ts|tsx)",
    // "../src/common/**/_*.stories.@(js|jsx|mjs|ts|tsx)"
  ],

  addons: [
    "@storybook/addon-coverage",
    "@storybook/addon-docs",
    "@storybook/addon-vitest"
  ],

  async viteFinal(config, { configType }) {
    // Merge custom configuration into the default config
    const { mergeConfig, loadConfigFromFile } = await import("vite");
    // Let Vite bundle the shared config, which also supports CommonJS build scripts.
    const loadedConfig = await loadConfigFromFile(
      { command: configType === "PRODUCTION" ? "build" : "serve", mode: configType === "PRODUCTION" ? "production" : "development" },
      path.resolve(__dirname, "../vite.config.lib.ts"),
    );
    if (!loadedConfig) throw new Error("Could not load the shared Vite configuration");
    const istanbul = (await import("vite-plugin-istanbul")).default;

    // Create a modified BaseViteConfig without external dependencies for Storybook
    const storybookBaseConfig = { ...loadedConfig.config };
    if (storybookBaseConfig.build?.rollupOptions) {
      // Remove external dependencies for Storybook build
      delete storybookBaseConfig.build.rollupOptions.external;
    }

    const WithBaseConfig = mergeConfig(config, storybookBaseConfig);
    return mergeConfig(WithBaseConfig, {
      resolve: {
        alias: {
          ...mockAliases,
        },
      },
      define: {
        global: "globalThis",
        "process.env": {},
      },
      plugins: [
        // visualizer({
        //   open: true, // Automatically open the visualization in your browser
        //   filename: "bundle-analysis.html", // Output file name
        //   template: "treemap", // Visualization type ('treemap', 'sunburst', etc.)
        // }),
        istanbul({
          include: ["**/stories/**"],
          exclude: ["node_modules", "test/"],
          extension: [".ts", ".tsx"],
          requireEnv: false,
        }),
        createMissingAssetsPlugin(),
        // Add TypeScript 7 (tsgo) type checking
        tsgoChecker({
          tsconfigPath: "../tsconfig.lib.json",
          root: path.resolve(__dirname, ".."),
          overlay: true,
        }),
      ],
      server: {
        fs: {
          allow: [".."],
        },
      },
      commonjsOptions: {
        transformMixedEsModules: true,
        strictRequires: true,
      },
    } as UserConfig);
  },

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  staticDirs: [path.resolve(`${SRC_BASE}/custom-hooks/use-dynamic-import`)],
  docs: {},

  typescript: {
    check: true, // Enable TypeScript checking
    // reactDocgen: "react-docgen",
    reactDocgen: "react-docgen", // Use react-docgen
    skipCompiler: false, // Enable TypeScript compiler
    reactDocgenTypescriptOptions: {
      // exclude: ["*EngagementPlannerCalendar.tsx"],
      compilerOptions: {
        maxNodeModuleJsDepth: 1,
      },
      // Use tsgo for type checking
      tsconfigPath: path.resolve(__dirname, "../tsconfig.lib.json"),
    },
  },
};

export default config;
