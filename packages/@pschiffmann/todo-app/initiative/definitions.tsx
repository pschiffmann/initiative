import { resolveDefinitions } from "@initiative.dev/schema";

export const [, definitions] = resolveDefinitions([
  [
    "@initiative.dev/lib-mui-material/nodes",
    await import("@initiative.dev/lib-mui-material/nodes"),
  ],
  [
    "@initiative.dev/lib-core/libraries",
    await import("@initiative.dev/lib-core/libraries"),
  ],
  [
    "@initiative.dev/lib-core/nodes",
    await import("@initiative.dev/lib-core/nodes"),
  ],
  [
    "#initiative/libraries/index.js",
    await import("#initiative/libraries/index.js"),
  ],
  ["#initiative/nodes/index.js", await import("#initiative/nodes/index.js")],
]);
