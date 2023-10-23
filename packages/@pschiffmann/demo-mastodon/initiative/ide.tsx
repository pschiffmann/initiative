import { Editor } from "@initiative.dev/ide";
import { format } from "prettier";
import * as prettierPluginEstree from "prettier/plugins/estree.js";
import * as prettierPluginTypescript from "prettier/plugins/typescript.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { definitions } from "./definitions.js";

import "@initiative.dev/ide/styles.css";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <Editor
      projectId="@pschiffmann/demo-mastodon"
      definitions={definitions}
      formatJsFile={(source) =>
        format(source, {
          parser: "typescript",
          plugins: [prettierPluginTypescript, prettierPluginEstree as any],
        })
      }
    />
  </StrictMode>,
);
