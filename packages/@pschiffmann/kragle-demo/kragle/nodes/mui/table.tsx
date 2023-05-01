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
  return (
    <Table>
      <TableHead>
        <TableRow>
          {slots.column.map((column, i) => (
            <TableCell key={column.nodeId} align={align[i]}>
              {header[i]}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={getRowKey(row)}>
            {slots.column.map((column, i) => (
              <TableCell key={column.nodeId} align={align[i]}>
                {column.element({ row })}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
