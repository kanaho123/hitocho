import { useEffect, useState } from "react";
import { getScenes } from "../api";
import { SceneCard } from "../components/SceneCard";
import type { SceneDTO } from "../../shared/types";

type Props = {
  readOnly: boolean;
  onAddScene: () => void;
};

export function SceneListPage({ readOnly, onAddScene }: Props) {
  const [scenes, setScenes] = useState<SceneDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getScenes()
      .then((data) => {
        if (!cancelled) setScenes(data);
      })
      .catch(() => {
        if (!cancelled) setError("Sceneの読み込みに失敗しました。");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <div className="page-header">
        <h1>Scene一覧</h1>
        {readOnly ? (
          <span className="hint">閲覧専用のため登録できません</span>
        ) : (
          <button type="button" onClick={onAddScene}>
            Sceneを追加する
          </button>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      {scenes === null && !error && <p>読み込み中...</p>}

      {scenes !== null && scenes.length === 0 && (
        <p>まだSceneがありません。最初の出会いを記録してみましょう。</p>
      )}

      {scenes !== null && scenes.length > 0 && (
        <ul className="scene-list">
          {scenes.map((scene) => (
            <li key={scene.id}>
              <SceneCard scene={scene} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
