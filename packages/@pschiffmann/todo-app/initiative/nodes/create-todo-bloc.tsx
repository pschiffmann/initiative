import { NodeComponentProps } from "@initiative.dev/schema";
import { useState } from "react";
import { CreateTodoBlocSchema } from "./create-todo-bloc.schema.js";

export function CreateTodoBloc({
  createTodo,
  closeDialog,
  slots,
  OutputsProvider,
}: NodeComponentProps<CreateTodoBlocSchema>) {
  const [description, setDescription] = useState("");

  function submit() {
    createTodo({
      id: crypto.randomUUID(),
      description,
      createdAt: new Date(),
      completed: false,
    });
    setDescription("");
    closeDialog();
  }

  return (
    <OutputsProvider
      description$value={description}
      description$onChange={setDescription}
      submit={submit}
      submitDisabled={!description}
    >
      <slots.child.Component />
    </OutputsProvider>
  );
}
