import { NodeComponentProps } from "@initiative.dev/schema";
import { Box } from "@mui/material";
import { GridContainerSchema } from "./grid-container.schema.js";

export function GridContainer({
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
      })}
    >
      {gridArea.map((gridArea, i) => (
        <Box
          key={i}
          sx={{
            gridArea,
            justifySelf: justifySelf[i],
            alignSelf: alignSelf[i],
            margin: margin[i],
          }}
        >
          <slots.child.Component index={i} />
        </Box>
      ))}
    </Box>
  );
}
