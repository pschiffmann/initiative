import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import validate from "validate-npm-package-name";

export async function createPackage(
  templateName: string,
  workspace: string,
  packageName: string,
) {
  const templatePath = path.resolve(
    import.meta.url.substring("file://".length),
    "../../templates",
    templateName,
  );
  const workspacePath = path.resolve(process.cwd(), workspace);
  await assertDirectoryIsEmpty(workspacePath);
  assertValidPackageName(packageName);

  await copyDirectory(templatePath, workspacePath);
  await generatePackageJson(workspacePath, packageName);
}

async function assertDirectoryIsEmpty(workspacePath: string) {
  try {
    const files = await readdir(workspacePath);
    if (files.length !== 0) {
      throw new Error(`Directory "${workspacePath}" is not empty.`);
    }
  } catch (e) {
    if (e instanceof Error && (e as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }
  }
}

function assertValidPackageName(packageName: string): void {
  const { validForNewPackages, errors } = validate(packageName);
  if (!validForNewPackages) {
    throw new Error(
      [
        `Invalid package name "${packageName}":`,
        ...(errors ?? []).map((e) => `  - ${e}`),
      ].join("\n"),
    );
  }
}

async function copyDirectory(from: string, to: string) {
  await mkdir(to);

  const entries = await readdir(from, { withFileTypes: true });
  for (const { name } of entries.filter((e) => e.isFile())) {
    await copyFile(path.resolve(from, name), path.resolve(to, name));
  }
  for (const { name } of entries.filter((e) => e.isDirectory())) {
    await copyDirectory(path.resolve(from, name), path.resolve(to, name));
  }
}

async function generatePackageJson(workspacePath: string, packageName: string) {
  const packageJson = {
    name: packageName,
    version: "0.1.0",
    type: "module",
    scripts: {
      tsc: "tsc -b",
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    imports: {
      "#initiative/*": "./initiative/*",
    },
    dependencies: {
      "@initiative.dev/ide": "^0.1.0",
      "@initiative.dev/lib-core": "^0.1.0",
      "@initiative.dev/schema": "^0.1.0",
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    },
    devDependencies: {
      "@types/react": "^18.2.43",
      "@types/react-dom": "^18.2.17",
      "@vitejs/plugin-react": "^4.2.1",
      prettier: "3.1.1",
      vite: "^5.0.7",
    },
    sideEffects: false,
  };
  await writeFile(
    path.resolve(workspacePath, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );
}
