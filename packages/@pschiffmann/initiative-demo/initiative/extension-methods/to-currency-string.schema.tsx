import { ExtensionMethodSchema, t } from "@initiativejs/schema";

export const toCurrencyStringSchema = new ExtensionMethodSchema({
  name: "@pschiffmann/initiative-demo::toCurrencyString",
  self: t.number(),
  type: t.function()()(t.string()),
  doc: "",
});

export type toCurrencyStringSchema = typeof toCurrencyStringSchema;
