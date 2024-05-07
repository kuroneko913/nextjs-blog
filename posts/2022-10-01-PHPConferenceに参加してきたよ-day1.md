---
title: 2022-10-01-PHPConferenceに参加してきたよー！1日目
date: 2022-10-01T09:33:55.840Z
description: 2022-10-01-PHPConferenceに参加してきたよー！1日目
---
# はじめに
お仕事やプライベートで素のPHPやLaravelを触っているので、[PHP Conference Japan 2022](https://phpcon.php.gr.jp/2022/)に所属する会社の先輩後輩も登壇するとのことでその応援も兼ねて参加してきた。

3年ぶりの現地開催とのこと( [PHP Conference Japan 2019](https://phpcon.php.gr.jp/2019/) もちゃんと参加してた)で、リアルイベントが大好きな私は当然現地参加した。
もらえるノベルティをかたっぱしからかっさらいつつ、Twitterでハッシュタグをつけて感想を呟き、会社のtimes_にもメモを投稿しながら参加させていただいた。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr"><a href="https://twitter.com/hashtag/phpcon2022?src=hash&amp;ref_src=twsrc%5Etfw">#phpcon2022</a> <a href="https://twitter.com/hashtag/MetaQuest2?src=hash&amp;ref_src=twsrc%5Etfw">#MetaQuest2</a> <br><br>ノベルティをとりあえずパシャリ。 <a href="https://t.co/i560oQaDHC">pic.twitter.com/i560oQaDHC</a></p>&mdash; まさき。⛅ (@myblackcat7112) <a href="https://twitter.com/myblackcat7112/status/1573837947685998592?ref_src=twsrc%5Etfw">September 25, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

そうそう、今回のカンファレンスで一番ハッとさせられたのは、「プライベートの趣味が、たまたま PHPだった」という発言かもしれない。


# 1日目に見たトークと思ったことをざっくばらんと。
たぶん、最初だけめっちゃ書いて途中から適当になるかもだけど、ただ単に気力が失われているだけなので気にしないで欲しい。

## [17年続くWebサービスを改善する 〜新卒2年目からみるカラーミーショップ〜 ](https://fortee.jp/phpcon-2022/proposal/6669e288-563e-49c5-be45-3871c730b6ab)

カラーミーショップを運営するGMOペパボのスポンサーセッション。
前半は Feature toggles (フィーチャートグル) を活用した漸進的な開発の話だった。Feature toggles とは、UIなどを含めた機能の有効・無効をif文などで切り替えるものだそうだ。

これにより大きい開発案件は完成するまでリリースできなかったが、できたところまでリリースすることが可能になるそうだ。
> 数ヶ月などの長い期間存在するfeature branchをリリース直前に一度にmainにmergeしていました。feature flagで新機能をOFFにすることで、短いサイクルでmainにmergeして本番環境にdeployしてしまう運用が可能になります。
[軽量feature flag導入の手引き](https://qiita.com/behiron/items/de1b082e60f7b4ade773)

また、一部のユーザーにだけ機能を公開するといった使い方やABテストなどの短期間の実験的取り組みにも使えるものだった。
* [小さく安全なリリースを実現するために使える「フィーチャートグル」って何？年収は？彼女は？調べてみました！](https://qiita.com/ipeblb/items/92b794321751a6fa133e)

ただし、実装自体はif文の追加になるのでトグルの切り替えはソースコードのデプロイが発生する。切り替えのたびにデプロイするのはだるい！ということで、
[unleash](https://www.getunleash.io/) というトグルマネジメントサービスを導入しているらしい。
[高機能な Feature Flag サービス「Unleash」のデモを試した](https://kakakakakku.hatenablog.com/entry/2022/01/12/152452)で、Unleashが提供しているデモのやり方などが紹介されているのでこれを見ながら実際に触ってみると面白い。このデモのStep2では自分のUserIdを有効に指定すると画像が出てくるという体験ができ、わかっていても声が出てしまったw

![Unleashのデモ](/images/uploaded/20221001-134652.png)

Feature toggles を用いて大きい開発案件をこまめにリリースしたり、一部のユーザーだけに限定公開するのはぜひうちのプロダクトでも取り入れていきたいな、と思った。

[カラーミーショップの改善におけるSRE活動について](https://speakerdeck.com/homirun/karamisiyotupunogai-shan-niokerusrehuo-dong-nituite?slide=23)

後半はSRE関連のお話がメインだった。
所属する会社でもSLI/SLOを決めたいよね！という動きがありプロダクトの機能や実装上の知見を提供する形で私も関わらせていただいているので、うちの動きは間違ってなかったんだな、とかSLI/SLOベースでの開発に活かしていきたいよねーとか思った。
特に、エラーバジェットを使い切った時の対応のあり方は参考にしていきたいと思う。

## [AWS CDK に魅入られた PHPer がオススメする IaC から入るインフラの話](https://www.slideshare.net/chatii0079/aws-cdk-phper) 
<iframe src="//www.slideshare.net/slideshow/embed_code/key/bL3PC8X1KpriIC" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/chatii0079/aws-cdk-phper" title="AWS CDKに魅入られた PHPer がオススメする" target="_blank">AWS CDKに魅入られた PHPer がオススメする</a> </strong> from <strong><a href="//www.slideshare.net/chatii0079" target="_blank">Taichi Inaba</a></strong> </div>

アプリケーション側の人間だってインフラを知っておいて損はない！！ところでAWS CDKというプログラムを書く感覚でインフラを作れるものがあるんだけどこれいいぜ！って話だった。
インフラもわかる先輩いるけど、大体必要に駆られてできるようになっただけなんだぜ、って話を聞いて妙に納得した。

[AWS Cloud Developer Kit](https://aws.amazon.com/jp/cdk/)
このセッションはPHP版のCDKがまだないのでTypeScriptでどうやって使うかを説明してくれていた。

ここら辺も見ながら、あとでAsanaのWebHookのやつをCDKで書いてデプロイを試してみようかな。
[AWS CDKの学習方法 ドキュメントや学習コンテンツをまとめてみる](https://dev.classmethod.jp/articles/aws_cdk_learning_method/)

## [リリースして11年経過したPHPアプリケーションにPHPStanを導入した](https://speakerdeck.com/tasuku43/php-conference-japan-2022)

Chatworkで静的解析ツール([PHPStan](https://phpstan.org/))を導入した時の話。本番環境でエラーが発生しちゃったことがあるが静的解析ツールでこれを回避できるらしいということで導入を決めたらしい。 

この導入の過程で [PHPStanのPlayground](https://phpstan.org/try)でエラーレベルごとにどんなエラーが引っかかるのかを確認したり、baselineという設定を使って本当に出したいエラーだけを出すように設定した話が印象に残っている。

特に既存のエラーは検知対象外とすると言う点は、この手のツールを導入する時の敷居を下げるために必須だと思う。
また、テストコードをまだ書けていないコードに対しても静的解析は有効なので、まずは自分がプライベートで書いたコードに対してCIに追加して試してみようかな、と思った。

[リリースして11年経過したPHPアプリケーションにPHPStanを導入した](https://creators-note.chatwork.com/entry/2022/05/24/084828)
[level=0 から始める PHPStan(Larastan) 導入ガイド](https://blog.shin1x1.com/entry/getting-stated-with-phpstan)

PHPStanと組み合わせたら強そう。
[GitHub Actionsでreviewdogを飼って静的解析してみる](https://zenn.dev/peraichi/articles/01fy360dgteynbfv5tj3q6smv5)

[deptrac](https://github.com/qossmic/deptrac)も気になる。
[アーキテクチャのコード品質を守りたい！](https://zenn.dev/ysit/articles/layered-architecture-lint-check)

## [フィーチャートグルを使って素早く価値を検証する 早く安全に失敗し学ぶために ](https://speakerdeck.com/akki_megane/huitiyatoguruwo-shi-tutesu-zao-kujia-zhi-wojian-zheng-suru)

フィーチャートグルの中でも Experiment Toggles (実験トグル)と呼ばれるもので、ユーザーごとに切り替えて使うものの話だった。これを用いてさくっと実装して安全に実験してユーザーの反応を見て、本実装に入るかを検討するようだ。
具体的にはフロントエンドの実装はコンポーネントの出し分け、バックエンドはAPIエンドポイントの追加で実現する。特に後者ではGAS, Lambdaなどの外部リソースでさくっと作りエンドポイントの有効無効を切り替えることで実現するようだ。

本実装だとめっちゃ時間かかるけど最低限の機能の実装だけして反応見ることで、ビジネス判断の材料を得られるのはすごい有効な手段だと思う。今取り組んでいる案件を思い浮かべながら、この仕組みを適用できないかちょっと考えてみようかなと思った。

## [ローンチから16年目のWebサービスに、どうやってフィーチャートグルを導入したか、運用しているか / phpcon2022](https://speakerdeck.com/meihei3/phpcon2022-e259c9cb-1462-4e0a-b22c-20327532bbee)

こちらの話も1度のリリースでの変更量を減らしたいのでフィーチャートグルを使いました、という話だった。PR Timesではフィーチャートグル(リリーストグル)を使うことなどでリリース頻度も向上させることができたらしい。

> Release Toggleを用いて開発中の機能をOFFにすることで、未完成の機能をメインブランチにマージしながら開発を進めることができます。これにより、「機能のリリースとコードのデプロイを分離する」ことが可能になります。
[小さく安全なリリースを実現するために使える「フィーチャートグル」って何？年収は？彼女は？調べてみました！](https://qiita.com/ipeblb/items/92b794321751a6fa133e#release-toggle)


## [20年ものの巨大レガシープロダクトを PHP 8.0にアップデートした際の対策と得られた知見](https://speakerdeck.com/akamah/20nian-mononoju-da-regasipurodakutowo-php-8-dot-0niatupudetositaji-nodui-ce-tode-raretazhi-jian)

サイボウズのGaroonのバージョンアップの話だった。
7系から8.0にバージョンアップする際に変更箇所を全部確認し、問題なく動作するか確認する必要があったらしい。さらにGaroonは毎月その月版Garoonを開発している？そうなので影響範囲の調査が大変だったそう。その際の調査としてバージョンアップの影響を受ける関数がそのファイルに含まれているかを調査することで、調査コストを減らすことができたらしい。
さらにGaroonではPHPそのものにパッチを当てているらしく、アプリケーションだけの問題ではないので、PHPのバージョンだけを上げたブランチを作り、それがちゃんと動くことを確認したらしい。
比較演算子の挙動に関しては、ソースに直接手を入れて、前のバージョンと現在のバージョンのメソッドを内部で実行し、その結果が異なる場合にログを吐き出すようにし、その都度処理を確認していったそう。

PHPにパッチを当てて運用しているからこそできるアイディアだが、正直この規模になってくるとこの方法くらいしかなさそうな気がする... バージョンアップこわい...
新規開発にも、既存開発でも自動的に問題を見つける仕組みを導入するのはいい方法だと思う。

そのほかにもnullを新たに受け入れるようになった関数があるらしく、それらの挙動にも気をつけなければ、と思うのだった。


## [続CPUとは何か / What is a CPU continued](https://speakerdeck.com/tomzoh/what-is-a-cpu-continued-e3c0ab67-5139-4f90-aa12-5d9fa924274f)

CPU(Z80)をソフトウェアエミュレーターとして再現し、その出力信号をラズパイのGPIOで出力することで、ハードウェアエミュレーター(Z80と同じように振る舞うハードウェア)を作ってしまおうと言う話だった。

うん、本人も宣言してたとおり、一ミリもPHPの話してないw スライド1枚だけ一瞬触れてる
作ってみることで見えるものがあるのが伝わってきたのは間違いない。

# 全体を通しての感想

Feature Toggles の話が多かった。うちのプロダクト開発にもなんらかの形で取り入れられたら開発速度が向上できるかもしれないとは思った。
AWS CDKしかり、PHP Stanしかり、どちらも実際に手で動かしてみたいと思った。

# まとめ
実際に現地で聞いた1日目の発表に関してslackのメモなども見ながらまとめた。
3年前に比べるとカンファレンス全体を楽しむ余裕ができた気がする。PHP力も少しはついているのかな？
皆様発表お疲れ様でした！！

2日目に聞いた発表とアーカイブでキャッチアップした発表もブログとして残してみようと思う。
I will blog! #phpcon2022

