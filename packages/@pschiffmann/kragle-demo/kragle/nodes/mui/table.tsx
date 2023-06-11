import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { MuiTableProps } from "./table.schema.js";

export function MuiTable({
  rows,
  getRowKey,
  header,
  align,
  slots,
}: MuiTableProps) {
  const columns = new Array(slots.column.length).fill(0);
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((_, i) => (
            <TableCell key={i} align={align[i]}>
              {header[i]}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={getRowKey(row)}>
            {columns.map((_, i) => (
              <TableCell key={i} align={align[i]}>
                <slots.column.Component index={i} row={row} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
