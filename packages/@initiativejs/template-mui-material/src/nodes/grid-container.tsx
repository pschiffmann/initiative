import { NodeComponentProps } from "@initiativejs/schema";
import { Box, Stack } from "@mui/material";
import { FlexContainerSchema } from "./flex-container.schema.js";

export function FlexContainer({
  flexDirection,
  alignItems,
  gap,
  padding,
  alignSelf,
  margin,
  slots,
}: NodeComponentProps<FlexContainerSchema>) {
  return (
    <Stack sx={{ flexDirection, alignItems, gap, padding }}>
      {alignSelf.map((alignSelf, i) => (
        <Box sx={{ alignSelf, margin: margin[i] }} key={i}>
          <slots.child.Component index={i} />
        </Box>
      ))}
    </Stack>
  );
}
