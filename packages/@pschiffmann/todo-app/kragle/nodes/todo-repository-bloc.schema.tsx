import { NodeSchema, t } from "@kragle/runtime";
import { todoItem } from "../libraries/todo.schema.js";

export const TodoRepositoryBlocSchema = new NodeSchema(
  "@pschiffmann/todo-app::TodoRepositoryBloc",
  {
    outputs: {
      todos: {
        type: t.array(todoItem),
      },
      completedTodoIds: {
        type: t.array(t.string()),
      },
      toggleCompleted: {
        type: t.function(t.string(), t.boolean())(),
      },
      showComplete: {
        type: t.boolean(),
      },
      toggleShowComplete: {
        type: t.function(t.boolean())(),
      },
      showIncomplete: {
        type: t.boolean(),
      },
      toggleShowIncomplete: {
        type: t.function(t.boolean())(),
      },
    },
    slots: {
      child: {},
    },
  }
);

export type TodoRepositoryBlocSchema = typeof TodoRepositoryBlocSchema;
