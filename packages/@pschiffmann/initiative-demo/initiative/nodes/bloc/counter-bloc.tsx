import { NodeComponentProps } from "@initiative.dev/schema";
import { useMemo, useState } from "react";
import { CounterBlocSchema } from "./counter-bloc.schema.js";

export function CounterBloc({
  slots,
  OutputsProvider,
  ...props
}: NodeComponentProps<CounterBlocSchema>) {
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
    [],
  );

  return (
    <OutputsProvider label={`count: ${n}`} {...actions}>
      <slots.child.Component {...props} />
    </OutputsProvider>
  );
}
