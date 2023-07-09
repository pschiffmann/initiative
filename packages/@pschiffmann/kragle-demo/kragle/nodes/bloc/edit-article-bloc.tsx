import { NodeComponentProps } from "@kragle/runtime";
import { useState } from "react";
import {
  ArticleLibrary$getFormattedPrice,
  ArticleLibrary$parseFormattedPrice,
} from "../../libraries/article.js";
import { EditArticleBlocSchema } from "./edit-article-bloc.schema.js";

export function EditArticleBloc({
  article,
  updateArticle,
  slots,
  OutputsProvider,
}: NodeComponentProps<EditArticleBlocSchema>) {
  const [name, setName] = useState(article.name);
  const [price, setPrice] = useState(ArticleLibrary$getFormattedPrice(article));

  function save() {
    if (!name) {
      alert("Name can't be empty.");
      return;
    }
    let parsedPrice: number;
    try {
      parsedPrice = ArticleLibrary$parseFormattedPrice(price);
      updateArticle({ ...article, name, price: parsedPrice });
    } catch (e) {
      alert(e);
    }
  }

  return (
    <OutputsProvider
      name={name}
      updateName={setName}
      price={price}
      updatePrice={setPrice}
      save={save}
    >
      <slots.child.Component />
    </OutputsProvider>
  );
}
