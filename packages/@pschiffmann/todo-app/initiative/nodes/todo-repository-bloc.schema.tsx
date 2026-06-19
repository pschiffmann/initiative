import { todoItem } from "#initiative/types/index.js";
import { NodeSchema, t } from "@initiative.dev/schema";

export const TodoRepositoryBlocSchema = new NodeSchema(
  "@pschiffmann/todo-app::TodoRepositoryBloc",
  {
    outputs: {
      visibleTodos: {
        type: t.array(todoItem()),
      },
      completedIds: {
        type: t.array(t.string()),
      },
      totalCount: {
        type: t.number(),
      },
      isEmpty: {
        type: t.boolean(),
      },
      toggleCompleted: {
        type: t.function(t.string(), t.boolean())()(),
      },
      showCompleted: {
        type: t.boolean(),
      },
      toggleShowCompleted: {
        type: t.function()()(),
      },
      createTodo: {
        type: t.function(todoItem())()(),
      },
      deleteTodo: {
        type: t.function(t.string())()(t.function()()()),
      },
    },
    slots: {
      child: {},
    },
  },
);

export type TodoRepositoryBlocSchema = typeof TodoRepositoryBlocSchema;
