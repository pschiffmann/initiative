import { InferProps, NodeSpec, t } from "@kragle/runtime";
import { useCallback, useState } from "react";

export const spec = new NodeSpec("@pschiffmann/kragle-demo/Bloc", {
  outputs: {
    label: t.string,
    increaseCounter: t.function()(),
  },
  slots: {
    Children: {},
  },
});

export const component = function Bloc({
  OutputsProvider,
}: InferProps<typeof spec>) {
  const [n, setN] = useState(0);

  const increaseCounter = useCallback(() => setN((n) => n + 1), []);

  return (
    <OutputsProvider label={`count: ${n}`} increaseCounter={increaseCounter} />
  );
};
