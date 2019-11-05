;$$pullDown = (function(){
  var __event = function(target, mode, func){
		if (target.addEventListener){target.addEventListener(mode, func, false)}
		else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
	};


  // options
  var __options = {
    class_area  : "mynt-pull-down",  // 表示されたリストの親element用class名
    // mode        : "",         // リスト表示モード["always": , "multiple":複数選択モード]
    input_match : "partial",  // ["partial":部分一致 , "forward":前方一致]
    brank_view  : true,       // [true:ブランクで表示 , false:文字入力で表示]
    readonly    : false,
    listonly    : false ,      // リストに無い項目は登録不可
    all_view    : true ,      // 常に全部表示
    multiple    : false ,     // 複数選択モード
    multiple_split_string : ",", // 1項目に複数入力する際のsplit文字列(input_matchが"multiple"の場合に使用)

    datas    : [],            // ex)[{key:--,value:---},{key:--,value:---},{key:--,value:---},...]
    elements : [              // ex) elm_val(value)->表示,elm_key(key,id)->非表示
      {
        elm_val:null,         // value値を登録するelement※任意
        elm_key:null          // key(id)値を登録するelement※任意（key値は無くても可） 
      }
    ],
    margin   : 0,             // 入力フォームとの距離（margin-top:--px値）
    attach   : function(){},  // 項目にアタッチした時のイベント処理
    selected : function(){},  // 項目を選択した後のイベント処理
    canceled : function(){}   // 項目選択をキャンセルした後のイベント処理
  };


  // setup
  var $$ = function(options){
    if(!options){return;}
    this.options = this.setOptions(options);
    
    switch(document.readyState){
      case "complete"    : this.set();break;
      case "interactive" : __event(window , "DOMContentLoaded" , (function(e){this.set(e)}).bind(this));break;
      default            : __event(window , "load" , (function(e){this.set(e)}).bind(this));break;
    }
    
    // cancel-event
    if($$pullDown.window_click_flg !== true){

      if(typeof window.ontouchend !== "undefined"){
        __event(window , "touchend" , (function(e){this.event_cancel(e)}).bind(this));
      }
      else{
        __event(window , "click" , (function(e){this.event_cancel(e)}).bind(this));
      }
      
      // __event(window , "keyup" , (function(e){this.event_cursor(e)}).bind(this));
      $$pullDown.window_click_flg = true;
    }
  };

  // イベント、属性セット
  $$.prototype.set = function(e){
    for(var i=0; i<this.options.elements.length; i++){
      var elm_val = (this.options.elements[i].elm_val) ? document.querySelector(this.options.elements[i].elm_val) : null;
      if(elm_val){
        // __event(elm_val , "focus" , (function(e){this.event_attach(e)}).bind(this));
        if(typeof window.touchend !== "undefined"){
          __event(elm_val , "touchend" , (function(e){this.event_attach(e)}).bind(this));
        }
        else{
          __event(elm_val , "mouseup" , (function(e){this.event_attach(e)}).bind(this));
        }
        elm_val.setAttribute("data-flg-pulldown","1");
        elm_val.setAttribute("data-num" , i);
        elm_val.autocomplete = "off";
        if(this.options.readonly === true){
          elm_val.readOnly = true;
        }
        // input-match
        __event(elm_val , "keyup" , (function(e){this.input_match(e)}).bind(this));
//          __event(elm_val , "keypress" , (function(e){this.input_match(e)}).bind(this));
        // listonly
        __event(elm_val , "blur" , (function(e){this.blur(e)}).bind(this));
      }
    }
  };


  // optionsセット
  $$.prototype.setOptions = function(options){
    if(!options){return __options}
    var res = {};
    for(var i in __options){
      res[i] = __options[i];
    }
    for(var i in options){
      res[i] = options[i];
    }
    return res;
  };

  // close
  $$.prototype.all_close = function(){
    var elms = document.querySelectorAll("." + this.options.class_area);
    for(var i=0; i<elms.length; i++){
      elms[i].parentNode.removeChild(elms[i]);
    }
  };

  


  // focus
  $$.prototype.event_attach = function(e){
    // event
    this.options.attach(e);

    var target = e.currentTarget;
    if(!target){return}
    var num = target.getAttribute("data-num");

    // close
    this.all_close();

    // pull-down-areaの作成
    var area = this.event_attach_makeLists(target , num);

    // 入力文字列チェック
    this.input_match(e);
    
    return area;
  }

  // focus-single
  $$.prototype.event_attach_makeLists = function(target , num){
    var area = document.createElement("ol");
    area.setAttribute("data-flg-pulldown","1");
    area.className = this.options.class_area;
    area.setAttribute("data-input_match",this.options.input_match);
    area.style.setProperty("top"  , String(target.offsetTop  + target.offsetHeight + this.options.margin) + "px" , "");
    area.style.setProperty("left" , String(target.offsetLeft) + "px" , "");
    area.style.setProperty("min-width" , String(target.offsetWidth) + "px" , "");
    target.parentElement.appendChild(area);
    for(var i=0; i<this.options.datas.length; i++){
      var list = document.createElement("li");
      area.setAttribute("data-flg-pulldown","1");
      if(typeof this.options.datas[i].key !== "undefined"){
        list.setAttribute("data-key" , this.options.datas[i].key);
        list.setAttribute("data-val" , this.options.datas[i].value);
        list.setAttribute("data-num" , num);
        list.setAttribute("data-flg-pulldown" , "1");
      }
      else{
        list.setAttribute("data-val" , this.options.datas[i].value);
        list.setAttribute("data-num" , num);
        list.setAttribute("data-flg-pulldown" , "1");
      }
      list.innerHTML = this.options.datas[i].value;
      area.appendChild(list);

      if(this.options.input_match === "multiple"){
        __event(list , "click" , (function(e){this.event_selected_multi(e)}).bind(this));
      }
      else{
        __event(list , "click" , (function(e){this.event_selected_single(e)}).bind(this));
      }
    }
    return area;
  };


  // selected
  $$.prototype.event_selected_single = function(e){
    var target = e.currentTarget;
    if(!target){return;}
    var key = target.getAttribute("data-key");
    var val = target.getAttribute("data-val");
    var num = target.getAttribute("data-num");

    if(typeof this.options.elements[num] === "undefined"){return;}
    if(typeof this.options.elements[num].elm_key !== "undefined"){
      var elm = document.querySelector(this.options.elements[num].elm_key);
      if(elm){
        elm.value = key;
      }
    }
    if(typeof this.options.elements[num].elm_val !== "undefined"){
      var elm = document.querySelector(this.options.elements[num].elm_val);
      if(elm){
        elm.value = val;
      }
    }

    // リストを閉じる
    this.all_close();
    
    // 選択時イベントを実行
    this.options.selected(e);
  };

  // selected-multi
  $$.prototype.event_selected_multi = function(e){
    var target = e.currentTarget;
    if(!target){return;}

    var mode = null;
    // 削除
    if(target.getAttribute("data-match") === "1"){
      target.setAttribute("data-match","0");
      mode = "del";
    }
    // 追加
    else{
      target.setAttribute("data-match","1");
      mode = "add";
    }
// console.log(mode);
    
    var key = target.getAttribute("data-key");
    var val = target.getAttribute("data-val");
    var num = target.getAttribute("data-num");

    if(typeof this.options.elements[num] === "undefined"){return;}
    if(typeof this.options.elements[num].elm_key !== "undefined"){
      var elm_key = document.querySelector(this.options.elements[num].elm_key);
      if(elm_key){
        var lists_json = elm_key.getAttribute("data-lists");
        var lists = (lists_json) ? JSON.parse(lists_json) : [];
        switch(mode){
          case "add" : lists.push(key);break;
          case "del" : lists.splice(lists.indexOf(key) , 1);break;
        }
        elm_key.setAttribute("data-lists" , JSON.stringify(lists));
        elm_key.value = lists.join(this.options.mulple_split_string);
      }
    }
    if(typeof this.options.elements[num].elm_val !== "undefined"){
      var elm_val = document.querySelector(this.options.elements[num].elm_val);
      if(elm_val){
        var lists_json = elm_val.getAttribute("data-lists");
        var lists = (lists_json) ? JSON.parse(lists_json) : [];
        switch(mode){
          case "add" : lists.push(val);break;
          case "del" : lists.splice(lists.indexOf(val) , 1);break;
        }
        elm_val.setAttribute("data-lists" , JSON.stringify(lists));
        elm_val.value = lists.join(this.options.mulple_split_string);
      }
    }
    
    this.options.selected(e);
  };




  // canceled : プルダウン表示している時に、window クリックに対して対象elementじゃない場合にはcloseする
  $$.prototype.event_cancel = function(e){
    if(e.target.getAttribute("data-flg-pulldown") === "1"){return;}
    this.all_close();
  };

  

  // input-match
  $$.prototype.input_match = function(e){

    this.event_cursor(e);

    var target = e.target;
    if(!target){return;}

    var area = document.querySelector("."+this.options.class_area);
    if(!area){
      area = this.event_attach(e);
      area.style.setProperty("display","none","");
    }

    var lists = area.querySelectorAll(":scope > li");
    if(!lists || !lists.length){return;}

    var input_value = target.value;
    if(input_value === ""){
      this.setKeyElement_clear(e);
      this.input_match_pattern.clear(lists);
    }

    // brank_view
    if(this.options.brank_view === false){
      if(input_value === ""){
        area.style.setProperty("display","none","");
        return;
      }
      else{
        area.style.setProperty("display","block","");
      }
    }

    // regexp
    var res = null;
    switch(this.options.input_match){
      case "partial":res = this.input_match_pattern.partial(input_value,lists);break;
      case "forward":res = this.input_match_pattern.forward(input_value,lists);break;
      case "multiple":res = this.input_match_pattern.multiple(target,lists);break;
      case "always":
      default:res = this.input_match_pattern.always(input_value,lists);break;
    }
    if(res === null){return;}

    // empty
    var diff = lists.length - res.hidden_count;
    if(diff === 0){
      area.style.setProperty("display","none","");
    }
    // 入力後に１つだけリスト表示されない処理
    else if(diff === 1 && res.value_match !== false){
      area.style.setProperty("display","none","");
    }
    else{
      area.style.setProperty("display","block","");
    }

    // not-key(id)
    var num = (document.activeElement) ? document.activeElement.getAttribute("data-num") : null;

    if(num !== null && typeof this.options.elements[num] !== "undefined" && this.options.elements[num].elm_key){
      var elm_key = document.querySelector(this.options.elements[num].elm_key);
      if(res.value_match === false){
        elm_key.value = "";
      }
      else if(res.value_match !== false && diff === 1){
        elm_key.value = lists[res.value_match].getAttribute("data-key");
      }
    }
  };

  $$.prototype.input_match_pattern = {
    clear : function(lists){
      for(var i=0; i<lists.length; i++){
        lists[i].setAttribute("data-match" , "0");
      }
    },
    firstMatch_scroll : function(list){
      if(document.querySelector("[data-select='1']")){return}
      var area = list.parentNode;
      var top = list.offsetTop;
      area.scrollTop = top;
    },

    always : function(input_value,lists){
      var reg = new RegExp(input_value , "i");
      var hidden_count = 0;
      var value_match = false;
      var first_match = null;
      for(var i=0; i<lists.length; i++){
        if(input_value === ""){
          lists[i].style.setProperty("display","block","");
          continue;
        }
        var val = lists[i].getAttribute("data-val");
        if(val !== null && val.match(reg)){
          lists[i].setAttribute("data-match" , "1");
        }
        else{
          lists[i].setAttribute("data-match" , "0");
        }
        if(input_value === val){
          lists[i].setAttribute("data-match" , "1");
          value_match = i;
        }
        // 1番目をスクロールで最上位に持っていく
        if(first_match === null && val.match(reg)){
          // lists[i].setAttribute("data-select" , "1");
          this.firstMatch_scroll(lists[i]);
          first_match = lists[i];
        }
      }
      
      return {
        hidden_count : hidden_count,
        value_match  : value_match
      };
    },
    partial : function(input_value,lists){
      var reg = new RegExp(input_value , "i");
      var hidden_count = 0;
      var value_match = false;
      for(var i=0; i<lists.length; i++){
        if(input_value === ""){
          lists[i].style.setProperty("display","block","");
          continue;
        }
        var val = lists[i].getAttribute("data-val");
        if(val !== null && val.match(reg)){
          lists[i].style.setProperty("display","block","");
        }
        else{
          lists[i].style.setProperty("display","none","");
          hidden_count++;
        }
        if(input_value === val){
          value_match = i;
        }
      }
      return {
        hidden_count : hidden_count,
        value_match  : value_match
      };
    },
    forward : function(input_value,lists){
      reg = new RegExp("^"+input_value , "i");
      var hidden_count = 0;
      var value_match = false;
      for(var i=0; i<lists.length; i++){
        if(input_value === ""){
          lists[i].style.setProperty("display","block","");
          continue;
        }
        var val = lists[i].getAttribute("data-val");
        if(val !== null && val.match(reg)){
          lists[i].style.setProperty("display","block","");
        }
        else{
          lists[i].style.setProperty("display","none","");
          hidden_count++;
        }
        if(input_value === val){
          value_match = i;
        }
      }
      return {
        hidden_count : hidden_count,
        value_match  : value_match
      };
    },
    multiple : function(target,lists){
      var input_value = target.getAttribute("data-lists");
      var input_values = [];
      if(input_value !== null){
        input_values = JSON.parse(input_value);
      }
      var hidden_count = 0;
      var value_matches = [];
      var first_match = null;

      for(var i=0; i<lists.length; i++){
        if(!input_values.length){continue;}

        var val = lists[i].getAttribute("data-val");
        if(val === ""){continue;}
        var scroll_flg = false;

        if(input_values.indexOf(val) !== -1){
          lists[i].setAttribute("data-match" , "1");
          scroll_flg = true;
          if(first_match === null){
            this.firstMatch_scroll(lists[i]);
            value_matches.push(lists[i]);
          }
        }
        else{
          lists[i].setAttribute("data-match" , "0");
        }
      }
      return {
        hidden_count : hidden_count,
        value_match  : value_matches
      };
    }
  };

  $$.prototype.area_scroll = function(list){
    var area       = list.parentNode;
    var scrollTop  = area.scrollTop;
    var listTop    = list.offsetTop;
    var areaHeight = area.offsetHeight;
    var listHeight = list.offsetHeight;
    // over
    if(scrollTop > listTop){
      area.scrollTop = listTop;
    }
    // under
    else if(scrollTop + areaHeight < listTop + listHeight){
      area.scrollTop = (areaHeight - listTop - listHeight) * -1;
    }
  };

  $$.prototype.setKeyElement_clear = function(e){
    var target = e.target;
    if(target.value !== ""){return}
    var num = target.getAttribute("data-num");
    if(typeof this.options.elements[num] === "undefined"){return}
    var key = document.querySelector(this.options.elements[num].elm_key);
    key.value = "";
  };
  
  $$.prototype.event_cursor = function(e){

    if(!e.keyCode){return;}
    if(e.keyCode !== 38 && e.keyCode !== 40 && e.keyCode !== 13){return;}

    // areaが表示されているか確認
    var area = document.querySelector("."+this.options.class_area);
    if(!area){return;}

    // 現在の選択状態を確認
    var lists = area.querySelectorAll(":scope > *");
    var select = null;
    var match  = null;
    for(var i=0; i<lists.length; i++){
      if(select === null && lists[i].getAttribute("data-select") === "1"){
        select = lists[i];
        // break;
      }
      if(match === null && lists[i].getAttribute("data-match") === "1"){
        match = lists[i];
        // break;
      }
    }

    var current = (select === null && match !== null) ? match : select;

    // カーソル操作
    var next = null;
    switch(e.keyCode){
      case 38: // over
        if(current === null){
          current = lists[lists.length -1];
          current.setAttribute("data-select" , "1");
          next = current;
        }
        else if(current.previousSibling){
          current.previousSibling.setAttribute("data-select" , "1");
          current.removeAttribute("data-select");
          next = current.previousSibling;
        }
        else{
          next = current;
        }
        break;

      case 40: // under
        if(current === null){
          current = lists[0];
          current.setAttribute("data-select" , "1");
          next = current;
        }
        else if(current.nextSibling){
          current.nextSibling.setAttribute("data-select" , "1");
          current.removeAttribute("data-select");
          next = current.nextSibling;
        }
        else{
          next = current;
        }
        break;

      case 13: // enter
        if(current !== null){
          event.preventDefault();

          var val = current.getAttribute("data-val");
          val = (val === null) ? "" : val;
          
          // リストを閉じる
          if(this.current_input_match() === "multiple"){
            // var input = document.activeElement;
            // var attr = input.getAttribute("data-lists");
            // var lists = (attr) ? JSON.parse(attr) : [];
            this.event_selected_multi({currentTarget:current});


            // console.log(current);
            // __event(list , "click" , (function(e){this.event_selected_multi(e)}).bind(this));
          }
          else{//console.log("close : "+this.options.input_match);
            document.activeElement.value = val;
            this.all_close();
          }
        }
        break;
    }

    if(next !== null){
      this.area_scroll(next);
    }
  };

  // 
  $$.prototype.current_input_match = function(){
    // 現在表示されているリスト
    var target = document.querySelector("."+this.options.class_area);
    // リスト親から"data-input_match"を取得
    return target.getAttribute("data-input_match");
  };



  // css登録
  var myScript = document.getElementsByTagName("script");
  var linkTag  = document.querySelector("link[data-flg-pulldown='1']");
  if(myScript.length && !linkTag){
    var src = myScript[myScript.length-1].src;
    var href = src.replace(".js",".css");
    var link = document.createElement("link");
    link.setAttribute("data-flg-pulldown","1");
    link.rel = "stylesheet";
    link.href = href;
    var head = document.getElementsByTagName("head");
    head[0].appendChild(link);
  }

  // event-blur
  $$.prototype.blur = function(e){
    // 複数選択の場合は、現バージョンでは処理しない(ver1.3)
    if(this.options.multiple === true){return}

    this.setData_val2key(e);
    this.listonly(e);
  };

  // blur data-set value -> key-data
  $$.prototype.setData_val2key = function(e){
    // 入力項目
    var val_elm = e.target;
    if(!val_elm){return;}

    // key-elmの取得
    var key_elm = this.getElement_val2key(val_elm);
    if(!key_elm){return;}

    // 未入力の場合は、keyデータもクリアして処理終了
    if(val_elm.value === ""){
      key_elm.value = "";
      return;
    }

    // value値をデータリストから検索
    var flg = 0;
    for(var i=0; i<this.options.datas.length; i++){
      if(this.options.datas[i].value !== val_elm.value){continue;}
      flg++;
      key_elm.value = this.options.datas[i].key;
      break;
    }
    if(flg){return}

    // フラグが無い場合は、一番最初にマッチしたデータを強制選択
    var reg = new RegExp(val_elm.value , "i");
    for(var i=0; i<this.options.datas.length; i++){
      switch(this.options.input_match){
        // 前方一致
        case "forward":
          if(this.options.datas[i].value.match(reg)){
            val_elm.value = this.options.datas[i].value;
            key_elm.value = this.options.datas[i].key;
            return;
          }
          break;
        // 部分一致
        default:
          if(this.options.datas[i].value.indexOf(val_elm.value) !== -1){
            val_elm.value = this.options.datas[i].value;
            key_elm.value = this.options.datas[i].key;
            return;
          }
          break;
      }
    }

  };

  // list-only
  $$.prototype.listonly = function(e){
    if(typeof this.options.listonly === "undefined"){return}
    if(this.options.listonly !== true){return}

    var val_elm = e.target;
    if(!val_elm){return;}

    // key-elmの取得
    var key_elm = this.getElement_val2key(val_elm);
    if(!key_elm){return;}

    // 未入力の場合は、処理終了
    if(val_elm.value === ""){
      return;
    }

    // データ検索マッチしていなければ、value値を削除
    var flg = 0;
    for(var i=0; i<this.options.datas.length; i++){
      if(this.options.datas[i].value !== val_elm.value){continue;}
      flg++;
      break;
    }
    if(!flg){
      val_elm.value = "";
    }
    
    
  };

  // val-elementからkey-elementを取得
  $$.prototype.getElement_val2key = function(val_elm){
    var num = val_elm.getAttribute("data-num");
    if(typeof this.options.elements[num] !== "undefined"
    && typeof this.options.elements[num].elm_key !== "undefined"){
      return document.querySelector(this.options.elements[num].elm_key);
    }
    return null;
  };


  return $$;
})();