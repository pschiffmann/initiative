import { NodeComponentProps } from "@initiative.dev/schema";
import { Router as RouteMatcher } from "@pschiffmann/std/router";
import { useCallback, useContext, useMemo } from "react";
import { NavigationContext } from "../navigation-provider.js";
import { resolvePath } from "../resolve-path.js";
import { RouterSchema } from "./router.schema.js";

export function Router({
  path,
  slots,
  OutputsProvider,
  ...props
}: NodeComponentProps<RouterSchema>) {
  const { base, pathname, navigate } = useContext(NavigationContext);
  const resolve = useCallback((to: string) => resolvePath(base, to), [base]);

  const matcher = useMemo(() => new RouteMatcher(path), path);
  const match = matcher.match(pathname);
  const routeIndex = path.indexOf(match?.route!);

  if (!match) return null;
  return (
    <OutputsProvider
      base={base}
      params={Object.values(match.params)}
      navigate={navigate}
      resolve={resolve}
    >
      <slots.route.Component index={routeIndex} {...props} />
    </OutputsProvider>
  );
}
