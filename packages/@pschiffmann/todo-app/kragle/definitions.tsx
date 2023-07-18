import { resolveDefinitions } from "@kragle/runtime";

export const [, definitions] = resolveDefinitions([
  [
    "@kragle/template-mui-material/nodes",
    await import("@kragle/template-mui-material/nodes"),
  ],
  ["#kragle/libraries/index.js", await import("#kragle/libraries/index.js")],
  ["#kragle/nodes/index.js", await import("#kragle/nodes/index.js")],
]);
