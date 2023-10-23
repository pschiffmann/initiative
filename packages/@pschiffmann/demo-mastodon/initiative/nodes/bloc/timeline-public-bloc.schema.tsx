import { NodeSchema, t } from "@initiative.dev/schema";
import { status } from "../../types/index.js";

t;

export const TimelinePublicBlocSchema = new NodeSchema(
  "@pschiffmann/demo-mastodon::TimelinePublicBloc",
  {
    slots: {
      child: {
        outputs: {
          status: {
            type: status(),
          },
        },
      },
    },
  },
);

export type TimelinePublicBlocSchema = typeof TimelinePublicBlocSchema;
