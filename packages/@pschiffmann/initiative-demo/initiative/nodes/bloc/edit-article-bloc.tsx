import { NodeComponentProps } from "@initiative.dev/schema";
import { useState } from "react";
import { toCurrencyString } from "../../extension-methods/to-currency-string.js";
import { EditArticleBlocSchema } from "./edit-article-bloc.schema.js";

export function EditArticleBloc({
  article,
  updateArticle,
  slots,
  OutputsProvider,
}: NodeComponentProps<EditArticleBlocSchema>) {
  const [name, setName] = useState(article.name);
  const [price, setPrice] = useState(toCurrencyString(article.price));

  function save() {
    if (!name) {
      alert("Name can't be empty.");
      return;
    }
    let parsedPrice: number;
    try {
      parsedPrice = parseFormattedPrice(price);
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

function parseFormattedPrice(input: string) {
  const match = input.match(articlePriceFormat);
  if (!match) throw new Error(`Invalid price format.`);
  return Number.parseInt(match[1]) * 100 + Number.parseInt(match[2]);
}

const articlePriceFormat = /^(\d+),(\d{2})€$/;
