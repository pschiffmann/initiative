import { SceneDocumentPatch, SceneJson } from "@kragle/runtime";

export interface ConnectToEditorRequest {
  readonly type: "@kragle/editor.ConnectToEditorRequest";
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