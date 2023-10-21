import { NodeComponentProps } from "@initiative.dev/schema";
import { useCallback, useState } from "react";
import { CounterBlocSchema } from "./counter-bloc.schema.js";

export function CounterBloc({
  slots,
  OutputsProvider,
}: NodeComponentProps<CounterBlocSchema>) {
  const [counter, setCounter] = useState(0);
  const increaseCounter = useCallback(() => setCounter((n) => n + 1), []);
  const decreaseCounter = useCallback(() => setCounter((n) => n - 1), []);
  const resetCounter = useCallback(() => setCounter(0), []);

  return (
    <OutputsProvider
      increaseCounter={increaseCounter}
      decreaseCounter={decreaseCounter}
      resetCounter={resetCounter}
      counterValue={counter}
    >
      <slots.child.Component />
    </OutputsProvider>
  );
}
