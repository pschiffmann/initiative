import { StyleProps } from "@initiative.dev/schema";
import { CSSProperties } from "react";

const rootStyle: CSSProperties = {
  padding: 8,
  backgroundColor: "darkred",
  color: "white",
  fontFamily: "monospace",
};

const listStyle = {
  margin: 0,
  padding: "4px 16px",
};

export interface ErrorComponentProps extends StyleProps {
  title: string;
  details?: readonly string[];
}

export function ErrorComponent({
  title,
  details,
  className,
  style,
}: ErrorComponentProps) {
  return (
    <div className={className} style={{ ...style, ...rootStyle }}>
      <b>{title}</b>
      {details && (
        <ul style={listStyle}>
          {details.map((message, i) => (
            <li key={i}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
