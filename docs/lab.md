# Labの構成と実験の追加

[READMEに戻る](../README.md)

## 紹介ページ

`/lab` は実験の入口です。Genetic Codes（`/lab/genetic-codes`）、AIエージェント運用と、このサイトのNotesも並べています。`/lab/ai-agent-operations` では、カナデ・カモメ・カナメにXやWebサイトの情報をランダムに渡し、気になるものを蓄積して、書けるときに記事にする運用を紹介します。toy toi boxの「問いのおもちゃ箱」は出発点として説明し、カナデによるエッセイを実際の出力例として添えています。note（`https://note.com/toytoibox`）とX（`https://x.com/toytoibox`）へのリンクを並べています。旧 `/lab/toytoibox` は新しい実験ページへ恒久リダイレクトします。

`/lab/mind-kernel` ではMind Kernelそのもの・公開テンプレート・MCPサーバーの役割と運用を紹介します。AIエージェント運用の紹介ページと相互にリンクし、思考の軸と記事づくりの関係を説明しています。個人の非公開Kernelの内容は掲載しません。

## 実験を追加する

実験を追加するときは `src/labs/experiments.ts` の `experiments` に1件追加します。`id` は重複しない値、`title`・`category`・`description`・`action` は表示文、`icon` は `agent` / `kernel` / `writing` / `dna` / `notes` から選びます。サイト内は `href: "/lab/…"` などを指定し、新しいツールや紹介ページなら `app/lab/<slug>/page.tsx` にページを作ります。外部の実験は `href: "https://…"` と `external: true` だけで追加でき、別タブで開きます。一覧の件数・カードは自動で更新されます。
