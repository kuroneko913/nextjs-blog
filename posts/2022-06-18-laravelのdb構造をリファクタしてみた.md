---
title: LaravelのDB構造をリファクタしてみた。
date: 2022-06-18T18:46:17.360Z
description: 以前に作成したテーブルが中途半端な関係テーブルだったのでリファクタすることにした。
---
# はじめに
副業で2年くらい前にLaravelで作ったWebサイトがある。本当はLaravelを使う必要はほとんどないのだが、わがままを言ってLaravelで作成させていただいた。そのサイト専用のCMSを作ると言う点ではなかなか良い勉強になった。  

ただし、その頃はLaravelを勉強しながらサイトを作っていたし、実業務でもあまりテーブル設計やテストコードの実装などをやっていなかったのもあり、メンテナンスの観点ではまだまだ未熟なものである。

たとえば、今回は全体的にテストコードを拡充し、Laravelのバージョンアップの準備を進めようと思っていたのだが、そこにあったのはテストを書くのも一苦労するようなControllerに処理が直書きされているようなコードだった。
このControllerのテストを書きながら、Ajaxで記事をリクエストする処理がイケてないことに気付きリファクタを始めた。(どの記事を見ながら書いたのか忘れたが、ControllerでURLを生成し、それをテンプレートに埋め込まれたjsへ渡し、再検索をかけるためajaxエンドポイントにgetでリクエストしているようなコードだ... 自分で書いておきながら恐ろしいコードである...)

そのように非同期での記事検索を本来あるべきajaxでの実装に置き換えたとき、既存の機能のうち動かない部分を見つけた。そのサイトの記事にはキーワードを表すタグが付いているのだが、そのタグの付いている記事を正しく検索できなくなっていたのだ。

そのサイトではタグの文字列を用いて検索するようにしていたが、POSTエンドポイントとはいえど入力される値の形式は整えておきたいとのことでそのタグを管理するIDで検索するように変更していた。だがどうやらそのタグのIDが正しく取得できていないと言うことが判明し、はじめてDBをみることにしたのだった...

table:tags
|id|name|column_id|created_at|updated_at|
|--|--|--|--|--|
|1|タグ1|1|||
|2|タグ1|2|||
|3|タグ2|2|||
|4|タグ3|2|||

上記のようなテーブル構造をしていた。おそらく作成当初はタグを使う場所なんてあんまりないし、完全な関係テーブルにする必要はないと判断したのかもしれない... (それでも完全な関係テーブルにしておくべきだっただろう...)

このテーブルにおいてIDはnameとcolumn_idのペアに対するものであり、本来のtagに対してのものではない。そのため、nameではなくidで単純に検索をかけると、同じタグ文字列なのに別なIDでヒットするというものになってしまっている。タグ一覧の画面で3つのタグだけが表示されることを期待したのに、nameが同じでもidが異なるので4つのタグが表示されるという間抜けな状態になってしまった。


そこでこの問題を解消するために、tagsとcolumnsという2つのテーブルの関係テーブル tag_columnsに分割することにした。

# やること
中途半端に実装されてしまった関係テーブルもどきを以下のように完全な関係テーブルにする。

table:tags
|id|name|created_at|updated_at|
|--|--|--|--|
|1|タグ1|||
|2|タグ2|||
|3|タグ3|||

table:tag_columns
|id|tag_id|column_id|created_at|updated_at|
|--|--|--|--|--|
|1|1|1|||
|2|1|2|||
|3|2|2|||
|4|3|2|||

# やったこと
まず元のテーブルをリネームし、完全に参照用のテーブルにした。

```sql
-- rename table
ALTER TABLE tags RENAME TO tags_bk;
```

新しくtags(タグの情報しか持ってない本来の意味のtags)とtagsとcolumnsの関係だけを定義した関係テーブル tag_columnsをそれぞれ定義する。(SequelProで新しいテーブルを作成しカラムを追加してから、TableInfoをコピペしたものが以下のもの)

```sql
-- create table tags
CREATE TABLE `tags` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- create table tag_columns
CREATE TABLE `tag_columns` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `tag_id` int(11) DEFAULT NULL,
  `column_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8; 
