import { NodeSchema, t } from "@initiativejs/schema";

export const CounterBlocSchema = new NodeSchema(
  "@pschiffmann/initiative-demo::CounterBloc",
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
