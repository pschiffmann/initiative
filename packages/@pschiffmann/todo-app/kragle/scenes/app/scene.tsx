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
  Button,
  CheckList,
  CheckListSchema,
  Dialog,
  DialogSchema,
  FlexContainer,
  IconButton,
  Typography,
} from "@kragle/template-mui-material/nodes";
import {
  Array$length,
  Operators$gt,
  Operators$ternary,
  String$concat,
} from "@kragle/template-std/libraries";
import { Switch } from "@kragle/template-std/nodes";
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

const TodoRepositoryBloc1$visibleTodosContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["visibleTodos"]
>(null!);
const TodoRepositoryBloc1$completedIdsContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["completedIds"]
>(null!);
const TodoRepositoryBloc1$totalCountContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["totalCount"]
>(null!);
const TodoRepositoryBloc1$toggleCompletedContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["toggleCompleted"]
>(null!);
const TodoRepositoryBloc1$showCompletedContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["showCompleted"]
>(null!);
const TodoRepositoryBloc1$toggleShowCompletedContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["toggleShowCompleted"]
>(null!);

function TodoRepositoryBloc1_OutputsProvider({
  visibleTodos,
  completedIds,
  totalCount,
  toggleCompleted,
  showCompleted,
  toggleShowCompleted,
  children,
}: any) {
  return (
    <TodoRepositoryBloc1$visibleTodosContext.Provider value={visibleTodos}>
      <TodoRepositoryBloc1$completedIdsContext.Provider value={completedIds}>
        <TodoRepositoryBloc1$totalCountContext.Provider value={totalCount}>
          <TodoRepositoryBloc1$toggleCompletedContext.Provider
            value={toggleCompleted}
          >
            <TodoRepositoryBloc1$showCompletedContext.Provider
              value={showCompleted}
            >
              <TodoRepositoryBloc1$toggleShowCompletedContext.Provider
                value={toggleShowCompleted}
              >
                {children}
              </TodoRepositoryBloc1$toggleShowCompletedContext.Provider>
            </TodoRepositoryBloc1$showCompletedContext.Provider>
          </TodoRepositoryBloc1$toggleCompletedContext.Provider>
        </TodoRepositoryBloc1$totalCountContext.Provider>
      </TodoRepositoryBloc1$completedIdsContext.Provider>
    </TodoRepositoryBloc1$visibleTodosContext.Provider>
  );
}

function Layout_Adapter() {
  return (
    <FlexContainer
      flexDirection={undefined}
      alignItems={undefined}
      justifyContent={undefined}
      gap={1}
      padding={"16px 0"}
      backgroundColor={"background.paper"}
      elevation={2}
      outlined={undefined}
      borderRadius={2}
      alignSelf={[undefined, undefined, undefined]}
      margin={[undefined, undefined, "0 12px"]}
      slots={{
        child: { size: 3, Component: Layout_child },
      }}
    />
  );
}

