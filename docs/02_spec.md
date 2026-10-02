# 人帖（ひとちょう）v0.2 追加仕様：本番デモの閲覧専用化

## 背景・目的

v0.1を公開デモ（ https://hitocho.vercel.app ）として一般公開したところ、
URLを知っていれば誰でも新規登録できる状態だった。
公開デモは「架空データを見てもらうためのショーケース」として使うことを目的とし、
荒らし投稿やデータ汚染を避けるため、**本番環境のみ新規登録を禁止**する。

授業内でのローカル動作確認・開発は引き続き登録できる必要があるため、
ローカル（`vercel dev`）や将来のPreviewデプロイには影響しない。

## 変更内容

### サーバー側（本当の境界）

- `POST /api/scenes` の先頭で、Vercelが自動的に設定する環境変数 `VERCEL_ENV` を見て、
  `VERCEL_ENV === "production"` の場合は **403** を返し、以降の処理（バリデーション・DB書き込み）を行わない。
  - 判定ロジックは `api/_lib/env.ts` の `isReadOnlyDemo()` に集約。
  - `VERCEL_ENV` はVercelが各環境で自動的に設定する値（Production / Preview / Development）であり、
    追加の環境変数を手動設定する必要はない。`vercel dev`でのローカル実行時は `development` になる。
- `GET /api/scenes` / `GET /api/people` / `GET /api/people/:id` は変更なし（閲覧は本番でも可能）。

### フロントエンド（UI表示）

- 新規に `GET /api/config` を追加し、`{ readOnly: boolean }` を返す（判定ロジックは上と同じ `isReadOnlyDemo()` を再利用）。
- `App.tsx` がマウント時にこれを取得し、`readOnly` を各画面へ渡す。
  - 画面上部のデモ表示バナーの文言を、`readOnly`時は
    「デモ版（閲覧専用）：架空の名前・内容のサンプルです。このデモ環境からの新規登録はできません。」に切り替える。
  - Scene一覧画面：「Sceneを追加する」ボタンの代わりに「閲覧専用のため登録できません」と表示する。
  - Scene登録フォーム画面：`readOnly`時はフォームを表示せず、「このデモは閲覧専用です。新規登録はローカル環境でお試しください。」と案内して一覧に戻るボタンのみ表示する（直接このビューに来た場合の保険）。
  - 万が一フォーム経由でPOSTが403になった場合も、サーバーからのエラーメッセージをそのまま表示するようにした（従来は汎用メッセージで原因が分からなかった）。

## 対象ファイル

- `api/_lib/env.ts`（新規）— `isReadOnlyDemo()`
- `api/scenes.ts` — POST分岐の先頭でガード
- `api/config.ts`（新規）— `GET /api/config`
- `shared/types.ts` — `ConfigDTO` 追加
- `src/api.ts` — `getConfig()` 追加、エラーメッセージ表示の改善
- `src/App.tsx` — config取得、バナー文言の切り替え
- `src/pages/SceneListPage.tsx` / `SceneFormPage.tsx` — `readOnly` 対応

## 確認方法と結果

- ローカル（`vercel dev`）：`GET /api/config` が `{"readOnly":false}` を返し、`POST /api/scenes` が201で成功することを確認。
- 本番（`https://hitocho.vercel.app`）：匿名アクセスでトップページ・`GET /api/scenes`・`GET /api/people` が閲覧できること、`POST /api/scenes` が403で拒否されることを確認。
