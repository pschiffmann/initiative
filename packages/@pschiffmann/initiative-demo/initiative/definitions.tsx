import { t, resolveDefinitions } from "@initiativejs/schema";
import { articleType } from "./types.js";

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
      type: articleType(),
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
