import { TableButtonCellProps } from "./table-button-cell.schema.js";

export function TableButtonCell({ label, onPress }: TableButtonCellProps) {
  return (
    <td>
      <button style={{ zIndex: 2 }} onClick={onPress}>
        {label}
      </button>
    </td>
  );
}
