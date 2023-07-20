import { InferLibraryMembers, LibrarySchema, t } from "@kragle/runtime";

export const BooleanSchema = new LibrarySchema(
  "@kragle/template-std::Boolean",
  {
    if: t.function(t.boolean(), t.any(), t.any())(t.any()),
  }
);

export type BooleanMembers = InferLibraryMembers<typeof BooleanSchema>;
