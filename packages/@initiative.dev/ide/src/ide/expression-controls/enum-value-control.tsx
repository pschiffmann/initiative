import { SelectControl } from "#design-system";
import { EnumValueExpression } from "#shared";
import { t } from "@initiative.dev/schema";
import { useMemo } from "react";
import { ExpressionControlProps, generateHelpText } from "./index.js";

export function EnumValueControl({
  parent,
  name,
  expectedType,
  optional,
  doc,
  expression,
  onChange,
}: ExpressionControlProps<EnumValueExpression>) {
  const options = useMemo(() => {
    if (!t.Union.is(expectedType)) return [];
    return expectedType.elements
      .map((e) => (t.String.is(e) || t.Number.is(e) ? e.value : null))
      .filter(
        (v): v is string | number =>
          typeof v === "string" || typeof v === "number",
      );
  }, [expectedType]);

  return (
    <SelectControl
      label={name}
      helpText={generateHelpText(name, expectedType, optional, doc)}
      dense={parent === "member-access-expression"}
      options={options}
      getOptionLabel={(o) => JSON.stringify(o)}
      noOptionSelectedLabel=""
      value={expression.value}
      onChange={(value) => onChange(expression.withValue(value))}
      onClear={() => onChange(null)}
    />
  );
}
