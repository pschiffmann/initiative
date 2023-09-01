import { NodeSchema, t } from "@initiativejs/schema";

export const I18nSchema = new NodeSchema("@pschiffmann/initiative-demo::I18n", {
  outputs: {
    translate: {
      type: t.function(t.string())()(t.string()),
    },
  },
  slots: {
    child: {},
  },
});

export type I18nSchema = typeof I18nSchema;
