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
  datas    : [
    {key:1,value:"1-abc"},
    {key:2,value:"2-ade"},
    {key:3,value:"1-bef"}
  ],  // ex)[{key:value},{key:value},{key:value},...]
  input_match : "partial",  // ["partial":部分一致 , "forward":前方一致]
  branc_view  : false,       // [true:ブランクで表示 , false:文字入力で表示]
  elements : [    // ex) elm_val(value)->表示,elm_key(key,id)->非表示
    {
      elm_key : "[name='aaa_key']", // value値を登録するelement※任意
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


