import { NodeComponentProps } from "@initiative.dev/schema";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Simulation } from "../../src/simulation/index.js";
import { SimulationBlocSchema } from "./simulation-bloc.schema.js";

export function SimulationBloc({
  slots,
  OutputsProvider,
}: NodeComponentProps<SimulationBlocSchema>) {
  const [simulation] = useState(() => new Simulation());
  useEffect(() => {
    simulation.start();
    return () => {
      simulation.stop();
    };
  }, [simulation]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      simulation.observer = onStoreChange;
      return () => {
        simulation.observer = null;
      };
    },
    [simulation],
  );
  const getSnapshot = useCallback(() => simulation.heroes, [simulation]);
  const heroes = useSyncExternalStore(subscribe, getSnapshot);

  return (
    <OutputsProvider heroes={heroes}>
      <slots.child.Component />
    </OutputsProvider>
  );
}
