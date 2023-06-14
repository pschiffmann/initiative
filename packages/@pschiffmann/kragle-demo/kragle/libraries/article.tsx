import { type ArticleLibraryMembers } from "./article.schema.js";

export const ArticleLibrary$getId: ArticleLibraryMembers["getId"] = (article) =>
  `${article.id}`;

export const ArticleLibrary$getName: ArticleLibraryMembers["getName"] = (
  article
) => article.name;

export const ArticleLibrary$getFormattedPrice: ArticleLibraryMembers["getFormattedPrice"] =
  (article) => {
    const euros = Math.trunc(article.price / 100);
    const cents = Math.trunc(article.price % 100);
    return `${euros},${cents.toString().padEnd(2, "0")}€`;
  };

export const ArticleLibrary$parseFormattedPrice: ArticleLibraryMembers["parseFormattedPrice"] =
  (input) => {
    const match = input.match(articlePriceFormat);
    if (!match) throw new Error(`Invalid price format.`);
    return Number.parseInt(match[1]) * 100 + Number.parseInt(match[2]);
  };

const articlePriceFormat = /^(\d+),(\d{2})€$/;
