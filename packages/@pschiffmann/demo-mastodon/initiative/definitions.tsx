import { resolveDefinitions, t } from "@initiative.dev/schema";
import { status } from "./types/index.js";

t;

const errors: string[] = [];
export const definitions = resolveDefinitions(
  [
    [
      "@initiative.dev/lib-core/json-literals",
      await import("@initiative.dev/lib-core/json-literals"),
    ],
    [
      "@initiative.dev/lib-core/nodes",
      await import("@initiative.dev/lib-core/nodes"),
    ],
    [
      "@initiative.dev/lib-mui-material/nodes",
      await import("@initiative.dev/lib-mui-material/nodes"),
    ],
    [
      "@initiative.dev/lib-router/nodes",
      await import("@initiative.dev/lib-router/nodes"),
    ],
    ["#initiative/nodes/index.js", await import("#initiative/nodes/index.js")],
  ],
  {
    status: {
      type: status(),
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
