import { InferLibraryMembers, LibrarySchema, t } from "@kragle/runtime";

export const StringSchema = new LibrarySchema("@kragle/template-std::String", {
  concat: t.function(
    t.any(),
    t.any(),
    t.optional(t.any()),
    t.optional(t.any()),
  )(t.string()),
  length: t.function(t.string())(t.number()),
});

export type StringMembers = InferLibraryMembers<typeof StringSchema>;
