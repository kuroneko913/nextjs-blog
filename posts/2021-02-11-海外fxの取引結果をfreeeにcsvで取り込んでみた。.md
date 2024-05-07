---
title: 海外FXの取引結果をFreeeにCSVで取り込んでみた。
date: 2021-02-11T09:43:56.460Z
description: 海外FXの取引結果を確定申告とやらをするために、会計アプリFreeeにアップロードした話。Freeeには、CSVアップロード機能があるので、MT4からダウンロードした取引結果をもとにCSVファイルを生成してアップロードした。
---
## はじめに

私は、海外FXを自動売買システムを使って行っています。
学生時代は、自分でFXの自動売買システムを作るんだ！と意気込んでいましたし、MQLを少し勉強していました。そして、取引ロジックを自分で見つけるのは難しすぎるということに気づいて以来、他人の作ったシステムを利用させていただき運用しています。

海外FXの自動売買では利益は(資金を増やした際の設定ミスにより)まったく出ていませんが、ふるさと納税と副業の収益に関しては、確定申告をする必要があったので、ついでにFXの損失申告もしておこうとなった次第です。その際に、会計アプリFreeeに取引損益を管理してもらえると一元管理ができて楽そうだったので、FX取引ソフトMT4での取引結果からCSVを生成し[Freee](https://www.freee.co.jp/)へ取り込みました。

## MT4での自動売買結果の取得

[MetaTrader4:MT4](https://www.metatrader4.com/ja)と呼ばれる取引ツールから、まず全取引履歴をダウンロードしました。

以下に示すのがVPS([Conoha](https://www.conoha.jp/vps/?btn_id=header_vps))上で動いているUbuntuにWineを入れて無理やり動かしているMetaTrader4というソフトです。いろいろとカラフルなグラフは、インジケータというもので、これをみながら取引のタイミングを探します。
(私は、今はつかってません、見た目がそれっぽいのでこれを選んだだけです笑)

![MetaTrader4](/images/uploaded/20210211-193738.png)

なぜか、CSVダウンロードがサポートされておらず、xlsファイル(Excel形式)をダウンロードして、GoogleSpreadSheetにアップロードしてCSVファイルに変換してダウンロードするという謎の工程を踏んでいます。
最終的に以下のようなファイルを得ました。取引開始時刻,取引終了時刻,取引種類(通貨ペア,buy or sell),損益などがまとまってます。この図の部分だとギリギリ負けてる気がする...... 

![実際の取引CSV](/images/uploaded/20210211-200044.png)

## 会計freeeに取引損益をCSVでアップロードする

まず、損益管理のために、Freeeに現金の口座(FX収益)を登録しました。この現金の口座を登録することで柔軟な資金管理が可能になると思います。

この登録した口座に、[取引・口座振替のインポート](https://support.freee.co.jp/hc/ja/articles/202847320?_ga=2.130420360.684241821.1613031431-1312080387.1612684829)を参考に、提供されている雛形CSVファイル形式のデータをアップロードすることで連携を実現します。

今回作るCSVファイルには、以下のような項目があります。

「収支区分,管理番号,発生日,決済期日,取引先コード,取引先,勘定科目,税区分,金額,税計算区分,税額,備考,品目,部門,メモタグ（複数指定可、カンマ区切り）,セグメント1,セグメント2,セグメント3,決済日,決済口座,決済金額」

これらの項目のうち、必須項目が「収支区分,発生日, 勘定科目, 税区分, 金額, 決済日, 決済口座, 決済金額」なのでこれらを埋めていきます。

FXでの取引は、勝てば収入、負ければ支出なので、収支区分を損益額の正負で判定します。勘定科目は「雑収入」でいいと思います。というような感じでダウンロードしたCSVをFreee連携用のCSVに書き換えていきます。

手作業だと結構手間なので、Pythonでスクリプトを書いて実現しました。

とりあえず、ダウンロードしたCSVファイルをpandasで読み取りDataFrameにします。できたDataFrameを画面に表示してざっくりと状況を把握します。

```ipynb
import pandas as pd 
file_path = '~/Downloads/Statement202102.xls.csv'
df = pd.read_csv(file_path)
print(df)
```

次に、作成するCSVのヘッダーを定義しておきます。

```ipynb
header = '収支区分,管理番号,発生日,決済期日,取引先コード,取引先,勘定科目,税区分,金額,税計算区分,税額,備考,品目,部門,メモタグ（複数指定可、カンマ区切り）,セグメント1,セグメント2,セグメント3,決済日,決済口座,決済金額'
```

今回出力する範囲は、2020年の取引のみなので、その範囲のみのDataFrameを作成します。
そのDataFrameに対して、Profitの値が、文字列になっており、4桁以上だと変な空白が含まれてしまいintとして認識されなかったので空白を除去する前処理を行い、収入・支出を正負で判定し、「収支区分」に値をセットすると言ったことをひたすら書いていきます。

```ipynb
target_df = df[((df['Open Time']>='2020.01.01') & (df['Open Time']<='2020.12.31'))]
target_df_ = target_df
print(target_df_.tail())
target_df_['Profit'] = target_df['Profit'].str.replace(' ','')
target_df_.loc[target_df_['Profit'].astype('int')>0 , '収支区分'] = '収入'
target_df_.loc[target_df_['Profit'].astype('int')<0 , '収支区分'] = '支出'
target_df_['Profit'] = target_df_['Profit'].astype('int').abs()
target_df_['発生日'] = pd.to_datetime(target_df_['Close Time'], format="%Y.%m.%d").dt.strftime('%Y/%m/%d')
target_df_['勘定科目'] = '雑収入'
target_df_['税区分'] = '課税売上'
target_df_['金額'] = target_df_['Profit']
target_df_['決済金額'] = target_df_['Profit']
target_df_['決済日'] = pd.to_datetime(target_df_['Close Time'], format="%Y.%m.%d").dt.strftime('%Y/%m/%d')
target_df_['決済口座'] = 'FX収益'
target_df_['メモタグ（複数指定可、カンマ区切り）'] = target_df_['Ticket'].astype('str')
print(target_df_.tail())
```

ここまでで得られたDataFrameには不要な項目が残っているので、不要な項目を除去した新しいDataFrameを作成し、先ほど追加した必須項目等の値を適用しています。また、数字がない部分の除去や何故か小数表示されている金額があったのでそれをここで強制的にintにするなど最後の処理を行っています。

```ipynb
target = pd.DataFrame({k:['']*len(df) for k in header.split(',')})
target[['収支区分','発生日', '勘定科目', '税区分', '金額', '決済日', '決済口座','決済金額','メモタグ（複数指定可、カンマ区切り）']] = target_df_[['収支区分','発生日', '勘定科目', '税区分', '金額', '決済日', '決済口座','決済金額', 'メモタグ（複数指定可、カンマ区切り）']]

target = target.dropna()
target['決済金額'] = target['決済金額'].astype('int')
target['金額'] = target['金額'].astype('int')
```

最後に、出来上がったDataFrameをCSVに書き出して完了です。

```ipynb
target.to_csv('~/fx_for_freee.csv',sep=',',index=False)
```

出来上がったCSVは以下のようなものです。

![Freee連携用CSV](/images/uploaded/20210211-203222.png)

あとはこれをFreeeに食わせてあげると、以下のようになります。これでどの程度損益を得ているのかをFreeeで管理できるようになります。

![Freeeに取り込まれた結果](/images/uploaded/20210211-203647.png)

## まとめ
MT4で取引された取引履歴をCSVに変換し、それをFreeeに連携するためのCSVに変換しました。これにより、FreeeでFXの損益を一元管理できるようになりました。
できれば、自動で連携していてくれると助かるんだけどなぁ...... (あとで考えます)