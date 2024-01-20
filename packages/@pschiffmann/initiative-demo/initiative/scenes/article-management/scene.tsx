import { toCurrencyString } from "#initiative/extension-methods/index.js";
import {
  ArticleRepository,
  EditArticleBloc,
  I18n,
  MuiButton,
  MuiDialog,
  MuiTable,
  MuiTextField,
  MuiTypography,
  Stack,
  type ArticleRepositorySchema,
  type EditArticleBlocSchema,
  type I18nSchema,
  type MuiDialogSchema,
  type MuiTableSchema,
  type StackSchema,
} from "#initiative/nodes/index.js";
import { type Article } from "#initiative/types.js";
import {
  FluentBundle,
  FluentResource,
  type FluentVariable,
} from "@fluent/bundle";
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
  type ReactNode,
} from "react";
import { useLocale } from "../../locale-context.js";
import ftlUrlDe from "./locale/de.ftl";
import ftlUrlEn from "./locale/en.ftl";

export {
  Scene as ArticleManagement,
  type SceneProps as ArticleManagementProps,
};

const Scene$articleContext = createContext<Article>(null!);
const Scene$usernameContext = createContext<string>(null!);

interface SceneProps extends StyleProps {
  /**
   * For testing purposes only.
   */
  article: Article;

  /**
   * Current user.
   */
  username: string;
}

function Scene({ className, style, article, username }: SceneProps) {
  return (
    <FluentBundleProvider>
      <Scene$articleContext.Provider value={article}>
        <Scene$usernameContext.Provider value={username}>
          <Translations_Adapter className={className} style={style} />
        </Scene$usernameContext.Provider>
      </Scene$articleContext.Provider>
    </FluentBundleProvider>
  );
}

const UpdateArticleButton_Adapter = memo(function UpdateArticleButton_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <MuiButton
      className={className}
      style={style}
      label={"Save"}
      onPress={useContext(EditArticleBloc$saveContext)}
    />
  );
});

const EditArticlePriceTextField_Adapter = memo(
  function EditArticlePriceTextField_Adapter({ className, style }: StyleProps) {
    return (
      <MuiTextField
        className={className}
        style={style}
        label={"Price"}
        value={useContext(EditArticleBloc$priceContext)}
        onChange={useContext(EditArticleBloc$updatePriceContext)}
      />
    );
  },
);

const EditArticleNameTextField_Adapter = memo(
  function EditArticleNameTextField_Adapter({ className, style }: StyleProps) {
    return (
      <MuiTextField
        className={className}
        style={style}
        label={"Name"}
        value={useContext(EditArticleBloc$nameContext)}
        onChange={useContext(EditArticleBloc$updateNameContext)}
      />
    );
  },
);

const EditArticleFormLayout_Adapter = memo(
  function EditArticleFormLayout_Adapter({ className, style }: StyleProps) {
    return (
      <Stack
        className={className}
        style={style}
        flexDirection={"column"}
        gap={3}
        alignSelf={[undefined, undefined, undefined]}
        slots={EditArticleFormLayout$slots}
      />
    );
  },
);

const EditArticleFormLayout$slots = {
  child: { size: 3, Component: EditArticleFormLayout_child },
};

function EditArticleFormLayout_child({
  className,
  style,
  index,
}: SlotComponentProps<StackSchema, "child">) {
  switch (index) {
    case 0:
      return (
        <EditArticleNameTextField_Adapter className={className} style={style} />
      );
    case 1:
      return (
        <EditArticlePriceTextField_Adapter
          className={className}
          style={style}
        />
      );
    case 2:
      return (
        <UpdateArticleButton_Adapter className={className} style={style} />
      );
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

const EditArticleBloc$nameContext = createContext<
  OutputTypes<EditArticleBlocSchema>["name"]
>(null!);
const EditArticleBloc$updateNameContext = createContext<
  OutputTypes<EditArticleBlocSchema>["updateName"]
>(null!);
const EditArticleBloc$priceContext = createContext<
  OutputTypes<EditArticleBlocSchema>["price"]
>(null!);
const EditArticleBloc$updatePriceContext = createContext<
  OutputTypes<EditArticleBlocSchema>["updatePrice"]
>(null!);
const EditArticleBloc$saveContext = createContext<
  OutputTypes<EditArticleBlocSchema>["save"]
>(null!);

const EditArticleBloc_Adapter = memo(function EditArticleBloc_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <EditArticleBloc
      className={className}
      style={style}
      article={useContext(ArticlesTable$rowContext)}
      updateArticle={useContext(ArticleRepository$updateArticleContext)}
      OutputsProvider={EditArticleBloc_OutputsProvider}
      slots={EditArticleBloc$slots}
    />
  );
});

const EditArticleBloc$slots = {
  child: { Component: EditArticleFormLayout_Adapter },
};

