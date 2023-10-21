import { Definitions } from "@initiative.dev/schema";
import { createContext } from "react";

export const DefinitionsContext = createContext<Definitions>(null!);
export const LocaleContext = createContext<{
  value: string;
  onChange(value: string): void;
}>(null!);
