import { resolveDefinitions, t } from "@initiativejs/schema";
import { article } from "./types.js";

// Prevent VS Code `organize imports` command from removing this import.
t;

const errors: string[] = [];
export const definitions = resolveDefinitions(
  [
    [
      "@initiativejs/template-std/json-literals",
      await import("@initiativejs/template-std/json-literals"),
    ],
    ["#initiative/nodes/index.js", await import("#initiative/nodes/index.js")],
    [
      "#initiative/extension-methods/index.js",
      await import("./extension-methods/index.js"),
    ],
  ],
  {
    article: {
      type: article(),
    },
  },
  errors,
);
if (errors.length) {
  alert(
    `'resolveDefinitions()' encountered errors. Check the dev tools for ` +
      `details.`,
  );
  console.error(`'resolveDefinitions()' errors:`);
  console.error(errors);
}
