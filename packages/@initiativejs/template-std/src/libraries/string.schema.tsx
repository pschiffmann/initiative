import { InferLibraryMembers, LibrarySchema, t } from "@initiativejs/schema";

export const StringSchema = new LibrarySchema(
  "@initiativejs/template-std::String",
  {
    concat: t.function(t.any(), t.any())(t.any(), t.any())(t.string()),
    length: t.function(t.string())()(t.number()),
  },
);

export type StringMembers = InferLibraryMembers<typeof StringSchema>;
