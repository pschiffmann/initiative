import { NodeComponentProps } from "@initiative.dev/schema";
import { useContext } from "react";
import { NavigationContext } from "../navigation-provider.js";
import { resolvePath } from "../resolve-path.js";
import { NavLinkSchema } from "./nav-link.schema.js";

export function NavLink({
  content,
  path,
  ...props
}: NodeComponentProps<NavLinkSchema>) {
  const { base, navigate } = useContext(NavigationContext);

  return (
    <a
      href={resolvePath(base, path)}
      onClick={(e) => {
        if (
          e.button !== 0 ||
          e.altKey ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey
        ) {
          return;
        }
        e.preventDefault();
        navigate(path);
      }}
      {...props}
    >
      {content}
    </a>
  );
}
