import { NodeSchema, t } from "@initiative.dev/schema";
import { todoItem } from "../libraries/todo.schema.js";

export const CreateTodoBlocSchema = new NodeSchema(
  "@pschiffmann/todo-app::CreateTodoBloc",
  {
    inputs: {
      createTodo: {
        type: t.function(todoItem())()(),
      },
      closeDialog: {
        type: t.function()()(),
      },
    },
    outputs: {
      description$value: {
        type: t.string(),
      },
      description$onChange: {
        type: t.function(t.string())()(),
      },
      submit: {
        type: t.function()()(),
      },
      submitDisabled: {
        type: t.boolean(),
      },
    },
    slots: {
      child: {},
    },
  },
);

export type CreateTodoBlocSchema = typeof CreateTodoBlocSchema;
