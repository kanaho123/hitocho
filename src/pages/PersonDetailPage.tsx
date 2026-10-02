import { useEffect, useState } from "react";
import { getPerson } from "../api";
import { SceneCard } from "../components/SceneCard";
import type { PersonDetailDTO } from "../../shared/types";

type Props = {
  personId: number;
  onBack: () => void;
};

export function PersonDetailPage({ personId, onBack }: Props) {
  const [person, setPerson] = useState<PersonDetailDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPerson(personId)
      .then((data) => {
        if (!cancelled) setPerson(data);
      })
      .catch(() => {
        if (!cancelled) setError("人物の読み込みに失敗しました。");
      });
    return () => {
      cancelled = true;
    };
  }, [personId]);

  return (
    <section>
      <button type="button" onClick={onBack}>
        人物一覧に戻る
      </button>

      {error && <p className="error-text">{error}</p>}
      {person === null && !error && <p>読み込み中...</p>}

      {person !== null && (
        <>
          <h1>{person.name}</h1>
          {person.scenes.length === 0 ? (
            <p>まだSceneがありません。</p>
          ) : (
            <ul className="scene-list">
              {person.scenes.map((scene) => (
                <li key={scene.id}>
                  <SceneCard scene={scene} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
