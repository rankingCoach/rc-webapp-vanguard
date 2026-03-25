import fs from 'node:fs';
import path from 'node:path';

/**
 * Load all metadata files from exports-meta directory
 * @param {string} metaDir - Directory containing meta .json files
 * @returns {Object[]} Array of parsed metadata files
 */
export function loadAllMetaFiles(metaDir) {
  const metaFiles = [];

  if (!fs.existsSync(metaDir)) {
    console.warn(`  ⚠ Meta directory not found: ${metaDir}`);
    return metaFiles;
  }

  try {
    const files = fs.readdirSync(metaDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      try {
        const filePath = path.join(metaDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const meta = JSON.parse(content);
        metaFiles.push(meta);
      } catch (err) {
        console.warn(`  ⚠ Failed to parse meta file ${file}: ${err.message}`);
      }
    }
  } catch (err) {
    console.warn(`  ⚠ Failed to read meta directory: ${err.message}`);
  }

  return metaFiles;
}

/**
 * Build a map of export names to metadata
 * Metadata file names should match component/hook/helper names
 * @param {Object[]} metaFiles - Array of metadata objects
 * @returns {Map<string, Object>} Map from name to metadata
 */
export function buildMetaMap(metaFiles) {
  const metaMap = new Map();

  for (const meta of metaFiles) {
    if (!meta.id) {
      console.warn(`  ⚠ Meta file missing 'id' field: ${JSON.stringify(meta).slice(0, 50)}`);
      continue;
    }

    // Extract name from id (e.g., "component:button" → "Button")
    // The id format is "kind:id", where id is the normalized name
    // We need to find the actual export name by matching meta content
    const exportName = extractExportNameFromMeta(meta);

    if (exportName) {
      metaMap.set(exportName, meta);
    }
  }

  return metaMap;
}

/**
 * Extract the likely export name from metadata
 * This uses the id field and reverse-normalizes it
 * @param {Object} meta - Metadata object with 'id' and possibly 'name' field
 * @returns {string|null} The export name or null if unable to determine
 */
function extractExportNameFromMeta(meta) {
  // If meta has explicit 'name' field (user-set), prefer that
  if (meta.name) {
    return meta.name;
  }

  // Extract from id: "component:button" → "Button"
  // "hook:use-form" → "useForm"
  // "constant:default-marker" → "DefaultMarker"
  const parts = meta.id.split(':');
  if (parts.length !== 2) {
    return null;
  }

  const [kind, id] = parts;
  return denormalizeId(id, kind);
}

/**
 * Convert normalized ID back to export name
 * "button" → "Button"
 * "action-bar-root" → "ActionBarRoot"
 * "use-form-config" → "useFormConfig"
 * @param {string} id - Normalized ID
 * @param {string} kind - Item kind (component, hook, helper, constant)
 * @returns {string} Export name
 */
function denormalizeId(id, kind) {
  const parts = id.split('-');

  // For hooks, first word is lowercase
  if (kind === 'hook' && parts.length > 0) {
    parts[0] = parts[0].toLowerCase();
  }

  // Capitalize each part except first (for hooks)
  return parts
    .map((part, idx) => {
      if (kind === 'hook' && idx === 0) {
        return part; // Keep first part lowercase for hooks
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}

/**
 * Match metadata to an export by name
 * @param {string} exportName - Name of the export
 * @param {Map<string, Object>} metaMap - Map from name to metadata
 * @returns {Object|null} Metadata object or null if not found
 */
export function matchMetaToExport(exportName, metaMap) {
  return metaMap.get(exportName) || null;
}
