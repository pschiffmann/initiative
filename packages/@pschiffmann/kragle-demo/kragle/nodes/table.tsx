import { TableProps } from "./table.schema.js";

export function Table({ rows, getRowKey, header: headers, slots }: TableProps) {
  return (
    <table>
      <thead>
        <tr>
          {headers.map((header, i) => (
            <th key={i}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={getRowKey?.(row) ?? index}>
            {slots.column.map((slot) => slot.element({ row }))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
