import { Box, Stack as MuiStack } from "@mui/material";
import { StackProps } from "./stack.schema.js";

export function Stack({ flexDirection, gap, alignSelf, slots }: StackProps) {
  return (
    <MuiStack flexDirection={flexDirection} gap={gap}>
      {slots.child.map((child, i) => (
        <Box key={child.nodeId} alignSelf={alignSelf[i]}>
          {child.element()}
        </Box>
      ))}
    </MuiStack>
  );
}
