import { NodeSchema, t } from "@initiative.dev/schema";

export const AvatarSchema = new NodeSchema(
  "@initiative.dev/lib-mui-material::Avatar",
  {
    inputs: {
      src: {
        type: t.string(),
      },
      alt: {
        type: t.string(),
      },
      variant: {
        type: t.union(
          t.string("circular"),
          t.string("rounded"),
          t.string("square"),
        ),
        optional: true,
      },
      size: {
        type: t.number(),
        optional: true,
      },
    },
  },
);

export type AvatarSchema = typeof AvatarSchema;
