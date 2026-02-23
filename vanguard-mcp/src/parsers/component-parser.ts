import * as fs from 'fs';
import * as path from 'path';
import { Project } from 'ts-morph';

import { ComponentPropsDetails, PropsField } from '../types.js';

/**
 * Parses TypeScript component files to extract props interfaces
 */
export class ComponentParser {
  private static project: Project;
  private static propsCache: Map<string, string> = new Map();

  /**
   * Initialize the TypeScript project
   */
  static initialize(): void {
    try {
      const tsConfigPath = path.join(process.cwd(), '..', 'tsconfig.json');
      this.project = new Project({
        tsConfigFilePath: tsConfigPath,
        compilerOptions: {
          allowJs: true,
          skipLibCheck: true,
        },
      });
    } catch (error) {
      console.warn('Could not initialize ts-morph project, some features may be limited:', error);
    }
  }

  /**
   * Extract props interface from a component file
   */
  static getComponentProps(componentFilePath: string, componentName: string): string | null {
    // Check cache first
    const cacheKey = componentName;
    if (this.propsCache.has(cacheKey)) {
      return this.propsCache.get(cacheKey) || null;
    }

    try {
      // Ensure path exists
      if (!fs.existsSync(componentFilePath)) {
        return null;
      }

      // If ts-morph is available, use it for better parsing
      if (this.project) {
        return this.extractPropsWithTsMorph(componentFilePath, componentName);
      } else {
        // Fallback to regex-based extraction
        return this.extractPropsWithRegex(componentFilePath, componentName);
      }
    } catch (error) {
      console.error(`Error parsing props for ${componentName}:`, error);
      return null;
    }
  }

  /**
   * Extract props using ts-morph AST parser
   */
  private static extractPropsWithTsMorph(componentFilePath: string, componentName: string): string | null {
    try {
      const sourceFile = this.project!.addSourceFileAtPath(componentFilePath);

      // Look for Props interface/type
      const propsNames = ['Props', `${componentName}Props`];

      for (const propsName of propsNames) {
        // Try interface
        const interfaceDecl = sourceFile.getInterface(propsName);
        if (interfaceDecl) {
          const text = interfaceDecl.getText();
          this.propsCache.set(componentName, text);
          return text;
        }

        // Try type alias
        const typeAlias = sourceFile.getTypeAlias(propsName);
        if (typeAlias) {
          const text = typeAlias.getText();
          this.propsCache.set(componentName, text);
          return text;
        }
      }

      return null;
    } catch (error) {
      console.error(`ts-morph parsing failed for ${componentName}:`, error);
      return null;
    }
  }

  /**
   * Extract props using regex (fallback)
   */
  private static extractPropsWithRegex(componentFilePath: string, componentName: string): string | null {
    try {
      const content = fs.readFileSync(componentFilePath, 'utf-8');

      // Look for "export type {ComponentName}Props = " or "export interface {ComponentName}Props"
      const patterns = [
        new RegExp(`export (?:type|interface) ${componentName}Props\\s*(?:=|\\s*\\{)[^}]*(?:\\}|;)`, 's'),
        new RegExp(`export (?:type|interface) Props\\s*(?:=|\\s*\\{)[^}]*(?:\\}|;)`, 's'),
      ];

      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          const text = match[0];
          this.propsCache.set(componentName, text);
          return text;
        }
      }

