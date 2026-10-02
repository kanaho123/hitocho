import { useEffect, useState } from "react";
import "./App.css";
import { getConfig } from "./api";
import { SceneListPage } from "./pages/SceneListPage";
import { SceneFormPage } from "./pages/SceneFormPage";
import { PersonListPage } from "./pages/PersonListPage";
import { PersonDetailPage } from "./pages/PersonDetailPage";

type View =
  | { name: "scenes" }
  | { name: "newScene" }
  | { name: "people" }
  | { name: "personDetail"; personId: number };

function App() {
  const [view, setView] = useState<View>({ name: "scenes" });
  const [sceneListKey, setSceneListKey] = useState(0);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    getConfig()
      .then((config) => setReadOnly(config.readOnly))
      .catch(() => setReadOnly(false));
  }, []);

  return (
    <>
      <p className="demo-notice">
        {readOnly
          ? "デモ版（閲覧専用）：架空の名前・内容のサンプルです。このデモ環境からの新規登録はできません。"
          : "デモ版：架空の名前・内容でお試しください（ログイン機能はなく、URLを知っていれば誰でも閲覧・投稿できます）"}
      </p>
      <nav className="main-nav">
        <button type="button" onClick={() => setView({ name: "scenes" })}>
          Scene一覧
        </button>
        <button type="button" onClick={() => setView({ name: "people" })}>
          人物一覧
        </button>
      </nav>

      <main>
        {view.name === "scenes" && (
          <SceneListPage
            key={sceneListKey}
            readOnly={readOnly}
            onAddScene={() => setView({ name: "newScene" })}
          />
        )}

        {view.name === "newScene" && (
          <SceneFormPage
            readOnly={readOnly}
            onDone={() => {
              setSceneListKey((k) => k + 1);
              setView({ name: "scenes" });
            }}
          />
        )}

        {view.name === "people" && (
          <PersonListPage
            onSelectPerson={(personId) => setView({ name: "personDetail", personId })}
          />
        )}

        {view.name === "personDetail" && (
          <PersonDetailPage
            key={view.personId}
            personId={view.personId}
            onBack={() => setView({ name: "people" })}
          />
        )}
      </main>
    </>
  );
}

export default App;
