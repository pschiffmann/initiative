import { Editor } from "@initiativejs/ide";
import { format } from "prettier";
import * as prettierPluginEstree from "prettier/plugins/estree.js";
import * as prettierPluginTypescript from "prettier/plugins/typescript.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { definitions } from "./definitions.js";

import "@initiativejs/ide/styles.css";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <Editor
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