      return null;
    } catch (error) {
      console.error(`Regex parsing failed for ${componentName}:`, error);
      return null;
    }
  }

  private static propsDetailsCache: Map<string, ComponentPropsDetails> = new Map();

  /**
   * Clear cache (useful for testing or file watching)
   */
  static clearCache(): void {
    this.propsCache.clear();
    this.propsDetailsCache.clear();
  }

  /**
   * Get parsed props details (fields + types + descriptions)
   */
  static getComponentPropsDetails(componentFilePath: string, componentName: string): ComponentPropsDetails | null {
    const cacheKey = componentName;
    if (this.propsDetailsCache.has(cacheKey)) {
      return this.propsDetailsCache.get(cacheKey) || null;
    }

    try {
      if (!fs.existsSync(componentFilePath)) {
        return null;
      }

      if (this.project) {
        const details = this.extractPropsDetailsWithTsMorph(componentFilePath, componentName);
        if (details) {
          this.propsDetailsCache.set(cacheKey, details);
          return details;
        }
      }

      const fallback = this.extractPropsDetailsWithRegex(componentFilePath, componentName);
      if (fallback) {
        this.propsDetailsCache.set(cacheKey, fallback);
        return fallback;
      }

      return null;
    } catch (error) {
      console.error(`Error extracting props details for ${componentName}:`, error);
      return null;
    }
  }

  private static extractPropsDetailsWithTsMorph(
    componentFilePath: string,
    componentName: string,
  ): ComponentPropsDetails | null {
    try {
      const sourceFile = this.project!.addSourceFileAtPath(componentFilePath);
      const propsNames = ['Props', `${componentName}Props`];

      for (const propsName of propsNames) {
        const interfaceDecl = sourceFile.getInterface(propsName);
        if (interfaceDecl) {
          const fields = interfaceDecl.getProperties().map((prop) => {
            const name = prop.getName();
            const optional = prop.hasQuestionToken();
            const typeNode = prop.getTypeNode();
            const type = typeNode ? typeNode.getText() : prop.getType().getText();
            const jsDocs = prop.getJsDocs();
            const description =
              jsDocs
                .map((d) => d.getComment())
                .filter(Boolean)
                .join('\n') || undefined;
            return { name, type, optional, description } as PropsField;
          });

          const raw = interfaceDecl.getText();
          return { componentName, fields, raw };
        }

        const typeAlias = sourceFile.getTypeAlias(propsName);
        if (typeAlias) {
          const typeNode = typeAlias.getTypeNode();
          const members = typeNode && (typeNode as any).getMembers ? (typeNode as any).getMembers() : [];
          const fields = members.map((member: any) => {
            const name = member.getName();
            const optional = member.hasQuestionToken ? member.hasQuestionToken() : false;
            const type = member.getTypeNode
              ? member.getTypeNode().getText()
              : member.getType
                ? member.getType().getText()
                : 'unknown';
            const jsDocs = member.getJsDocs ? member.getJsDocs() : [];
            const description =
              jsDocs
                .map((d: any) => d.getComment())
                .filter(Boolean)
                .join('\n') || undefined;
            return { name, type, optional, description } as PropsField;
          });

          const raw = typeAlias.getText();
          return { componentName, fields, raw };
        }
      }

      return null;
    } catch (error) {
      console.error(`ts-morph failed extracting props details for ${componentName}:`, error);
      return null;
    }
  }

  private static extractPropsDetailsWithRegex(
    componentFilePath: string,
    componentName: string,
  ): ComponentPropsDetails | null {
    try {
      const content = fs.readFileSync(componentFilePath, 'utf-8');

      const patterns = [
        new RegExp(`export (?:interface|type) ${componentName}Props\s*(?:=|\{)([\s\S]*?)\}`, 'm'),
        new RegExp(`export (?:interface|type) Props\s*(?:=|\{)([\s\S]*?)\}`, 'm'),
      ];

      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          const body = match[1];
          const lines = body
            .split(/\n|;/)
            .map((l) => l.trim())
            .filter(Boolean);
          const fields: PropsField[] = [];
          for (const line of lines) {
            // Try to parse: name?: type or name: type
            const m = line.match(/^\s*([a-zA-Z0-9_]+)(\??)\s*:?\s*([^;{]+)/);
            if (m) {
              const name = m[1];
              const optional = m[2] === '?';
              const type = m[3].trim();
              fields.push({ name, type, optional, description: undefined } as PropsField);
            }
          }
          const raw = match[0];
          return { componentName, fields, raw };
        }
      }

      return null;
    } catch (error) {
      console.error(`Regex extraction failed for ${componentName}:`, error);
      return null;
    }
  }
}
