---
title: GASの小ネタ。ABC_Notifier
date: 2021-03-06T09:07:03.401Z
description: GASの小ネタをシェアしてみる。AtCoderコンテストの通知をするGASを書いて運用してます。
---
# はじめに

GoogleAppsScriptを使うと、GoogleCalendarやGmailなどのGoogleのサービスを取り扱った処理を書くことができます。今回は、GASを使って、最近忘れがちな競技プログラミングのAtCoderのコンテストを自動で通知するようにしました。

# やったこと

## 処理内容

内容的にはあまり難しいことではないので、詳細のコードは[こちら](https://github.com/kuroneko913/ABC_Notifier)を見ていただくことにし、実装の大まかな部分を説明していこうと思います。

### ContestNotify 関数

```
function ContestNotify() {
  const contests = [
    'AtCoder Beginner Contest',
    'AtCoder Regular Contest',
    'ACL Contest',
  ]
  for (let contest of contests) {
    Logger.log('check... '+contest)
    AtCoderNotify(contest)
  }
}
```

各コンテストの告知メールのタイトルを実際の処理関数に渡しています。

### AtCoderNotify 関数

```
function AtCoderNotify(contestTitle) {
  let threads = GmailApp.search('from:noreply@atcoder.jp subject:'+contestTitle+" is:unread",0,1)
  if (threads.length === 0) return
  mail = new AtCoderMail(threads[0])
  notifier = new AtCoderNotifyCalendar(mail, contestTitle)
  notifier.exec()
  threads[0].markRead()
}
```

コンテストのタイトルを受け取って、そのタイトルを含むメールをGmailで検索して、未読になっている最新の1件を取得しています。そのメールに対して、カレンダー登録、メールの既読処理を行っています。

### AtCoderMail

GmailApp.search()で取得したメールスレッドオブジェクトを受け取って、以下の項目を取得します。

 1. コンテストサイトのURL
 2. コンテスト名
 3. コンテストの開始時刻
 4. コンテストの終了時刻

### AtCoderNotifyCalendar

AtCoderMailオブジェクトとコンテストのタイトルを受け取り、AtCoderMailオブジェクトから取得した情報をもとにGoogleCalendarに登録します。コンテストの1時間前と5分前に通知を送るようにしています。
exec()では、土日の午後限定で実行するようなチェックも行っています。

あとはこれをトリガーをセットしてあげて、毎日午後に動くようにしています。
これで、AtCoderのコンテストを忘れちゃったから、参加できないってことはなくなりますね、きっと。

## GASの管理

GASも、何度も更新を重ねていく場合はgit管理がしたくなるものです。今回は、[Google Apps Script GitHub アシスタント](https://chrome.google.com/webstore/detail/google-apps-script-github/lfjcgcmkmjjlieihflfhjopckgpelofo?hl=ja)というChrome拡張を使って実現しています。

以下のように、GitHubのリポジトリとブランチを指定できるようになっています。更新を新しいブランチで追加できるようになっているようです。

![Chrome拡張を追加した場合の画面](/images/uploaded/20210306-185416.png)

## スクリプトのプロパティの指定
旧エディタでしか設定する方法が分からないのですが、以下の画面でkeyとvalueを指定することで、スクリプト内部からのみ呼び出せる定数を取得できます。以下は、CALENDAR_IDという定数を取得している処理です。
```
PropertiesService.getScriptProperties().getProperty('CALENDAR_ID')
```

![スクリプトのプロパティ](/images/uploaded/20210306-190009.png)

これにより、スクリプトに直接記載するのを避けるべき定数を外部から指定できます。
新エディタでもきっと使えるはず...

実は作ったのは、結構前だったりします。

<blockquote class="twitter-tweet"><p lang="und" dir="ltr"><a href="https://t.co/qwsau4uykB">pic.twitter.com/qwsau4uykB</a></p>&mdash; Blackcat🌗 (@myblackcat7112) <a href="https://twitter.com/myblackcat7112/status/1317460563077648391?ref_src=twsrc%5Etfw">October 17, 2020</a></blockquote>

# まとめ
GASを使ってAtCoderコンテストのリマインダーを行う仕組みを実装しました。その際にGASのコードをGitHubで管理するChrome拡張を試してみました。最後にプライベートな定数をスクリプトのプロパティに保存するようにしてみました。
