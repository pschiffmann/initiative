import { SceneDocumentPatch, SceneJson } from "./scene-data/index.js";

export interface ConnectToEditorRequest {
  readonly type: "@initiativejs/ide.ConnectToEditorRequest";
  readonly port: MessagePort;
}

export interface InitializeStageCommand {
  readonly type: "initialize-stage";
  readonly sceneName: string;
  readonly sceneJson: SceneJson;
}

export type StageConnectionCommand =
  | InitializeStageCommand
  | SceneDocumentPatch;