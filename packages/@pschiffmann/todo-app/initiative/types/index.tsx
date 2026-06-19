import { t } from "@initiative.dev/schema";

export interface TodoItem {
  readonly id: string;
  readonly description: string;
  readonly createdAt: Date;
  readonly completed: boolean;
}

export const todoItem = t.entity<TodoItem>(
  "@pschiffmann/todo-app::TodoItem",
  {
    moduleName: "#initiative/types/index.js",
    exportName: "TodoItem",
  },
  () => ({
    properties: {
      id: {
        type: t.string(),
      },
      description: {
        type: t.string(),
      },
      completed: {
        type: t.boolean(),
      },
    },
  }),
);
