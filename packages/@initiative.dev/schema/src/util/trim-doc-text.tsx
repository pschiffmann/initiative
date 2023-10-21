export function trimDocText(text: string): string {
  let result = "";
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    result += trimmed ? `${trimmed} ` : "\n\n";
  }
  return result;
}
