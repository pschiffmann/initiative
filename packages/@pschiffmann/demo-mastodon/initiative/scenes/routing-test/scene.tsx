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
import { type StyleProps } from "@initiative.dev/schema";
import {
  type OutputTypes,
  type OutputsProviderProps,
  type SlotComponentProps,
} from "@initiative.dev/schema/code-gen-helpers";
import {
  createContext,
  memo,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "../../locale-context.js";
import ftlUrlEn from "./locale/en.ftl";

export { Scene as RoutingTest, type SceneProps as RoutingTestProps };

interface SceneProps extends StyleProps {}

function Scene({ className, style }: SceneProps) {
  return (
    <FluentBundleProvider>
      <Layout_Adapter className={className} style={style} />
    </FluentBundleProvider>
  );
}

const RegisterButton_Adapter = memo(function RegisterButton_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Button
      className={className}
      style={style}
      label={"Register"}
      variant={"contained"}
      color={"primary"}
    />
  );
});

const LoginButton_Adapter = memo(function LoginButton_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Button
      className={className}
      style={style}
      label={"Login"}
      variant={"outlined"}
      color={"primary"}
    />
  );
});

const Title_Adapter = memo(function Title_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Typography
      className={className}
      style={style}
      text={"Welcome to Mastodon!"}
      variant={"h3"}
    />
  );
});

const Explore_Adapter = memo(function Explore_Adapter({
  className,
  style,
}: StyleProps) {
  return <ExploreSceneImport className={className} style={style} />;
});

const DefaultRedirect_Adapter = memo(function DefaultRedirect_Adapter({
  className,
  style,
}: StyleProps) {
  return <Navigate className={className} style={style} path={"/login"} />;
});

const LoginContainer_Adapter = memo(function LoginContainer_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <FlexContainer
      className={className}
      style={style}
      flexDirection={"column"}
      gap={1}
      padding={"8px"}
      outlined={true}
      borderRadius={1}
      alignSelf={[undefined, undefined, undefined]}
      margin={[undefined, undefined, undefined]}
      slots={LoginContainer$slots}
    />
  );
});

const LoginContainer$slots = {
  child: { size: 3, Component: LoginContainer_child },
};

function LoginContainer_child({
  className,
  style,
  index,
}: SlotComponentProps<FlexContainerSchema, "child">) {
  switch (index) {
    case 0:
      return <Title_Adapter className={className} style={style} />;
    case 1:
      return <LoginButton_Adapter className={className} style={style} />;
    case 2:
      return <RegisterButton_Adapter className={className} style={style} />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
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

const Router_Adapter = memo(function Router_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Router
      className={className}
      style={style}
      path={["login", "", "explore"]}
      OutputsProvider={Router_OutputsProvider}
      slots={Router$slots}
    />
  );
});

const Router$slots = {
  route: { size: 3, Component: Router_route },
};

function Router_route({
  className,
  style,
  index,
}: SlotComponentProps<RouterSchema, "route">) {
  switch (index) {
    case 0:
      return <LoginContainer_Adapter className={className} style={style} />;
    case 1:
      return <DefaultRedirect_Adapter className={className} style={style} />;
    case 2:
      return <Explore_Adapter className={className} style={style} />;
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

const LoginLink_Adapter = memo(function LoginLink_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <NavLink
      className={className}
      style={style}
      content={"Login"}
      path={"login"}
    />
  );
});

const ExploreLink_Adapter = memo(function ExploreLink_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <NavLink
      className={className}
      style={style}
      content={"Explore"}
      path={"explore"}
    />
  );
});

const Layout_Adapter = memo(function Layout_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <FlexContainer
      className={className}
      style={style}
      flexDirection={"column"}
      alignSelf={[undefined, undefined, "start"]}
      margin={[undefined, undefined, "8px auto"]}
      slots={Layout$slots}
    />
  );
});

const Layout$slots = {
  child: { size: 3, Component: Layout_child },
};

function Layout_child({
  className,
  style,
  index,
}: SlotComponentProps<FlexContainerSchema, "child">) {
  switch (index) {
    case 0:
      return <ExploreLink_Adapter className={className} style={style} />;
    case 1:
      return <LoginLink_Adapter className={className} style={style} />;
    case 2:
      return <Router_Adapter className={className} style={style} />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
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
