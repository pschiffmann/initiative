import { NodeComponentProps } from "@initiative.dev/schema";
import { Stack } from "@mui/material";
import { FlexContainerSchema } from "./flex-container.schema.js";

export function FlexContainer({
  className,
  style,
  flexDirection,
  alignItems,
  justifyContent,
  gap,
  padding,
  alignSelf,
  margin,
  backgroundColor,
  elevation,
  outlined,
  borderRadius,
  slots,
}: NodeComponentProps<FlexContainerSchema>) {
  return (
    <Stack
      className={className}
      sx={(theme) => ({
        flexDirection,
        alignItems,
        justifyContent,
        gap,
        padding,
        backgroundColor,
        boxShadow: elevation,
        border: outlined ? `1px solid ${theme.palette.divider}` : undefined,
        borderRadius,
        ...style,

        ...Object.fromEntries(
          margin.map((margin, i) => [
            `& > .child-${i + 1}`,
            {
              margin,
              alignSelf: alignSelf[i],
            },
          ]),
        ),
      })}
    >
      {alignSelf.map((_, i) => (
        <slots.child.Component key={i} index={i} className={`child-${i + 1}`} />
      ))}
    </Stack>
  );
}
