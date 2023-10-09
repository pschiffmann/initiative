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
import { FluentBundle, FluentResource, FluentVariable } from "@fluent/bundle";
import {
  type OutputTypes,
  type OutputsProviderProps,
  type SlotComponentProps,
} from "@initiativejs/schema/code-gen-helpers";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocale } from "../locale-context.js";
import ftlUrlDe from "./locale/de.ftl";
import ftlUrlEn from "./locale/en.ftl";

export function ArticleManagement() {
  const locale = useLocale();
  const fluentBundle = useFluentBundle(locale);
  return (
    <FluentBundleContext.Provider value={fluentBundle}>
      <Translations_Adapter />
    </FluentBundleContext.Provider>
  );
}

function Translations_Adapter() {
  return (
    <I18n
      slots={{
        child: { Component: ArticleRepository_Adapter },
      }}
      OutputsProvider={Translations_OutputsProvider}
    />
  );
}

const Translations$translateContext = createContext<
  OutputTypes<I18nSchema>["translate"]
>(null!);

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

function ArticleRepository_Adapter() {
  return (
    <ArticleRepository
      slots={{
        child: { Component: PageLayout_Adapter },
      }}
      OutputsProvider={ArticleRepository_OutputsProvider}
    />
  );
}

const ArticleRepository$articlesContext = createContext<
  OutputTypes<ArticleRepositorySchema>["articles"]
>(null!);
const ArticleRepository$updateArticleContext = createContext<
  OutputTypes<ArticleRepositorySchema>["updateArticle"]
>(null!);

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

function PageLayout_Adapter() {
  return (
    <Stack
      flexDirection={"column"}
      gap={3}
      alignSelf={[undefined, undefined, "end", undefined]}
      slots={{
        child: { size: 4, Component: PageLayout_child },
      }}
    />
  );
}

