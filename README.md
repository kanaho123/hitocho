# 人帖（ひとちょう）

> ⚠️ **デモ版**：架空の名前・内容でお試しください。ログイン機能はなく、URLを知っていれば誰でも閲覧・投稿できます。個人情報や機密情報は入力しないでください。

## 目的

人と会う機会が多い人が、以前会った人と再会した時に「いつ・どこで会い、何があったのか」をすぐ思い出せないという課題を解決するアプリ。詳細な仕様は [docs/01_spec.md](docs/01_spec.md) を参照。

## 機能（v0.1）

- Scene（人と会った場面）の一覧表示・新規登録
- 人物の新規登録（Scene登録画面からその場で追加可能）
- Scene・人物一覧
- 人物ページ（その人物が登場した過去のSceneを新しい順に表示）
- 入力チェック・エラー表示（必須項目、文字数上限、重複人物の確認）

## 技術構成

- フロントエンド: Vite + React + TypeScript
- API: Vercel Functions（`api/`、ブラウザから直接DBには接続しない）
- ORM: Prisma（`prisma/schema.prisma`）
- DB: Vercel Postgres（Neon）

## 制限事項

- 認証・ログイン機能は実装していません（v0.1の対象外）。URLを知っている人は誰でも閲覧・投稿できます。
- 複数ユーザーの区別はありません。全員が同じデータを共有します。

## セットアップ

1. 依存関係をインストール（`postinstall`でPrisma Clientも生成される）
   ```bash
   npm install
   ```
2. Vercelダッシュボード（またはCLI）でPostgres（Neon）ストレージを作成し、プロジェクトに接続する。
3. 環境変数を取得する（`.env.local`は自動でgit管理外）
   ```bash
   vercel link
   vercel env pull .env.local
   ```
   `.env.example`に記載の `DATABASE_URL` / `DATABASE_URL_UNPOOLED` が入っていればOK。
4. スキーマをDBに反映する
   ```bash
   npm run db:push
   ```
5. ローカル開発サーバーを起動する（`api/`配下も含めて動かすため`vite`単体ではなく`vercel dev`を使う）
   ```bash
   vercel dev
   ```

## スクリプト

- `npm run dev` — Viteの開発サーバーのみ起動（`/api/*`は動かない。フロント単体の見た目確認用）
- `vercel dev` — フロント＋`/api/*`を含めた本番相当のローカル実行
- `npm run build` — 型チェック＋本番ビルド（`prisma generate`を含む）
- `npm run db:push` — Prismaスキーマを接続先DBに反映
