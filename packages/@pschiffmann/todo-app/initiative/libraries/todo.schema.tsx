import { InferLibraryMembers, LibrarySchema, t } from "@initiativejs/schema";

export interface TodoItem {
  readonly id: string;
  readonly description: string;
  readonly createdAt: Date;
  readonly completed: boolean;
}

export const todoItem = t.entity<TodoItem>("@pschiffmann/todo-app::TodoItem");

export const TodoLibrarySchema = new LibrarySchema(
  "@pschiffmann/todo-app::Todo",
  {
    getId: t.function(todoItem)(t.string()),
    getDescription: t.function(todoItem)(t.string()),
    getCreatedAt: t.function(todoItem)(t.string()),
    getCompleted: t.function(todoItem)(t.boolean()),
  },
);

export type TodoLibraryMembers = InferLibraryMembers<typeof TodoLibrarySchema>;
