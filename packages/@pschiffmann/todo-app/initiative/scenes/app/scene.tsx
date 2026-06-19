import {
  CreateTodoBloc,
  TodoHelpers,
  TodoRepositoryBloc,
  type CreateTodoBlocSchema,
  type TodoHelpersSchema,
  type TodoRepositoryBlocSchema,
} from "#initiative/nodes/index.js";
import {
  FluentBundle,
  FluentResource,
  type FluentVariable,
} from "@fluent/bundle";
import { Switch, type SwitchSchema } from "@initiative.dev/lib-core/nodes";
import {
  Button,
  CheckList,
  Dialog,
  FlexContainer,
  IconButton,
  TextField,
  Typography,
  type CheckListSchema,
  type DialogSchema,
  type FlexContainerSchema,
} from "@initiative.dev/lib-mui-material/nodes";
import { type StyleProps } from "@initiative.dev/schema";
import {
  type OutputTypes,
  type OutputsProviderProps,
  type SlotComponentProps,
} from "@initiative.dev/schema/code-gen-helpers";
import {
  createContext,
  memo,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { useLocale } from "../../locale-context.js";
import ftlUrlDe from "./locale/de.ftl";
import ftlUrlEn from "./locale/en.ftl";

export { Scene as App, type SceneProps as AppProps };

interface SceneProps extends StyleProps {}

function Scene({ className, style }: SceneProps) {
  return (
    <FluentBundleProvider>
      <TodoHelpers_Adapter className={className} style={style} />
    </FluentBundleProvider>
  );
}

const NewTodoSubmitButton_Adapter = memo(function NewTodoSubmitButton_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Button
      className={className}
      style={style}
      label={translateMessage(
        useContext(FluentBundleContext),
        "NewTodoSubmitButton",
        "label",
        {},
      )}
      variant={"contained"}
      color={"primary"}
      onPress={useContext(CreateTodoBloc$submitContext)}
    />
  );
});

const NewTodoDescription_Adapter = memo(function NewTodoDescription_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <TextField
      className={className}
      style={style}
      label={translateMessage(
        useContext(FluentBundleContext),
        "NewTodoDescription",
        "label",
        {},
      )}
      value={useContext(CreateTodoBloc$description$valueContext)}
      onChange={useContext(CreateTodoBloc$description$onChangeContext)}
    />
  );
});

const NewTodoFormLayout_Adapter = memo(function NewTodoFormLayout_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <FlexContainer
      className={className}
      style={style}
      gap={1}
      padding={"8px 0 0 0"}
      alignSelf={[undefined, undefined]}
      margin={[undefined, undefined]}
      slots={NewTodoFormLayout$slots}
    />
  );
});

const NewTodoFormLayout$slots = {
  child: { size: 2, Component: NewTodoFormLayout_child },
};

function NewTodoFormLayout_child({
  className,
  style,
  index,
}: SlotComponentProps<FlexContainerSchema, "child">): ReactElement {
  switch (index) {
    case 0:
      return <NewTodoDescription_Adapter className={className} style={style} />;
    case 1:
      return (
        <NewTodoSubmitButton_Adapter className={className} style={style} />
      );
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

const DeleteTodoButton_Adapter = memo(function DeleteTodoButton_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <IconButton
      className={className}
      style={style}
      label={""}
      icon={"delete"}
      color={"error"}
      size={"small"}
      onPress={useContext(TodoRepositoryBloc$deleteTodoContext)(
        useContext(TodoHelpers$getIdContext)(useContext(TodoList$itemContext)),
      )}
    />
  );
});

const EmptyStateText_Adapter = memo(function EmptyStateText_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Typography
      className={className}
      style={style}
      text={translateMessage(
        useContext(FluentBundleContext),
        "EmptyStateText",
        "text",
        {},
      )}
      color={"text.secondary"}
    />
  );
});

const CreateTodoBloc$description$valueContext = createContext<
  OutputTypes<CreateTodoBlocSchema>["description$value"]
>(null!);
const CreateTodoBloc$description$onChangeContext = createContext<
  OutputTypes<CreateTodoBlocSchema>["description$onChange"]
>(null!);
const CreateTodoBloc$submitContext = createContext<
  OutputTypes<CreateTodoBlocSchema>["submit"]
>(null!);
const CreateTodoBloc$submitDisabledContext = createContext<
  OutputTypes<CreateTodoBlocSchema>["submitDisabled"]
>(null!);

const CreateTodoBloc_Adapter = memo(function CreateTodoBloc_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <CreateTodoBloc
      className={className}
      style={style}
      createTodo={useContext(TodoRepositoryBloc$createTodoContext)}
      closeDialog={useContext(NewTodoDialog$closeContext)}
      OutputsProvider={CreateTodoBloc_OutputsProvider}
      slots={CreateTodoBloc$slots}
    />
  );
});

