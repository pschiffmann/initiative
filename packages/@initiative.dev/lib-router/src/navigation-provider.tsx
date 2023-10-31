import * as $String from "@pschiffmann/std/string";
import { History } from "history";
import {
  ReactNode,
  createContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { resolvePath } from "./resolve-path.js";

export const NavigationContext = createContext<Navigation>(null!);

export interface Navigation {
  /**
   * Starts and ends with `/`.
   */
  readonly base: string;

  /**
   * Never starts or ends with `/`.
   */
  readonly pathname: string;

  /**
   * `to` can be absolute or relative, and is resolved relative to `base`.
   */
  navigate(to: string, replace?: boolean): void;
}

export interface HistoryNavigationProviderProps {
  history: History;
  children: ReactNode;
}

export function HistoryNavigationProvider({
  history,
  children,
}: HistoryNavigationProviderProps) {
  const historyPathname = useHistoryPathname(history);
  const navigation = useMemo<Navigation>(() => {
    const base = "/";
    const pathname = historyPathname.substring(base.length);
    return {
      base,
      pathname,
      navigate(path, replace) {
        const to = resolvePath(base, path);
        replace ? history.replace(to) : history.push(to);
      },
    };
  }, [history, historyPathname]);

  return (
    <NavigationContext.Provider value={navigation}>
      {children}
    </NavigationContext.Provider>
  );
}

function useHistoryPathname(history: History) {
  const { subscribe, getSnapshot } = useMemo(
    () => ({
      subscribe(onStoreChange: () => void) {
        return history.listen(onStoreChange);
      },
      getSnapshot() {
        return history.location.pathname;
      },
    }),
    [history],
  );
  const raw = useSyncExternalStore(subscribe, getSnapshot);
  const sanitized = $String.trimEnd(raw, "/").replaceAll(/\/{2,}/g, "/");

  useEffect(() => {
    if (raw !== sanitized) history.replace(sanitized);
  }, [raw, sanitized]);

  return sanitized;
}
