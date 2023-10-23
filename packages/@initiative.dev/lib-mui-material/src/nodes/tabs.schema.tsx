import { NodeSchema, t } from "@initiative.dev/schema";

export const TabsSchema = new NodeSchema(
  "@initiative.dev/lib-mui-material::Tabs",
  {
    inputs: {
      variant: {
        type: t.union(
          t.string("standard"),
          t.string("fullWidth"),
          t.string("scrollable"),
        ),
      },
      iconPosition: {
        type: t.union(
          t.string("bottom"),
          t.string("end"),
          t.string("start"),
          t.string("top"),
        ),
        optional: true,
      },
    },
    slots: {
      tab: {
        inputs: {
          label: {
            type: t.string(),
          },
          icon: {
            type: t.string(),
            optional: true,
          },
          disabled: {
            type: t.boolean(),
            optional: true,
          },
        },
      },
    },
  },
);

export type TabsSchema = typeof TabsSchema;
