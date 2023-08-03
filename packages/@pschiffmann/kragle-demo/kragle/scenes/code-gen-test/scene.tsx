import { ArticleLibrary$getName } from "#kragle/libraries/index.js";
import {
  ArticleRepository,
  ArticleRepositorySchema,
  MuiTypography,
  Repeat,
  RepeatSchema,
  Stack,
  StackSchema,
  TryCall,
  TryCallSchema,
} from "#kragle/nodes/index.js";
import {
  OutputTypes,
  OutputsProviderProps,
  SlotComponentProps,
} from "@kragle/runtime/code-gen-helpers";
import { createContext, useContext } from "react";

export function CodeGenTest() {
  return <ArticleRepository1_Adapter />;
}

function ArticleRepository1_Adapter() {
  return (
    <ArticleRepository
      slots={{
        child: { Component: MuiStack1_Adapter },
      }}
      OutputsProvider={ArticleRepository1_OutputsProvider}
    />
  );
}

const ArticleRepository1$articlesContext = createContext<
  OutputTypes<ArticleRepositorySchema>["articles"]
>(null!);
const ArticleRepository1$updateArticleContext = createContext<
  OutputTypes<ArticleRepositorySchema>["updateArticle"]
>(null!);

function ArticleRepository1_OutputsProvider({
  articles,
  updateArticle,
  children,
}: OutputsProviderProps<ArticleRepositorySchema>) {
  return (
    <ArticleRepository1$articlesContext.Provider value={articles}>
      <ArticleRepository1$updateArticleContext.Provider value={updateArticle}>
        {children}
      </ArticleRepository1$updateArticleContext.Provider>
    </ArticleRepository1$articlesContext.Provider>
  );
}

function MuiStack1_Adapter() {
  return (
    <Stack
      flexDirection={"column"}
      gap={undefined}
      alignSelf={[undefined, undefined]}
      slots={{
        child: { size: 2, Component: MuiStack1_child },
      }}
    />
  );
}

function MuiStack1_child({ index }: SlotComponentProps<StackSchema, "child">) {
  switch (index) {
    case 0:
      return <IterateArticles_Adapter />;
    case 1:
      return <FnCall_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function IterateArticles_Adapter() {
  return (
    <Repeat
      collection={useContext(ArticleRepository1$articlesContext)}
      slots={{
        child: { Component: IterateArticles_child },
      }}
      OutputsProvider={IterateArticles_OutputsProvider}
    />
  );
}

const IterateArticles$isEmptyContext = createContext<
  OutputTypes<RepeatSchema>["isEmpty"]
>(null!);
const IterateArticles$indexContext = createContext<
  OutputTypes<RepeatSchema>["index"]
>(null!);
const IterateArticles$itemContext = createContext<
  OutputTypes<RepeatSchema>["item"]
>(null!);

function IterateArticles_OutputsProvider({
  isEmpty,
  children,
}: OutputsProviderProps<RepeatSchema>) {
  return (
    <IterateArticles$isEmptyContext.Provider value={isEmpty}>
      {children}
    </IterateArticles$isEmptyContext.Provider>
  );
}

function IterateArticles_child({
  index,
  item,
}: SlotComponentProps<RepeatSchema, "child">) {
  return (
    <IterateArticles$indexContext.Provider value={index}>
      <IterateArticles$itemContext.Provider value={item}>
        <ArticleName_Adapter />
      </IterateArticles$itemContext.Provider>
    </IterateArticles$indexContext.Provider>
  );
}

function FnCall_Adapter() {
  return (
    <TryCall
      callable={ArticleLibrary$getName}
      slots={{
        onSuccess: { Component: FnCall_onSuccess },
        onError: { Component: FnCall_onError },
      }}
    />
  );
}

const FnCall$valueContext = createContext<OutputTypes<TryCallSchema>["value"]>(
  null!,
);
const FnCall$errorContext = createContext<OutputTypes<TryCallSchema>["error"]>(
  null!,
);

function FnCall_onSuccess({
  value,
}: SlotComponentProps<TryCallSchema, "onSuccess">) {
  return (
    <FnCall$valueContext.Provider value={value}>
      <FnCallResult_Adapter />
    </FnCall$valueContext.Provider>
  );
}

function FnCall_onError({
  error,
}: SlotComponentProps<TryCallSchema, "onError">) {
  return (
    <FnCall$errorContext.Provider value={error}>
      <FnCallError_Adapter />
    </FnCall$errorContext.Provider>
  );
}

function ArticleName_Adapter() {
  return (
    <MuiTypography
      text={ArticleLibrary$getName(useContext(IterateArticles$itemContext))}
      variant={undefined}
    />
  );
}

function FnCallResult_Adapter() {
  return (
    <MuiTypography text={useContext(FnCall$valueContext)} variant={undefined} />
  );
}

function FnCallError_Adapter() {
  return (
    <MuiTypography text={useContext(FnCall$errorContext)} variant={undefined} />
  );
}
