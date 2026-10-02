import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ApiError, createScene, getPeople } from "../api";
import { SceneCard } from "../components/SceneCard";
import {
  hasSceneErrors,
  validatePersonName,
  validateSceneInput,
  type SceneFieldErrors,
} from "../../shared/validation";
import type { PersonListItemDTO, SceneDTO } from "../../shared/types";

type Props = {
  readOnly: boolean;
  onDone: () => void;
};

type DuplicateCandidate = {
  name: string;
  personId: number;
};

export function SceneFormPage({ readOnly, onDone }: Props) {
  const [existingPeople, setExistingPeople] = useState<PersonListItemDTO[]>([]);
  const [selectedPersonIds, setSelectedPersonIds] = useState<number[]>([]);
  const [newPeople, setNewPeople] = useState<string[]>([]);
  const [newPersonInput, setNewPersonInput] = useState("");
  const [newPersonInputError, setNewPersonInputError] = useState<string | null>(null);
  const [duplicateCandidate, setDuplicateCandidate] = useState<DuplicateCandidate | null>(null);

  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");

  const [fieldErrors, setFieldErrors] = useState<SceneFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedScene, setSavedScene] = useState<SceneDTO | null>(null);

  useEffect(() => {
    getPeople().then(setExistingPeople).catch(() => setExistingPeople([]));
  }, []);

  function toggleExisting(id: number) {
    setSelectedPersonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function removeNewPerson(index: number) {
    setNewPeople((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddPerson() {
    const name = newPersonInput.trim();
    const error = validatePersonName(newPersonInput);
    if (error) {
      setNewPersonInputError(error);
      return;
    }

    if (newPeople.includes(name)) {
      setNewPersonInputError("すでに追加されています。");
      return;
    }

    const existingMatch = existingPeople.find((p) => p.name === name);
    if (existingMatch) {
      if (selectedPersonIds.includes(existingMatch.id)) {
        setNewPersonInputError("すでに選択されています。");
        return;
      }
      setNewPersonInputError(null);
      setDuplicateCandidate({ name, personId: existingMatch.id });
      return;
    }

    setNewPersonInputError(null);
    setNewPeople((prev) => [...prev, name]);
    setNewPersonInput("");
  }

  function useDuplicateExisting() {
    if (!duplicateCandidate) return;
    setSelectedPersonIds((prev) => [...prev, duplicateCandidate.personId]);
    setDuplicateCandidate(null);
    setNewPersonInput("");
  }

  function registerDuplicateAsNew() {
    if (!duplicateCandidate) return;
    setNewPeople((prev) => [...prev, duplicateCandidate.name]);
    setDuplicateCandidate(null);
    setNewPersonInput("");
  }

  function resetForm() {
    setSelectedPersonIds([]);
    setNewPeople([]);
    setNewPersonInput("");
    setNewPersonInputError(null);
    setDuplicateCandidate(null);
    setDate("");
    setTitle("");
    setStory("");
    setFieldErrors({});
    setSubmitError(null);
    setSavedScene(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const errors = validateSceneInput({
      date,
      title,
      story,
      peopleCount: selectedPersonIds.length + newPeople.length,
    });
    setFieldErrors(errors);
    if (hasSceneErrors(errors)) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const scene = await createScene({
        date,
        title,
        story,
        personIds: selectedPersonIds,
        newPersonNames: newPeople,
      });
      setSavedScene(scene);
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields as SceneFieldErrors);
      } else if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError("保存に失敗しました。もう一度お試しください。");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (readOnly) {
    return (
      <section>
        <h1>Sceneを追加する</h1>
        <p>このデモは閲覧専用です。新規登録はローカル環境でお試しください。</p>
        <button type="button" onClick={onDone}>
          戻る
        </button>
      </section>
    );
  }

  if (savedScene) {
    return (
      <section>
        <h1>Sceneを保存しました。</h1>
        <SceneCard scene={savedScene} />
        <div className="form-actions">
          <button type="button" onClick={onDone}>
            Scene一覧に戻る
          </button>
          <button type="button" onClick={resetForm}>
            続けて登録する
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h1>Sceneを追加する</h1>
      <form onSubmit={handleSubmit} noValidate>
        <label className="field">
          日付
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {fieldErrors.date && <span className="error-text">{fieldErrors.date}</span>}
        </label>

        <label className="field">
          場面名
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          {fieldErrors.title && <span className="error-text">{fieldErrors.title}</span>}
        </label>

        <fieldset className="field">
          <legend>一緒にいた人物</legend>
          <p className="hint">
            本名が分からない場合は、後から分かる呼び名でも登録できます。
          </p>

          {existingPeople.length > 0 && (
            <ul className="person-checklist">
              {existingPeople.map((p) => (
                <li key={p.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedPersonIds.includes(p.id)}
                      onChange={() => toggleExisting(p.id)}
                    />
                    {p.name}
                  </label>
                </li>
              ))}
            </ul>
          )}

          {newPeople.length > 0 && (
            <ul className="chip-list">
              {newPeople.map((name, i) => (
                <li key={`${name}-${i}`} className="chip">
                  {name}
                  <button type="button" onClick={() => removeNewPerson(i)} aria-label={`${name}を削除`}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="add-person-row">
            <input
              type="text"
              value={newPersonInput}
              onChange={(e) => {
                setNewPersonInput(e.target.value);
                setNewPersonInputError(null);
              }}
              placeholder="新しい人物の呼び名"
            />
            <button type="button" onClick={handleAddPerson}>
              追加
            </button>
          </div>
          {newPersonInputError && <span className="error-text">{newPersonInputError}</span>}
          {fieldErrors.people && <span className="error-text">{fieldErrors.people}</span>}

          {duplicateCandidate && (
            <div className="confirm-dialog">
              <p>同じ呼び名の人物が登録されています。既存の人物を選びますか？</p>
              <div className="form-actions">
                <button type="button" onClick={useDuplicateExisting}>
                  既存の人物を使う
                </button>
                <button type="button" onClick={registerDuplicateAsNew}>
                  別人物として登録する
                </button>
              </div>
            </div>
          )}
        </fieldset>

        <label className="field">
          出来事・話したこと
          <textarea value={story} onChange={(e) => setStory(e.target.value)} rows={5} />
          {fieldErrors.story && <span className="error-text">{fieldErrors.story}</span>}
        </label>

        {submitError && <p className="error-text">{submitError}</p>}

        <div className="form-actions">
          <button type="button" onClick={onDone}>
            戻る
          </button>
          <button type="submit" disabled={submitting}>
            保存する
          </button>
        </div>
      </form>
    </section>
  );
}
