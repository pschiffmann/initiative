import {
  CssBaseline,
  GlobalStyles,
  ThemeProvider as MuiThemeProvider,
  createTheme,
  darken,
  lighten,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import { PropsWithChildren } from "react";

const mode = "dark" as "light" | "dark";
const theme = createTheme({
  palette: {
    mode,
    background: {
      // Default primary colors:
      // - light mode: `blue[700]`
      // - dark mode: `blue[200]`
      // https://github.com/mui/material-ui/blob/a731e863cb13c83f4d6b9b4c7dd3633fad8f1ed4/packages/mui-material/src/styles/createPalette.js#L94-L107
      default:
        mode === "light" ? lighten(blue[700], 0.96) : darken(blue[200], 0.96),
    },
  },
});

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={(theme) => ({
          html: { width: "100%", height: "100%" },
          body: { width: "100%", height: "100%" },
          "#root": { width: "100%", height: "100%" },
          a: { color: theme.palette.primary.main },
        })}
      />
      {children}
    </MuiThemeProvider>
  );
}
