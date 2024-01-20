import { HistoryNavigationProvider } from "@initiative.dev/lib-router";
import { createBrowserHistory } from "history";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RoutingTest } from "../initiative/scenes/routing-test/scene.js";
import { ThemeProvider } from "./components/theme-provider.js";

const history = createBrowserHistory();
history.replace("/");

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <ThemeProvider>
      <HistoryNavigationProvider history={history}>
        {/* <TestTimelinePublic /> */}
        <RoutingTest />
      </HistoryNavigationProvider>
    </ThemeProvider>
  </StrictMode>,
);
