import {
  StatusCard,
  StatusContainer,
  TimelinePublicBloc,
  type TimelinePublicBlocSchema,
} from "#initiative/nodes/index.js";
import {
  FluentBundle,
  FluentResource,
  type FluentVariable,
} from "@fluent/bundle";
import {
  FlexContainer,
  Icon,
  Tabs,
  Typography,
  type FlexContainerSchema,
  type TabsSchema,
} from "@initiative.dev/lib-mui-material/nodes";
import { type StyleProps } from "@initiative.dev/schema";
import {
  type OutputTypes,
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

export {
  Scene as TestTimelinePublic,
  type SceneProps as TestTimelinePublicProps,
};

interface SceneProps extends StyleProps {}

function Scene({ className, style }: SceneProps) {
  return (
    <FluentBundleProvider>
      <StatusContainer_Adapter className={className} style={style} />
    </FluentBundleProvider>
  );
}

const Status_Adapter = memo(function Status_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <StatusCard
      className={className}
      style={style}
      status={useContext(TimelinePublicBloc$statusContext)}
    />
  );
});

const NewsPlaceholder_Adapter = memo(function NewsPlaceholder_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Typography className={className} style={style} text={"Placeholder"} />
  );
});

const PeoplePlaceholder_Adapter = memo(function PeoplePlaceholder_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Typography className={className} style={style} text={"Placeholder"} />
  );
});

const HashtagsPlaceholder_Adapter = memo(function HashtagsPlaceholder_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Typography className={className} style={style} text={"Placeholder"} />
  );
});

const TimelinePublicBloc$statusContext = createContext<
  OutputTypes<TimelinePublicBlocSchema>["status"]
>(null!);

const TimelinePublicBloc_Adapter = memo(function TimelinePublicBloc_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <TimelinePublicBloc
      className={className}
      style={style}
      slots={TimelinePublicBloc$slots}
    />
  );
});

const TimelinePublicBloc$slots = {
  child: { Component: TimelinePublicBloc_child },
};

function TimelinePublicBloc_child({
  className,
  style,
  status,
}: SlotComponentProps<TimelinePublicBlocSchema, "child">) {
  return (
    <TimelinePublicBloc$statusContext.Provider value={status}>
      <Status_Adapter className={className} style={style} />
    </TimelinePublicBloc$statusContext.Provider>
  );
}

const HeaderTitle_Adapter = memo(function HeaderTitle_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Typography
      className={className}
      style={style}
      text={"Explore"}
      variant={"h6"}
    />
  );
});

const HeaderIcon_Adapter = memo(function HeaderIcon_Adapter({
  className,
  style,
}: StyleProps) {
  return <Icon className={className} style={style} icon={"tag"} />;
});

const Tabs_Adapter = memo(function Tabs_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Tabs
      className={className}
      style={style}
      variant={"fullWidth"}
      label={["Posts", "Hashtags", "People", "News"]}
      icon={[undefined, undefined, undefined, undefined]}
      disabled={[undefined, true, true, true]}
      slots={Tabs$slots}
    />
  );
});

const Tabs$slots = {
  tab: { size: 4, Component: Tabs_tab },
};

function Tabs_tab({
  className,
  style,
  index,
}: SlotComponentProps<TabsSchema, "tab">) {
  switch (index) {
    case 0:
      return <TimelinePublicBloc_Adapter className={className} style={style} />;
    case 1:
      return (
        <HashtagsPlaceholder_Adapter className={className} style={style} />
      );
    case 2:
      return <PeoplePlaceholder_Adapter className={className} style={style} />;
    case 3:
      return <NewsPlaceholder_Adapter className={className} style={style} />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

const Header_Adapter = memo(function Header_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <FlexContainer
      className={className}
      style={style}
      flexDirection={"row"}
      alignItems={"center"}
      gap={0.5}
      padding={"8px"}
      alignSelf={[undefined, undefined]}
      margin={[undefined, undefined]}
      slots={Header$slots}
    />
  );
});

const Header$slots = {
  child: { size: 2, Component: Header_child },
};

function Header_child({
  className,
  style,
  index,
}: SlotComponentProps<FlexContainerSchema, "child">) {
  switch (index) {
    case 0:
      return <HeaderIcon_Adapter className={className} style={style} />;
    case 1:
      return <HeaderTitle_Adapter className={className} style={style} />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

const StatusContainer_Adapter = memo(function StatusContainer_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <StatusContainer
      className={className}
      style={style}
      slots={StatusContainer$slots}
    />
  );
});

const StatusContainer$slots = {
  header: { Component: Header_Adapter },
  child: { Component: Tabs_Adapter },
};

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
