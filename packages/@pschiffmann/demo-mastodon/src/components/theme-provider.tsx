import {
  CssBaseline,
  GlobalStyles,
  ThemeProvider as MuiThemeProvider,
  createTheme,
  lighten,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import { PropsWithChildren } from "react";

const theme = createTheme({
  palette: {
    background: {
      // `blue[700]` is the primary color in the default theme:
      // https://github.com/mui/material-ui/blob/a731e863cb13c83f4d6b9b4c7dd3633fad8f1ed4/packages/mui-material/src/styles/createPalette.js#L94-L107
      default: lighten(blue[700], 0.96),
    },
  },
});

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          html: { width: "100%", height: "100%" },
          body: { width: "100%", height: "100%" },
          "#root": { width: "100%", height: "100%" },
        }}
      />
      {children}
    </MuiThemeProvider>
  );
}
