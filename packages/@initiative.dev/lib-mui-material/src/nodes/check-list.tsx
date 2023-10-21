import { NodeComponentProps } from "@initiative.dev/schema";
import {
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useId } from "react";
import { CheckListSchema } from "./check-list.schema.js";

export function CheckList({
  items,
  getItemKey,
  getPrimaryText,
  getSecondaryText,
  checked,
  onCheckedChange,
  slots,
}: NodeComponentProps<CheckListSchema>) {
  const labelIdPrefix = useId();
  const checkedSet = new Set(checked);

  return (
    <List>
      {items.map((item) => {
        const key = getItemKey(item);
        const labelId = `${labelIdPrefix}-${key}`;
        const isChecked = checkedSet.has(key);

        return (
          <ListItem
            key={key}
            secondaryAction={<slots.secondaryAction.Component item={item} />}
            disablePadding
          >
            <ListItemButton
              role={undefined}
              onClick={() => onCheckedChange(key, !isChecked)}
              dense
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={isChecked}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={getPrimaryText(item)}
                secondary={getSecondaryText?.(item)}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}