const CreateTodoBloc$slots = {
  child: { Component: NewTodoFormLayout_Adapter },
};

function CreateTodoBloc_OutputsProvider({
  description$value,
  description$onChange,
  submit,
  submitDisabled,
  children,
}: OutputsProviderProps<CreateTodoBlocSchema>) {
  return (
    <CreateTodoBloc$description$valueContext.Provider value={description$value}>
      <CreateTodoBloc$description$onChangeContext.Provider
        value={description$onChange}
      >
        <CreateTodoBloc$submitContext.Provider value={submit}>
          <CreateTodoBloc$submitDisabledContext.Provider value={submitDisabled}>
            {children}
          </CreateTodoBloc$submitDisabledContext.Provider>
        </CreateTodoBloc$submitContext.Provider>
      </CreateTodoBloc$description$onChangeContext.Provider>
    </CreateTodoBloc$description$valueContext.Provider>
  );
}

const OpenNewTodoDialog_Adapter = memo(function OpenNewTodoDialog_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Button
      className={className}
      style={style}
      label={translateMessage(
        useContext(FluentBundleContext),
        "OpenNewTodoDialog",
        "label",
        {},
      )}
      variant={"contained"}
      color={"primary"}
      startIcon={"add"}
      onPress={useContext(NewTodoDialog$openContext)}
    />
  );
});

const TodoList$itemContext = createContext<
  OutputTypes<CheckListSchema>["item"]
>(null!);

const TodoList_Adapter = memo(function TodoList_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <CheckList
      className={className}
      style={style}
      items={useContext(TodoRepositoryBloc$visibleTodosContext)}
      getItemKey={useContext(TodoHelpers$getIdContext)}
      getPrimaryText={useContext(TodoHelpers$getDescriptionContext)}
      getSecondaryText={useContext(TodoHelpers$getCreatedAtContext)}
      checked={useContext(TodoRepositoryBloc$completedIdsContext)}
      onCheckedChange={useContext(TodoRepositoryBloc$toggleCompletedContext)}
      slots={TodoList$slots}
    />
  );
});

const TodoList$slots = {
  secondaryAction: { Component: TodoList_secondaryAction },
};

function TodoList_secondaryAction({
  className,
  style,
  item,
}: SlotComponentProps<CheckListSchema, "secondaryAction">) {
  return (
    <TodoList$itemContext.Provider value={item}>
      <DeleteTodoButton_Adapter className={className} style={style} />
    </TodoList$itemContext.Provider>
  );
}

const EmptyStateContainer_Adapter = memo(function EmptyStateContainer_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <FlexContainer
      className={className}
      style={style}
      padding={"16px"}
      alignSelf={[undefined]}
      margin={[undefined]}
      slots={EmptyStateContainer$slots}
    />
  );
});

const EmptyStateContainer$slots = {
  child: { size: 1, Component: EmptyStateContainer_child },
};

function EmptyStateContainer_child({
  className,
  style,
  index,
}: SlotComponentProps<FlexContainerSchema, "child">): ReactElement {
  switch (index) {
    case 0:
      return <EmptyStateText_Adapter className={className} style={style} />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

const ToggleCompletedButton_Adapter = memo(
  function ToggleCompletedButton_Adapter({ className, style }: StyleProps) {
    return (
      <IconButton
        className={className}
        style={style}
        label={""}
        icon={translateMessage(
          useContext(FluentBundleContext),
          "ToggleCompletedButton",
          "icon",
          {
            showCompleted: useContext(
              TodoRepositoryBloc$showCompletedContext,
            ).toString(),
          },
        )}
        color={"primary"}
        size={"small"}
        onPress={useContext(TodoRepositoryBloc$toggleShowCompletedContext)}
      />
    );
  },
);

const TodoCount_Adapter = memo(function TodoCount_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Typography
      className={className}
      style={style}
      text={translateMessage(
        useContext(FluentBundleContext),
        "TodoCount",
        "text",
        {
          completed: useContext(TodoRepositoryBloc$completedIdsContext).length,
          total: useContext(TodoRepositoryBloc$totalCountContext),
        },
      )}
    />
  );
});

const Title_Adapter = memo(function Title_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Typography
      className={className}
      style={style}
      text={"Todo App"}
      variant={"h4"}
    />
  );
});

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

const NewTodoDialog_Adapter = memo(function NewTodoDialog_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Dialog
      className={className}
      style={style}
      title={translateMessage(
        useContext(FluentBundleContext),
        "NewTodoDialog",
        "title",
        {},
      )}
      OutputsProvider={NewTodoDialog_OutputsProvider}
      slots={NewTodoDialog$slots}
    />
  );
});

