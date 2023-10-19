import { ReactNode, createContext, useContext } from "react";

const LocaleContext = createContext<"en" | "de">("en");

export interface LocaleProviderProps {
  locale: "en" | "de";
  children: ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): "en" | "de" {
  return useContext(LocaleContext);
}