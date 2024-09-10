---
title: GitHubでcommitページに次のcommitへボタンがなかったので実装する
description: ""
date: 2024-09-05T00:11:54.259Z
preview: ""
draft: true
tags: []
categories: []
---

# はじめに
GitHubでCommits一覧ページを開いたときに特定のcommitの変更差分を確認することはよくあることだと思う。
そして、あれ、次のcommitへのボタンがないぞ？となるのは私だけではないはずだ。

それはなぜかというと、プルリクエストをcommit単位で見たときには、nextボタンがあるからである。
![GitHubのプルリクエストからcommit単位で差分を見るときの画面には次のcommitボタンがある](/images/uploaded/20240905/pull-request-commit-next-button-image.png)

だがしかし、リポジトリのトップからCommits画面経由でCommitを見るとnextボタンが無いのである。1commitずつ差分を確認したいときに意外と困る。

そこで、今回はGitHubのCommitページに、prev, nextのボタンを追加してくれるChrome拡張を作ることにした。

# 結論
以下のChrome拡張を作成した。
[github-commit-navigator](https://github.com/kuroneko913/github-commit-navigator)

# 実装について
## 画面にボタンを表示する
まず、Commitページにprev, nextボタンを生やすことを考えた。
ボタンの>の部分はPullRequestの画面ではSVGでやってるようだったので、CSSで頑張って書くのではなく、SVGを埋め込む形にした。

## commit ID の取得
特定のCommitページに、次のcommitへと、直前のcommitへのボタンを作る必要があるので、まずはそのリポジトリの全Commitを取得して、該当ページのcommitIDとその前後のcommitIDを取得する処理を書いた。
CommitIDの取得自体は、以下のようなgithubのAPIエンドポイントを叩くだけでできた。ただし、認証なしでのアクセスではPublicリポジトリからの取得のみに限られる。

```js
const url = `https://api.github.com/repos/${githubUserId}/${githubRepoName}/commits`;
```

また、ページ遷移するたびにAPIから取得していたのではすぐにレートリミットに引っかかることが目に見えるので、取得したCommitIDのリストをJSONでlocalStorageに保持しておくことにした。またlocalStorageに保存したデータには1時間の有効期限を設定しておき、有効期限が切れるまではAPIからの取得を行わないようにした。

## 最初の1commitだけChrome拡張が読み込まれないトラブル
Chrome拡張をリロードして、いざCommitページへ移動しても、prev, nextボタンが表示されないことが多々あった。
原因は、GitHubがSPAで実装されているため、一般的なMPAと違って画面遷移時に再読み込みが走らないことだった。

そのため、なんらかの方法でGitHubのCommitページに遷移したこと、参照しているcommitが変化したことなどを検出して、そのタイミングでChrome拡張の処理を呼び出してやる必要があった。
余計にCommitIDを取得する処理が走ってしまったり、画面遷移を検知できずボタンを表示できないなどのトラブルに見舞われた。

## 最初の1commitだけChrome拡張が読み込まれないトラブルの対処法
1. content_scriptをやめて、service_workerからボタンを表示する処理を呼び出す
2. 表示するボタンの整形などのためのCSSの読み込みは、呼び出されたmainスクリプトの中で実施する

である。

### content_scriptをやめて、service_workerからボタンを表示する処理を呼び出す
今回は、Chrome拡張の裏側で動いている「拡張機能 Service Worker」という仕組みを使うことで画面遷移やDOMの変化を検出して、適切なタイミングでスクリプトを実行できるようにした。

> 拡張機能 Service Worker は、拡張機能の中心的なイベント ハンドラです。
https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/basics?hl=ja

```json:manifest.json
    "permissions": [
      "storage",  
      "scripting", 
      "tabs",
      "webNavigation"
    ],
    "host_permissions": [
      "https://github.com/*"
    ],
    "background": {
      "service_worker": "src/background.js"
    },
    "web_accessible_resources": [
      {
        "resources": ["content.css"],
        "matches": ["https://github.com/*"]
      }
    ]
```

具体的には、以下のように[webNavigation](https://developer.chrome.com/docs/extensions/reference/api/webNavigation?hl=ja)のonHistoryStateUpdatedイベントを検出して、開いているページがGitHubのページかどうか、Commitページかどうかを判定し、Commitページかつまだボタンが表示されていない場合にのみ、ボタンを表示するJSを呼び出すようにしている。

> フレームの履歴が新しい URL に更新されたときに呼び出されます。そのフレームの今後のすべてのイベントで、更新された URL が使用されます。
https://developer.chrome.com/docs/extensions/reference/api/webNavigation?hl=ja#event-onHistoryStateUpdated

```js
chrome.webNavigation.onHistoryStateUpdated.addListener(debounce(function(details) {
    if (details.url.includes('https://github.com/')) {
        // 現在のタブでボタンがすでに表示されているかどうかを確認
        chrome.scripting.executeScript({
            target: {tabId: details.tabId},
            func: () => {
                // コミットページじゃない場合はスクリプトを実行しない
                const isCommitPage = window.location.pathname.includes('/commit/');
                if (!isCommitPage) {
                    return false;
                }

                const prevButtonExists = !!document.getElementById('prev-button');
                const nextButtonExists = !!document.getElementById('next-button');
                // ボタンが存在しない場合のみスクリプトを実行
                return !(prevButtonExists && nextButtonExists);
            },
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error('Error:', chrome.runtime.lastError.message);
                return;
            }
            if (results && !results[0]) {
                return;
            }
            chrome.scripting.executeScript({
                target: {tabId: details.tabId},
                files: ['dist/bundle.js'],
            });
        });
    }
}, 500), {url: [{hostContains: 'github.com'}]});

