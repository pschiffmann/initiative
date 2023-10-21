import { NodeComponentProps } from "@initiative.dev/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { MuiTableSchema } from "./table.schema.js";

export function MuiTable({
  rows,
  header,
  align,
  slots,
}: NodeComponentProps<MuiTableSchema>) {
  const columns = new Array(slots.column.size).fill(0);
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
          <TableRow key={row.id}>
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
