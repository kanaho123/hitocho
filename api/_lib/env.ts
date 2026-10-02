// VercelがProduction/Preview/Developmentで自動設定する環境変数。
// `vercel dev`でのローカル実行時は "development" になる。
export function isReadOnlyDemo(): boolean {
  return process.env.VERCEL_ENV === "production";
}
