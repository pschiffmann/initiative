import { useState } from "react";
import {
  Article,
  formatArticlePrice,
  parseArticlePrice,
} from "./article-repository.js";
import { EditArticleBlocProps } from "./edit-article-bloc.schema.js";

export function EditArticleBloc({
  article,
  updateArticle,
  slots,
  OutputsProvider,
}: EditArticleBlocProps) {
  const [name, setName] = useState((article as Article).name);
  const [price, setPrice] = useState(formatArticlePrice(article as Article));

  function save() {
    if (!name) {
      alert("Name can't be empty.");
      return;
    }
    let parsedPrice: number;
    try {
      parsedPrice = parseArticlePrice(price);
    } catch (e) {
      alert(e);
      return;
    }
    updateArticle({ ...article, name, parsedPrice });
    alert("Saved!");
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
