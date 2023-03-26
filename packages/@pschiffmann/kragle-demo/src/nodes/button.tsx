import { InferProps, NodeSpec, t } from "@kragle/runtime";

export const spec = new NodeSpec("@pschiffmann/kragle-demo/Button", {
  inputs: {
    label: t.string,
    onPress: t.function()(),
  },
});

export const component = function Button({
  label,
  onPress,
}: InferProps<typeof spec>) {
  return <button onClick={onPress}>{label}</button>;
};
