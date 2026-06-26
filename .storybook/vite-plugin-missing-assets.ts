import type { Plugin } from "vite";

interface MissingAssetConfig {
  /** File path patterns to check in the load hook */
  loadPatterns: string[];
  /** CSS URL replacements - key is the pattern to find, value is the replacement */
  cssReplacements: Record<string, string>;
}

const DEFAULT_CONFIG: MissingAssetConfig = {
  loadPatterns: [
    "logo_new_layout.svg",
    "/jump/img/",
    "/rc-360-logo-mobile",
    "rc-360-logo.svg",
    // Removed /vanguard/assets/fonts/ since we're now serving them via public directory
  ],
  cssReplacements: {
    "/jump/img/logo_new_layout.svg": "/jump/img/logo_new_layout.svg",
    "/vanguard/assets/images/rc-360-logo.svg": "/vanguard/assets/images/rc-360-logo.svg",
    "/vanguard/assets/images/rc-360-logo-mobile.svg": "/vanguard/assets/images/rc-360-logo-mobile.svg",
    "/vanguard/assets/fonts/Roboto-Regular.ttf": "/vanguard/assets/fonts/Roboto-Regular.ttf",
    "/vanguard/assets/fonts/Roboto-Medium.ttf": "/vanguard/assets/fonts/Roboto-Medium.ttf",
    "/vanguard/assets/fonts/Roboto-Bold.ttf": "/vanguard/assets/fonts/Roboto-Bold.ttf",
    "/vanguard/assets/fonts/Inter-Regular.woff2": "/vanguard/assets/fonts/Inter-Regular.woff2",
    "/vanguard/assets/fonts/Inter-Medium.woff2": "/vanguard/assets/fonts/Inter-Medium.woff2",
    "/vanguard/assets/fonts/Inter-Bold.woff2": "/vanguard/assets/fonts/Inter-Bold.woff2",
  },
};

/**
 * Vite plugin to handle missing assets by replacing them with placeholder data URLs
 */
export function createMissingAssetsPlugin(config: Partial<MissingAssetConfig> = {}): Plugin {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return {
    name: "ignore-missing-assets",
    enforce: "pre", // Run before vite:css plugin

    load(id) {
      // Handle missing assets by returning a placeholder
      const shouldHandle = finalConfig.loadPatterns.some((pattern) => id.includes(pattern));

      if (shouldHandle) {
        return 'export default ""'; // Return empty string for missing assets
      }
    },

    transform(code, id) {
      // Handle CSS files that reference missing assets BEFORE PostCSS processes them
      if (!id.endsWith(".css")) {
        return;
      }

      let transformedCode = code;
      let hasChanges = false;

      // Process each CSS replacement
      Object.entries(finalConfig.cssReplacements).forEach(([searchPath, logPath]) => {
        if (code.includes(searchPath)) {
          console.log(`Replacing missing ${logPath} reference in CSS:`, id);

          // Create regex pattern that handles the search path
          const escapedPath = searchPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

          // Handle font files differently - remove the entire @font-face declaration
          if (searchPath.includes("/fonts/") && (searchPath.endsWith(".ttf") || searchPath.endsWith(".woff2"))) {
            // Remove the entire @font-face block that contains this font
            const fontFaceRegex = new RegExp(`@font-face\\s*{[^}]*url\\(['"]?${escapedPath}['"]?\\)[^}]*}`, "g");
            transformedCode = transformedCode.replace(fontFaceRegex, "");
            hasChanges = true;
          } else {
            // For other assets, replace with empty data URL
            const regex = new RegExp(`url\\(['"]?${escapedPath}['"]?\\)`, "g");
            transformedCode = transformedCode.replace(regex, 'url("data:image/svg+xml;base64,")');
            hasChanges = true;
          }
        }
      });

      return hasChanges ? transformedCode : undefined;
    },
  };
}