```


もともとのテーブル(tags_bkにリネームされている)からtagsに入るべき情報だけを引っ張ってきてINSERTする。
```sql
-- もともとのテーブルをtags_bkとしデータを入れ直す。
INSERT INTO tags(name,created_at,updated_at)
select distinct name,NOW(),NOW() from tags_bk;
```

関係テーブルも同様にtags_bkとtagsから入るはずの値を検索してきてINSERTした。

```sql
-- 関係テーブルにINSERT
INSERT INTO tag_columns(tag_id,column_id,created_at,updated_at)
select tags.id,column_id,tags_bk.created_at,tags_bk.updated_at from tags_bk
inner join tags ON tags.name = tags_bk.name;
```

最後にもう不要となったもとの中途半端な関係テーブルもどきを削除すれば完成。
```sql
-- 以前のテーブル定義を削除する
DROP TABLE tags_bk;
```

ここまでの流れをlaravelのmigrationでやる。
その前にtags, tag_columnsから tags_bkを復元するクエリも書き出しておく。(rollbackができるように)

```sql
-- 中途半端な関係テーブルのテーブル定義
CREATE TABLE `tags` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `column_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 中途半端な関係テーブルの復元
INSERT INTO tags_bk(name, column_id, created_at, updated_at)
select name,column_id, tag_columns.created_at, tag_columns.updated_at from tag_columns
inner join tags ON tags.id = tag_columns.tag_id;

-- 新しく作ったテーブルを削除する
DROP TABLE tags, tag_columns;

-- 復元したテーブルをrename
ALTER TABLE tags_bk RENAME TO tags;
```

あとはひたすら laravelのmigrationファイルにこれらを書いていけばいい。

laravelでテーブルをrenameする時は、Schema::rename(from, to);を使えばできる。

[Laravel 6.x データベース：マイグレーション
](https://readouble.com/laravel/6.x/ja/migrations.html)

```php:RenameTagsTagsBk.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * 関係テーブル分割のためのテーブル名の一時変更migration
 * tags -> tags_bk
 */
class RenameTagsTagsBk extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::rename('tags','tags_bk');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::rename('tags_bk','tags');
    }
}

```

新しく作る tags, tag_columnsの定義に関しては以下のように定義してやればよい。
upのところでcreate文を書き、down(rollback時の処理)ではテーブルを削除(drop)している。

```php
    public function up()
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 255);
            $table->timestamps();
        });
    }

　　public function down()
    {
        Schema::dropIfExists('tags');
    }

```

tagsやtag_columnsに値を流し込む作業もmigrationファイルに記述してしまって良いらしい。
tag_columnsの方では、tags_bkにtagsを INNER JOIN して取得した各項目を1行ずつforeachの中でINSERTする処理を書いている。これで既存データのお引っ越しは完了だ。
downの方ではtag_columnsをTRUNCATEしている。(tag_columnsに値がない状態にすればいいのでこれでOK)

```php

/**
 * 関係テーブル tag_columnsにデータを流し込む
 */
class TransferTagsBkToTagColumns extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $tag_columns = DB::table('tag_columns');
        $originals = DB::table('tags_bk')
            ->select('tags.id','column_id','tags_bk.created_at','tags_bk.updated_at')
            ->join('tags','tags_bk.name','tags.name')->get();
        foreach($originals as $row) {
            $tag_columns->insert([
                'tag_id' => $row->id,
                'column_id' => $row->column_id,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $tags = DB::table('tag_columns');
        $tags->truncate();
    }
}

```

最後にリネームしたtags_bkを削除(drop)すればOKである。
ただし、削除したものをrollbackするにはtags_bkを作ること、tags,tag_columnsから中身を作ってINSERTしてやることが必要になるので以下のように少し面倒だ。

```php
  public function down()
    {
        Schema::create('tags_bk', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 255);
            $table->Integer('column_id');
            $table->timestamps();
        });

        $tags = DB::table('tags_bk');
        $originals = DB::table('tag_columns')
            ->select('tags.id','name','column_id','tag_columns.created_at','tag_columns.updated_at')
            ->join('tags','tag_columns.tag_id','tags.id')->get();
        foreach($originals as $row) {
            $tags->insert([
                'name' => $row->name,
                'column_id' => $row->column_id,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ]);
        }
    }

```

というステップを踏んで、テーブル分割作業をSQLのクエリからmigrationファイルに書き起こすことができた。


# まとめ
DBの構造がいけてないと後々の改修の際に苦労することになる。ただ、そんな時でも元のデータを保ちながらDB構造のリファクタをすることはできるようだ。
まず,クエリでどうすればリファクタできるかを考えてから、Laravelのmigrationファイルに書き起こす。migrationの中でデータの引越しも書いてしまえばいざと言う時にrollbackして元の構造に戻すこともできるし、変更したときの記録が残って良い。

というわけでテーブル構造のリファクタをしたのだが、少々面倒ではあったので、最初から適切にテーブルを設計しておくことの大切さを再認識させられた。
また、この変更によりLaravelのEloquentModelやロジックの修正は必要そうなのでおいおいやっていこうと思う。