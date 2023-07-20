import { OperatorsMembers } from "./operators.schema.js";

export const Operators$eq: OperatorsMembers["eq"] = (a, b) => a === b;
export const Operators$gt: OperatorsMembers["gt"] = (a, b) => a > b;
export const Operators$ge: OperatorsMembers["ge"] = (a, b) => a >= b;
export const Operators$lt: OperatorsMembers["lt"] = (a, b) => a < b;
export const Operators$le: OperatorsMembers["le"] = (a, b) => a <= b;
export const Operators$and: OperatorsMembers["and"] = (a, b) => a && b;
export const Operators$or: OperatorsMembers["or"] = (a, b) => a || b;
export const Operators$not: OperatorsMembers["or"] = (a) => !a;
export const Operators$ternary: OperatorsMembers["ternary"] = (
  condition,
  thenValue,
  elseValue
) => (condition ? thenValue : elseValue);
