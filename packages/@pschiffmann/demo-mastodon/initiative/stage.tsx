import { Stage } from "@initiative.dev/ide";
import { HistoryNavigationProvider } from "@initiative.dev/lib-router";
import { createBrowserHistory } from "history";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "../src/components/theme-provider.js";
import { status } from "./debug-values/status.js";
import { definitions } from "./definitions.js";

const history = createBrowserHistory();
history.replace("/");

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <ThemeProvider>
      <HistoryNavigationProvider history={history}>
        <Stage definitions={definitions} debugValues={{ status }} />
      </HistoryNavigationProvider>
    </ThemeProvider>
  </StrictMode>,
);
