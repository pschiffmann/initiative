import {
  AddCircle,
  RemoveCircle,
  ReplayCircleFilled,
} from "@mui/icons-material";
import { IconButton, Stack, Typography } from "@mui/material";
import { useCallback, useState } from "react";

export function App() {
  const [counter, setCounter] = useState(0);
  const increaseCounter = useCallback(() => setCounter((n) => n + 1), []);
  const decreaseCounter = useCallback(() => setCounter((n) => n - 1), []);
  const resetCounter = useCallback(() => setCounter(0), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <h1>Counter App</h1>
      <Typography variant="body1" component="div">
        Counter value: {counter}
      </Typography>
      <Stack flexDirection="row" gap={1}>
        <IconButton color="error" onClick={decreaseCounter}>
          <RemoveCircle />
        </IconButton>
        <IconButton color="primary" onClick={resetCounter}>
          <ReplayCircleFilled />
        </IconButton>
        <IconButton color="success" onClick={increaseCounter}>
          <AddCircle />
        </IconButton>
      </Stack>
    </div>
  );
}
