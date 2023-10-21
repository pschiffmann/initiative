export interface ProjectConfig {
  readonly locales?: readonly string[];
}

export function parseProjectConfig(json: string): ProjectConfig {
  let projectConfig: ProjectConfig;
  try {
    projectConfig = JSON.parse(json);
  } catch (e) {
    throw new Error(
      `Error while parsing 'initiative.json' file: ` +
        (e instanceof Error ? e.message : `${e}`),
    );
  }

  if (typeof projectConfig !== "object" || projectConfig === null) {
    throw new Error(
      `Invalid 'initiative.json': Expected object, got ${typeof projectConfig}.`,
    );
  }
  const { locales, ...rest } = projectConfig;
  if (Object.keys(rest).length !== 0) {
    throw new Error(`Unrecognized options: ${Object.keys(rest).join("', ")}`);
  }

  if (
    locales &&
    (!Array.isArray(locales) || locales.some((l) => typeof l !== "string"))
  ) {
    throw new Error(`'locales' must be an array of strings.`);
  }

  return projectConfig;
}
