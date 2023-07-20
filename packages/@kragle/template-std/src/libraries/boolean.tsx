import { BooleanMembers } from "./boolean.schema.js";

export const Boolean$if: BooleanMembers["if"] = (
  condition,
  thenValue,
  elseValue
) => (condition ? thenValue : elseValue);
