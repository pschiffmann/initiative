import { NodeSchema, t } from "@kragle/runtime";

export const I18nSchema = new NodeSchema("@pschiffmann/kragle-demo::I18n", {
  outputs: {
    translate: {
      type: t.function(t.string())(t.string()),
    },
  },
  slots: {
    child: {},
  },
});

export type I18nSchema = typeof I18nSchema;
