import { ExploreSceneImport } from "#initiative/nodes/index.js";
import {
  FluentBundle,
  FluentResource,
  type FluentVariable,
} from "@fluent/bundle";
import {
  Button,
  FlexContainer,
  Typography,
  type FlexContainerSchema,
} from "@initiative.dev/lib-mui-material/nodes";
import {
  NavLink,
  Navigate,
  Router,
  type RouterSchema,
} from "@initiative.dev/lib-router/nodes";
import {
  type OutputTypes,
  type OutputsProviderProps,
  type SlotComponentProps,
} from "@initiative.dev/schema/code-gen-helpers";
import { createContext, useEffect, useState, type ReactNode } from "react";
import { useLocale } from "../../locale-context.js";
import ftlUrlEn from "./locale/en.ftl";

export { Scene as RoutingTest, type SceneProps as RoutingTestProps };

interface SceneProps {}

function Scene({}: SceneProps) {
  return (
    <FluentBundleProvider>
      <Layout_Adapter />
    </FluentBundleProvider>
  );
}

function Layout_Adapter() {
  return (
    <FlexContainer
      flexDirection={"column"}
      alignSelf={[undefined, undefined, undefined]}
      margin={[undefined, undefined, undefined]}
      slots={{
        child: { size: 3, Component: Layout_child },
      }}
    />
  );
}

function Layout_child({
  index,
}: SlotComponentProps<FlexContainerSchema, "child">) {
  switch (index) {
    case 0:
      return <LoginLink_Adapter />;
    case 1:
      return <ExploreLink_Adapter />;
    case 2:
      return <Router_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function LoginLink_Adapter() {
  return <NavLink content={"Explore"} path={"explore"} />;
}

function ExploreLink_Adapter() {
  return <NavLink content={"Login"} path={"login"} />;
}

const Router$baseContext = createContext<OutputTypes<RouterSchema>["base"]>(
  null!,
);
const Router$paramsContext = createContext<OutputTypes<RouterSchema>["params"]>(
  null!,
);
const Router$navigateContext = createContext<
  OutputTypes<RouterSchema>["navigate"]
>(null!);
const Router$resolveContext = createContext<
  OutputTypes<RouterSchema>["resolve"]
>(null!);

function Router_Adapter() {
  return (
    <Router
      path={["login", "", "explore"]}
      OutputsProvider={Router_OutputsProvider}
      slots={{
        route: { size: 3, Component: Router_route },
      }}
    />
  );
}

function Router_route({ index }: SlotComponentProps<RouterSchema, "route">) {
  switch (index) {
    case 0:
      return <LoginContainer_Adapter />;
    case 1:
      return <DefaultRedirect_Adapter />;
    case 2:
      return <Explore_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function Router_OutputsProvider({
  base,
  params,
  navigate,
  resolve,
  children,
}: OutputsProviderProps<RouterSchema>) {
  return (
    <Router$baseContext.Provider value={base}>
      <Router$paramsContext.Provider value={params}>
        <Router$navigateContext.Provider value={navigate}>
          <Router$resolveContext.Provider value={resolve}>
            {children}
          </Router$resolveContext.Provider>
        </Router$navigateContext.Provider>
      </Router$paramsContext.Provider>
    </Router$baseContext.Provider>
  );
}

function LoginContainer_Adapter() {
  return (
    <FlexContainer
      flexDirection={"column"}
      gap={1}
      padding={"8px"}
      outlined={true}
      borderRadius={1}
      alignSelf={[undefined, undefined, undefined]}
      margin={[undefined, undefined, undefined]}
      slots={{
        child: { size: 3, Component: LoginContainer_child },
      }}
    />
  );
}

function LoginContainer_child({
  index,
}: SlotComponentProps<FlexContainerSchema, "child">) {
  switch (index) {
    case 0:
      return <Title_Adapter />;
    case 1:
      return <LoginButton_Adapter />;
    case 2:
      return <RegisterButton_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function DefaultRedirect_Adapter() {
  return <Navigate path={"/login"} />;
}

function Explore_Adapter() {
  return <ExploreSceneImport />;
}

function Title_Adapter() {
  return <Typography text={"Welcome to Mastodon!"} variant={"h3"} />;
}

function LoginButton_Adapter() {
  return <Button label={"Login"} variant={"outlined"} color={"primary"} />;
}

function RegisterButton_Adapter() {
  return <Button label={"Register"} variant={"contained"} color={"primary"} />;
}

//
// Fluent
//

const ftlCache = new Map<string, Promise<string>>();

const FluentBundleContext = createContext<FluentBundle | null>(null);

function FluentBundleProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [bundle, setBundle] = useState<FluentBundle | null>(null);

  useEffect(() => {
    let cancelled = false;

    let ftlPromise = ftlCache.get(locale);
    if (!ftlPromise) {
      switch (locale) {
        case "en":
          ftlPromise = fetch(ftlUrlEn).then((r) => r.text());
          break;
        default:
          throw new Error(`Unsupported locale: '${locale}'`);
      }
      ftlCache.set(locale, ftlPromise);
    }
    ftlPromise.then((source) => {
      if (cancelled) return;
      const bundle = new FluentBundle(locale);
      bundle.addResource(new FluentResource(source));
      setBundle(bundle);
    });

    return () => {
      cancelled = true;
      setBundle(null);
    };
  }, [locale]);

  return (
    <FluentBundleContext.Provider value={bundle}>
      {children}
    </FluentBundleContext.Provider>
  );
}

function translateMessage(
  bundle: FluentBundle | null,
  nodeId: string,
  expressionKey: string,
  args?: Record<string, FluentVariable>,
): string {
  const pattern = bundle?.getMessage(nodeId)?.attributes?.[expressionKey];
  return pattern
    ? bundle!.formatPattern(pattern, args, [])
    : `${nodeId}.${expressionKey}`;
}
