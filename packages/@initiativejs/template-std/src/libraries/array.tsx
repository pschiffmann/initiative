import { ArrayMembers } from "./array.schema.js";

export const Array$at: ArrayMembers["at"] = (self, value) => self[value];
export const Array$length: ArrayMembers["length"] = (self) => self.length;
