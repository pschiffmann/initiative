import { bemClasses } from "#design-system";

const cls = bemClasses("initiative-line");

export interface DfiLinesProps {
  startX: number;
  startY: number;
  tunnel:
    | [entranceX: number, entranceY: number, exitX: number, exitY: number]
    | undefined;
  endX: number;
  endY: number;
  parent?: boolean;
}

export function DfiLines({
  startX,
  startY,
  tunnel,
  endX,
  endY,
  parent,
}: DfiLinesProps) {
  if (tunnel !== undefined) {
    return (
      <path
        d={`  M ${startX}
                  ${startY}
              C ${startX + (tunnel[0] - startX) / 2}
                  ${startY}
                ${startX + (tunnel[0] - startX) / 2}
                  ${tunnel[1]}
                ${tunnel[0]}
                  ${tunnel[1]}
              H ${tunnel[2]}
              C ${tunnel[2] + (endX - tunnel[2]) / 2}
                  ${tunnel[3]}
                ${tunnel[2] + (endX - tunnel[2]) / 2}
                  ${endY}
                ${endX}
                  ${endY}
            `}
        stroke="black"
        fill="transparent"
      />
    );
  } else {
    return (
      <path
        d={`  M ${startX}
                  ${startY}
              C ${startX + (endX - startX) / 2}
                  ${startY}
                ${startX + (endX - startX) / 2}
                  ${endY}
                ${endX}
                 ${endY}`}
        stroke="black"
        fill="transparent"
        strokeDasharray={parent ? "5,5" : undefined}
      />
    );
  }
}
