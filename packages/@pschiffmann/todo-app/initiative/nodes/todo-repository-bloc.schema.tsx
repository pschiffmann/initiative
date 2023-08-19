import { NodeSchema, t } from "@initiativejs/schema";
import { todoItem } from "../libraries/todo.schema.js";

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
      toggleCompleted: {
        type: t.function(t.string(), t.boolean())(),
      },
      showCompleted: {
        type: t.boolean(),
      },
      toggleShowCompleted: {
        type: t.function()(),
      },
      createTodo: {
        type: t.function(todoItem())(),
      },
      deleteTodo: {
        type: t.function(t.string())(t.function()()),
      },
    },
    slots: {
      child: {},
    },
  },
);

export type TodoRepositoryBlocSchema = typeof TodoRepositoryBlocSchema;
