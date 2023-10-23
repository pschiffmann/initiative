import { resolveDefinitions } from "@initiative.dev/schema";

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
    ["#initiative/nodes/index.js", await import("#initiative/nodes/index.js")],
  ],
  {},
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
