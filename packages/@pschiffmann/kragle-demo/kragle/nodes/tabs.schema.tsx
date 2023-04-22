import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const TabsSchema = new NodeSchema("@pschiffmann/kragle-demo/Tabs", {
  outputs: {
    activeTabPanel: t.string(),
    activateTabPanel: t.function(t.string())(),
  },
  slots: {
    tabPanel: {
      inputs: {
        label: t.string(),
      },
    },
  },
});

export type TabsProps = InferProps<typeof TabsSchema>;
