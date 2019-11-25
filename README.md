pulldown.js
==
```
- Author : Yugeta.Koji
- Date   : 2019.09.03
- Version
- ver 1.0 : remake
- ver 1.1 : multiple
- ver 1.2 : smart-phone (click -> ontouchend)
- ver 1.3 : リストに無い項目は登録不可 (2019.10.22) *keyが無い場合も含む
- ver 1.4 : iOSがkeyupに対応していない件の対応 -> input-eventを利用
```

# Specification
  - input_match
    1. "partial" : 部分一致)
    2. "forward" : 前方一致)]

  - branc_view
    1. true : ブランクで表示
    2. false : 文字入力で表示

  - readonly
    1. true
    2. false

  - multiple

  - multiple_split_string


# Sample
```
new $$pullDown({
  datas    : [  // ex)[{key:value},{key:value},{key:value},...]
    {key:1,value:"1-abc"},
    {key:2,value:"2-ade"},
    {key:3,value:"1-bef"}
  ],

  class_area  : "mynt-pulldown",  // 表示されたリストの親element用class名
  input_match : "partial",  // ["partial":部分一致 , "forward":前方一致]
  brank_view  : false,      // [true:ブランクで表示 , false:文字入力で表示]
  readonly    : false,      // 入力不可にしてリスト選択のみにする。
  listonly    : false ,     // リストに無い項目は登録不可
  all_view    : false ,     // 常に全部表示
  multiple    : false ,     // 複数選択モード
  last1_input : false,      // リストが最後の１つになったら自動的に入力にする。（新規入力が不可の場合に使用すると効果的だが、登録完了の感覚がないのでデフォルトはfalse）
  multiple_split : ",",     // 1項目に複数入力する際のsplit文字列(input_matchが"multiple"の場合に使用)
  margin   : 0,             // 入力フォームとの距離（margin-top:--px値）

  elements : [ // ex) elm_val(value)->表示,elm_key(key,id)->非表示
    {
      elm_key : "[name='aaa_key']", // value値を登録するelement※任意だが記述する場合はvalと対にelementが存在している事
      elm_val : "[name='aaa_val']"  // key(id)値を登録するelement※任意（key値は無くても可） 
    } 
  ],

  attach   : function(e){console.log("attach-1")},  // 項目にアタッチした時のイベント処理
  selected : function(e){console.log("select-1")},  // 項目を選択した後のイベント処理
  canceled : function(e){console.log("cancel-1")}   // 項目選択をキャンセルした後のイベント処理
});
```

# Caution
  - multiple=trueの場合は、readonlyモードになる。
    入力項目の自動モードが発動するため、readonlyになるため、selectタグと同じ挙動になる。


# Request
  - スマホの操作感をselectタグに近づける
    * 入力完了時にクリックしなくても自動でリスト表示を閉じたい
  - リストにない文字列を入力した際にUIで新規登録とわかり易くしたい
  - 都道府県リストの追加（ajax読み込みで容量軽減対応）
  - リストが1個の時にリスト表示されない事象を表示するように解消
  

