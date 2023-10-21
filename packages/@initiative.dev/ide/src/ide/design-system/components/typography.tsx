import { ReactNode, createElement } from "react";
import { bemClasses } from "../index.js";

const cls = bemClasses("initiative-typography");

export interface TypographyProps {
  component?: "div" | "span" | "code";

  variant:
    | "headline-large"
    | "headline-medium"
    | "headline-small"
    | "title-large"
    | "title-medium"
    | "title-small"
    | "label-large"
    | "label-medium"
    | "label-small"
    | "body-large"
    | "body-medium"
    | "body-small"
    | "code-large"
    | "code-medium"
    | "code-small";

  noWrap?: boolean;

  className?: string;

  children: ReactNode;
}

export function Typography({
  variant,
  noWrap,
  component = "div",
  className,
  children,
}: TypographyProps) {
  return createElement(component, {
    className: cls.block(className, variant, noWrap && "no-wrap"),
    variant,
    children,
  });
}
