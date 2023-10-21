import { ProjectConfig } from "./project-config.js";
import { SceneDocumentPatch, SceneJson } from "./scene-data/index.js";

export interface ConnectToEditorRequest {
  readonly type: "@initiative.dev/ide.ConnectToEditorRequest";
  readonly port: MessagePort;
}

export interface InitializeStageCommand {
  readonly type: "initialize-stage";
  readonly projectConfig: ProjectConfig;
  readonly sceneName: string;
  readonly sceneJson: SceneJson;
}

export interface SetLocaleCommand {
  readonly type: "set-locale";
  readonly locale: string;
}

export type StageConnectionCommand =
  | InitializeStageCommand
  | SetLocaleCommand
  | SceneDocumentPatch;
