import { FlexContainerProps } from "./flex-container.schema.js";

export function FlexContainer({
  flexDirection,
  OutputsProvider,
}: FlexContainerProps) {
  return (
    <OutputsProvider>
      {({ Child: Children }) => (
        <div style={{ display: "flex", flexDirection }}>
          {Children.map((Child, i) => (
            <Child key={i} />
          ))}
        </div>
      )}
    </OutputsProvider>
  );
}
