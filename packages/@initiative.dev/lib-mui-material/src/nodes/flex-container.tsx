import { NodeComponentProps } from "@initiative.dev/schema";
import { Box, Stack } from "@mui/material";
import { FlexContainerSchema } from "./flex-container.schema.js";

export function FlexContainer({
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
      })}
    >
      {alignSelf.map((alignSelf, i) => (
        <Box sx={{ alignSelf, margin: margin[i] }} key={i}>
          <slots.child.Component index={i} />
        </Box>
      ))}
    </Stack>
  );
}
