import { t } from "@kragle/runtime";
import { InferProps, NodeSchema } from "@kragle/runtime/v2";

export const CounterBlocSchema = new NodeSchema(
  "@pschiffmann/kragle-demo::CounterBloc",
  {
    outputs: {
      label: t.string(),
      increaseCounter: t.function()(),
      decreaseCounter: t.function()(),
      reset: t.function()(),
    },
    slots: {
      child: {},
    },
  }
);

export type CounterBlocProps = InferProps<typeof CounterBlocSchema>;
