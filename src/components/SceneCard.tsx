import type { SceneDTO } from "../../shared/types";

export function SceneCard({ scene }: { scene: SceneDTO }) {
  return (
    <div className="scene-card">
      <div className="scene-card-header">
        <span className="scene-date">{scene.date}</span>
        <h2>{scene.title}</h2>
      </div>
      <p className="scene-people">{scene.people.map((p) => p.name).join("、")}</p>
      {scene.story && <p className="scene-story">{scene.story}</p>}
    </div>
  );
}
