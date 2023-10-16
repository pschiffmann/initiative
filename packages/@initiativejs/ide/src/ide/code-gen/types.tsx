import { t } from "@initiativejs/schema";
import { ImportNames } from "./imports.js";

export function generateType(type: t.Type, importNames: ImportNames): string {
  if (
    type instanceof t.Any ||
    type instanceof t.Boolean ||
    type instanceof t.Null ||
    type instanceof t.Number ||
    type instanceof t.String ||
    type instanceof t.Undefined ||
    type instanceof t.Void
  ) {
    return type.toString();
  }

  if (t.Array.is(type)) {
    return `readonly ${_generateType(type.element, importNames)}[]`;
  } else if (type instanceof t.Entity) {
    return importNames.importType(type.typeSource);
  } else if (t.Function.is(type)) {
    const parameters = type.parameters.map(
      (p, i) =>
        `p${i + 1}${i < type.requiredCount ? "" : "?"}: ` +
        generateType(p, importNames),
    );
    const returnType = generateType(type.returnType, importNames);
    return `(${parameters.join(", ")}) => ${returnType}`;
  } else if (t.Tuple.is(type)) {
    const elements = type.elements.map((e) => generateType(e, importNames));
    return `[${elements.join(", ")}]`;
  } else if (t.Union.is(type)) {
    return type.elements.map((e) => generateType(e, importNames)).join(" | ");
  }

  throw new Error("Unimplemented");
}

/**
 * Like `generateType`, but wraps the generated string in brackets if necessary.
 */
function _generateType(type: t.Type, importNames: ImportNames): string {
  const result = generateType(type, importNames);
  return t.Array.is(type) || t.Function.is(type) || t.Union.is(type)
    ? `(${result})`
    : result;
}