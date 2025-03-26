---
title: BrefでLaravelをさくっとデプロイしてみるよー！
description: ""
date: 2025-02-11T05:37:27.649Z
preview: ""
draft: true
tags: []
categories: []
---
# はじめに
Laravelを用いて作ったものをさくっとデプロイして一部の人に共有したくなった。
思いつき程度のものだったので余り時間もお金もかけたくない、ということで、AWS LambdaでPHPを動かすことができるBrefを試してみた。

# brefでのLaravelプレビュー環境の構築
## brefを使った理由
以前からAWS LambdaでPHPを動かしてみたいと思っていた。普段はPHPを書いている人間なので当然である。だがしかし、CDKもLamdbaもPHPを公式にサポートしていないため、ちょっとハードルが高かった。

過去にAWS CDK(Cloud Development Kit)を用いてLamdba+ApiGatewayを構築したことがある。そのくらいにはLambdaにもインフラにも興味がある。

```link
https://qiita.com/myblackcat7112/items/cfd5fa4c6d1e7b60ad1f
```

カンファレンスなどでどうやらbrefというものでそれを叶えることができるらしいと耳にしてからは、どこかでbref使ってみたいなーと思っていた。

```link
https://bref.sh/docs/setup
```

> Bref aims to make running PHP applications simple.
To reach that goal, Bref takes advantage of serverless technologies. However, while serverless is promising, there are many choices to make, tools to build and best practices to figure out.

> Brefは、PHPアプリケーションの実行をシンプルにすることを目指している。 その目標を達成するために、Brefはサーバーレス・テクノロジーを活用している。 しかし、サーバーレスは有望ではあるが、選択すべきこと、構築すべきツール、把握すべきベストプラクティスは多い。
translated by deep L.

つまり、brefは、AWS Lambda上でPHPアプリケーションを簡単に構築できるものである。そして、LamdbaをはじめとするAWSのリソースは使用した分だけの課金体系。コスト面的にも、さくっと手元で動いているLaravelを特定の人にだけ公開するのにはもってこいだった。

## brefの仕組み
brefの中身をコードリーディングを通して解明しているスライド。
```link
https://speakerdeck.com/seike460/a-look-inside-serverless-php-take-a-peek-inside-bref
```

実際に動かしてみた感じ、serverless.ymlに必要な情報を指定して、それをもとにAWS LambdaやS3,deployに必要なIAMロールの設定、ApiGatewayを作るためのCloudFormationテンプレートを作成してくれるのを補助してくれてそう。
もちろん、Lambdaとリクエストの変換みたいなところ、php-fpmが動くLambdaレイヤーの提供などもおこなってくれてそうにみえる。
AWSLambdaなどのサーバレスフレームワークでは、S3にコードを置いておき実行するという方針になっている。また、後述するが画面表示をさせるためには、別途S3に静的ファイルを配置しておく必要がある。

## brefでLaravelをdeployするにあたりやったこと
1. aws cliをインストール
2. deploy用のIAM Identity Centerのユーザーを追加
3. aws-vaultのインストール
4. brefのセットアップ
5. Laravelをdeployする！

### 1. aws cliをインストール
[AWS CLI の最新バージョンのインストールまたは更新
](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/getting-started-install.html)からダウンロードしてインストール。もしくは、homebrewでインストールができそう。

以下のようにバージョンが表示できればインストールは成功。
```sh
% aws --version
aws-cli/2.17.5 Python/3.11.9 Darwin/23.4.0 source/x86_64
```

### 2. deploy用のIAM Identity Centerのユーザーを追加
IAMユーザーを作って認証情報を吐き出すやり方をまずやろうとしていた。が、以下のようにIAM Identity Centerのユーザーを作って認証を行う方法を推奨されたので、そちらで行うことにした。

> 推奨された代替案
ブラウザベースの CLI である AWS CloudShell を使用してコマンドを実行します。 詳細はこちら 
AWS CLI V2 を使用し、IAM Identity Center のユーザーによる認証を有効にします。 詳細はこちら 

