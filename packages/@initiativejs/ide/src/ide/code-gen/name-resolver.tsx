import * as $Map from "@pschiffmann/std/map";

export class NameResolver {
  #namesCounter = new Map<string, number>();

  /**
   * Outer keys are module names. Inner keys are module export names. Inner
   * values are import aliases.
   *
   * ## Examples
   *
   * The import statement `import { memo } from "react";` gets stored as
   * `{ "react": { "memo": "memo" } }`.
   *
   * The import statement
   * `import { Button as Button2 } from "#initiative/definitions.js";` gets
   * stored as `{ "#initiative/definitions.js": { "Button": "Button2" } }`.
   */
  #importedBindings = new Map<string, Map<string, string>>();

  /**
   * Same as `#importedNames`, but contains type imports like
   * `import { type ButtonSchema } from "#initiative/definitions.js";`.
   */
  #importedTypes = new Map<string, Map<string, string>>();

  /**
   * Map from requested name to actual name.
   */
  #declarations = new Map<string, string>();

  #importName(
    cache: Map<string, Map<string, string>>,
    moduleName: string,
    exportName: string,
  ) {
    const moduleImports = $Map.putIfAbsent(cache, moduleName, () => new Map());
    return $Map.putIfAbsent(moduleImports, exportName, () => {
      const importsWithSameName = this.#namesCounter.get(exportName) ?? 0;
      this.#namesCounter.set(exportName, importsWithSameName + 1);
      return importsWithSameName === 0
        ? exportName
        : `${exportName}${importsWithSameName + 1}`;
    });
  }

  importBinding({
    moduleName,
    exportName,
  }: {
    moduleName: string;
    exportName: string;
  }): string {
    return this.#importName(this.#importedBindings, moduleName, exportName);
  }

  importType({
    moduleName,
    exportName,
  }: {
    moduleName: string;
    exportName: string;
  }): string {
    return this.#importName(this.#importedTypes, moduleName, exportName);
  }

  declareName(name: string): string {
    return $Map.putIfAbsent(this.#declarations, name, () => {
      const importsWithSameName = this.#namesCounter.get(name) ?? 0;
      this.#namesCounter.set(name, importsWithSameName + 1);
      return importsWithSameName === 0
        ? name
        : `${name}${importsWithSameName + 1}`;
    });
  }

  generateImportStatements(): string {
    return [
      ...new Set([
        ...this.#importedBindings.keys(),
        ...this.#importedTypes.keys(),
      ]),
    ]
      .sort()
      .map((moduleName) => {
        const bindingImports = [
          ...(this.#importedBindings.get(moduleName) ?? []),
        ]
          .map(([exportName, alias]) =>
            exportName === alias ? exportName : `${exportName} as ${alias}`,
          )
          .sort();
        const typeImports = [...(this.#importedTypes.get(moduleName) ?? [])]
          .map(([exportName, alias]) =>
            exportName === alias
              ? `type ${exportName}`
              : `type ${exportName} as ${alias}`,
          )
          .sort();
        const imports = [...bindingImports, ...typeImports].join(", ");
        return `import { ${imports} } from "${moduleName}";`;
      })
      .join("\n");
  }
}
