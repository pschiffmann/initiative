import { resolveDefinitions } from "@initiative.dev/schema";

export const [, definitions] = resolveDefinitions([
  [
    "@initiative.dev/lib-mui-material/nodes",
    await import("@initiative.dev/lib-mui-material/nodes"),
  ],
  [
    "@initiative.dev/lib-core/nodes",
    await import("@initiative.dev/lib-core/nodes"),
  ],
  ["#initiative/nodes/index.js", await import("#initiative/nodes/index.js")],
]);