const NewTodoDialog$slots = {
  trigger: { Component: OpenNewTodoDialog_Adapter },
  content: { Component: CreateTodoBloc_Adapter },
};

function NewTodoDialog_OutputsProvider({
  isOpen,
  open,
  close,
  toggle,
  children,
}: OutputsProviderProps<DialogSchema>) {
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

const EmptyStateSwitch_Adapter = memo(function EmptyStateSwitch_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Switch
      className={className}
      style={style}
      showIf={[useContext(TodoRepositoryBloc$isEmptyContext), true]}
      slots={EmptyStateSwitch$slots}
    />
  );
});

const EmptyStateSwitch$slots = {
  case: { size: 2, Component: EmptyStateSwitch_case },
};

function EmptyStateSwitch_case({
  className,
  style,
  index,
}: SlotComponentProps<SwitchSchema, "case">): ReactElement {
  switch (index) {
    case 0:
      return (
        <EmptyStateContainer_Adapter className={className} style={style} />
      );
    case 1:
      return <TodoList_Adapter className={className} style={style} />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

const Header_Adapter = memo(function Header_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <FlexContainer
      className={className}
      style={style}
      flexDirection={"row"}
      alignItems={"center"}
      gap={1}
      padding={"0 20px"}
      alignSelf={[undefined, undefined, undefined]}
      margin={["0 auto 0 0", undefined, undefined]}
      slots={Header$slots}
    />
  );
});

const Header$slots = {
  child: { size: 3, Component: Header_child },
};

function Header_child({
  className,
  style,
  index,
}: SlotComponentProps<FlexContainerSchema, "child">): ReactElement {
  switch (index) {
    case 0:
      return <Title_Adapter className={className} style={style} />;
    case 1:
      return <TodoCount_Adapter className={className} style={style} />;
    case 2:
      return (
        <ToggleCompletedButton_Adapter className={className} style={style} />
      );
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

const PageLayout_Adapter = memo(function PageLayout_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <FlexContainer
      className={className}
      style={style}
      flexDirection={"column"}
      gap={1}
      padding={"16px 0"}
      backgroundColor={"background.paper"}
      elevation={2}
      borderRadius={2}
      alignSelf={[undefined, undefined, "start"]}
      margin={[undefined, undefined, "0 12px"]}
      slots={PageLayout$slots}
    />
  );
});

const PageLayout$slots = {
  child: { size: 3, Component: PageLayout_child },
};

function PageLayout_child({
  className,
  style,
  index,
}: SlotComponentProps<FlexContainerSchema, "child">): ReactElement {
  switch (index) {
    case 0:
      return <Header_Adapter className={className} style={style} />;
    case 1:
      return <EmptyStateSwitch_Adapter className={className} style={style} />;
    case 2:
      return <NewTodoDialog_Adapter className={className} style={style} />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

const TodoRepositoryBloc$visibleTodosContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["visibleTodos"]
>(null!);
const TodoRepositoryBloc$completedIdsContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["completedIds"]
>(null!);
const TodoRepositoryBloc$totalCountContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["totalCount"]
>(null!);
const TodoRepositoryBloc$isEmptyContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["isEmpty"]
>(null!);
const TodoRepositoryBloc$toggleCompletedContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["toggleCompleted"]
>(null!);
const TodoRepositoryBloc$showCompletedContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["showCompleted"]
>(null!);
const TodoRepositoryBloc$toggleShowCompletedContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["toggleShowCompleted"]
>(null!);
const TodoRepositoryBloc$createTodoContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["createTodo"]
>(null!);
const TodoRepositoryBloc$deleteTodoContext = createContext<
  OutputTypes<TodoRepositoryBlocSchema>["deleteTodo"]
>(null!);

const TodoRepositoryBloc_Adapter = memo(function TodoRepositoryBloc_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <TodoRepositoryBloc
      className={className}
      style={style}
      OutputsProvider={TodoRepositoryBloc_OutputsProvider}
      slots={TodoRepositoryBloc$slots}
    />
  );
});

const TodoRepositoryBloc$slots = {
  child: { Component: PageLayout_Adapter },
};

