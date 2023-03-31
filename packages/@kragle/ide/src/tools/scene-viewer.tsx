export function SceneViewer() {
  return (
    <div className="tool scene-viewer">
      <div className="tool__header">Scene viewer</div>
      <iframe className="scene-viewer__iframe" src="//localhost:5173/" />
    </div>
  );
}
