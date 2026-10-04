# くろねこ。の実験室

[myblackcat913.com](https://myblackcat913.com) のソースコードです。Next.jsで、ブログ記事・日々のノート・実験を公開しています。本番はNetlifyで運用しています。

## サイトの構成

- **Home**（`/`）：更新記事とNotesへの入口。
- **Blog**（`/blog`）：Markdownで管理する記事。本文は `posts/` に保存します。
- **Notes**（`/notes`）：スマホから気軽に残す記録。公開ノートはFirestoreに保存し、投稿・くずかご操作には本人のGitHubログインが必要です。
- **Lab**（`/lab`）：Genetic Codes、AIエージェント運用、Mind Kernelなどの実験の入口。
- **About**（`/about`）：プロフィール。

## ローカル開発

Node.js 20.18.1以上を使用します。CIとNetlifyに合わせ、Yarnで開発します。

```bash
yarn install --frozen-lockfile
cp .env.example .env.local
yarn dev
```

[localhost:3000](http://localhost:3000) を開きます。環境変数のサンプルには値を入れていません。Firestoreを使う機能にはFirebaseの設定が必要です。NotesのGitHubログインは本番ドメイン専用なので、localhostやDeploy Previewでは利用できません。

## 変更する場所

- `app/`：各ページ、API、共通部品（`app/modules/`）。
- `posts/`：ブログ記事のMarkdown。`draft: true` の記事は公開一覧から除外します。
- `src/labs/experiments.ts`：Labの実験一覧。
- `src/notes/`：Notesの保存・認証・共有処理。
- `app/design-system.css`：共通の色、幅、余白、カード、ボタンなど。
- `public/`：画像とPWA用ファイル。

## 検証とデプロイ

```bash
yarn lint
yarn test
yarn build
```

テストはFirestoreとGitHubのモックを使用し、ライブのデータベースには書き込みません。PRでは同じ検証をGitHub Actionsで実行します。NetlifyのDeploy Previewで表示を確認し、`main`へのマージ後に本番へデプロイされます。設定は [netlify.toml](netlify.toml) を参照してください。

## 詳しい手順

- [Notesの使い方と運用](docs/notes.md)：保存先、くずかご、GitHub OAuth設定、認証、PWA、リリース時の確認。
- [Labの構成と実験の追加](docs/lab.md)：紹介ページと一覧への追加方法。
- [共通デザイン](docs/design-system.md)：デザインの定義と共通部品。
- [公開サイトの保護と運用](docs/security.md)：いいねAPIの上限、MCPの削除、下書きと外部スクリプト。
