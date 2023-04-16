import { useCallback, useState } from "react";
import { BlocProps } from "./bloc-schema.js";

export function Bloc({ OutputsProvider }: BlocProps) {
  const [n, setN] = useState(0);

  const increaseCounter = useCallback(() => setN((n) => n + 1), []);

  return (
    <OutputsProvider label={`count: ${n}`} increaseCounter={increaseCounter} />
  );
}
