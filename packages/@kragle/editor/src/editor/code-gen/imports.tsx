import { SceneDocument } from "@kragle/runtime";

export interface ImportNames {
  /**
   * Map from `NodeSchema.name` to node component import name.
   *
   * Import names are not guaranteed to be the same as their
   * `NodeDefinition.exportName`, because the export name is not guaranteed to
   * be unique across multiple modules.
   */
  nodeComponents: ReadonlyMap<string, string>;

  /**
   * Map from `<libraryName>::<memberName>` to library member import name.
   */
  libraryMembers: ReadonlyMap<string, string>;
}

// TODO expand to include kraggel schema imports
export function resolveUsedImports(document: SceneDocument) {
  const importStatements = [
    `import { createContext, memo, useContext } from "react";`,
    `import { OutputTypes, OutputsProviderProps, SlotComponentProps, } from "@kragle/runtime/code-gen-helpers";`,
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
            ? `import { ${importName}Schema } from "${moduleName}";`
            : `import { ${exportName} as ${importName}Schema } from "${moduleName}";`,
        );
        nodeComponents.set(nodeType, importName);
        nodeComponentImportNames.add(importName);
        break;
      }
    }
  }

  const libraryMembers = new Map<string, string>();
  const libraryMemberImportNames = new Set<string>();
  function importLibraryMember(libraryName: string, memberName: string) {
    const memberKey = `${libraryName}::${memberName}`;
    if (libraryMembers.has(memberKey)) return;
    const { moduleName, exportNamePrefix } =
      document.definitions.getLibrary(libraryName);
    for (let i = 1; ; i++) {
      const importName =
        i === 1
          ? `${exportNamePrefix}$${memberName}`
          : `${exportNamePrefix}$${memberName}${i}`;
      if (!libraryMemberImportNames.has(importName)) {
        importStatements.push(`import { ${importName} } from "${moduleName}";`);
        libraryMembers.set(memberKey, importName);
        libraryMemberImportNames.add(importName);
        break;
      }
    }
  }

  for (const nodeId of document.keys()) {
    const nodeData = document.getNode(nodeId);
    importNodeComponent(nodeData.type);
    nodeData.forEachInput((expression) => {
      expression?.map((json) => {
        if (json.type === "library-member") {
          importLibraryMember(json.libraryName, json.memberName);
        }
        return json;
      });
    });
  }

  return {
    importStatements: importStatements.join("\n"),
    importNames: { nodeComponents, libraryMembers },
  };
}
