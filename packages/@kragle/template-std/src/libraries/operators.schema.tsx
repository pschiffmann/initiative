import { InferLibraryMembers, LibrarySchema, t } from "@kragle/runtime";

export const OperatorsSchema = new LibrarySchema(
  "@kragle/template-std::Operators",
  {
    eq: t.function(t.any(), t.any())(t.boolean()),
    gt: t.function(t.number(), t.number())(t.boolean()),
    ge: t.function(t.number(), t.number())(t.boolean()),
    lt: t.function(t.number(), t.number())(t.boolean()),
    le: t.function(t.number(), t.number())(t.boolean()),
    and: t.function(t.boolean(), t.boolean())(t.boolean()),
    or: t.function(t.boolean(), t.boolean())(t.boolean()),
    not: t.function(t.any())(t.boolean()),
    ternary: t.function(t.boolean(), t.any(), t.any())(t.any()),
  }
);

export type OperatorsMembers = InferLibraryMembers<typeof OperatorsSchema>;
