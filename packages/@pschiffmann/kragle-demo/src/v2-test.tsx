import sceneJson from "#scenes/article-management.json";
import { resolveDefinitions, sceneDocumentFromJson } from "@kragle/runtime/v2";

const definitions = resolveDefinitions([
  ["@pschiffmann/kragle-demo/src/v2-test.tsx", await import("#nodes/index.js")],
]);
console.log({ definitions });

const sceneDocument = sceneDocumentFromJson(definitions, sceneJson as any);
console.log(sceneDocument);
