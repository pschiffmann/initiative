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
  header1,
  header2,
  header3,
  header4,
  align1,
  align2,
  align3,
  align4,
  slots,
}: MuiTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell align={align1}>{header1}</TableCell>
          <TableCell align={align2}>{header2}</TableCell>
          <TableCell align={align3}>{header3}</TableCell>
          <TableCell align={align4}>{header4}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={getRowKey(row)}>
            <TableCell align={align1}>
              {slots.column1.element({ row })}
            </TableCell>
            <TableCell align={align2}>
              {slots.column2.element({ row })}
            </TableCell>
            <TableCell align={align3}>
              {slots.column3.element({ row })}
            </TableCell>
            <TableCell align={align4}>
              {slots.column4.element({ row })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
