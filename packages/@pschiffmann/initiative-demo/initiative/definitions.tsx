import { resolveDefinitions } from "@initiativejs/schema";

export const [, definitions] = resolveDefinitions([
  [
    "@initiativejs/template-std/json-literals",
    await import("@initiativejs/template-std/json-literals"),
  ],
  ["#initiative/nodes/index.js", await import("#initiative/nodes/index.js")],
  [
    "#initiative/extension-methods/index.js",
    await import("./extension-methods/index.js"),
  ],
]);