function Layout_child({ index }: any) {
  switch (index) {
    case 0:
      return <Header_Adapter />;
    case 1:
      return <EmptStateSwitch_Adapter />;
    case 2:
      return <NewTodoDialog_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function Header_Adapter() {
  return (
    <FlexContainer
      flexDirection={"row"}
      alignItems={"center"}
      justifyContent={undefined}
      gap={1}
      padding={"0 12px"}
      backgroundColor={undefined}
      elevation={undefined}
      outlined={undefined}
      borderRadius={undefined}
      alignSelf={[undefined, undefined, undefined]}
      margin={["0 auto 0 0", undefined, undefined]}
      slots={{
        child: { size: 3, Component: Header_child },
      }}
    />
  );
}

function Header_child({ index }: any) {
  switch (index) {
    case 0:
      return <Title_Adapter />;
    case 1:
      return <TodoCount_Adapter />;
    case 2:
      return <ToggleCompletedButton_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function EmptStateSwitch_Adapter() {
  return (
    <Switch
      showIf={[
        Operators$gt(
          Array$length(useContext(TodoRepositoryBloc1$visibleTodosContext)),
          0
        ),
        true,
      ]}
      slots={{
        case: { size: 2, Component: EmptStateSwitch_case },
      }}
    />
  );
}

function EmptStateSwitch_case({ index }: any) {
  switch (index) {
    case 0:
      return <TodoList_Adapter />;
    case 1:
      return <EmptyStateContainer_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function NewTodoDialog_Adapter() {
  return (
    <Dialog
      title={"dialog title"}
      slots={{
        trigger: { Component: OpenNewTodoDialog_Adapter },
        content: { Component: Typography1_Adapter },
      }}
      OutputsProvider={NewTodoDialog_OutputsProvider}
    />
  );
}

const NewTodoDialog$isOpenContext = createContext<
  OutputTypes<DialogSchema>["isOpen"]
>(null!);
const NewTodoDialog$openContext = createContext<
  OutputTypes<DialogSchema>["open"]
>(null!);
const NewTodoDialog$closeContext = createContext<
  OutputTypes<DialogSchema>["close"]
>(null!);
const NewTodoDialog$toggleContext = createContext<
  OutputTypes<DialogSchema>["toggle"]
>(null!);

function NewTodoDialog_OutputsProvider({
  isOpen,
  open,
  close,
  toggle,
  children,
}: any) {
  return (
    <NewTodoDialog$isOpenContext.Provider value={isOpen}>
      <NewTodoDialog$openContext.Provider value={open}>
        <NewTodoDialog$closeContext.Provider value={close}>
          <NewTodoDialog$toggleContext.Provider value={toggle}>
            {children}
          </NewTodoDialog$toggleContext.Provider>
        </NewTodoDialog$closeContext.Provider>
      </NewTodoDialog$openContext.Provider>
    </NewTodoDialog$isOpenContext.Provider>
  );
}

function Title_Adapter() {
  return (
    <Typography
      text={"Todo App"}
      variant={"h4"}
      noWrap={undefined}
      color={undefined}
      component={undefined}
    />
  );
}

function TodoCount_Adapter() {
  return (
    <Typography
      text={String$concat(
        "Completed: ",
        Array$length(useContext(TodoRepositoryBloc1$completedIdsContext)),
        "/",
        useContext(TodoRepositoryBloc1$totalCountContext)
      )}
      variant={undefined}
      noWrap={undefined}
      color={undefined}
      component={undefined}
    />
  );
}

function ToggleCompletedButton_Adapter() {
  return (
    <IconButton
      label={""}
      icon={Operators$ternary(
        useContext(TodoRepositoryBloc1$showCompletedContext),
        "visibility",
        "visibility_off"
      )}
      color={"primary"}
      size={"small"}
      onPress={useContext(TodoRepositoryBloc1$toggleShowCompletedContext)}
      disabled={undefined}
    />
  );
}

function TodoList_Adapter() {
  return (
    <CheckList
      items={useContext(TodoRepositoryBloc1$visibleTodosContext)}
      getItemKey={TodoLibrary$getId}
      getPrimaryText={TodoLibrary$getDescription}
      getSecondaryText={TodoLibrary$getCreatedAt}
      checked={useContext(TodoRepositoryBloc1$completedIdsContext)}
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

function EmptyStateContainer_Adapter() {
  return (
    <FlexContainer
      flexDirection={undefined}
      alignItems={undefined}
      justifyContent={undefined}
      gap={undefined}
      padding={" 16px"}
      backgroundColor={undefined}
      elevation={undefined}
      outlined={undefined}
      borderRadius={undefined}
      alignSelf={[undefined]}
      margin={[undefined]}
      slots={{
        child: { size: 1, Component: EmptyStateContainer_child },
      }}
    />
  );
}

function EmptyStateContainer_child({ index }: any) {
  switch (index) {
    case 0:
      return <EmptyStateText_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function OpenNewTodoDialog_Adapter() {
  return (
    <Button
      label={"New Todo"}
      variant={"contained"}
      color={"success"}
      size={undefined}
      startIcon={"add"}
      endIcon={undefined}
      onPress={useContext(NewTodoDialog$openContext)}
      disabled={undefined}
    />
  );
}

function Typography1_Adapter() {
  return (
    <Typography
      text={"hello world"}
      variant={undefined}
      noWrap={undefined}
      color={undefined}
      component={undefined}
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

function EmptyStateText_Adapter() {
  return (
    <Typography
      text={"Nothing left to do. Enjoy your day!"}
      variant={undefined}
      noWrap={undefined}
      color={"text.secondary"}
      component={undefined}
    />
  );
}
