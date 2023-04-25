type Modifier = string | false | null | undefined;

export interface BemClasses {
  block(external?: Modifier | Modifier[], ...modifiers: Modifier[]): string;
  element(
    element: string,
    external?: Modifier | Modifier[],
    ...modifiers: Modifier[]
  ): string;
}

export function bemClasses(block: string): BemClasses {
  return {
    block(external, ...modifiers) {
      let result = prependExternal(block, external);
      for (const modifier of modifiers) {
        if (modifier) result += ` ${block}--${modifier}`;
      }
      return result;
    },
    element(element, external, ...modifiers) {
      let result = prependExternal(`${block}__${element}`, external);
      for (const modifier of modifiers) {
        if (modifier) result += ` ${block}__${element}--${modifier}`;
      }
      return result;
    },
  };
}

function prependExternal(
  result: string,
  external: Modifier | Modifier[]
): string {
  if (!external) return result;
  if (!Array.isArray(external)) {
    return external ? `${external} ${result}` : result;
  }
  for (let i = external.length - 1; i >= 0; i--) {
    const cls = external[i];
    if (cls) result = `${cls} ${result}`;
  }
  return result;
}
