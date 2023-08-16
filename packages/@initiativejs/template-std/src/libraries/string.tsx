import { StringMembers } from "./string.schema.js";

export const String$length: StringMembers["length"] = (self) => self.length;
export const String$concat: StringMembers["concat"] = (a, b, c = "", d = "") =>
  `${a}${b}${c}${d}`;
