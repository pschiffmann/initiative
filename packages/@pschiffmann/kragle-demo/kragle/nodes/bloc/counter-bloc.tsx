import { useMemo, useState } from "react";
import { CounterBlocProps } from "./counter-bloc.schema.js";

export function CounterBloc({ slots, OutputsProvider }: CounterBlocProps) {
  const [n, setN] = useState(0);

  const actions = useMemo(
    () => ({
      increaseCounter() {
        setN((n) => n + 1);
      },
      decreaseCounter() {
        setN((n) => n - 1);
      },
      reset() {
        setN(0);
      },
    }),
    []
  );

  return (
    <OutputsProvider label={`count: ${n}`} {...actions}>
      {slots.child.element()}
    </OutputsProvider>
  );
}
