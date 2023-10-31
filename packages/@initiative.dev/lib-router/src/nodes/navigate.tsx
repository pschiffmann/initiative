import { NodeComponentProps } from "@initiative.dev/schema";
import { useContext, useEffect } from "react";
import { NavigationContext } from "../navigation-provider.js";
import { NavigateSchema } from "./navigate.schema.js";

export function Navigate({ path }: NodeComponentProps<NavigateSchema>) {
  const { navigate } = useContext(NavigationContext);

  useEffect(() => {
    navigate(path);
  }, [navigate, path]);

  return null;
}
