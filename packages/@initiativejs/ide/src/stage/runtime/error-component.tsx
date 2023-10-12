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

export interface ErrorComponentProps {
  title: string;
  details?: readonly string[];
}

export function ErrorComponent({ title, details }: ErrorComponentProps) {
  return (
    <div style={rootStyle}>
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
