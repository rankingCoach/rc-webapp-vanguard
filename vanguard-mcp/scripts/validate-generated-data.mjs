#!/usr/bin/env node

/**
 * Validation script for MCP generated data
 * Checks catalogue structure, detail files, and data consistency
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MCP_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(MCP_DIR, 'data');
const CATALOGUE_PATH = path.join(DATA_DIR, 'catalogue.json');
const ITEMS_DIR = path.join(DATA_DIR, 'items');

const errors = [];
const warnings = [];

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Validating MCP Generated Data');
  console.log('=================================\n');

  try {
    validateCatalogueExists();
    validateCatalogueStructure();
    validateDetailFiles();
    validateDataConsistency();

    printResults();
    process.exit(errors.length > 0 ? 1 : 0);
  } catch (err) {
    console.error('❌ Validation failed with error:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

/**
 * Check if catalogue file exists
 */
function validateCatalogueExists() {
  if (!fs.existsSync(CATALOGUE_PATH)) {
    errors.push(`Catalogue file not found at ${CATALOGUE_PATH}`);
    return;
  }

  try {
    const content = fs.readFileSync(CATALOGUE_PATH, 'utf-8');
    JSON.parse(content);
  } catch (err) {
    errors.push(`Catalogue file is not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Validate catalogue structure and content
 */
function validateCatalogueStructure() {
  try {
    const content = fs.readFileSync(CATALOGUE_PATH, 'utf-8');
    const catalogue = JSON.parse(content);

    // Check required fields
    if (!catalogue.version) {
      errors.push('Catalogue missing "version" field');
    }
    if (!catalogue.generatedAt) {
      errors.push('Catalogue missing "generatedAt" field');
    }
    if (!catalogue.stats) {
      errors.push('Catalogue missing "stats" field');
    }
    if (!Array.isArray(catalogue.items)) {
      errors.push('Catalogue "items" must be an array');
      return;
    }

    // Validate stats
    if (catalogue.stats) {
      const stats = catalogue.stats;
      if (typeof stats.totalComponents !== 'number') {
        errors.push('Stats.totalComponents must be a number');
      }
      if (typeof stats.totalHooks !== 'number') {
        errors.push('Stats.totalHooks must be a number');
      }
      if (typeof stats.totalHelpers !== 'number') {
        errors.push('Stats.totalHelpers must be a number');
      }
      const expectedTotal = stats.totalComponents + stats.totalHooks + stats.totalHelpers;
      if (stats.totalItems !== expectedTotal) {
        errors.push(
          `Stats.totalItems (${stats.totalItems}) doesn't match sum of components + hooks + helpers (${expectedTotal})`,
        );
      }
    }

    // Validate each item
    const ids = new Set();
    for (const item of catalogue.items) {
      if (!item.id) {
        errors.push('Catalogue item missing "id" field');
      } else if (ids.has(item.id)) {
        errors.push(`Duplicate catalogue item ID: ${item.id}`);
      } else {
        ids.add(item.id);
      }

      if (!item.kind) {
        errors.push('Catalogue item missing "kind" field');
      }
      if (!item.name) {
        errors.push('Catalogue item missing "name" field');
      }
      if (!Array.isArray(item.keywords)) {
        errors.push(`Catalogue item ${item.id} has non-array keywords`);
      }
      if (!Array.isArray(item.tags)) {
        errors.push(`Catalogue item ${item.id} has non-array tags`);
      }
      if (!item.detailsRef) {
        warnings.push(`Catalogue item ${item.id} missing "detailsRef" field`);
      }
    }

    console.log(`✓ Catalogue structure validated (${catalogue.items.length} items)`);
  } catch (err) {
    errors.push(`Error validating catalogue structure: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Validate detail files exist and are valid
 */
function validateDetailFiles() {
  try {
    const catalogue = JSON.parse(fs.readFileSync(CATALOGUE_PATH, 'utf-8'));

    if (!fs.existsSync(ITEMS_DIR)) {
      errors.push(`Items directory does not exist: ${ITEMS_DIR}`);
      return;
    }

    const actualFiles = new Set(fs.readdirSync(ITEMS_DIR));
    let validDetailFiles = 0;
    const missingFiles = [];
    const invalidJsonFiles = [];

    for (const item of catalogue.items) {
      const expectedFilename = path.basename(item.detailsRef);

      // Check if file exists
      if (!actualFiles.has(expectedFilename)) {
        missingFiles.push(expectedFilename);
        continue;
      }

      // Check if file is valid JSON
      try {
        const filePath = path.join(ITEMS_DIR, expectedFilename);
        const content = fs.readFileSync(filePath, 'utf-8');
        JSON.parse(content);
        validDetailFiles++;
      } catch (err) {
        invalidJsonFiles.push(`${expectedFilename}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    if (missingFiles.length > 0) {
      errors.push(`Missing detail files: ${missingFiles.join(', ')}`);
    }
    if (invalidJsonFiles.length > 0) {
      errors.push(`Invalid detail files: ${invalidJsonFiles.join('; ')}`);
    }

    console.log(`✓ Detail files validated (${validDetailFiles} valid files)`);
  } catch (err) {
    errors.push(`Error validating detail files: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Validate data consistency
 */
function validateDataConsistency() {
  try {
    const catalogue = JSON.parse(fs.readFileSync(CATALOGUE_PATH, 'utf-8'));

    // Check component count consistency
    const components = catalogue.items.filter((item) => item.kind === 'component');
    const hooks = catalogue.items.filter((item) => item.kind === 'hook');
    const helpers = catalogue.items.filter((item) => item.kind === 'helper');

    if (catalogue.stats.totalComponents !== components.length) {
      errors.push(
        `Component count mismatch: stats says ${catalogue.stats.totalComponents}, but found ${components.length}`,
      );
    }
    if (catalogue.stats.totalHooks !== hooks.length) {
      errors.push(`Hook count mismatch: stats says ${catalogue.stats.totalHooks}, but found ${hooks.length}`);
    }
    if (catalogue.stats.totalHelpers !== helpers.length) {
      errors.push(`Helper count mismatch: stats says ${catalogue.stats.totalHelpers}, but found ${helpers.length}`);
    }

    // Check metadata coverage
    const itemsWithMetadata = catalogue.items.filter(
      (item) => item.summary || (Array.isArray(item.keywords) && item.keywords.length > 0),
    ).length;

    const expectedCoverage = catalogue.stats.itemsWithMetadata;
    if (itemsWithMetadata !== expectedCoverage) {
      warnings.push(
        `Metadata coverage mismatch: stats says ${expectedCoverage}, but found ${itemsWithMetadata} items with metadata`,
      );
    }

    console.log('✓ Data consistency validated');
  } catch (err) {
    errors.push(`Error validating data consistency: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Print validation results
 */
function printResults() {
  console.log('\n📋 Validation Results');
  console.log('====================\n');

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All validations passed!\n');
    return;
  }

  if (errors.length > 0) {
    console.log('❌ Errors:');
    errors.forEach((err) => console.log(`  - ${err}`));
    console.log();
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach((warn) => console.log(`  - ${warn}`));
    console.log();
  }

  const summary =
    errors.length > 0
      ? `${errors.length} error${errors.length > 1 ? 's' : ''}, ${warnings.length} warning${warnings.length > 1 ? 's' : ''}`
      : `${warnings.length} warning${warnings.length > 1 ? 's' : ''}`;

  console.log(`Summary: ${summary}`);
}

// Run validation
main();
