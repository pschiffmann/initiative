import { TableTextCellProps } from "./table-text-cell.schema.js";

export function TableTextCell({ element, getText }: TableTextCellProps) {
  return <td>{getText(element)}</td>;
}