IAM Identity Centerにユーザーを作成し、そのユーザーをグループに所属させた。そのグループに所属するユーザーにどんな権限をもたせるかを新たに許可セットを作成する形で実現した。

許可セット: BrefDeployerの追加。brefでdeployするのに必要な権限を持たせている。
グループ: aws-local-access-bref-laravel-deploy-group
ユーザー: aws-local-access-user-for-cli
管理アカウント: もともと作ってあったアカウント

ここで作ったユーザーは、管理アカウントを通じてAWSへのアクセスをすることができる。グループごとに管理アカウントに適用されるアクセス許可セットを指定できるので、aws-local-access-user-for-cliは、BrefDeployerという許可セットを持ったアカウントとして存在できる。

BrefDeployerにアタッチしたポリシー
- AmazonAPIGatewayAdministrator
- AWSLambda_FullAccess
- CloudWatchLogsFullAccess

最終的にカスタマーマネージドポリシーとしてアタッチしたもの(ChatGPTといっしょに不要な権限をできる限り剥がした)
- brefで管理するbucketを定義するためにS3用の権限を追加した。泣く泣く自動生成されるであろうbucketのarnを指定している。
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::bref-laravel-deployer/*",
                "arn:aws:s3:::laravel-dev-serverlessdeploymentbucket-xxxxxx/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": [
                "arn:aws:s3:::bref-laravel-deployer",
                "arn:aws:s3:::laravel-dev-serverlessdeploymentbucket-xxxxxx"
            ]
        }
    ]
}
```

- deployに必要なcloudformationの権限だけに絞ったものを指定
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:CreateStack",
                "cloudformation:UpdateStack",
                "cloudformation:DescribeStacks",
                "cloudformation:DescribeStackEvents",
                "cloudformation:DescribeStackResources",
                "cloudformation:DescribeStackResource",
                "cloudformation:GetTemplate",
                "cloudformation:ListStacks"
            ],
            "Resource": "arn:aws:cloudformation:ap-northeast-1:xxxxxx:stack/laravel-dev/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:ValidateTemplate"
            ],
            "Resource": "*"
        }
    ]
}
```
- STSでちゃんと情報を取れるようにポリシーを定義
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "sts:GetSessionToken",
                "sts:GetCallerIdentity"
            ],
            "Resource": "*"
        }
    ]
}
```

### 3. aws-vaultのインストール
awscliを通じてAWSのリソースを操作するのに、APIの認証情報を使わないといけない。デフォルトでは、~/.aws/credentialsに平文で保存しておき、それをcliで読み取ってリクエストするという形になっている。

認証情報を平文で持っておくのは怖いので、ここではAWS Vaultを使って、MacOS Keychainに保存することにする。

> AWS Vaultは、開発環境でAWSの認証情報を安全に保存し、アクセスするためのツールです。 AWS Vaultは、オペレーティングシステムのセキュアなキーストアにIAM認証情報を保存し、シェルやアプリケーションに公開するために、そこから一時的な認証情報を生成します。 AWS VaultはAWS CLIツールを補完するように設計されており、~/.aws/configにあるプロファイルや設定を認識する。
https://github.com/99designs/aws-vault?tab=readme-ov-file#aws-vault

```link
https://github.com/99designs/aws-vault
```

```link
https://zenn.dev/ryoh/articles/1f7edb4dc6b6b5
```

インストールは、```brew install --cask aws-vault```でやった。
```sh
% aws-vault --version
7.2.0-Homebrew
```

最終的に、.aws/configを以下のようにした。
```
[profile bref-deployer]
sso_session=sso
sso_account_id={アカウントID}
sso_role_name=BrefDeployer

[sso-session sso]
sso_start_url={IdentityCenterで確認できるURL}
sso_region=ap-northeast-1
sso_registration_scopes=sso:account:access
```

以下のコマンドを実行してACCESS_TOKENなどが取得できていればOK
aws-vault exec bref-deployer -- env | grep AWS

```sh
% aws-vault exec bref-deployer -- aws sts get-caller-identity
% aws-vault list
```

### 4. brefのセットアップ
[brefセットアップ](https://bref.sh/docs/setup)に従い、npmでserverlessコマンドをインストールする
```sh
npm install -g serverless@3
```

```sh
% serverless -v
Framework Core: 3.40.0
Plugin: 7.2.3
SDK: 4.5.1
```
[Serverless Laravel - Getting started](https://bref.sh/docs/laravel/getting-started)に従い、設定した。
Laravelの場合は、bref/laravel-bridgeなるライブラリがあるので、これをインストールする。
serverless.ymlを生成してくれるコマンドを叩いておく。
```sh
composer require bref/bref bref/laravel-bridge --update-with-dependencies
php artisan vendor:publish --tag=serverless-config
```

ただし、composerでインストールする際に、PHPのバージョンが合わないなどで、composer.jsonに以下の記述を追加している。
```json
    "minimum-stability": "dev",
```
[minimum-stability と prefer-stable について](https://zenn.dev/mpyw/articles/a99f3087829993#minimum-stability-%E3%81%A8-prefer-stable-%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)

### 5. LaravelをDeployする
Laravelは、以下のリポジトリをベースにローカルで動くようにした。
```link
https://github.com/kuroneko913/php-practice-docker-laravel
```

以下のようにserverless.ymlを設定している。
- .envファイルに書いてあった環境変数の設定
- packageの部分ではどのファイルをS3にアップロードするか、除外するかを指定
- functionsではLambdaに関する設定。サポートするPHPのバージョンが提供されているランタイムを指定している。
- serverless-s3-syncというプラグインを指定することで、静的ファイルに変更があったらそれをdeploy時に同期するように設定している。

```yml:serverless.yml
service: laravel

provider:
    name: aws
    # The AWS region in which to deploy (us-east-1 is the default)
    region: ap-northeast-1
    # Environment variables
    environment:
        APP_ENV: production # Or use ${sls:stage} if you want the environment to match the stage
        SESSION_DRIVER: cookie # Change to database if you have set up a database
        APP_NAME: Laravel
        APP_KEY: base64:xxxxxxx
        ASSET_URL: https://bref-laravel-deployer.s3.amazonaws.com
        BASIC_AUTH_USER: xxxxxxx
        BASIC_AUTH_PASSWORD: xxxxxxx
package:
    patterns:
        - '!node_modules/**'
        - '!storage/logs/**'              # ログファイルを除外
        - '!storage/framework/views/**'   # viewキャッシュを除外
        - '!storage/framework/sessions/**'# セッションを除外
        - 'storage/framework/cache/**'    # キャッシュのみ含める
        - '!public/css/**'      # public配下の静的ファイルを除外
        - '!public/js/**'
        - '!public/images/**'
        - 'vendor/**'
        - 'bootstrap/**'
        - 'public/**'
        - 'config/**'
        - 'routes/**'

functions:

    # This function runs the Laravel website/API
    web:
        handler: public/index.php
        runtime: php-82-fpm
        timeout: 28 # in seconds (API Gateway has a timeout of 29 seconds)
        events:
            - httpApi: '*'

    # This function lets us run artisan commands in Lambda
    artisan:
        handler: artisan
        runtime: php-82-console
        timeout: 720 # in seconds

plugins:
    # We need to include the Bref plugin
    - ./vendor/bref/bref
    - serverless-s3-sync

custom:
    s3Sync:
        - bucketName: bref-laravel-deployer
          localDir: public
```

あとは、aws-vault exec bref-deployer -- serverless deploy を実行すると、権限などが足りていればLambdaとしてDeployされる。

CloudFormationを開いてみると、LambdaやS3,Log,ApiGateway,IAMなどのリソースが作成されていた。

