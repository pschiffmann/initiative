import { resolveDefinitions } from "@initiativejs/schema";

export const [, definitions] = resolveDefinitions([
  [
    "#initiative/libraries/index.js",
    await import("#initiative/libraries/index.js"),
  ],
  ["#initiative/nodes/index.js", await import("#initiative/nodes/index.js")],
]);
