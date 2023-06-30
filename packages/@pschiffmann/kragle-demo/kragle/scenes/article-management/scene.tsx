import {
  ArticleLibrary$getFormattedPrice,
  ArticleLibrary$getId,
  ArticleLibrary$getName,
} from "#kragle/libraries/index.js";
import {
  ArticleRepository,
  MuiButton,
  MuiDialog,
  MuiTable,
  MuiTypography,
  Stack,
} from "#kragle/nodes/index.js";
import { createContext, useContext } from "react";

export function ArticleManagement() {
  return <ArticlcesRepository_Adapter />;
}

function ArticlcesRepository_Adapter() {
  return (
    <ArticleRepository
      slots={{
        child: { Component: ArticlesRepository_child },
      }}
      OutputsProvider={ArticlcesRepository_OutputsProvider}
    />
  );
}

const ArticlesRepository$articlesContext = createContext<any>(null);
const ArticlesRepository$updateArticleContext = createContext<any>(null);

function ArticlcesRepository_OutputsProvider({
  articles,
  updateArticle,
  children,
}: any) {
  return (
    <ArticlesRepository$articlesContext.Provider value={articles}>
      <ArticlesRepository$updateArticleContext.Provider value={updateArticle}>
        {children}
      </ArticlesRepository$updateArticleContext.Provider>
    </ArticlesRepository$articlesContext.Provider>
  );
}

function ArticlesRepository_child() {
  return <PageLayout_Adapter />;
}

function PageLayout_Adapter() {
  return (
    <Stack
      flexDirection={"column"}
      gap={3}
      alignSelf={[undefined, "end", undefined]}
      slots={{ child: { size: 3, Component: PageLayout_child } }}
    />
  );
}

function PageLayout_child({ index }: any) {
  switch (index) {
    case 0:
      return <PageTitle_Adapter />;
    case 1:
      return <NewArticleDialog_Adapter />;
    case 2:
      return <ArticlesTable_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function PageTitle_Adapter() {
  return <MuiTypography text="Article Management" variant="h3" />;
}

function NewArticleDialog_Adapter() {
  return (
    <MuiDialog
      title="New Article"
      slots={{
        trigger: { Component: NewArticleDialog_trigger },
        content: { Component: NewArticleDialog_content },
      }}
      OutputsProvider={NewArticleDialog_OutputsProvider}
    />
  );
}

const NewArticleDialog$isOpenContext = createContext<any>(null);
const NewArticleDialog$openContext = createContext<any>(null);
const NewArticleDialog$closeContext = createContext<any>(null);
const NewArticleDialog$toggleContext = createContext<any>(null);

function NewArticleDialog_OutputsProvider({
  isOpen,
  open,
  close,
  toggle,
  children,
}: any) {
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

function NewArticleDialog_trigger() {
  return <NewArticleButton_Adapter />;
}

function NewArticleDialog_content() {
  return <NewArticleBloc_Adapter />;
}

function NewArticleButton_Adapter() {
  return (
    <MuiButton
      label="Add new"
      variant="contained"
      onPress={useContext(NewArticleDialog$openContext)}
    />
  );
}

function NewArticleBloc_Adapter() {
  return <MuiTypography text="Under construction" />;
}

function ArticlesTable_Adapter() {
  return (
    <MuiTable
      rows={useContext(ArticlesRepository$articlesContext)}
      getRowKey={ArticleLibrary$getId}
      header={["Id", "Name", "Price", "Action"]}
      align={[undefined, undefined, "right", undefined]}
      slots={{
        column: { size: 4, Component: ArticlesTable_column },
      }}
    />
  );
}

const ArticlesTable$rowContext = createContext<any>(null);

function ArticlesTable_column({ row, index }: any) {
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

function IdColumn_Adapter() {
  return (
    <MuiTypography
      text={ArticleLibrary$getId(useContext(ArticlesTable$rowContext))}
      variant="body2"
    />
  );
}

function NameColumn_Adapter() {
  return (
    <MuiTypography
      text={ArticleLibrary$getName(useContext(ArticlesTable$rowContext))}
      variant="body2"
    />
  );
}

function PriceColumn_Adapter() {
  return (
    <MuiTypography
      text={ArticleLibrary$getFormattedPrice(
        useContext(ArticlesTable$rowContext)
      )}
      variant="body2"
    />
  );
}

function EditColumn_Adapter() {
  return <div>You get the idea ...</div>;
}
