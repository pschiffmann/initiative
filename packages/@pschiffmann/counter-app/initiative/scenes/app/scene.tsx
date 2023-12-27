import {
  CounterBloc,
  type CounterBlocSchema,
} from "#initiative/nodes/index.js";
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
  type OutputTypes,
  type OutputsProviderProps,
  type SlotComponentProps,
} from "@initiative.dev/schema/code-gen-helpers";
import {
  createContext,
  memo,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "../../locale-context.js";
import ftlUrlEn from "./locale/en.ftl";

export { Scene as App, type SceneProps as AppProps };

interface SceneProps {}

function Scene({}: SceneProps) {
  return (
    <FluentBundleProvider>
      <CounterBloc_Adapter />
    </FluentBundleProvider>
  );
}

const IncreaseButton_Adapter = memo(function IncreaseButton_Adapter() {
  return (
    <Button
      label={"Increase"}
      variant={"contained"}
      color={"primary"}
      startIcon={"add"}
      onPress={useContext(CounterBloc$increaseCounterContext)}
    />
  );
});

const CounterValue_Adapter = memo(function CounterValue_Adapter() {
  return (
    <Typography
      text={translateMessage(
        useContext(FluentBundleContext),
        "CounterValue",
        "text",
        {
          counter: useContext(CounterBloc$counterValueContext),
        },
      )}
    />
  );
});

const Title_Adapter = memo(function Title_Adapter() {
  return <Typography text={"Counter App Demo"} variant={"h4"} />;
});

const Layout_Adapter = memo(function Layout_Adapter() {
  return (
    <FlexContainer
      gap={1}
      padding={"16px"}
      alignSelf={[undefined, undefined, undefined]}
      margin={[undefined, undefined, undefined]}
      slots={Layout$slots}
    />
  );
});

const Layout$slots = {
  child: { size: 3, Component: Layout_child },
};

function Layout_child({
  index,
}: SlotComponentProps<FlexContainerSchema, "child">) {
  switch (index) {
    case 0:
      return <Title_Adapter />;
    case 1:
      return <CounterValue_Adapter />;
    case 2:
      return <IncreaseButton_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

const CounterBloc$increaseCounterContext = createContext<
  OutputTypes<CounterBlocSchema>["increaseCounter"]
>(null!);
const CounterBloc$decreaseCounterContext = createContext<
  OutputTypes<CounterBlocSchema>["decreaseCounter"]
>(null!);
const CounterBloc$resetCounterContext = createContext<
  OutputTypes<CounterBlocSchema>["resetCounter"]
>(null!);
const CounterBloc$counterValueContext = createContext<
  OutputTypes<CounterBlocSchema>["counterValue"]
>(null!);

const CounterBloc_Adapter = memo(function CounterBloc_Adapter() {
  return (
    <CounterBloc
      OutputsProvider={CounterBloc_OutputsProvider}
      slots={CounterBloc$slots}
    />
  );
});

const CounterBloc$slots = {
  child: { Component: Layout_Adapter },
};

function CounterBloc_OutputsProvider({
  increaseCounter,
  decreaseCounter,
  resetCounter,
  counterValue,
  children,
}: OutputsProviderProps<CounterBlocSchema>) {
  return (
    <CounterBloc$increaseCounterContext.Provider value={increaseCounter}>
      <CounterBloc$decreaseCounterContext.Provider value={decreaseCounter}>
        <CounterBloc$resetCounterContext.Provider value={resetCounter}>
          <CounterBloc$counterValueContext.Provider value={counterValue}>
            {children}
          </CounterBloc$counterValueContext.Provider>
        </CounterBloc$resetCounterContext.Provider>
      </CounterBloc$decreaseCounterContext.Provider>
    </CounterBloc$increaseCounterContext.Provider>
  );
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
