import { resolveDefinitions } from "@initiativejs/schema";

export const [, definitions] = resolveDefinitions([
  ["#initiative/nodes/index.js", await import("#initiative/nodes/index.js")],
  [
    "@initiativejs/template-std/json-literals",
    await import("@initiativejs/template-std/json-literals"),
  ],
]);
