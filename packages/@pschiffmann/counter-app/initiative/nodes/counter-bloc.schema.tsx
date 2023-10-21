import { NodeSchema, t } from "@initiative.dev/schema";

export const CounterBlocSchema = new NodeSchema(
  "@pschiffmann/counter-app::CounterBloc",
  {
    outputs: {
      increaseCounter: {
        type: t.function()()(),
      },
      decreaseCounter: {
        type: t.function()()(),
      },
      resetCounter: {
        type: t.function()()(),
      },
      counterValue: {
        type: t.number(),
      },
    },
    slots: {
      child: {},
    },
  },
);

export type CounterBlocSchema = typeof CounterBlocSchema;
