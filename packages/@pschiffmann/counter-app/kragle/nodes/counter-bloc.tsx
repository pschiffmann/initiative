import { NodeComponentProps } from "@kragle/runtime";
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
      counterLabel={`Counter value: ${counter}`}
    >
      <slots.child.Component />
    </OutputsProvider>
  );
}
