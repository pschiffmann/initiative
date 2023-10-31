/**
 * `base` is assumed to be a path that starts and ends with `/`.
 */
export function resolvePath(base: string, path: string) {
  const baseUrl = new URL(base, window.location.href);
  return new URL(path, baseUrl).pathname;
}
