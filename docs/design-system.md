# 共通デザイン

[READMEに戻る](../README.md)

Labから抽出した色、幅、角丸、余白を `app/design-system.css` の `--site-*` 変数で管理します。生成りの背景、深い緑の文字、緑のアクセント、薄い境界線を共通に使い、ページ固有のレイアウトはLab・NotesのCSSに残します。共通部品は `site-header`、`site-footer`、`site-card`、`site-button`、`site-content`。Home・Blog・Aboutと各実験も同じ定義を参照します。エラー表示と紙を丸めた表現、記事画像、コードの構文色は用途に合わせた色を維持します。

Copyrightはクライアントで現在年を表示し、開いたまま年を越した場合も更新します。静的ビルド時の年には依存しません。
