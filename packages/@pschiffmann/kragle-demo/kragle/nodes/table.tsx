import { TableProps } from "./table.schema.js";

export function Table({
  elements,
  getElementKey,
  header: headers,
  OutputsProvider,
}: TableProps) {
  return (
    <OutputsProvider>
      {({ Column: Columns }) => (
        <table>
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {elements.map((element, index) => (
              <tr key={getElementKey?.(element) ?? index}>
                {Columns.map((Column, i) => (
                  <Column key={i} element={element} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </OutputsProvider>
  );
}
