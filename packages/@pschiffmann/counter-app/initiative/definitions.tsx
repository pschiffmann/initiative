import { resolveDefinitions } from "@initiativejs/schema";

export const [, definitions] = resolveDefinitions([
  [
    "@initiativejs/template-mui-material/nodes",
    await import("@initiativejs/template-mui-material/nodes"),
  ],
  [
    "@initiativejs/template-std/nodes",
    await import("@initiativejs/template-std/nodes"),
  ],
  ["#initiative/nodes/index.js", await import("#initiative/nodes/index.js")],
]);