```

イベントの発火のタイミングによっては、短時間で複数回実行されてしまうことが容易に想像できる。そのため、debounceというテクニックを用いて、あえてイベント検出時に遅延を設定して、無駄に処理が実行されないようにしている。チャタリング抑制だな、と個人的には理解した。

> debounceは、高頻度で発火するイベント（例: ウィンドウのリサイズ、キー入力など）を制御するためのテクニックの一つです。このテクニックを使うと、特定の時間間隔内に再度イベントが発火しなかった場合にのみ関数を実行することができます。
[一瞬で理解！JavaScriptの`debounce`テクニックとその実装方法](https://qiita.com/itinerant_programmer/items/5900b3ea0e6823223ee7)


GitHubがSPAであるがゆえの問題との格闘時に参考にしたリンク
[【Chrome拡張機能開発】GitHubでmainブランチにいる時に目立たせて気付きたい](https://www.endorphinbath.com/chrome-extension-github-main-branch-notice/)


ChatGPTに相談した結果、SPAだから起きていると判明。

```
この問題は、GitHubがシングルページアプリケーション (SPA) の要素を持っているために、ページの完全なリロードが行われず、URLが変わってもcontent.jsが自動で再実行されないことが原因です。つまり、ページ遷移の際にブラウザが新しいページを完全に読み込むわけではないため、content_scriptsが再度適用されないことがあります。

この問題を解決するには、URLの変化を監視し、URLが変更されたときに手動でcontent.jsの動作をトリガーする必要があります。これには、history.pushStateやpopstateイベントを監視する方法がよく使われます。
```

### 表示するボタンの整形などのためのCSSの読み込みは、呼び出されたmainスクリプトの中で実施する
content_script時に一緒にCSSもロードすることができるのだが、今回はbackground.jsからのみスクリプトを起動するようにしたので、CSSの読み込みもスクリプト実行時に自分でやる必要が出てきた。以下のようにCSSをheadに追加する処理を記述するだけで良い。

```js:main.js
// CSSの追加
function injectCSS(cssFileName, id) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = chrome.runtime.getURL(cssFileName);
    css.id = id;
    document.head.appendChild(css);
}

// content_scriptで追加しないようにしたのでCSSを動的に追加する
injectCSS('content.css', 'github-commit-navigation-css');

```

## Webpackを導入してファイル分割
エントリーポイントのmain.jsに、commitを取得してくる処理の詳細、画面にボタンを追加する処理の詳細が含まれてしまった結果、300行程度のコード量になってしまって見づらくなった。そのため、エントリーポイントのmain.jsの他、commitを取得してくる処理の詳細、画面にボタンを追加する処理をそれぞれファイルに分割することにした。

ここで中途半端にReactやNextJSをかじっていたので、import文が使えるものだと思っていたが、どうやら標準では叶わないようだった。
そこでバンドラーとして有名な[webpack](https://webpack.js.org/)を導入し、モジュールごとに管理できるようにすることにした。つまり、3つのファイルに分割して開発、管理はして、Chrome拡張として使用するときは3つのファイルを一つのファイルにまとめた(バンドルした)ものを読み込めば良い状態にする。

[webpackとは？](https://qiita.com/minato-naka/items/0db285f4a3ba5adb6498)

[いちばんやさしい webpack 入門](https://zenn.dev/sprout2000/articles/9d026d3d9e0e8f)

# まとめ
GitHubのCommitページでcommit単位で前後の差分を見たかったので、prev commit, next commitボタンを表示するChrome拡張を実装した。

GitHubがSPAで実装されていたので単純なcontent_scriptの実装では済まず、
background.jsを拡張のサービスワーカーで起動しておき、commit画面への遷移イベントを検知した際にボタンを表示するスクリプトを呼び出すという形で実装した。

また、content_scriptであれば一緒に読み込めたCSSも、ボタン表示処理の中でJSでロードする形を取る必要が発生した。

ファイルの分割をしたほうがメンテナンスしやすかったのでwebpackを導入して実現した。

作ろう！と思いついて大体実装したのが金曜日、なぜか月曜日の夜にちゃんと動くようにしたい！となったので合計2日間でちゃんと動くChrome拡張が作れたのは嬉しい。
もちろん、ChatGPTといっしょにデバッグしたり、課題解決の方法を考えられたのは大きかった。

実は、金曜日に[ReactではじめるChrome拡張開発入門](https://zenn.dev/alvinvin/books/chrome_extension)というチュートリアルをやって、DeepL翻訳の拡張のようなものを作るという体験をしていたのもあってChrome拡張開発の解像度がだいぶ高まっていたのもありそう。

Privateリポジトリの場合は、権限の問題で取得できないので認証機能を実装してPrivateリポジトリでも取得できるようにするのが次の目標。
