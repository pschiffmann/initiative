import { NodeComponentProps } from "@kragle/runtime";
import { useCallback, useState } from "react";
import { TodoItem } from "../libraries/todo.schema.js";
import { TodoRepositoryBlocSchema } from "./todo-repository-bloc.schema.js";

export function TodoRepositoryBloc({
  slots,
  OutputsProvider,
}: NodeComponentProps<TodoRepositoryBlocSchema>) {
  const [todos, setTodos] = useState(createMockTodos);
  const createTodo = useCallback(
    (newTodo: TodoItem) => setTodos((todos) => [...todos, newTodo]),
    []
  );
  const deleteTodo = useCallback(
    (id: string) => () =>
      setTodos((todos) => todos.filter((todo) => todo.id !== id)),
    []
  );

  const toggleCompleted = useCallback(
    (id: string, completed: boolean) =>
      setTodos((todos) =>
        todos.map((todo) => (todo.id === id ? { ...todo, completed } : todo))
      ),
    []
  );

  const [showCompleted, setShowCompleted] = useState(true);
  const toggleShowCompleted = useCallback(
    () => setShowCompleted((x) => !x),
    []
  );

  const completedIds = todos
    .filter((todo) => todo.completed)
    .map((todo) => todo.id);
  const visibleTodos = todos.filter((todo) => showCompleted || !todo.completed);

  return (
    <OutputsProvider
      visibleTodos={visibleTodos}
      completedIds={completedIds}
      totalCount={todos.length}
      toggleCompleted={toggleCompleted}
      showCompleted={showCompleted}
      toggleShowCompleted={toggleShowCompleted}
      createTodo={createTodo}
      deleteTodo={deleteTodo}
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
