import { t } from "@initiativejs/schema";
import { NameResolver } from "./name-resolver.js";

export function generateType(type: t.Type, nameResolver: NameResolver): string {
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
    return `readonly ${_generateType(type.element, nameResolver)}[]`;
  } else if (type instanceof t.Entity) {
    return nameResolver.importType(type.typeSource);
  } else if (t.Function.is(type)) {
    const parameters = type.parameters.map(
      (p, i) =>
        `p${i + 1}${i < type.requiredCount ? "" : "?"}: ` +
        generateType(p, nameResolver),
    );
    const returnType = generateType(type.returnType, nameResolver);
    return `(${parameters.join(", ")}) => ${returnType}`;
  } else if (t.Tuple.is(type)) {
    const elements = type.elements.map((e) => generateType(e, nameResolver));
    return `[${elements.join(", ")}]`;
  } else if (t.Union.is(type)) {
    return type.elements.map((e) => generateType(e, nameResolver)).join(" | ");
  }

  throw new Error("Unimplemented");
}

/**
 * Like `generateType`, but wraps the generated string in brackets if necessary.
 */
function _generateType(type: t.Type, nameResolver: NameResolver): string {
  const result = generateType(type, nameResolver);
  return t.Array.is(type) || t.Function.is(type) || t.Union.is(type)
    ? `(${result})`
    : result;
}
