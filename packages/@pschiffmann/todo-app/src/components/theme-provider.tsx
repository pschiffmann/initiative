import {
  Box,
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
  checkboxClasses,
  createTheme,
  listItemTextClasses,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { PropsWithChildren } from "react";

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        display="grid"
        justifyItems="center"
        sx={{ "& > *": { width: 600, margin: 4 } }}
      >
        {children}
      </Box>
    </MuiThemeProvider>
  );
}

const theme = createTheme({
  palette: {
    background: {
      default: grey[50],
    },
  },
  components: {
    MuiListItem: {
      styleOverrides: {
        root: {
          [`&:has(.${checkboxClasses.root}.${checkboxClasses.checked}) .${listItemTextClasses.primary}`]:
            {
              textDecoration: "line-through",
            },
        },
      },
    },
  },
});
