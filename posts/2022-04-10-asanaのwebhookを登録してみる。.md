---
title: AsanaのWebhookを登録してみる。
date: 2022-04-10T14:20:45.429Z
description: AsanaのWebhookを登録するところまでの備忘録。
---
## はじめに

前回、こんな記事を書いた。

[やりたいこと・やらなきゃいけないことをゲーム感覚でこなす仕組みを考えてみたよ。](https://myblackcat913.com/2022-01-23-%E3%82%84%E3%82%8A%E3%81%9F%E3%81%84%E3%81%93%E3%81%A8%E3%83%BB%E3%82%84%E3%82%89%E3%81%AA%E3%81%8D%E3%82%83%E3%81%84%E3%81%91%E3%81%AA%E3%81%84%E3%81%93%E3%81%A8%E3%82%92%E3%82%B2%E3%83%BC%E3%83%A0%E6%84%9F%E8%A6%9A%E3%81%A7%E3%81%93%E3%81%AA%E3%81%99%E4%BB%95%E7%B5%84%E3%81%BF%E3%82%92%E8%80%83%E3%81%88%E3%81%A6%E3%81%BF%E3%81%9F%E3%82%88%E3%80%82/)

Asanaを使って日常のタスク管理をするというものである。
これによって確かにタスクはわかりやすくなった。やるべきことは明確になったし、期限もわかるようになった。ただし、タスクを完了しても完了したという事実だけがあり、それに対して誰も何のリアクションもくれない... (あたりまえ)

そこでタスクの完了をトリガーに、自動で褒めてくれる仕組みを考えている。(褒めるのセルフサービス)

AsanaにはWebhookが用意されているので、その一歩としてWebhookを登録してみる！

## Webhook

### webhook ってなんだっけ？

SlackとかGithubとかそのようなWebサービスにはAPIの他にWebhookと呼ばれるものが存在している。
簡単に言ってしまえば、それらのサービスで何らかの「イベント」が発生したときに、「イベント」が発生したことをあらかじめ登録してあるエンドポイントへのPOSTリクエストによって通知してくれるものである。

> 「SlackのWebhook使おうぜ！」
> と言われたら
> 「ユーザーが投稿などをした際に、Slackが指定したURLにPOSTリクエストしてくれるから、それ使おうぜ！」
> と言っているものだと思えば良いと思います。
> [Webhookとは？](https://qiita.com/soarflat/items/ed970f6dc59b2ab76169#%E7%B5%82%E3%82%8F%E3%82%8A)

これを使うことによりイベントが発生するのを検出するためにWebAPIのリクエストを頻繁に送るようなことをしなくて済む。

## AsanaへWebhookを登録する

### AsanaのWebhook

詳しくはAsanaの[Webhook](https://developers.asana.com/docs/webhooks)
のドキュメントを読んでいただきたいが、Asanaのタスクやプロジェクトなどが追加・更新・削除されたことなどを知ることができるものである。

### AsanaのWebhook handshake

AsanaのWebhookを利用するには、WebhookURLなどの情報を持たせたPOSTリクエストを送り、WebhookURLで指定したエンドポイントにAsana側からリクエストが飛ぶのでそのリクエストを受け取り再度、Asana側に送ってあげるということをする必要がある。(handshake)

このとき、Asana側から送られるリクエストのヘッダーに含まれるX-Hook-Secretという値をWebhookURLのエンドポイントからのレスポンスのヘッダーに含める必要がある。
これにより、確かにWebhookURLが生きていること、Asanaからの情報を受け取れることを証明する。

## WebhookURLの準備

先述したようにWebhookのエンドポイントには、Asana側からリクエスト時に付与されるX-Hook-Secretなる値を読み取ることが要求される。ただのPOSTリクエストを受け取るエンドポイントであれば、GASでPOSTリクエストを受け付けられるようにしておけばいいのだが、どうやら現状のGASではリクエストヘッダーの値を確認することができないようだ。

> GAS の Web App ではリクエストヘッダーにアクセスすることができません。
> [Google Apps Script (GAS) で Slack 連携を実装する前に知っておくとよい 5 つのこと](https://qiita.com/seratch/items/2158cb0abed5b8e12809#gas-%E3%81%AE-web-app-%E3%81%A7%E3%81%AF-x-slack-signature-%E3%82%92%E6%A4%9C%E8%A8%BC%E3%81%A7%E3%81%8D%E3%81%BE%E3%81%9B%E3%82%93)
>
> なお、doPost()のパラメータオブジェクトにHeader情報を直接取得できるプロパティはないと思います。
> （少なくともリファレンスではそのような記述を見つけることはできませんでした）
> 別途調べたところ、ChatWorkでは類似の問題（doPostでのヘッダー情報取得）への対応をしたばかりです。
> [HTTPリクエストのヘッダに含まれる値取得し、その値をヘッダに含めてレスポンスを返したい](https://teratail.com/questions/117983)

そのため、今回はWebhookのエンドポイントにAWSの[API Gateway](https://ap-northeast-1.console.aws.amazon.com/apigateway)を使うことにした。

/AsanaTaskWebhookReceiver に POSTリクエストしたら、X-Hook-Secret付きのレスポンスを返すLambdaをキックするようにする。

![API Gatewayで定義したエンドポイント](/images/uploaded/20220411-002010.png)

![API Gatewayテスト結果](/images/uploaded/20220411-002747.png)

なお、API Gatewayへのエンドポイントの作成は、Lambda側から行ったのち、POST統合リクエストのページからLambda関数を再度指定して更新している。

> 上記のLambda関数を再度選んで右側にあるチェックするとAPIを作成した時の同様のポップアップが出てくるので「OK」します。権限が付与されたのでもう一度テストしてみると成功しました。
[[小ネタ]Lambda統合を使用したAPI Gatewayのエクスポート→インポートの注意点](https://dev.classmethod.jp/articles/api-gateway-export-import/)

![lambdaとの連携を再度設定する必要があった](/images/uploaded/20220401-011602.png)


![Lambdaとの関係](/images/uploaded/20220411-003147.png)

以下のようにPythonでリクエストを受け取り、レスポンスを返す簡単なコードをLambdaで実装している。

```python
import json
import requests

def lambda_handler(event, context):
    secret = event['headers']['X-Hook-Secret']
    return {
        "statusCode":"200",
        "headers": {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Hook-Secret': secret
        }
    }
    
```

## Webhookの登録
curl でリクエストした際にはどうにもあんまりうまくいかなかったので、AsanaのPythonライブラリを用いてローカルからPythonでWebhookを登録した。(おそらくfiltersの部分のJSON表記がうまく書けてなかったのだと思う)

```python
import asana
token = '<AsanaAccessToken>'
client = asana.Client.access_token(token)
client.headers['Asana-Enable'] = '1234567'
req = {
    'resource':'<RESOURCE_ID>',
    'target':'<apiGateWayで実装したWebhookエンドポイント /default/AsanaTaskWebhookReceiver >',
    "filters": [{"action":"changed","fields": ["completed"],"resource_type": "task"}],
}

res = client.webhooks.create(req)
print(res)
```

以下のように登録内容が含まれたレスポンスが得られればWebhookの登録には成功している。
```json
{'gid': '<webhook-gid>', 'resource_type': 'webhook', 
'resource': {'gid': '<resouce-gid>', 'resource_type': 'project', 'name': 'マイホームワーク'}, 
'target': '<API GateWayで実装したWebhookエンドポイント /default/AsanaTaskWebhookReceiver >', 'active': True, 'filters': [{'resource_type': 'task', 'resource_subtype': None, 'action': 'changed', 'fields': ['completed']}], 'created_at': '2022-03-31T16:13:51.843Z', 'last_failure_at': None, 'last_failure_content': '', 'last_success_at': '2022-03-31T16:13:53.125Z'}
```

といってもこのほとんど[How to use Asana Webhooks with AWS Lambda (Python)](https://sharon-53595.medium.com/how-to-use-asana-webhooks-with-a-aws-lambda-function-python-3c24ef068474)の通りである。

API Gatewayの設定で、{internal server error} が返されて困っていたので以下の記事も参考にして解消している。
[API Gateway {“message”:”Missing Authentication Token”} が返ってきた時](https://bokuranotameno.com/post-10884/)

ちなみにこのエンドポイントに直接リンクでアクセスした際に internal server error が出るのは、X-Hook-Secretを与えてないから当然である。

またAPIのログを記録するために、IAMロールを作成し追加している。

[API ゲートウェイ REST API または WebSocket API のトラブルシューティングのために CloudWatch Logs を有効にするにはどうすればよいですか?](https://aws.amazon.com/jp/premiumsupport/knowledge-center/api-gateway-cloudwatch-logs/)

その他にもこの記事を見たりして理解を深めた。
[AWS APIGatewayからLambdaへリクエストヘッダー情報を受け渡す](https://qiita.com/kobayashim_21/items/19dba5d3ef8955f3b2d1)


## まとめ
タスク完了時に通知をするため、AsanaのWebhookを使いたかった。
リクエストヘッダーの値を取得できないGASではAsanaのWebhookエンドポイントを作ることができないことがわかった。
そこでAWSのAPI Gatewayでエンドポイントを作成し、Lambdaをキックすることでエンドポイントを実装できた。
ローカル環境からこのエンドポイントを叩くことでAsanaへWebhookが登録されるのを確認した。

