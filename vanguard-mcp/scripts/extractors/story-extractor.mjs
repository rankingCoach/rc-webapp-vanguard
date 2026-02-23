import fs from 'fs';
import path from 'path';

/**
 * Extract story code from story files using simple string matching
 * Falls back gracefully if file not found or parsing fails
 * @param {string} storyFilePath - Path to story file
 * @param {string} storyName - Export name of the story
 * @returns {string|null} Story code or null if not found
 */
export function extractStoryCode(storyFilePath, storyName) {
  try {
    // Resolve path
    if (!fs.existsSync(storyFilePath)) {
      return null;
    }

    const content = fs.readFileSync(storyFilePath, 'utf-8');

    // Look for export pattern: export const StoryName = { ... }
    // This is a simplified regex that captures single-line and multi-line exports
    const exportRegex = new RegExp(
      `export\\s+(?:const|let)\\s+${escapeRegex(storyName)}\\s*=\\s*\\{[^}]*(?:\\{[^}]*\\}[^}]*)*\\}`,
      's'
    );

    const match = content.match(exportRegex);
    if (match) {
      return match[0];
    }

    // Fallback: look for any export of this story name
    const simpleExportRegex = new RegExp(`export\\s+(?:const|let)\\s+${escapeRegex(storyName)}\\s*=`, 's');
    const simpleMatch = content.match(simpleExportRegex);

    if (simpleMatch) {
      // Found export start, but couldn't parse full object
      // Return null to indicate partial match
      return null;
    }

    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Escape special regex characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
