import { createElement } from "react";
import { TypographyProps } from "./typography.schema.js";

export function Typography({ text, variant = "p" }: TypographyProps) {
  return createElement(variant, { children: text });
}
