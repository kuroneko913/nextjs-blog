This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## 実験メモ

- `/notes/new`: スマホ用投稿画面。本文のみで公開でき、タイトル・タグは任意。
- `/notes`: 公開メモの一覧。複数選択して記事のMarkdown下書きを保存できる。
- `/notes/<id>`: メモ固有の公開URL。
- 投稿画面からホーム画面に追加すると、投稿画面を直接開くPWAになる。既存ブログPWAの起動先は維持する。

### 本番設定（Netlify）

既存の `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` を使います。追加で `NOTES_ADMIN_KEY` に、`openssl rand -hex 32` などで生成したランダムな投稿キーを設定して再デプロイしてください。`NEXT_PUBLIC_` は付けないでください。投稿キーをスマホのパスワードマネージャーに保存し、最初の投稿時に入力すると90日間ログインを保持します。キーを変更すると既存セッションも無効になります。

メモはFirestoreの `experiment-notes` コレクションへ保存されます。ログイン試行制限は `experiment-notes-private` に保存されます。サーバーのAdmin SDKだけが読み書きするため、既存のFirestoreのdeny-allルールは変更しません。メモの一覧は単一フィールドとドキュメントIDの降順を使い、追加の複合インデックスは不要です。

書きかけはブラウザのlocalStorageに保存します。端末間の同期はありません。通信失敗時には入力を維持し、再送には同じIDを使うため重複投稿を防げます。接続が戻っても自動公開せず、本人が「公開する」を押します。公開内容はプレーンテキストとして表示します。画像添付・公開後の編集は初期版には含みません。

本番PWAは投稿画面と必要なJS/CSSをキャッシュします。オンラインで一度起動してService Workerの準備が終われば、オフラインでも投稿画面を開いて下書きできます。API、認証情報、Next.jsのRSCレスポンスはキャッシュしません。開発モードではService Workerを登録しません。

### 検証

`npm test` は実際のAPIハンドラーをFirestoreのインメモリ代替で検証し、ライブのデータベースには書き込みません。認証、CSRF、入力制限、再送、ページ送り、下書き書き出し、旧URLとの互換性を確認します。`npm run lint` と `npm run build` も実行してください。

リリース時はNetlifyに投稿キーを設定後、本人の端末でログイン→一文投稿→一覧・固有URLを確認してください。Firestoreへの実接続とiPhone/Android実機のホーム画面追加は、この確認で検証します。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
