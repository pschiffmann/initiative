import { Box, CssBaseline } from "@mui/material";
import { PropsWithChildren } from "react";

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <>
      <CssBaseline />
      <Box sx={{ "& > *": { width: 1, height: 1 } }}>{children}</Box>
    </>
  );
}
