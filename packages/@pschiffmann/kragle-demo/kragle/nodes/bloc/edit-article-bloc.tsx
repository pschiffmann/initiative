import { useState } from "react";
import {
  Article$getFormattedPrice,
  Article$parseFormattedPrice,
} from "../../libraries/article.js";
import { EditArticleBlocProps } from "./edit-article-bloc.schema.js";

export function EditArticleBloc({
  article,
  updateArticle,
  slots,
  OutputsProvider,
}: EditArticleBlocProps) {
  const [name, setName] = useState(article.name);
  const [price, setPrice] = useState(Article$getFormattedPrice(article));

  function save() {
    if (!name) {
      alert("Name can't be empty.");
      return;
    }
    let parsedPrice: number;
    try {
      parsedPrice = Article$parseFormattedPrice(price);
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
      {slots.child.element()}
    </OutputsProvider>
  );
}
