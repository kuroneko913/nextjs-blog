---
title: Laravelでsqliteを使った時にハマったこと。
date: 2021-10-12T05:59:44.425Z
description: DBをmysqlからsqliteに切り替えた時に悩んだので、ここにメモを残しておく。
---
Laravelのデータベースに関する設定は、config/database.phpで定義されており、
.envファイルでどのデータベースを使うかを切り替えることができる。

このとき、使用するデータベースにmysqlを使っていたアプリケーションで、データベースをファイルベースのsqliteに切り替えようとした際に、DBが見つからない、とのエラーをPDO様からいただいてしまい、
しばらく悩んだので、ここにメモ程度に書いておくことにする。

結論。
sqliteに切り替える際は、
.envファイルの
DATABSEに関する以下の項目を、

```
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=laravel
DB_USERNAME=name
DB_PASSWORD=password
```

以下のように、DB_CONNECTION=sqliteだけにすること！

```
DB_CONNECTION=sqlite 
```

[Laravelでsqliteデータベースを使ってみよう](https://reffect.co.jp/laravel/laravel_sqlite)
という記事に書いてあった以下の1行のおかげでエラーは無事解消された。
 
> DB_DATABASEを削除しないとIlluminate\Database\QueryException : Database (homestead) does not exist.のエラーが発生します。ファイル名を変更した場合はDB_DATABASEにファイルのパスを指定してください。


また同じことで悩まないようにこの情報をメモ程度に残しておく。