import { NodeComponentProps } from "@kragle/runtime";
import { useCallback, useState } from "react";
import { TodoItem } from "../libraries/todo.schema.js";
import { TodoRepositoryBlocSchema } from "./todo-repository-bloc.schema.js";

export function TodoRepositoryBloc({
  slots,
  OutputsProvider,
}: NodeComponentProps<TodoRepositoryBlocSchema>) {
  const [todos, setTodos] = useState(createMockTodos);

  const toggleCompleted = useCallback(
    (id: string, completed: boolean) =>
      setTodos((todos) =>
        todos.map((todo) => (todo.id === id ? { ...todo, completed } : todo))
      ),
    []
  );

  const [showComplete, setShowComplete] = useState(true);
  const toggleShowComplete = useCallback(() => setShowComplete((x) => !x), []);
  const [showIncomplete, setShowIncomplete] = useState(true);
  const toggleShowIncomplete = useCallback(
    () => setShowIncomplete((x) => !x),
    []
  );

  const completedTodoIds = todos
    .filter((todo) => todo.completed)
    .map((todo) => todo.id);
  const visibleTodos = todos.filter((todo) => {
    if (todo.completed && showComplete) return true;
    if (!todo.completed && showIncomplete) return true;
    return false;
  });

  return (
    <OutputsProvider
      todos={visibleTodos}
      completedTodoIds={completedTodoIds}
      toggleCompleted={toggleCompleted}
      showComplete={showComplete}
      toggleShowComplete={toggleShowComplete}
      showIncomplete={showIncomplete}
      toggleShowIncomplete={toggleShowIncomplete}
    >
      <slots.child.Component />
    </OutputsProvider>
  );
}

function createMockTodos(): TodoItem[] {
  return [
    {
      id: crypto.randomUUID(),
      description: "Hello world",
      createdAt: new Date(),
      completed: false,
    },
    {
      id: crypto.randomUUID(),
      description: "dolphin",
      createdAt: new Date(),
      completed: false,
    },
    {
      id: crypto.randomUUID(),
      description: "asdf adsf asdf",
      createdAt: new Date(),
      completed: false,
    },
  ];
}
