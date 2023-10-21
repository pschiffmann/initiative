import { NodeSchema, t } from "@initiative.dev/schema";

export const I18nSchema = new NodeSchema("@pschiffmann/initiative-demo::I18n", {
  outputs: {
    translate: {
      type: t.function(t.string())()(t.string()),
    },
  },
  slots: {
    child: {},
  },
  editor: {
    // color: "#ffff00",
    icon: "translate",
  },
});

export type I18nSchema = typeof I18nSchema;
