import { PrimitiveWeakMap } from "@pschiffmann/std/primitive-weak-map";
import { Type } from "./type.js";

const cache = new PrimitiveWeakMap<string, Type>();

export function intern<T extends Type>(type: T): T {
  const key = type.toString(true);
  const cached = cache.get(key);
  if (cached) return cached as T;
  cache.set(key, type);
  return type;
}
