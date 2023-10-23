import { TestTimelinePublic } from "#initiative/scenes/test-timeline-public/scene.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./components/theme-provider.js";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <ThemeProvider>
      <TestTimelinePublic />
    </ThemeProvider>
  </StrictMode>,
);
