import { resolveDefinitions } from "@kragle/runtime";

export const [, definitions] = resolveDefinitions([
  [
    "@kragle/template-mui-material/nodes",
    await import("@kragle/template-mui-material/nodes"),
  ],
  ["@kragle/template-std/nodes", await import("@kragle/template-std/nodes")],
  ["#kragle/nodes/index.js", await import("#kragle/nodes/index.js")],
]);
