import {
  InventoryList,
  ReadonlyTextArea,
  SimulationBloc,
  type SimulationBlocSchema,
} from "#initiative/nodes/index.js";
import {
  FluentBundle,
  FluentResource,
  type FluentVariable,
} from "@fluent/bundle";
import {
  Avatar,
  GridContainer,
  Typography,
  type GridContainerSchema,
} from "@initiative.dev/lib-mui-material/nodes";
import {
  type OutputTypes,
  type OutputsProviderProps,
  type SlotComponentProps,
} from "@initiative.dev/schema/code-gen-helpers";
import {
  createContext,
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
      <SimulationBloc_Adapter />
    </FluentBundleProvider>
  );
}

const SimulationBloc$heroesContext = createContext<
  OutputTypes<SimulationBlocSchema>["heroes"]
>(null!);

function SimulationBloc_Adapter() {
  return (
    <SimulationBloc
      OutputsProvider={SimulationBloc_OutputsProvider}
      slots={{
        child: { Component: Layout_Adapter },
      }}
    />
  );
}

function SimulationBloc_OutputsProvider({
  heroes,
  children,
}: OutputsProviderProps<SimulationBlocSchema>) {
  return (
    <SimulationBloc$heroesContext.Provider value={heroes}>
      {children}
    </SimulationBloc$heroesContext.Provider>
  );
}

function Layout_Adapter() {
  return (
    <GridContainer
      gridTemplate={
        '"profile-card inventory" 120px\n"inventory-gold inventory" 40px\n"inventory-free-slots inventory" 40px\n"event-log event-log" calc(100vh - 240px)\n/ 40% 1fr'
      }
      gap={2}
      gridArea={[
        "profile-card",
        "event-log",
        "inventory",
        "inventory-gold",
        "inventory-free-slots",
      ]}
      justifySelf={[undefined, undefined, undefined, undefined, undefined]}
      alignSelf={[undefined, undefined, undefined, undefined, undefined]}
      margin={[undefined, undefined, undefined, undefined, undefined]}
      slots={{
        child: { size: 5, Component: Layout_child },
      }}
    />
  );
}

function Layout_child({
  index,
}: SlotComponentProps<GridContainerSchema, "child">) {
  switch (index) {
    case 0:
      return <HeroProfileCard_Adapter />;
    case 1:
      return <EventLog_Adapter />;
    case 2:
      return <Inventory_Adapter />;
    case 3:
      return <InventoryGold_Adapter />;
    case 4:
      return <InventoryFreeSlots_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function HeroProfileCard_Adapter() {
  return (
    <GridContainer
      gridTemplate={'"avatar name" 1fr\n"avatar location" 1fr\n/ auto 1fr'}
      alignItems={"center"}
      outlined={true}
      borderRadius={2}
      gridArea={["avatar", "name", "location"]}
      justifySelf={[undefined, undefined, undefined]}
      alignSelf={[undefined, undefined, undefined]}
      margin={["0 8px", "0 8px 0 0", undefined]}
      slots={{
        child: { size: 3, Component: HeroProfileCard_child },
      }}
    />
  );
}

function HeroProfileCard_child({
  index,
}: SlotComponentProps<GridContainerSchema, "child">) {
  switch (index) {
    case 0:
      return <Avatar_Adapter />;
    case 1:
      return <HeroName_Adapter />;
    case 2:
      return <HeroLocation_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function EventLog_Adapter() {
  return (
    <ReadonlyTextArea
      label={"Event Log"}
      value={useContext(SimulationBloc$heroesContext)
        .at(0)
        .adventureState.eventLog.join(
          translateMessage(
            useContext(FluentBundleContext),
            "EventLog",
            "value-p2",
            {},
          ),
        )}
    />
  );
}

function Inventory_Adapter() {
  return (
    <InventoryList
      items={useContext(SimulationBloc$heroesContext).at(0).inventory.stacks}
    />
  );
}

function InventoryGold_Adapter() {
  return (
    <Typography
      text={translateMessage(
        useContext(FluentBundleContext),
        "InventoryGold",
        "text",
        {
          gold: useContext(SimulationBloc$heroesContext).at(0).inventory.gold,
        },
      )}
    />
  );
}

function InventoryFreeSlots_Adapter() {
  return (
    <Typography
      text={translateMessage(
        useContext(FluentBundleContext),
        "InventoryFreeSlots",
        "text",
        {
          total: useContext(SimulationBloc$heroesContext).at(0).inventory.slots,
          used: useContext(SimulationBloc$heroesContext).at(0).inventory.stacks
            .length,
        },
      )}
    />
  );
}

function Avatar_Adapter() {
  return (
    <Avatar
      src={"placeholder"}
      alt={useContext(SimulationBloc$heroesContext).at(0).name}
    />
  );
}

function HeroName_Adapter() {
  return (
    <Typography
      text={useContext(SimulationBloc$heroesContext).at(0).name}
      variant={"body1"}
    />
  );
}

function HeroLocation_Adapter() {
  return (
    <Typography
      text={"in town"}
      variant={"subtitle2"}
      color={"text.secondary"}
    />
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
