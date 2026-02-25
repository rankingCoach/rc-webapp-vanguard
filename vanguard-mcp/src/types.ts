/**
 * Shared type definitions for the Vanguard MCP server
 */

/**
 * Entry from storybook.json file
 */
export interface StorybookEntry {
  id: string;
  type: 'story' | 'docs';
  name: string;
  title: string;
  importPath: string;
  tags?: string[];
  storiesImports?: string[];
}

/**
 * Parsed story information
 */
export interface StoryInfo {
  name: string;
  id: string;
  storyFilePath: string;
}

/**
 * Component metadata extracted from storybook.json and component files
 */
export interface ComponentInfo {
  name: string;
  stories: StoryInfo[];
  storyFilePath?: string;
  componentFilePath?: string;
  propsInterface?: string;
}

/**
 * Storybook entries grouped by component
 */
export interface ComponentIndex {
  [componentName: string]: ComponentInfo;
}

/**
 * Search result from search_components tool (enhanced)
 */
export interface SearchResult {
  name: string;
  kind: 'component' | 'hook' | 'helper';
  storyCount: number;
  componentPath?: string;
  summary?: string;
  keywords?: string[];
  tags?: string[];
  category?: string;
  matchReason?: string;
  relevanceScore?: number;
}

/**
 * Response from get_component_details tool (enhanced)
 */
export interface ComponentDetails {
  name: string;
  storyCount: number;
  stories: Array<{
    name: string;
    id: string;
  }>;
  propsInterface?: string;
  props?: PropsField[];
  componentPath?: string;
  dependentTypes?: Record<string, DependentType>;
  metadata?: {
    summary?: string;
    description?: string;
    keywords?: string[];
    tags?: string[];
    category?: string;
  };
  relatedComponents?: Array<{
    name: string;
    summary?: string;
    relationshipReason: string;
    similarityScore: number;
  }>;
}

/**
 * Response from get_component_examples tool
 */
export interface ComponentExamples {
  componentName: string;
  stories: Array<{
    name: string;
    code?: string;
  }>;
}

/**
 * Parsed props field information
 */
export interface PropsField {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
  defaultValue?: string;
}

/**
 * Dependent type used by component props (enum, type alias, interface, or import)
 */
export interface DependentType {
  kind: 'enum' | 'type' | 'interface' | 'import';
  text?: string;
  from?: string;
}

/**
 * Parsed props details for a component
 */
export interface ComponentPropsDetails {
  componentName: string;
  fields: PropsField[];
  raw?: string;
  dependentTypes?: Record<string, DependentType>;
}

/**
 * Hook information and signature
 */
export interface HookParameter {
  name: string;
  type: string;
  optional?: boolean;
}

export interface HookSignature {
  name: string;
  parameters?: HookParameter[];
  returnType?: string;
  raw?: string;
}

export interface HookInfo {
  id: string;
  name: string;
  category: 'hook';
  filePath: string;
  signature?: HookSignature | null;
  dependentTypes?: Record<string, DependentType> | null;
}

/**
 * Helper information and signature
 */
export interface HelperSignature {
  name: string;
  parameters?: HookParameter[];
  returnType?: string;
  raw?: string;
}

export interface HelperInfo {
  id: string;
  name: string;
  category: 'helper';
  filePath: string;
  signature?: HelperSignature | null;
  dependentTypes?: Record<string, DependentType> | null;
}

/**
 * Extended component info for vanguard.index
 */
export interface ExtendedComponentInfo {
  id: string;
  name: string;
  displayName?: string;
  componentPath?: string;
  storyCount?: number;
  hasStorybook?: boolean;
  category?: 'core' | 'common';
  tags?: string[];
}

/**
 * Unified Vanguard index file structure
 */
export interface VanguardIndex {
  version: string;
  generatedAt: string;
  stats: {
    totalComponents: number;
    coreComponents: number;
    commonComponents: number;
    componentsWithStorybook: number;
    totalHooks: number;
    totalHelpers: number;
  };
  components: ExtendedComponentInfo[];
  hooks: HookInfo[];
  helpers: HelperInfo[];
}

/**
 * Response from get_related_components tool
 */
export interface RelatedComponentsResult {
  component: string;
  related: Array<{
    name: string;
    summary?: string;
    relationshipReason: string;
    similarityScore: number;
  }>;
}
