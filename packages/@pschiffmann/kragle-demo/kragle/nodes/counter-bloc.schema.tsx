import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const CounterBlocSchema = new NodeSchema(
  "@pschiffmann/kragle-demo/CounterBloc",
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
