import {
  StatusContainer,
  StatusContent,
  TimelinePublicBloc,
  type TimelinePublicBlocSchema,
} from "#initiative/nodes/index.js";
import {
  FluentBundle,
  FluentResource,
  type FluentVariable,
} from "@fluent/bundle";
import {
  Avatar,
  FlexContainer,
  GridContainer,
  Icon,
  IconButton,
  Tabs,
  Typography,
  type FlexContainerSchema,
  type GridContainerSchema,
  type TabsSchema,
} from "@initiative.dev/lib-mui-material/nodes";
import {
  type OutputTypes,
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

export {
  Scene as TestTimelinePublic,
  type SceneProps as TestTimelinePublicProps,
};

interface SceneProps {}

function Scene({}: SceneProps) {
  return (
    <FluentBundleProvider>
      <StatusContainer_Adapter />
    </FluentBundleProvider>
  );
}

function StatusContainer_Adapter() {
  return (
    <StatusContainer
      slots={{
        header: { Component: Header_Adapter },
        child: { Component: Tabs_Adapter },
      }}
    />
  );
}

function Header_Adapter() {
  return (
    <FlexContainer
      flexDirection={"row"}
      alignItems={"center"}
      gap={0.5}
      padding={"8px"}
      alignSelf={[undefined, undefined]}
      margin={[undefined, undefined]}
      slots={{
        child: { size: 2, Component: Header_child },
      }}
    />
  );
}

function Header_child({
  index,
}: SlotComponentProps<FlexContainerSchema, "child">) {
  switch (index) {
    case 0:
      return <HeaderIcon_Adapter />;
    case 1:
      return <HeaderTitle_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function Tabs_Adapter() {
  return (
    <Tabs
      variant={"fullWidth"}
      label={["Posts", "Hashtags", "People", "News"]}
      icon={[undefined, undefined, undefined, undefined]}
      disabled={[undefined, true, true, true]}
      slots={{
        tab: { size: 4, Component: Tabs_tab },
      }}
    />
  );
}

function Tabs_tab({ index }: SlotComponentProps<TabsSchema, "tab">) {
  switch (index) {
    case 0:
      return <TimelinePublicBloc_Adapter />;
    case 1:
      return <HashtagsPlaceholder_Adapter />;
    case 2:
      return <PeoplePlaceholder_Adapter />;
    case 3:
      return <NewsPlaceholder_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function HeaderIcon_Adapter() {
  return <Icon icon={"tag"} />;
}

function HeaderTitle_Adapter() {
  return <Typography text={"Explore"} variant={"h6"} />;
}

const TimelinePublicBloc$statusContext = createContext<
  OutputTypes<TimelinePublicBlocSchema>["status"]
>(null!);

function TimelinePublicBloc_Adapter() {
  return (
    <TimelinePublicBloc
      slots={{
        child: { Component: TimelinePublicBloc_child },
      }}
    />
  );
}

function TimelinePublicBloc_child({
  status,
}: SlotComponentProps<TimelinePublicBlocSchema, "child">) {
  return (
    <TimelinePublicBloc$statusContext.Provider value={status}>
      <Status_Adapter />
    </TimelinePublicBloc$statusContext.Provider>
  );
}

function HashtagsPlaceholder_Adapter() {
  return <Typography text={"Placeholder"} />;
}

function PeoplePlaceholder_Adapter() {
  return <Typography text={"Placeholder"} />;
}

function NewsPlaceholder_Adapter() {
  return <Typography text={"Placeholder"} />;
}

function Status_Adapter() {
  return (
    <GridContainer
      gridTemplate={
        '"avatar name time" auto\n"avatar handle ." auto\n"text text text" auto\n"actions actions actions" auto\n/ auto 1fr auto'
      }
      gap={0}
      padding={"8px"}
      outlined={true}
      gridArea={["avatar", "name", "handle", "time", "actions", "text"]}
      justifySelf={[
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ]}
      alignSelf={[
        "center",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ]}
      margin={[
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ]}
      slots={{
        child: { size: 6, Component: Status_child },
      }}
    />
  );
}

function Status_child({
  index,
}: SlotComponentProps<GridContainerSchema, "child">) {
  switch (index) {
    case 0:
      return <Avatar_Adapter />;
    case 1:
      return <Name_Adapter />;
    case 2:
      return <Handle_Adapter />;
    case 3:
      return <Time_Adapter />;
    case 4:
      return <Actions_Adapter />;
    case 5:
      return <Content_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function Avatar_Adapter() {
  return (
    <Avatar
      src={useContext(TimelinePublicBloc$statusContext).account.avatar}
      alt={useContext(TimelinePublicBloc$statusContext).account.username}
      variant={"rounded"}
    />
  );
}

function Name_Adapter() {
  return (
    <Typography
      text={useContext(TimelinePublicBloc$statusContext).account.display_name}
      variant={"subtitle1"}
    />
  );
}

function Handle_Adapter() {
  return (
    <Typography
      text={translateMessage(
        useContext(FluentBundleContext),
        "Handle",
        "text",
        {
          username: useContext(TimelinePublicBloc$statusContext).account
            .username,
        },
      )}
      variant={"body2"}
      color={"text.secondary"}
    />
  );
}

function Time_Adapter() {
  return (
    <Typography
      text={useContext(TimelinePublicBloc$statusContext).created_at}
    />
  );
}

function Actions_Adapter() {
  return (
    <FlexContainer
      flexDirection={"row"}
      justifyContent={"space-between"}
      alignSelf={[undefined, undefined, undefined, undefined, undefined]}
      margin={[undefined, undefined, undefined, undefined, undefined]}
      slots={{
        child: { size: 5, Component: Actions_child },
      }}
    />
  );
}

function Actions_child({
  index,
}: SlotComponentProps<FlexContainerSchema, "child">) {
  switch (index) {
    case 0:
      return <ReplyButton_Adapter />;
    case 1:
      return <BoostButton_Adapter />;
    case 2:
      return <FavoriteButton_Adapter />;
    case 3:
      return <BookmarkButton_Adapter />;
    case 4:
      return <MoreButton_Adapter />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

function Content_Adapter() {
  return (
    <StatusContent
      content={useContext(TimelinePublicBloc$statusContext).content}
    />
  );
}

function ReplyButton_Adapter() {
  return <IconButton label={"Reply"} icon={"reply"} size={"small"} />;
}

function BoostButton_Adapter() {
  return <IconButton label={"Boost"} icon={"repeat"} size={"small"} />;
}

function FavoriteButton_Adapter() {
  return <IconButton label={"Favorite"} icon={"star"} size={"small"} />;
}

function BookmarkButton_Adapter() {
  return <IconButton label={"Bookmark"} icon={"bookmark"} size={"small"} />;
}

function MoreButton_Adapter() {
  return <IconButton label={"More"} icon={"more_horiz"} size={"small"} />;
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
