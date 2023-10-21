import { ReactNode, createContext, useContext } from "react";

const LocaleContext = createContext<"en">("en");

export interface LocaleProviderProps {
  locale: "en";
  children: ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): "en" {
  return useContext(LocaleContext);
}