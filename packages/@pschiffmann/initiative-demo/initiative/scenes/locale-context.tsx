import { ReactNode, createContext, useContext } from "react";

const LocaleContext = createContext<"de" | "en">("en");

export interface LocaleProviderProps {
  locale: "de" | "en";
  children: ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): "de" | "en" {
  return useContext(LocaleContext);
}
