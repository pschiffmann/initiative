import { NodeSchema, t } from "@kragle/runtime";

export const CounterBlocSchema = new NodeSchema(
  "@pschiffmann/kragle-demo::CounterBloc",
  {
    outputs: {
      label: {
        type: t.string(),
      },
      increaseCounter: {
        type: t.function()(),
      },
      decreaseCounter: {
        type: t.function()(),
      },
      reset: {
        type: t.function()(),
      },
    },
    slots: {
      child: {},
    },
  },
);

export type CounterBlocSchema = typeof CounterBlocSchema;
