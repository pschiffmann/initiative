import { NodeComponentProps } from "@initiativejs/schema";
import { useState } from "react";
import { Article } from "../../libraries/article.schema.js";
import { EditArticleBlocSchema } from "./edit-article-bloc.schema.js";

export function EditArticleBloc({
  article,
  updateArticle,
  slots,
  OutputsProvider,
}: NodeComponentProps<EditArticleBlocSchema>) {
  const [name, setName] = useState(article.name);
  const [price, setPrice] = useState(formatPrice(article));

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

function formatPrice(article: Article) {
  const euros = Math.trunc(article.price / 100);
  const cents = Math.trunc(article.price % 100);
  return `${euros},${cents.toString().padEnd(2, "0")}€`;
}

function parseFormattedPrice(input: string) {
  const match = input.match(articlePriceFormat);
  if (!match) throw new Error(`Invalid price format.`);
  return Number.parseInt(match[1]) * 100 + Number.parseInt(match[2]);
}

const articlePriceFormat = /^(\d+),(\d{2})€$/;
