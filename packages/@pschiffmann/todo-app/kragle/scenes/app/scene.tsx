import {
  TodoLibrary$getCreatedAt,
  TodoLibrary$getDescription,
  TodoLibrary$getId,
} from "#kragle/libraries/index.js";
import {
  TodoRepositoryBloc,
  TodoRepositoryBlocSchema,
} from "#kragle/nodes/index.js";
import { OutputTypes } from "@kragle/runtime/code-gen-helpers";
import {
  CheckList,
  CheckListSchema,
  CheckboxControl,
  FlexContainer,
  IconButton,
  Typography,
} from "@kragle/template-mui-material/nodes";
import { createContext, useContext } from "react";

export function App() {
  return <TodoRepositoryBloc1_Adapter />;
}

function TodoRepositoryBloc1_Adapter() {
  return (
    <TodoRepositoryBloc
      slots={{
        child: { Component: Layout_Adapter },
      }}
      OutputsProvider={TodoRepositoryBloc1_OutputsProvider}
    />
  );
}

const TodoRepositoryBloc1$todosContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["todos"]
>(null!);
const TodoRepositoryBloc1$completedTodoIdsContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["completedTodoIds"]
>(null!);
const TodoRepositoryBloc1$toggleCompletedContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["toggleCompleted"]
>(null!);
const TodoRepositoryBloc1$showCompleteContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["showComplete"]
>(null!);
const TodoRepositoryBloc1$toggleShowCompleteContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["toggleShowComplete"]
>(null!);
const TodoRepositoryBloc1$showIncompleteContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["showIncomplete"]
>(null!);
const TodoRepositoryBloc1$toggleShowIncompleteContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["toggleShowIncomplete"]
>(null!);

function TodoRepositoryBloc1_OutputsProvider({
  todos,
  completedTodoIds,
  toggleCompleted,
  showComplete,
  toggleShowComplete,
  showIncomplete,
  toggleShowIncomplete,
  children,
}: any) {
  return (
    <TodoRepositoryBloc1$todosContext.Provider value={todos}>
      <TodoRepositoryBloc1$completedTodoIdsContext.Provider
        value={completedTodoIds}
      >
        <TodoRepositoryBloc1$toggleCompletedContext.Provider
          value={toggleCompleted}
        >
          <TodoRepositoryBloc1$showCompleteContext.Provider
            value={showComplete}
          >
            <TodoRepositoryBloc1$toggleShowCompleteContext.Provider
              value={toggleShowComplete}
            >
              <TodoRepositoryBloc1$showIncompleteContext.Provider
                value={showIncomplete}
              >
                <TodoRepositoryBloc1$toggleShowIncompleteContext.Provider
                  value={toggleShowIncomplete}
                >
                  {children}
                </TodoRepositoryBloc1$toggleShowIncompleteContext.Provider>
              </TodoRepositoryBloc1$showIncompleteContext.Provider>
            </TodoRepositoryBloc1$toggleShowCompleteContext.Provider>
          </TodoRepositoryBloc1$showCompleteContext.Provider>
        </TodoRepositoryBloc1$toggleCompletedContext.Provider>
      </TodoRepositoryBloc1$completedTodoIdsContext.Provider>
    </TodoRepositoryBloc1$todosContext.Provider>
  );
}

function Layout_Adapter() {
  return (
    <FlexContainer
      flexDirection={undefined}
      alignItems={undefined}
      justifyContent={undefined}
      gap={-1}
      padding={"16px 0"}
      backgroundColor={"background.paper"}
      elevation={2}
      outlined={undefined}
      borderRadius={2}
      alignSelf={[undefined, "stretch", undefined]}
      margin={["0 16px", "0 8px", undefined]}
      slots={{
        child: { size: 3, Component: Layout_child },
      }}
    />
  );
}

function Layout_child({ index }: any) {
  switch (index) {
    case 0:
      return <AppTitle_Adapter />;
    case 1:
      return <HeaderControls_Adapter />;
    case 2:
      return <TodoList_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function AppTitle_Adapter() {
  return (
    <Typography
      text={"Todo App"}
      variant={"h4"}
      noWrap={undefined}
      component={undefined}
    />
  );
}

function HeaderControls_Adapter() {
  return (
    <FlexContainer
      flexDirection={"row"}
      alignItems={undefined}
      justifyContent={"end"}
      gap={1}
      padding={undefined}
      backgroundColor={undefined}
      elevation={undefined}
      outlined={undefined}
      borderRadius={undefined}
      alignSelf={[undefined, undefined]}
      margin={[undefined, undefined]}
      slots={{
        child: { size: 2, Component: HeaderControls_child },
      }}
    />
  );
}

function HeaderControls_child({ index }: any) {
  switch (index) {
    case 0:
      return <ShowCompletedControl_Adapter />;
    case 1:
      return <ShowIncompleteControl_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function TodoList_Adapter() {
  return (
    <CheckList
      items={useContext(TodoRepositoryBloc1$todosContext)}
      getItemKey={TodoLibrary$getId}
      getPrimaryText={TodoLibrary$getDescription}
      getSecondaryText={TodoLibrary$getCreatedAt}
      checked={useContext(TodoRepositoryBloc1$completedTodoIdsContext)}
      onCheckedChange={useContext(TodoRepositoryBloc1$toggleCompletedContext)}
      slots={{
        secondaryAction: { Component: DeleteTodo_Adapter },
      }}
    />
  );
}

const TodoList$itemContext = createContext<
  OutputTypes<CheckListSchema>["item"]
>(null!);

function ShowCompletedControl_Adapter() {
  return (
    <CheckboxControl
      label={"Show complete"}
      checked={useContext(TodoRepositoryBloc1$showCompleteContext)}
      onChange={useContext(TodoRepositoryBloc1$toggleShowCompleteContext)}
    />
  );
}

function ShowIncompleteControl_Adapter() {
  return (
    <CheckboxControl
      label={"Show incomplete"}
      checked={useContext(TodoRepositoryBloc1$showIncompleteContext)}
      onChange={useContext(TodoRepositoryBloc1$toggleShowIncompleteContext)}
    />
  );
}

function DeleteTodo_Adapter() {
  return (
    <IconButton
      label={"Delete"}
      icon={"delete"}
      color={"error"}
      size={undefined}
      onPress={undefined}
      disabled={undefined}
    />
  );
}
