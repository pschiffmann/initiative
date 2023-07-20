import { InferLibraryMembers, LibrarySchema, t } from "@kragle/runtime";

export const ArraySchema = new LibrarySchema("@kragle/template-std::Array", {
  at: t.function(t.array(t.any()), t.number())(t.any()),
  length: t.function(t.array(t.any()))(t.number()),
});

export type ArrayMembers = InferLibraryMembers<typeof ArraySchema>;
