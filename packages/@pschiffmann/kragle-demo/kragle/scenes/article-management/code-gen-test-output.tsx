import {
  ArticleLibrary$getFormattedPrice,
  ArticleLibrary$getId,
  ArticleLibrary$getName,
} from "#kragle/libraries/index.js";
import {
  ArticleRepository,
  EditArticleBloc,
  MuiButton,
  MuiDialog,
  MuiTable,
  MuiTextField,
  MuiTypography,
  Stack,
} from "#kragle/nodes/index.js";
import { createContext, useContext } from "react";

export function Articlemanagement() {
  return <ArticlcesRepository_Adapter />;
}

function ArticlcesRepository_Adapter() {
  return (
    <ArticleRepository
      slots={{
        child: { Component: PageLayout_Adapter },
      }}
      OutputsProvider={ArticlcesRepository_OutputsProvider}
    />
  );
}

const ArticlcesRepository$articlesContext = createContext<any>(null);
const ArticlcesRepository$updateArticleContext = createContext<any>(null);

function ArticlcesRepository_OutputsProvider({
  articles,
  updateArticle,
  children,
}: any) {
  return (
    <ArticlcesRepository$articlesContext.Provider value={articles}>
      <ArticlcesRepository$updateArticleContext.Provider value={updateArticle}>
        {children}
      </ArticlcesRepository$updateArticleContext.Provider>
    </ArticlcesRepository$articlesContext.Provider>
  );
}

function PageLayout_Adapter() {
  return (
    <Stack
      flexDirection={"column"}
      gap={3}
      alignSelf={[undefined, "end", undefined]}
      slots={{
        child: { size: 3, Component: PageLayout_child },
      }}
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
  return <MuiTypography text={"Article Management"} variant={"h3"} />;
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

function ArticlesTable_Adapter() {
  return (
    <MuiTable
      rows={useContext(ArticlcesRepository$articlesContext)}
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
      text={ArticleLibrary$getId(useContext(ArticlesTable$rowContext))}
      variant={"body2"}
    />
  );
}

function NameColumn_Adapter() {
  return (
    <MuiTypography
      text={ArticleLibrary$getName(useContext(ArticlesTable$rowContext))}
      variant={"body2"}
    />
  );
}

function PriceColumn_Adapter() {
  return (
    <MuiTypography
      text={ArticleLibrary$getFormattedPrice(
        useContext(ArticlesTable$rowContext)
      )}
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

const EditColumn$isOpenContext = createContext<any>(null);
const EditColumn$openContext = createContext<any>(null);
const EditColumn$closeContext = createContext<any>(null);
const EditColumn$toggleContext = createContext<any>(null);

function EditColumn_OutputsProvider({
  isOpen,
  open,
  close,
  toggle,
  children,
}: any) {
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
      updateArticle={useContext(ArticlcesRepository$updateArticleContext)}
      slots={{
        child: { Component: EditArticleFormLayout_Adapter },
      }}
      OutputsProvider={EditArticleBloc_OutputsProvider}
    />
  );
}

const EditArticleBloc$nameContext = createContext<any>(null);
const EditArticleBloc$updateNameContext = createContext<any>(null);
const EditArticleBloc$priceContext = createContext<any>(null);
const EditArticleBloc$updatePriceContext = createContext<any>(null);
const EditArticleBloc$saveContext = createContext<any>(null);

function EditArticleBloc_OutputsProvider({
  name,
  updateName,
  price,
  updatePrice,
  save,
  children,
}: any) {
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

function EditArticleFormLayout_child({ index }: any) {
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
