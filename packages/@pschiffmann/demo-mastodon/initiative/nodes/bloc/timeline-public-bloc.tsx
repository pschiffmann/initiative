import { NodeComponentProps } from "@initiative.dev/schema";
import { useEffect, useState } from "react";
import { Status } from "../../types/index.js";
import { TimelinePublicBlocSchema } from "./timeline-public-bloc.schema.js";

export function TimelinePublicBloc({
  slots,
}: NodeComponentProps<TimelinePublicBlocSchema>) {
  const [statuses, setStatuses] = useState<Status[]>([]);

  useEffect(() => {
    fetch(
      "https://mastodon.social/api/v1/timelines/public?local=true&only_media=false",
    )
      .then((r) => r.json())
      .then((r) => {
        console.log(r);
        setStatuses(r);
      });
  }, []);

  return (
    <>
      {statuses.map((status) => (
        <slots.child.Component key={status.id} status={status} />
      ))}
    </>
  );
}
