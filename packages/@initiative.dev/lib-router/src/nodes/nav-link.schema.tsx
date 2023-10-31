import { NodeSchema, t } from "@initiative.dev/schema";

export const NavLinkSchema = new NodeSchema(
  "@initiative.dev/lib-router::NavLink",
  {
    inputs: {
      content: {
        type: t.string(),
      },
      path: {
        type: t.string(),
      },
    },
    editor: {
      icon: "link",
    },
  },
);

export type NavLinkSchema = typeof NavLinkSchema;
