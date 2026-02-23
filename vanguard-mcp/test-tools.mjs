#!/usr/bin/env node

/**
 * Simple test script to verify Phase 1 tools work correctly
 */

import { StorybookLoader } from './dist/loaders/storybook-loader.js';
import { searchComponents } from './dist/tools/search-components.js';
import { searchByUseCase } from './dist/tools/search-by-use-case.js';
import { getRelatedComponents } from './dist/tools/get-related-components.js';
import { getComponentDetails } from './dist/tools/get-component-details.js';

console.log('🧪 Testing Phase 1 MCP Tools\n');

// Load component index
console.log('Loading component index...');
const componentIndex = StorybookLoader.loadStorybook();
console.log(`✓ Loaded ${Object.keys(componentIndex).length} components\n`);

// Test 1: Enhanced search_components
console.log('=== Test 1: Enhanced search_components ===');
console.log('Test 1a: Search by name "button"');
let results = searchComponents(componentIndex, { query: 'button', searchMode: 'name' });
console.log(`✓ Found ${results.length} results`);
if (results.length > 0) {
  console.log(`  - First result: ${results[0].name} (score: ${results[0].relevanceScore}, reason: ${results[0].matchReason})`);
}

console.log('\nTest 1b: Search by keyword "form"');
results = searchComponents(componentIndex, { query: 'form', searchMode: 'keyword' });
console.log(`✓ Found ${results.length} results`);
if (results.length > 0) {
  console.log(`  - First result: ${results[0].name} (score: ${results[0].relevanceScore}, reason: ${results[0].matchReason})`);
}

console.log('\nTest 1c: Search with tag filter ["forms"]');
results = searchComponents(componentIndex, { query: 'input', tags: ['forms'] });
console.log(`✓ Found ${results.length} results`);
if (results.length > 0) {
  results.slice(0, 3).forEach((r) => {
    console.log(`  - ${r.name} (tags: ${r.tags?.join(', ')})`);
  });
}

// Test 2: search_by_use_case
console.log('\n=== Test 2: search_by_use_case ===');
console.log('Test 2a: "I need a date picker"');
let useCaseResult = searchByUseCase({ useCase: 'I need a date picker' });
console.log(`✓ Found ${useCaseResult.results.length} results`);
if (useCaseResult.results.length > 0) {
  console.log(`  - Top result: ${useCaseResult.results[0].name} (score: ${useCaseResult.results[0].relevanceScore})`);
  console.log(`  - Match reason: ${useCaseResult.results[0].matchReason}`);
}
if (useCaseResult.suggestions.length > 0) {
  console.log(`  - Suggestions: ${useCaseResult.suggestions.slice(0, 3).join(', ')}`);
}

console.log('\nTest 2b: "components for file upload"');
useCaseResult = searchByUseCase({ useCase: 'components for file upload' });
console.log(`✓ Found ${useCaseResult.results.length} results`);
if (useCaseResult.results.length > 0) {
  console.log(`  - Top results: ${useCaseResult.results.slice(0, 3).map((r) => r.name).join(', ')}`);
}

// Test 3: get_related_components
console.log('\n=== Test 3: get_related_components ===');
console.log('Test 3a: Related to "Button"');
let relatedResult = getRelatedComponents({ componentName: 'Button' });
if (relatedResult) {
  console.log(`✓ Found ${relatedResult.related.length} related components`);
  if (relatedResult.related.length > 0) {
    relatedResult.related.slice(0, 3).forEach((r) => {
      console.log(`  - ${r.name} (score: ${r.similarityScore.toFixed(2)}, reason: ${r.relationshipReason})`);
    });
  }
} else {
  console.log('✗ Button not found');
}

console.log('\nTest 3b: Related to "Input" (same-tags only)');
relatedResult = getRelatedComponents({ componentName: 'Input', relationshipType: 'same-tags', limit: 5 });
if (relatedResult) {
  console.log(`✓ Found ${relatedResult.related.length} related components`);
  if (relatedResult.related.length > 0) {
    relatedResult.related.slice(0, 3).forEach((r) => {
      console.log(`  - ${r.name} (${r.relationshipReason})`);
    });
  }
}

// Test 4: Enhanced get_component_details
console.log('\n=== Test 4: Enhanced get_component_details ===');
console.log('Test 4a: Get Button details with related components');
const details = getComponentDetails(componentIndex, { componentName: 'Button', includeRelated: true });
if (details) {
  console.log(`✓ Component: ${details.name}`);
  console.log(`  - Story count: ${details.storyCount}`);
  if (details.metadata) {
    console.log(`  - Summary: ${details.metadata.summary}`);
    console.log(`  - Tags: ${details.metadata.tags?.join(', ')}`);
    console.log(`  - Keywords: ${details.metadata.keywords?.slice(0, 5).join(', ')}`);
  }
  if (details.relatedComponents && details.relatedComponents.length > 0) {
    console.log(`  - Related components (${details.relatedComponents.length}):`);
    details.relatedComponents.slice(0, 3).forEach((r) => {
      console.log(`    • ${r.name} (${r.relationshipReason})`);
    });
  }
} else {
  console.log('✗ Button not found');
}

console.log('\n✅ All tests completed!');
