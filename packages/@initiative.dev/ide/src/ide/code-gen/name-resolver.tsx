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
   *
   * The import statement `import Button from "@mui/material/Button";` gets
   * stored as `{ "@mui/material/Button": { "default": "Button" } }`.
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

  importDefault({
    moduleName,
    as,
  }: {
    moduleName: string;
    as: string;
  }): string {
    const moduleImports = $Map.putIfAbsent(
      this.#importedBindings,
      moduleName,
      () => new Map(),
    );
    return $Map.putIfAbsent(moduleImports, "default", () => {
      const importsWithSameName = this.#namesCounter.get(as) ?? 0;
      this.#namesCounter.set(as, importsWithSameName + 1);
      return importsWithSameName === 0 ? as : `${as}${importsWithSameName + 1}`;
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
      .sort((a, b) => {
        if (a.startsWith("#") && !b.startsWith("#")) return -1;
        if (b.startsWith("#") && !a.startsWith("#")) return 1;
        if (a.startsWith("./") && !b.startsWith("./")) return 1;
        if (b.startsWith("./") && !a.startsWith("./")) return -1;
        if (a.startsWith("../") && !b.startsWith("../")) return 1;
        if (b.startsWith("../") && !a.startsWith("../")) return -1;

        return a.localeCompare(b);
      })
      .map((moduleName) => {
        const importedBindings = this.#importedBindings.get(moduleName);
        const defaultImport = importedBindings?.get("default");
        const bindingImports = [...(importedBindings ?? [])]
          .filter(([exportName]) => exportName !== "default")
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
        return defaultImport && !!imports
          ? `import ${defaultImport}, { ${imports} } from "${moduleName}";`
          : defaultImport
          ? `import ${defaultImport} from "${moduleName}";`
          : `import { ${imports} } from "${moduleName}";`;
      })
      .join("\n");
  }
}