function EditArticleBloc_OutputsProvider({
  name,
  updateName,
  price,
  updatePrice,
  save,
  children,
}: OutputsProviderProps<EditArticleBlocSchema>) {
  return (
    <EditArticleBloc$nameContext.Provider value={name}>
      <EditArticleBloc$updateNameContext.Provider value={updateName}>
        <EditArticleBloc$priceContext.Provider value={price}>
          <EditArticleBloc$updatePriceContext.Provider value={updatePrice}>
            <EditArticleBloc$saveContext.Provider value={save}>
              {children}
            </EditArticleBloc$saveContext.Provider>
          </EditArticleBloc$updatePriceContext.Provider>
        </EditArticleBloc$priceContext.Provider>
      </EditArticleBloc$updateNameContext.Provider>
    </EditArticleBloc$nameContext.Provider>
  );
}

const EditArticleButton_Adapter = memo(function EditArticleButton_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <MuiButton
      className={className}
      style={style}
      label={"Edit"}
      onPress={useContext(EditColumn$openContext)}
    />
  );
});

const EditColumn$isOpenContext = createContext<
  OutputTypes<MuiDialogSchema>["isOpen"]
>(null!);
const EditColumn$openContext = createContext<
  OutputTypes<MuiDialogSchema>["open"]
>(null!);
const EditColumn$closeContext = createContext<
  OutputTypes<MuiDialogSchema>["close"]
>(null!);
const EditColumn$toggleContext = createContext<
  OutputTypes<MuiDialogSchema>["toggle"]
>(null!);

const EditColumn_Adapter = memo(function EditColumn_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <MuiDialog
      className={className}
      style={style}
      title={"Edit Article"}
      OutputsProvider={EditColumn_OutputsProvider}
      slots={EditColumn$slots}
    />
  );
});

const EditColumn$slots = {
  trigger: { Component: EditArticleButton_Adapter },
  content: { Component: EditArticleBloc_Adapter },
};

function EditColumn_OutputsProvider({
  isOpen,
  open,
  close,
  toggle,
  children,
}: OutputsProviderProps<MuiDialogSchema>) {
  return (
    <EditColumn$isOpenContext.Provider value={isOpen}>
      <EditColumn$openContext.Provider value={open}>
        <EditColumn$closeContext.Provider value={close}>
          <EditColumn$toggleContext.Provider value={toggle}>
            {children}
          </EditColumn$toggleContext.Provider>
        </EditColumn$closeContext.Provider>
      </EditColumn$openContext.Provider>
    </EditColumn$isOpenContext.Provider>
  );
}

const PriceColumn_Adapter = memo(function PriceColumn_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <MuiTypography
      className={className}
      style={style}
      text={toCurrencyString(useContext(ArticlesTable$rowContext).price)}
      variant={"body2"}
    />
  );
});

const NameColumn_Adapter = memo(function NameColumn_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <MuiTypography
      className={className}
      style={style}
      text={useContext(ArticlesTable$rowContext).name}
      variant={"body2"}
    />
  );
});

const IdColumn_Adapter = memo(function IdColumn_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <MuiTypography
      className={className}
      style={style}
      text={useContext(ArticlesTable$rowContext).id.toString(undefined)}
      variant={"body2"}
    />
  );
});

const NewArticleBloc_Adapter = memo(function NewArticleBloc_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <MuiTypography
      className={className}
      style={style}
      text={"Under construction"}
    />
  );
});

const NewArticleButton_Adapter = memo(function NewArticleButton_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <MuiButton
      className={className}
      style={style}
      label={"Add new"}
      variant={"contained"}
      onPress={useContext(NewArticleDialog$openContext)}
    />
  );
});

const ArticlesTable$rowContext = createContext<
  OutputTypes<MuiTableSchema>["row"]
>(null!);

const ArticlesTable_Adapter = memo(function ArticlesTable_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <MuiTable
      className={className}
      style={style}
      rows={useContext(ArticleRepository$articlesContext)}
      header={[
        translateMessage(
          useContext(FluentBundleContext),
          "ArticlesTable",
          "header-1",
          {},
        ),
        translateMessage(
          useContext(FluentBundleContext),
          "ArticlesTable",
          "header-2",
          {},
        ),
        translateMessage(
          useContext(FluentBundleContext),
          "ArticlesTable",
          "header-3",
          {},
        ),
        translateMessage(
          useContext(FluentBundleContext),
          "ArticlesTable",
          "header-4",
          {},
        ),
      ]}
      align={[undefined, undefined, "right", undefined]}
      slots={ArticlesTable$slots}
    />
  );
});

const ArticlesTable$slots = {
  column: { size: 4, Component: ArticlesTable_column },
};

