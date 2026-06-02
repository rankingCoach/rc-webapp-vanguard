import fs from 'node:fs';
import path from 'node:path';

import { Project } from 'ts-morph';

function extractTypeNamesFromText(typeText) {
  const typeNames = new Set();
  if (!typeText) return typeNames;
  const tokens = typeText.split(/[|&<>()[\]{},\s\n;]+/).filter(Boolean);
  for (const token of tokens) {
    if (/^[A-Z]/.test(token) || /[a-z][A-Z]/.test(token)) typeNames.add(token);
  }
  return typeNames;
}

export function extractSignature(rootDir, tsConfigPath, sourceRelPath, exportName, sharedProject) {
  try {
    const project = sharedProject ?? new Project({
      tsConfigFilePath: tsConfigPath,
      compilerOptions: { allowJs: true, skipLibCheck: true },
    });

    // Resolve possible file paths (preserve provided path relative to repo root)
    // sourceRelPath is expected to be like 'src/custom-hooks/.../file.ts' or a module path
    const candidate = path.join(rootDir, sourceRelPath);
    const possibleFiles = [];

    // If path points directly to a file with extension, prefer it
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      possibleFiles.push(candidate);
    }

    // Try common extensions variants (in case path omits extension)
    for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
      possibleFiles.push(candidate + ext);
    }

    // Also try as an index file in a directory
    for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
      possibleFiles.push(path.join(candidate, `index${ext}`));
    }

    const filePath = possibleFiles.find((p) => fs.existsSync(p));
    if (!filePath) return null;

    const sourceFile = project.addSourceFileAtPath(filePath);

    // Find function declaration
    const fn =
      sourceFile.getFunction(exportName) ||
      sourceFile.getVariableDeclaration(exportName) ||
      sourceFile.getClass(exportName);

    if (!fn) {
      // Might be exported as default from file, or as named export from the module's default
      // Try to look for export assignments
      // const exported = sourceFile.getExportAssignment ? sourceFile.getExportAssignment(exportName) : null;
      // Fallback: return minimal info
      return { name: exportName, filePath: path.relative(rootDir, filePath), signature: null, dependentTypes: null };
    }

    // If variable, see initializer
    let signature = null;
    if (fn.getKindName && fn.getKindName() === 'VariableDeclaration') {
      const init = fn.getInitializer && fn.getInitializer();
      if (init && init.getType) {
        const type = init.getType().getText();
        signature = { raw: type };
      }
    } else if (fn.getKindName && fn.getKindName() === 'FunctionDeclaration') {
      const params = fn
        .getParameters()
        .map((p) => ({ name: p.getName(), type: p.getType().getText(), optional: p.isOptional() }));
      const returnType = fn.getReturnType().getText();
      signature = { parameters: params, returnType };
    } else if (fn.getKindName && fn.getKindName() === 'ClassDeclaration') {
      signature = { kind: 'class' };
    }

    // Collect dependent types from parameter and return types
    const dependentTypes = {};
    if (signature && signature.parameters) {
      for (const p of signature.parameters) {
        for (const t of extractTypeNamesFromText(p.type)) dependentTypes[t] = { kind: 'type' };
      }
    }
    if (signature && signature.returnType) {
      for (const t of extractTypeNamesFromText(signature.returnType)) dependentTypes[t] = { kind: 'type' };
    }

    return {
      name: exportName,
      filePath: path.relative(rootDir, filePath),
      signature,
      dependentTypes: Object.keys(dependentTypes).length ? dependentTypes : undefined,
    };
  } catch (error) {
    console.warn(`⚠ Error extracting signature for ${exportName}: ${error.message}`);
    return null;
  }
}
