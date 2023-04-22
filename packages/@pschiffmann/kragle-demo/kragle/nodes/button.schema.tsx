import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const ButtonSchema = new NodeSchema("@pschiffmann/kragle-demo/Button", {
  inputs: {
    label: t.string(),
    onPress: t.function()(),
  },
});

export type ButtonProps = InferProps<typeof ButtonSchema>;
