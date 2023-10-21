import { resolveDefinitions, t } from "@initiative.dev/schema";
import { article } from "./types.js";

// Prevent VS Code `organize imports` command from removing this import.
t;

const errors: string[] = [];
export const definitions = resolveDefinitions(
  [
    [
      "@initiative.dev/lib-core/json-literals",
      await import("@initiative.dev/lib-core/json-literals"),
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
