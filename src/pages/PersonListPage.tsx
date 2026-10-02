import { useEffect, useState } from "react";
import { getPeople } from "../api";
import type { PersonListItemDTO } from "../../shared/types";

type Props = {
  onSelectPerson: (id: number) => void;
};

export function PersonListPage({ onSelectPerson }: Props) {
  const [people, setPeople] = useState<PersonListItemDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPeople()
      .then(setPeople)
      .catch(() => setError("人物の読み込みに失敗しました。"));
  }, []);

  return (
    <section>
      <h1>人物一覧</h1>

      {error && <p className="error-text">{error}</p>}
      {people === null && !error && <p>読み込み中...</p>}
      {people !== null && people.length === 0 && <p>まだ人物が登録されていません。</p>}

      {people !== null && people.length > 0 && (
        <ul className="person-list">
          {people.map((p) => (
            <li key={p.id}>
              <button type="button" className="person-list-item" onClick={() => onSelectPerson(p.id)}>
                <span className="person-name">{p.name}</span>
                <span className="person-scene-count">{p.sceneCount}件のScene</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
