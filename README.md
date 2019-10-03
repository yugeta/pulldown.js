pulldown.js
==
- Author : Yugeta.Koji
- Date   : 2019.09.03
- Version
- ver 1.0 : remake
- ver 1.1 : multiple
---

# Sample

new $$pullDown({
  datas    : [{key:1,value:"1-abc"},{key:2,value:"2-ade"},{key:3,value:"1-bef"}],  // ex)[{key:value},{key:value},{key:value},...]
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
 

# multiple

