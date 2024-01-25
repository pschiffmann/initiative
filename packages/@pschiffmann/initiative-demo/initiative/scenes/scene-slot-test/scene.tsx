import {
  MuiDialog,
  MuiTypography,
  type MuiDialogSchema,
} from "#initiative/nodes/index.js";
import {
  FluentBundle,
  FluentResource,
  type FluentVariable,
} from "@fluent/bundle";
import { type StyleProps } from "@initiative.dev/schema";
import {
  type OutputTypes,
  type OutputsProviderProps,
} from "@initiative.dev/schema/code-gen-helpers";
import {
  createContext,
  memo,
  useContext,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { useLocale } from "../../locale-context.js";
import ftlUrlDe from "./locale/de.ftl";
import ftlUrlEn from "./locale/en.ftl";

export { Scene as SceneSlotTest, type SceneProps as SceneSlotTestProps };

interface SceneProps extends StyleProps {
  slots: {
    readonly Trigger: ComponentType<TriggerSlotProps>;
  };
}

function Scene({
  className,
  style,

  slots,
}: SceneProps) {
  return (
    <FluentBundleProvider>
      <Scene$TriggerContext.Provider value={slots.Trigger}>
        <Root_Adapter className={className} style={style} />
      </Scene$TriggerContext.Provider>
    </FluentBundleProvider>
  );
}

const DialogContent_Adapter = memo(function DialogContent_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <MuiTypography className={className} style={style} text={"Hello world!"} />
  );
});

export interface TriggerSlotProps extends StyleProps {
  openDialog: () => void;
}

const Scene$TriggerContext = createContext<ComponentType<TriggerSlotProps>>(
  null!,
);

const Trigger_Adapter = memo(function Trigger_Adapter({
  className,
  style,
}: StyleProps) {
  const Component = useContext(Scene$TriggerContext);
  return (
    <Component
      className={className}
      style={style}
      openDialog={useContext(Root$openContext)}
    />
  );
});

const Root$isOpenContext = createContext<
  OutputTypes<MuiDialogSchema>["isOpen"]
>(null!);
const Root$openContext = createContext<OutputTypes<MuiDialogSchema>["open"]>(
  null!,
);
const Root$closeContext = createContext<OutputTypes<MuiDialogSchema>["close"]>(
  null!,
);
const Root$toggleContext = createContext<
  OutputTypes<MuiDialogSchema>["toggle"]
>(null!);

const Root_Adapter = memo(function Root_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <MuiDialog
      className={className}
      style={style}
      title={"scene-slot-test Dialog"}
      OutputsProvider={Root_OutputsProvider}
      slots={Root$slots}
    />
  );
});

const Root$slots = {
  trigger: { Component: Trigger_Adapter },
  content: { Component: DialogContent_Adapter },
};

function Root_OutputsProvider({
  isOpen,
  open,
  close,
  toggle,
  children,
}: OutputsProviderProps<MuiDialogSchema>) {
  return (
    <Root$isOpenContext.Provider value={isOpen}>
      <Root$openContext.Provider value={open}>
        <Root$closeContext.Provider value={close}>
          <Root$toggleContext.Provider value={toggle}>
            {children}
          </Root$toggleContext.Provider>
        </Root$closeContext.Provider>
      </Root$openContext.Provider>
    </Root$isOpenContext.Provider>
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
        case "de":
          ftlPromise = fetch(ftlUrlDe).then((r) => r.text());
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
