import { NodeSchema, t, trimDocText } from "@initiative.dev/schema";

export const RouterSchema = new NodeSchema(
  "@initiative.dev/lib-router::Router",
  {
    outputs: {
      base: {
        type: t.string(),
        doc: trimDocText(
          `The base path against which routes and \`navigate()\` paths are
           resolved.

           This is always a non-empty string that ends in \`/\`. Examples:
           - If this router is the top-level router, then \`base\` is \`/\`.
           - If this router is a nested router, and the parent router
           `,
        ),
      },
      params: {
        type: t.array(t.string()),
        doc: trimDocText(
          `The params from the active route, in order of declaration. If the
           route ends in a wildcard pattern '*', then the path matched by the
           wildcard is the last array element.`,
        ),
      },
      navigate: {
        type: t.function(t.string())(t.boolean())(),
        doc: trimDocText(
          `navigate(to: string, replace?: boolean): void

           'to' must be a path, query parameters and hashes are not allowed. It
           can be relative or absolute, and is resolved relative to 'base'.`,
        ),
      },
      resolve: {
        type: t.function(t.string())()(t.string()),
        doc: trimDocText(
          `Resolves the target path relative to the path matched by this router.

           This is similar to \`navigate()\`, but produces a new URL that can be
           passed to e.g. \`Link\` nodes.`,
        ),
      },
    },
    slots: {
      route: {
        inputs: {
          path: {
            type: t.string(),
            doc: trimDocText(`The route path.`),
          },
        },
      },
    },
    editor: {
      icon: "directions",
    },
  },
);

export type RouterSchema = typeof RouterSchema;
