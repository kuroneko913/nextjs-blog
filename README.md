This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## 実験メモ

- `/notes/new`: スマホ用投稿画面。本文のみで公開でき、タイトル・タグは任意。
- `/notes`: 公開メモの一覧。複数選択して記事のMarkdown下書きを保存できる。
- `/notes/<id>`: メモ固有の公開URL。
- 公開後・一覧・詳細の「X（Twitter）でシェア」から、タイトル（空欄なら本文の抜粋）と公開URLを入力したXの投稿画面を開ける。送信は本人がX上で行う。
- メモ固有ページにはタイトル・本文抜粋・PNGアイコン・canonical URLを含むOGP/Twitterカードをサーバー側で出力する。既存のX投稿に表示されるカードはX側のキャッシュによりすぐ更新されない場合がある。
- 投稿画面からホーム画面に追加すると、投稿画面を直接開くPWAになる。既存ブログPWAの起動先は維持する。

### 本番設定（Netlify）

既存の `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` を使います。認証はGitHub OAuthです。許可する投稿者は `src/notes/auth.ts` の `OWNER_GITHUB_ID = 20674685`（kuroneko913）だけで、変更可能なユーザー名やメールアドレスでは判定しません。

1. 本人が [GitHubのOAuth App登録画面](https://github.com/settings/applications/new) で専用アプリを作ります。
   - Application name: `くろねこ。の実験メモ`
   - Homepage URL: `https://myblackcat913.com`
   - Authorization callback URL: `https://myblackcat913.com/api/notes/oauth/callback`
   - Device Flowは不要です。公開プロフィールによる本人確認だけで、追加スコープは要求しません。
2. Client secretを本人が発行し、Netlifyのこのサイトの環境変数へ直接設定します。
   - `NOTES_GITHUB_CLIENT_ID`: GitHubに表示されるClient ID
   - `NOTES_GITHUB_CLIENT_SECRET`: 発行したClient secret
   - ProductionのFunctions実行時に利用できる設定にします。`NEXT_PUBLIC_` を付けず、secretはチャット・Git・スクリーンショットに貼らないでください。プレビューへのsecret設定は不要です。
3. 設定を終えてから認証変更を本番へ反映し、`/notes/new` の「投稿用にログイン」から本人がGitHubログインを確認します。設定前に反映した場合はログイン・投稿が停止し、キー認証へのフォールバックはありません。
4. 移行後は `NOTES_ADMIN_KEY` をNetlifyから削除できます。アプリはこの値を読みません。旧キーと旧Cookieは無効になるため、既存端末でも一度GitHubでログインし直します。

ログイン要求は同一オリジンのPOSTに限定し、10分間の署名付きstate CookieとS256 PKCEを使います。GitHubから毎回取得するアカウントIDを照合し、トークンはサーバー内のそのリクエストでだけ使います。投稿者用CookieはHttpOnly/Secure/SameSite=Strict、API配下に限定し、有効期間は30日です。ログイン用セッションはランダム256ビットのトークンで、Firestoreにはハッシュと投稿者ID・有効期限だけを保存します（平文トークンは保存しません）。ログアウト時はサーバーの記録も削除します。Client secretの変更・再デプロイで全セッションが無効になります。GitHubアプリの許可を取り消すだけでは既存のブログセッションは消えないため、全端末を失効する場合はsecretを更新するか、Firestoreの `session-` 文書を削除してください。

メモはFirestoreの `experiment-notes`、ログイン状態は `experiment-notes-private` の `session-<hash>` 文書へ保存されます。期限切れはAPIが毎回拒否します。必要に応じてprivateコレクションの `expiresAt` にFirestore TTLを設定できますが、認証の期限判定には不要です。旧 `login-rate-limit` 文書は使いません。サーバーのAdmin SDKだけが読み書きするため、既存のFirestoreのdeny-allルールは変更しません。メモの一覧は単一フィールドとドキュメントIDの降順を使い、追加の複合インデックスは不要です。

OAuthの開始・戻り先は本番ドメインに固定しています。Deploy Previewからのログインは受け付けません。GitHubのパスワード・パスキー・二要素認証はGitHubの画面だけで入力します。参考: [GitHub OAuthのWebフロー](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)、[スコープなしで使える公開情報](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps)。

書きかけはブラウザのlocalStorageに保存します。端末間の同期はありません。通信失敗時には入力を維持し、再送には同じIDを使うため重複投稿を防げます。接続が戻っても自動公開せず、本人が「公開する」を押します。公開内容はプレーンテキストとして表示します。画像添付・公開後の編集は初期版には含みません。

本番PWAは投稿画面と必要なJS/CSSをキャッシュします。オンラインで一度起動してService Workerの準備が終われば、オフラインでも投稿画面を開いて下書きできます。API、認証情報、Next.jsのRSCレスポンスはキャッシュしません。開発モードではService Workerを登録しません。

### 検証

`npm test` は実際のAPIハンドラーをFirestoreのインメモリ代替・GitHub応答のモックで検証し、ライブのデータベースには書き込みません。所有者のID照合、旧キーの拒否、state改ざん・期限、PKCE、Cookie、ログアウト後の再利用拒否、CSRF、入力制限、再送、ページ送り、下書き書き出し、旧URLとの互換性を確認します。`NODE_ENV=production npm test` でSecure Cookieも検証できます。`npm run lint` と `npm run build` も実行してください。

リリース時はOAuth設定後、本人の端末でGitHubログイン→書きかけの復元→公開→ログアウトを確認してください。ログインから戻っても自動投稿はしません。Firestoreへの実接続とiPhone/Android実機のPWAからGitHubへ移動・復帰する動作は、この確認で検証します。

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
