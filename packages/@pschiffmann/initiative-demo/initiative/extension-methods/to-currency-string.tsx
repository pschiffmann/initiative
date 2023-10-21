import { ExtensionMethodType } from "@initiative.dev/schema";
import { toCurrencyStringSchema } from "./to-currency-string.schema.js";

export const toCurrencyString: ExtensionMethodType<toCurrencyStringSchema> = (
  self,
) => {
  const euros = Math.trunc(self / 100);
  const cents = Math.trunc(self % 100);
  return `${euros},${cents.toString().padEnd(2, "0")}€`;
};