function PageLayout_child({ index }: SlotComponentProps<StackSchema, "child">) {
  switch (index) {
    case 0:
      return <PageTitle_Adapter />;
    case 1:
      return <PageSubtitle_Adapter />;
    case 2:
      return <NewArticleDialog_Adapter />;
    case 3:
      return <ArticlesTable_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function PageTitle_Adapter() {
  const fluentBundle = useContext(FluentBundleContext);
  return (
    <MuiTypography
      text={translateMessage(fluentBundle, "page-title", "text")}
      variant={"h3"}
    />
  );
}

function PageSubtitle_Adapter() {
  const fluentBundle = useContext(FluentBundleContext);
  return (
    <MuiTypography
      text={translateMessage(fluentBundle, "page-subtitle", "text", {
        user: "Philipp",
      })}
      variant={undefined}
    />
  );
}

function NewArticleDialog_Adapter() {
  return (
    <MuiDialog
      title={"New Article"}
      slots={{
        trigger: { Component: NewArticleButton_Adapter },
        content: { Component: NewArticleBloc_Adapter },
      }}
      OutputsProvider={NewArticleDialog_OutputsProvider}
    />
  );
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

function ArticlesTable_Adapter() {
  const fluentBundle = useContext(FluentBundleContext);
  return (
    <MuiTable
      rows={useContext(ArticleRepository$articlesContext)}
      header={[
        translateMessage(fluentBundle, "articles-table", "header-0"),
        translateMessage(fluentBundle, "articles-table", "header-1"),
        translateMessage(fluentBundle, "articles-table", "header-2"),
        translateMessage(fluentBundle, "articles-table", "header-3"),
      ]}
      align={[undefined, undefined, "right", undefined]}
      slots={{
        column: { size: 4, Component: ArticlesTable_column },
      }}
    />
  );
}

const ArticlesTable$rowContext = createContext<
  OutputTypes<MuiTableSchema>["row"]
>(null!);

function ArticlesTable_column({
  row,
  index,
}: SlotComponentProps<MuiTableSchema, "column">) {
  switch (index) {
    case 0:
      return (
        <ArticlesTable$rowContext.Provider value={row}>
          <IdColumn_Adapter />
        </ArticlesTable$rowContext.Provider>
      );
    case 1:
      return (
        <ArticlesTable$rowContext.Provider value={row}>
          <NameColumn_Adapter />
        </ArticlesTable$rowContext.Provider>
      );
    case 2:
      return (
        <ArticlesTable$rowContext.Provider value={row}>
          <PriceColumn_Adapter />
        </ArticlesTable$rowContext.Provider>
      );
    case 3:
      return (
        <ArticlesTable$rowContext.Provider value={row}>
          <EditColumn_Adapter />
        </ArticlesTable$rowContext.Provider>
      );
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function NewArticleButton_Adapter() {
  return (
    <MuiButton
      label={"Add new"}
      variant={"contained"}
      color={undefined}
      size={undefined}
      onPress={useContext(NewArticleDialog$openContext)}
    />
  );
}

function NewArticleBloc_Adapter() {
  return <MuiTypography text={"Under construction"} variant={undefined} />;
}

function IdColumn_Adapter() {
  return (
    <MuiTypography
      text={useContext(ArticlesTable$rowContext).id.toString(undefined)}
      variant={"body2"}
    />
  );
}

function NameColumn_Adapter() {
  return (
    <MuiTypography
      text={useContext(ArticlesTable$rowContext).name}
      variant={"body2"}
    />
  );
}

function PriceColumn_Adapter() {
  return (
    <MuiTypography
      text={toCurrencyString(useContext(ArticlesTable$rowContext).price)}
      variant={"body2"}
    />
  );
}

function EditColumn_Adapter() {
  return (
    <MuiDialog
      title={"Edit Article"}
      slots={{
        trigger: { Component: EditArticleButton_Adapter },
        content: { Component: EditArticleBloc_Adapter },
      }}
      OutputsProvider={EditColumn_OutputsProvider}
    />
  );
}

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

function EditArticleButton_Adapter() {
  return (
    <MuiButton
      label={"Edit"}
      variant={undefined}
      color={undefined}
      size={undefined}
      onPress={useContext(EditColumn$openContext)}
    />
  );
}

function EditArticleBloc_Adapter() {
  return (
    <EditArticleBloc
      article={useContext(ArticlesTable$rowContext)}
      updateArticle={useContext(ArticleRepository$updateArticleContext)}
      slots={{
        child: { Component: EditArticleFormLayout_Adapter },
      }}
      OutputsProvider={EditArticleBloc_OutputsProvider}
    />
  );
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

function EditArticleFormLayout_Adapter() {
  return (
    <Stack
      flexDirection={"column"}
      gap={3}
      alignSelf={[undefined, undefined, undefined]}
      slots={{
        child: { size: 3, Component: EditArticleFormLayout_child },
      }}
    />
  );
}

function EditArticleFormLayout_child({
  index,
}: SlotComponentProps<StackSchema, "child">) {
  switch (index) {
    case 0:
      return <EditArticleNameTextField_Adapter />;
    case 1:
      return <EditArticlePriceTextField_Adapter />;
    case 2:
      return <UpdateArticleButton_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function EditArticleNameTextField_Adapter() {
  return (
    <MuiTextField
      label={"Name"}
      value={useContext(EditArticleBloc$nameContext)}
      onChange={useContext(EditArticleBloc$updateNameContext)}
    />
  );
}

function EditArticlePriceTextField_Adapter() {
  return (
    <MuiTextField
      label={"Price"}
      value={useContext(EditArticleBloc$priceContext)}
      onChange={useContext(EditArticleBloc$updatePriceContext)}
    />
  );
}

function UpdateArticleButton_Adapter() {
  return (
    <MuiButton
      label={"Save"}
      variant={undefined}
      color={undefined}
      size={undefined}
      onPress={useContext(EditArticleBloc$saveContext)}
    />
  );
}

//
// i18n
//

const ftlCache = new Map<string, Promise<string>>();

const FluentBundleContext = createContext<FluentBundle | null>(null);

function useFluentBundle(locale: string) {
  const [bundle, setBundle] = useState<FluentBundle | null>(null);

  useEffect(() => {
    let cancelled = false;

    let ftlPromise = ftlCache.get(locale);
    if (!ftlPromise) {
      switch (locale) {
        case "de":
          ftlPromise = fetch(ftlUrlDe).then((r) => r.text());
          break;
        case "en":
          ftlPromise = fetch(ftlUrlEn).then((r) => r.text());
          break;
        default:
          throw new Error(`Unsupported locale: ${locale}`);
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

  return bundle;
}

function translateMessage(
  bundle: FluentBundle | null,
  nodeId: string,
  inputKey: string,
  args?: Record<string, FluentVariable>,
): string {
  const pattern = bundle?.getMessage(nodeId)?.attributes?.[inputKey];
  return pattern
    ? bundle!.formatPattern(pattern, args, [])
    : `${nodeId}.${inputKey}`;
}
