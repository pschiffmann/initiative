import { StatusContent } from "#initiative/nodes/index.js";
import { type Status } from "#initiative/types/index.js";
import {
  FluentBundle,
  FluentResource,
  type FluentVariable,
} from "@fluent/bundle";
import {
  Avatar,
  Divider,
  FlexContainer,
  GridContainer,
  IconButton,
  Typography,
  type FlexContainerSchema,
  type GridContainerSchema,
} from "@initiative.dev/lib-mui-material/nodes";
import { type StyleProps } from "@initiative.dev/schema";
import { type SlotComponentProps } from "@initiative.dev/schema/code-gen-helpers";
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

export { Scene as StatusCard, type SceneProps as StatusCardProps };

const Scene$statusContext = createContext<Status>(null!);

interface SceneProps extends StyleProps {
  /**
   *
   */
  status: Status;
}

function Scene({ className, style, status }: SceneProps) {
  return (
    <FluentBundleProvider>
      <Scene$statusContext.Provider value={status}>
        <Status_Adapter className={className} style={style} />
      </Scene$statusContext.Provider>
    </FluentBundleProvider>
  );
}

const MoreButton_Adapter = memo(function MoreButton_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <IconButton
      className={className}
      style={style}
      label={"More"}
      icon={"more_horiz"}
      size={"small"}
    />
  );
});

const BookmarkButton_Adapter = memo(function BookmarkButton_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <IconButton
      className={className}
      style={style}
      label={"Bookmark"}
      icon={"bookmark"}
      size={"small"}
    />
  );
});

const FavoriteButton_Adapter = memo(function FavoriteButton_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <IconButton
      className={className}
      style={style}
      label={"Favorite"}
      icon={"star"}
      size={"small"}
    />
  );
});

const BoostButton_Adapter = memo(function BoostButton_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <IconButton
      className={className}
      style={style}
      label={"Boost"}
      icon={"repeat"}
      size={"small"}
    />
  );
});

const ReplyButton_Adapter = memo(function ReplyButton_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <IconButton
      className={className}
      style={style}
      label={"Reply"}
      icon={"reply"}
      size={"small"}
    />
  );
});

const Divider_Adapter = memo(function Divider_Adapter({
  className,
  style,
}: StyleProps) {
  return <Divider className={className} style={style} />;
});

const Content_Adapter = memo(function Content_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <StatusContent
      className={className}
      style={style}
      content={useContext(Scene$statusContext).content}
    />
  );
});

const Actions_Adapter = memo(function Actions_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <FlexContainer
      className={className}
      style={style}
      flexDirection={"row"}
      justifyContent={"space-between"}
      alignSelf={[undefined, undefined, undefined, undefined, undefined]}
      margin={[undefined, undefined, undefined, undefined, undefined]}
      slots={Actions$slots}
    />
  );
});

const Actions$slots = {
  child: { size: 5, Component: Actions_child },
};

function Actions_child({
  className,
  style,
  index,
}: SlotComponentProps<FlexContainerSchema, "child">) {
  switch (index) {
    case 0:
      return <ReplyButton_Adapter className={className} style={style} />;
    case 1:
      return <BoostButton_Adapter className={className} style={style} />;
    case 2:
      return <FavoriteButton_Adapter className={className} style={style} />;
    case 3:
      return <BookmarkButton_Adapter className={className} style={style} />;
    case 4:
      return <MoreButton_Adapter className={className} style={style} />;
    default:
      throw new Error(`Invalid index '${index}'.`);
  }
}

const Time_Adapter = memo(function Time_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Typography
      className={className}
      style={style}
      text={useContext(Scene$statusContext).created_at}
    />
  );
});

const Handle_Adapter = memo(function Handle_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Typography
      className={className}
      style={style}
      text={translateMessage(
        useContext(FluentBundleContext),
        "Handle",
        "text",
        {
          username: useContext(Scene$statusContext).account.username,
        },
      )}
      variant={"body2"}
      color={"text.secondary"}
    />
  );
});

const Name_Adapter = memo(function Name_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Typography
      className={className}
      style={style}
      text={useContext(Scene$statusContext).account.display_name}
      variant={"subtitle1"}
    />
  );
});

const Avatar_Adapter = memo(function Avatar_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <Avatar
      className={className}
      style={style}
      src={useContext(Scene$statusContext).account.avatar}
      alt={useContext(Scene$statusContext).account.username}
      variant={"rounded"}
    />
  );
});

const Status_Adapter = memo(function Status_Adapter({
  className,
  style,
}: StyleProps) {
  return (
    <GridContainer
      className={className}
      style={style}
      gridTemplate={
        '"avatar name time" auto\n"avatar handle ." auto\n"text text text" auto\n"actions actions actions" auto\n"divider divider divider" auto\n/ auto 1fr auto'
      }
      gap={0}
      padding={"8px 8px 0 8px"}
      gridArea={[
        "avatar",
        "name",
        "handle",
        "time",
        "actions",
        "text",
        "divider",
      ]}
      justifySelf={[
        undefined,
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
        undefined,
      ]}
      margin={[
        "0 8px 0 0",
        undefined,
        "-4px 0 0 0",
        undefined,
        undefined,
        undefined,
        "8px -8px 0 -8px",
      ]}
      slots={Status$slots}
    />
  );
});

const Status$slots = {
  child: { size: 7, Component: Status_child },
};

function Status_child({
  className,
  style,
  index,
}: SlotComponentProps<GridContainerSchema, "child">) {
  switch (index) {
    case 0:
      return <Avatar_Adapter className={className} style={style} />;
    case 1:
      return <Name_Adapter className={className} style={style} />;
    case 2:
      return <Handle_Adapter className={className} style={style} />;
    case 3:
      return <Time_Adapter className={className} style={style} />;
    case 4:
      return <Actions_Adapter className={className} style={style} />;
    case 5:
      return <Content_Adapter className={className} style={style} />;
    case 6:
      return <Divider_Adapter className={className} style={style} />;
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