function TodoRepositoryBloc_OutputsProvider({
  visibleTodos,
  completedIds,
  totalCount,
  isEmpty,
  toggleCompleted,
  showCompleted,
  toggleShowCompleted,
  createTodo,
  deleteTodo,
  children,
}: OutputsProviderProps<TodoRepositoryBlocSchema>) {
  return (
    <TodoRepositoryBloc$visibleTodosContext.Provider value={visibleTodos}>
      <TodoRepositoryBloc$completedIdsContext.Provider value={completedIds}>
        <TodoRepositoryBloc$totalCountContext.Provider value={totalCount}>
          <TodoRepositoryBloc$isEmptyContext.Provider value={isEmpty}>
            <TodoRepositoryBloc$toggleCompletedContext.Provider
              value={toggleCompleted}
            >
              <TodoRepositoryBloc$showCompletedContext.Provider
                value={showCompleted}
              >
                <TodoRepositoryBloc$toggleShowCompletedContext.Provider
                  value={toggleShowCompleted}
                >
                  <TodoRepositoryBloc$createTodoContext.Provider
                    value={createTodo}
                  >
                    <TodoRepositoryBloc$deleteTodoContext.Provider
                      value={deleteTodo}
                    >
                      {children}
                    </TodoRepositoryBloc$deleteTodoContext.Provider>
                  </TodoRepositoryBloc$createTodoContext.Provider>
                </TodoRepositoryBloc$toggleShowCompletedContext.Provider>
              </TodoRepositoryBloc$showCompletedContext.Provider>
            </TodoRepositoryBloc$toggleCompletedContext.Provider>
          </TodoRepositoryBloc$isEmptyContext.Provider>
        </TodoRepositoryBloc$totalCountContext.Provider>
      </TodoRepositoryBloc$completedIdsContext.Provider>
    </TodoRepositoryBloc$visibleTodosContext.Provider>
  );
}

const TodoHelpers$getIdContext = createContext<
  OutputTypes<TodoHelpersSchema>["getId"]
>(null!);
const TodoHelpers$getDescriptionContext = createContext<
  OutputTypes<TodoHelpersSchema>["getDescription"]
>(null!);
const TodoHelpers$getCreatedAtContext = createContext<
  OutputTypes<TodoHelpersSchema>["getCreatedAt"]
>(null!);
const TodoHelpers$getCompletedContext = createContext<
  OutputTypes<TodoHelpersSchema>["getCompleted"]
>(null!);

const TodoHelpers_Adapter = memo(function TodoHelpers_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <TodoHelpers
      className={className}
      style={style}
      OutputsProvider={TodoHelpers_OutputsProvider}
      slots={TodoHelpers$slots}
    />
  );
});

const TodoHelpers$slots = {
  child: { Component: TodoRepositoryBloc_Adapter },
};

function TodoHelpers_OutputsProvider({
  getId,
  getDescription,
  getCreatedAt,
  getCompleted,
  children,
}: OutputsProviderProps<TodoHelpersSchema>) {
  return (
    <TodoHelpers$getIdContext.Provider value={getId}>
      <TodoHelpers$getDescriptionContext.Provider value={getDescription}>
        <TodoHelpers$getCreatedAtContext.Provider value={getCreatedAt}>
          <TodoHelpers$getCompletedContext.Provider value={getCompleted}>
            {children}
          </TodoHelpers$getCompletedContext.Provider>
        </TodoHelpers$getCreatedAtContext.Provider>
      </TodoHelpers$getDescriptionContext.Provider>
    </TodoHelpers$getIdContext.Provider>
  );
}

//
// Fluent
//

const ftlCache = new Map<string, Promise<string>>();

const FluentBundleContext = createContext<FluentBundle | null>(null);

function FluentBundleProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [bundle, setBundle] = useState<FluentBundle | null>(null);

  useEffect(() => {
    let cancelled = false;

    let ftlPromise = ftlCache.get(locale);
    if (!ftlPromise) {
      switch (locale) {
        case "en":
          ftlPromise = fetch(ftlUrlEn).then((r) => r.text());
          break;
        case "de":
          ftlPromise = fetch(ftlUrlDe).then((r) => r.text());
          break;
        default:
          throw new Error(`Unsupported locale: '${locale}'`);
      }
      ftlCache.set(locale, ftlPromise);
    }
    ftlPromise.then((source) => {
      if (cancelled) return;
      const bundle = new FluentBundle(locale);
      bundle.addResource(new FluentResource(source));
      setBundle(bundle);
    });

    return () => {
      cancelled = true;
      setBundle(null);
    };
  }, [locale]);

  return (
    <FluentBundleContext.Provider value={bundle}>
      {children}
    </FluentBundleContext.Provider>
  );
}

function translateMessage(
  bundle: FluentBundle | null,
  nodeId: string,
  expressionKey: string,
  args?: Record<string, FluentVariable>,
): string {
  const pattern = bundle?.getMessage(nodeId)?.attributes?.[expressionKey];
  return pattern
    ? bundle!.formatPattern(pattern, args, [])
    : `${nodeId}.${expressionKey}`;
}
