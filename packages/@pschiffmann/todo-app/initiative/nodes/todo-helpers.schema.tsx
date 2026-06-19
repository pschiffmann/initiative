import { todoItem } from "#initiative/types/index.js";
import { NodeSchema, t } from "@initiative.dev/schema";

export const TodoHelpersSchema = new NodeSchema(
  "@pschiffmann/todo-app::TodoHelpers",
  {
    outputs: {
      getId: {
        type: t.function(todoItem())()(t.string()),
      },
      getDescription: {
        type: t.function(todoItem())()(t.string()),
      },
      getCreatedAt: {
        type: t.function(todoItem())()(t.string()),
      },
      getCompleted: {
        type: t.function(todoItem())()(t.boolean()),
      },
    },
    slots: {
      child: {},
    },
  },
);

export type TodoHelpersSchema = typeof TodoHelpersSchema;
