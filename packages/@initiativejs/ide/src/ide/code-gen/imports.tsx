import { SceneDocument } from "#shared";

export interface ImportNames {
  /**
   * Map from `NodeSchema.name` to node component import name.
   *
   * Import names are not guaranteed to be the same as their
   * `NodeDefinition.exportName`, because the export name is not guaranteed to
   * be unique across multiple modules.
   */
  nodeComponents: ReadonlyMap<string, string>;
}

// TODO expand to include kraggel schema imports
export function resolveUsedImports(document: SceneDocument) {
  const importStatements = [
    `import { createContext, memo, useContext } from "react";`,
    `import { OutputTypes, OutputsProviderProps, SlotComponentProps, } from ` +
      `"@initiativejs/schema/code-gen-helpers";`,
  ];

  // `nodeComponents` is the same as `ImportNames.nodeComponents`.
  // `nodeComponentImportNames` contains the same values as
  // `nodeComponents.values()`.
  const nodeComponents = new Map<string, string>();
  const nodeComponentImportNames = new Set<string>();
  function importNodeComponent(nodeType: string) {
    if (nodeComponents.has(nodeType)) return;
    const { moduleName, exportName } = document.definitions.getNode(nodeType);
    for (let i = 1; ; i++) {
      const importName = i === 1 ? exportName : `${exportName}${i}`;
      if (!nodeComponentImportNames.has(importName)) {
        importStatements.push(`import { ${importName} } from "${moduleName}";`);
        importStatements.push(
          i === 1
            ? `import { type ${importName}Schema } from "${moduleName}";`
            : `import { type ${exportName} as ${importName}Schema } from ` +
                `"${moduleName}";`,
        );
        nodeComponents.set(nodeType, importName);
        nodeComponentImportNames.add(importName);
        break;
      }
    }
  }

  for (const nodeId of document.keys()) {
    const nodeData = document.getNode(nodeId);
    importNodeComponent(nodeData.type);
  }

  return {
    importStatements: importStatements.join("\n"),
    importNames: { nodeComponents },
  };
}
