import { generateCodeForScene } from "#code-gen";
import {
  Listener,
  Listeners,
  SceneDocument,
  Unsubscribe,
  sceneDocumentToJson,
} from "#shared";
import { validateSceneName } from "@initiativejs/schema";

export type WorkspaceState =
  | "initializing"
  | "permission-prompt"
  | "ready"
  | "error";

export class Workspace {
  constructor(
    readonly rootDirectory: FileSystemDirectoryHandle,
    readonly formatJsFile?: (source: string) => string | Promise<string>,
  ) {
    this.#initialize();
  }

  get state(): WorkspaceState {
    return this.#state;
  }
  #state: WorkspaceState = "initializing";

  /**
   * If `state` is `"error"`, then this property contains an error description.
   * In all other states, this value is `null`.
   */
  get error(): string | null {
    return this.#error;
  }
  #error: string | null = null;

  /**
   * List of scene names to be used with `open()`.
   */
  get scenes(): readonly string[] {
    return this.#scenes;
  }
  #scenes: readonly string[] = [];

  async #initialize() {
    let permissionState = await this.rootDirectory.queryPermission({
      mode: "readwrite",
    });
    switch (permissionState) {
      case "prompt": {
        this.#state = "permission-prompt";
        this.#changeListeners.notify();
        return;
      }
      case "denied": {
        this.#state = "error";
        this.#error = "Permission to open the workspace directory was denied.";
        return;
      }
    }

    try {
      await this.rootDirectory.getFileHandle("initiative.json");
    } catch (e) {
      console.error(e);
      this.#state = "error";
      this.#error = "The workspace must contain a initiative.json file.";
      this.#changeListeners.notify();
      return;
    }

    await this.scanFileSystem();
    this.#state = "ready";
    this.#changeListeners.notify();
  }

  async requestPermissions() {
    this.#state = "initializing";
    this.#error = null;
    this.#changeListeners.notify();

    await this.rootDirectory.requestPermission({ mode: "readwrite" });
    await this.#initialize();
  }

  readSceneJson(name: string): Promise<string> {
    return this.rootDirectory
      .getDirectoryHandle("scenes")
      .then((d) => d.getDirectoryHandle(name))
      .then((d) => d.getFileHandle("scene.json"))
      .then((f) => f.getFile())
      .then((f) => f.text());
  }

  async save(document: SceneDocument): Promise<void> {
    const sceneDirectory = await this.rootDirectory
      .getDirectoryHandle("scenes")
      .then((d) => d.getDirectoryHandle(document.name, { create: true }));

    const jsonFile = await sceneDirectory.getFileHandle("scene.json", {
      create: true,
    });
    const jsonFileWritable = await jsonFile.createWritable();
    await jsonFileWritable.write(
      JSON.stringify(sceneDocumentToJson(document), null, 2) + "\n",
    );
    await jsonFileWritable.close();

    let sceneTsx = generateCodeForScene(document);
    if (this.formatJsFile) sceneTsx = await this.formatJsFile(sceneTsx);
    const tsxFile = await sceneDirectory.getFileHandle("scene.tsx", {
      create: true,
    });
    const tsxFileWritable = await tsxFile.createWritable();
    await tsxFileWritable.write(sceneTsx);
    await tsxFileWritable.close();
  }

  async scanFileSystem() {
    let sceneDirectory: FileSystemDirectoryHandle;
    try {
      sceneDirectory = await this.rootDirectory.getDirectoryHandle("scenes");
    } catch (e) {
      console.error(e);
      this.#state = "error";
      this.#error = "Workspace doesn't contain a scenes directory.";
      this.#changeListeners.notify();
      return;
    }

    const scenes: string[] = [];
    for await (const handle of sceneDirectory.values()) {
      if (handle.kind !== "directory") continue;
      try {
        validateSceneName(handle.name);
        await handle.getFileHandle("scene.json");
        scenes.push(handle.name);
      } catch (_) {}
    }
    this.#scenes = scenes.sort();

    this.#changeListeners.notify();
  }

  #changeListeners = new Listeners<void>();
  listen(type: "change", listener: Listener<void>): Unsubscribe {
    const result = this.#changeListeners.add(listener);

    // Ugly workaround for race condition: Sometimes, this code is executed in
    // the following order:
    // 1. Workspace is created with `#state === "initializing"`
    // 2. <WorkspaceManager /> component is rendered
    // 3. Workspace state changes to `"permission-prompt"`
    // 4. <WorkspaceManager /> useEffect starts listening for workspace changes
    // In that case, the WorkspaceManager never re-renders because it never
    // receives a `"change"` notification. So we just fire the notification
    // here, even though the workspace didn't actually change.
    this.#changeListeners.notify();

    return result;
  }
}
