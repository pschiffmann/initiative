import { Stage } from "@kragle/editor";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { grey } from "@mui/material/colors";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { definitions } from "./definitions.js";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <ThemeProvider
      theme={createTheme({ palette: { background: { default: grey[50] } } })}
    >
      <CssBaseline />
      <Box
        display="grid"
        justifyItems="center"
        sx={{ "& > *": { width: 600, margin: 4 } }}
      >
        <Stage definitions={definitions} />
      </Box>
    </ThemeProvider>
  </StrictMode>
);
