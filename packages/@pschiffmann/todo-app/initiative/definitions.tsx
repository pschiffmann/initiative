import { resolveDefinitions } from "@initiativejs/schema";

export const [, definitions] = resolveDefinitions([
  [
    "@initiativejs/template-mui-material/nodes",
    await import("@initiativejs/template-mui-material/nodes"),
  ],
  [
    "@initiativejs/template-std/libraries",
    await import("@initiativejs/template-std/libraries"),
  ],
  [
    "@initiativejs/template-std/nodes",
    await import("@initiativejs/template-std/nodes"),
  ],
  [
    "#initiative/libraries/index.js",
    await import("#initiative/libraries/index.js"),
  ],
  ["#initiative/nodes/index.js", await import("#initiative/nodes/index.js")],
]);