function ArticlesTable_column({
  className,
  style,
  index,
  row,
}: SlotComponentProps<MuiTableSchema, "column">) {
  switch (index) {
    case 0:
      return (
        <ArticlesTable$rowContext.Provider value={row}>
          <IdColumn_Adapter className={className} style={style} />
        </ArticlesTable$rowContext.Provider>
      );
    case 1:
      return (
        <ArticlesTable$rowContext.Provider value={row}>
          <NameColumn_Adapter className={className} style={style} />
        </ArticlesTable$rowContext.Provider>
      );
    case 2:
      return (
        <ArticlesTable$rowContext.Provider value={row}>
          <PriceColumn_Adapter className={className} style={style} />
        </ArticlesTable$rowContext.Provider>
      );
    case 3:
      return (
        <ArticlesTable$rowContext.Provider value={row}>
          <EditColumn_Adapter className={className} style={style} />
        </ArticlesTable$rowContext.Provider>
      );
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

const NewArticleDialog$isOpenContext = createContext<
  OutputTypes<MuiDialogSchema>["isOpen"]
>(null!);
const NewArticleDialog$openContext = createContext<
  OutputTypes<MuiDialogSchema>["open"]
>(null!);
const NewArticleDialog$closeContext = createContext<
  OutputTypes<MuiDialogSchema>["close"]
>(null!);
const NewArticleDialog$toggleContext = createContext<
  OutputTypes<MuiDialogSchema>["toggle"]
>(null!);

const NewArticleDialog_Adapter = memo(function NewArticleDialog_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <MuiDialog
      className={className}
      style={style}
      title={"New Article"}
      OutputsProvider={NewArticleDialog_OutputsProvider}
      slots={NewArticleDialog$slots}
    />
  );
});

const NewArticleDialog$slots = {
  trigger: { Component: NewArticleButton_Adapter },
  content: { Component: NewArticleBloc_Adapter },
};

function NewArticleDialog_OutputsProvider({
  isOpen,
  open,
  close,
  toggle,
  children,
}: OutputsProviderProps<MuiDialogSchema>) {
  return (
    <NewArticleDialog$isOpenContext.Provider value={isOpen}>
      <NewArticleDialog$openContext.Provider value={open}>
        <NewArticleDialog$closeContext.Provider value={close}>
          <NewArticleDialog$toggleContext.Provider value={toggle}>
            {children}
          </NewArticleDialog$toggleContext.Provider>
        </NewArticleDialog$closeContext.Provider>
      </NewArticleDialog$openContext.Provider>
    </NewArticleDialog$isOpenContext.Provider>
  );
}

const UserGreeting_Adapter = memo(function UserGreeting_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <MuiTypography
      className={className}
      style={style}
      text={translateMessage(
        useContext(FluentBundleContext),
        "UserGreeting",
        "text",
        {
          user: useContext(Scene$usernameContext),
        },
      )}
      variant={"subtitle1"}
    />
  );
});

const PageTitle_Adapter = memo(function PageTitle_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <MuiTypography
      className={className}
      style={style}
      text={translateMessage(
        useContext(FluentBundleContext),
        "PageTitle",
        "text",
        {},
      )}
      variant={"h3"}
    />
  );
});

const PageLayout_Adapter = memo(function PageLayout_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Stack
      className={className}
      style={style}
      flexDirection={"column"}
      gap={3}
      alignSelf={[undefined, undefined, "end", undefined]}
      slots={PageLayout$slots}
    />
  );
});

const PageLayout$slots = {
  child: { size: 4, Component: PageLayout_child },
};

function PageLayout_child({
  className,
  style,
  index,
}: SlotComponentProps<StackSchema, "child">) {
  switch (index) {
    case 0:
      return <PageTitle_Adapter className={className} style={style} />;
    case 1:
      return <UserGreeting_Adapter className={className} style={style} />;
    case 2:
      return <NewArticleDialog_Adapter className={className} style={style} />;
    case 3:
      return <ArticlesTable_Adapter className={className} style={style} />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

const ArticleRepository$articlesContext = createContext<
  OutputTypes<ArticleRepositorySchema>["articles"]
>(null!);
const ArticleRepository$updateArticleContext = createContext<
  OutputTypes<ArticleRepositorySchema>["updateArticle"]
>(null!);

const ArticleRepository_Adapter = memo(function ArticleRepository_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <ArticleRepository
      className={className}
      style={style}
      OutputsProvider={ArticleRepository_OutputsProvider}
      slots={ArticleRepository$slots}
    />
  );
});

const ArticleRepository$slots = {
  child: { Component: PageLayout_Adapter },
};

function ArticleRepository_OutputsProvider({
  articles,
  updateArticle,
  children,
}: OutputsProviderProps<ArticleRepositorySchema>) {
  return (
    <ArticleRepository$articlesContext.Provider value={articles}>
      <ArticleRepository$updateArticleContext.Provider value={updateArticle}>
        {children}
      </ArticleRepository$updateArticleContext.Provider>
    </ArticleRepository$articlesContext.Provider>
  );
}

const Translations$translateContext = createContext<
  OutputTypes<I18nSchema>["translate"]
>(null!);

const Translations_Adapter = memo(function Translations_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <I18n
      className={className}
      style={style}
      OutputsProvider={Translations_OutputsProvider}
      slots={Translations$slots}
    />
  );
});

const Translations$slots = {
  child: { Component: ArticleRepository_Adapter },
};

function Translations_OutputsProvider({
  translate,
  children,
}: OutputsProviderProps<I18nSchema>) {
  return (
    <Translations$translateContext.Provider value={translate}>
      {children}
    </Translations$translateContext.Provider>
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
