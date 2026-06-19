import { NodeComponentProps } from "@initiative.dev/schema";
import { TodoHelpersSchema } from "./todo-helpers.schema.js";

export function TodoHelpers({
  slots,
  OutputsProvider,
}: NodeComponentProps<TodoHelpersSchema>) {
  return (
    <OutputsProvider
      getId={(todo) => todo.id}
      getDescription={(todo) => todo.description}
      getCreatedAt={(todo) => todo.createdAt.toLocaleDateString()}
      getCompleted={(todo) => todo.completed}
    >
      <slots.child.Component />
    </OutputsProvider>
  );
}
