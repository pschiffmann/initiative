import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const TabsSchema = new NodeSchema("@pschiffmann/kragle-demo/Tabs", {
  outputs: {
    activeIndex: t.number(),
    activateIndex: t.function(t.number())(),
  },
  slots: {
    TabPanel: {
      inputs: {
        label: t.string(),
      },
    },
  },
});

export type TabsProps = InferProps<typeof TabsSchema>;
