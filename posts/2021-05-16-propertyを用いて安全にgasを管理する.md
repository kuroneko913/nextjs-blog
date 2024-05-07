---
title: Propertyを用いて安全にGASを管理する
date: 2021-05-16T15:26:42.434Z
description: Propertyを用いることで、アクセストークンや環境変数などを直接ソースコードに書くことなく実行、管理することができる。
---
## はじめに

GASでは、APIを叩くことでChatworkやAWSなどの外部アプリとの連携が容易にできる。GASでAPIを叩く場合もアクセストークンを必要とし、なんらかの方法でGASに書き込んであげる必要がある。
ただし、AWSのアクセストークンなんかを直接GASのコードにハードコーディングしてgithubにpushでもすれば、即座にボットに回収され悪用されかねない。そこで、ソースとは別なところにトークンを保存し呼び出すということを行う。それがGASが提供しているPropertyである。

## Propertyとは...

詳細は[ここ](https://developers.google.com/apps-script/guides/properties)を参考にしてもらえればいいと思うが、key-value形式でスクリプトごとやユーザーごと、ドキュメントごとに値を保存することができる仕組みである。

今回は、スクリプトごとにアクセストークンなどのソースコードにハードコーディングしたくないものを保存する用途で用いる。

以下のような処理を実行することでkey,valueが保存される。(既にkey,valueの組みがあれば更新)

```
let props = PropertiesService.getScriptProperties()
props.setProperty('key', 'value')
```

保存されているkey,valueを取得する場合は以下のようにするだけである。

```
let props = PropertiesService.getScriptProperties()
let value = props.getProperty('key')
```

そのほか削除などもできる。

ここで設定された値は、以前のバージョンのGASのエディタであれば ファイル > プロジェクトのプロパティ から確認可能であったが、新しいエディタではセットされている値をgetProperties()などで取得して確認するしかなさそうである。

![旧エディタでは設定値が確認できた](/images/uploaded/20210517-004539.png)

## まとめ

アクセストークンなど、ハードコーディングしたくないもの、スクリプトごとに値を変えたいものは、Propertyを使うとよい。
key,valueストア形式なため気軽に利用できる。githubなどでGASのコードを公開するときは必須だと思う。
これのAWS版がSecretManagerで、こっちはアクセストークンのローテーションなども可能である。後でfitbitのアクセストークンを保存したときのことを記事にしようと思う。
