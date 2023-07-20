import { resolveDefinitions } from "@kragle/runtime";

export const [, definitions] = resolveDefinitions([
  [
    "@kragle/template-mui-material/nodes",
    await import("@kragle/template-mui-material/nodes"),
  ],
  [
    "@kragle/template-std/libraries",
    await import("@kragle/template-std/libraries"),
  ],
  ["@kragle/template-std/nodes", await import("@kragle/template-std/nodes")],
  ["#kragle/libraries/index.js", await import("#kragle/libraries/index.js")],
  ["#kragle/nodes/index.js", await import("#kragle/nodes/index.js")],
]);
