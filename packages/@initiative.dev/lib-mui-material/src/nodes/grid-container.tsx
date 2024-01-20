import { NodeComponentProps } from "@initiative.dev/schema";
import { Box } from "@mui/material";
import { GridContainerSchema } from "./grid-container.schema.js";

export function GridContainer({
  className,
  style,
  gridTemplate,
  justifyItems,
  alignItems,
  gap,
  padding,
  backgroundColor,
  elevation,
  outlined,
  borderRadius,
  gridArea,
  justifySelf,
  alignSelf,
  margin,
  slots,
}: NodeComponentProps<GridContainerSchema>) {
  return (
    <Box
      className={className}
      display="grid"
      sx={(theme) => ({
        gridTemplate,
        justifyItems,
        alignItems,
        gap,
        padding,
        backgroundColor,
        elevation,
        border: outlined ? `1px solid ${theme.palette.divider}` : undefined,
        borderRadius,
        ...style,

        ...Object.fromEntries(
          gridArea.map((gridArea, i) => [
            `& > .child-${i + 1}`,
            {
              gridArea,
              justifySelf: justifySelf[i],
              alignSelf: alignSelf[i],
              margin: margin[i],
            },
          ]),
        ),
      })}
    >
      {gridArea.map((_, i) => (
        <slots.child.Component key={i} index={i} className={`child-${i + 1}`} />
      ))}
    </Box>
  );
}
