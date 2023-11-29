import { NodeSchema, t } from "@initiative.dev/schema";
import { hero } from "../types/index.js";

export const SimulationBlocSchema = new NodeSchema(
  "@pschiffmann/inventory-game::SimulationBloc",
  {
    outputs: {
      heroes: {
        type: t.array(hero()),
      },
    },
    slots: {
      child: {},
    },
  },
);

export type SimulationBlocSchema = typeof SimulationBlocSchema;
