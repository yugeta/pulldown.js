;$$pullDown = (function(){

  var LIB   = function (){};
  var EVENT = function(){};
  var LISTS = function(){};
  var INPUT = function(){};
  var PETTERN = function(){};


  // ----------
  // event
  LIB.prototype.event = function(target, mode, func){
		if (target.addEventListener){target.addEventListener(mode, func, false)}
		else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
  };
  

  // ----------
  // options
  var __options = {
    class_area  : "mynt-pulldown",  // 表示されたリストの親element用class名
    input_match : "partial",  // ["partial":部分一致 , "forward":前方一致]
    brank_view  : false,      // [true:ブランクで表示 , false:文字入力で表示]
    readonly    : false,      // 入力不可にしてリスト選択のみにする。
    listonly    : false ,     // リストに無い項目は登録不可
    all_view    : false ,     // 常に全部表示
    multiple    : false ,     // 複数選択モード
    last1_input : false,      // リストが最後の１つになったら自動的に入力にする。（新規入力が不可の場合に使用）

    multiple_split : ",",     // 1項目に複数入力する際のsplit文字列(input_matchが"multiple"の場合に使用)

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


  // ----------
  // setup
  var MAIN = function(options){
    var main = this;

    if(!options){return;}
    this.options = this.setOptions(options);
    var lib = new LIB();
    
    switch(document.readyState){
      case "complete"    : this.set();break;
      case "interactive" : lib.event(window , "DOMContentLoaded" , (function(e){this.set(e)}).bind(this));break;
      default            : lib.event(window , "load" , (function(e){this.set(e)}).bind(this));break;
    }
    
    // cancel-event
    if($$pullDown.window_click_flg !== true){

      if(typeof window.ontouchend !== "undefined"){
        lib.event(window , "touchend" , (function(main,e){new EVENT().cancel(main,e)}).bind(this,main));
      }
      else{
        lib.event(window , "click" , (function(main,e){new EVENT().cancel(main,e)}).bind(this,main));
      }
      
      // lib.(window , "keyup" , (function(e){this.event_cursor(e)}).bind(this));
      $$pullDown.window_click_flg = true;
    }
  };

  // イベント、属性セット
  MAIN.prototype.set = function(e){
    var main  = this;
    var lib   = new LIB();
    var event = new EVENT();
    var input = new INPUT();

    for(var i=0; i<main.options.elements.length; i++){
      var elm_val = (main.options.elements[i].elm_val) ? document.querySelector(this.options.elements[i].elm_val) : null;
      if(elm_val){

        // lib.(elm_val , "focus" , (function(main,e){new EVENT().attach(main,e)}).bind(this,main));
        if(typeof window.touchend !== "undefined"){
          lib.event(elm_val , "touchend" , (function(main,e){new EVENT().attach(main,e)}).bind(this,main));
        }
        else{
          lib.event(elm_val , "mouseup"  , (function(main,e){new EVENT().attach(main,e)}).bind(this,main));
        }

        elm_val.setAttribute("data-flg-pulldown","1");
        elm_val.setAttribute("data-num" , i);
        elm_val.autocomplete = "off";

        if(main.options.readonly === true || main.options.multiple === true){
          elm_val.readOnly = true;
        }

        // input-match
        lib.event(elm_val , "keyup" , (function(main,e){new INPUT().check(main,e)}).bind(this,main));
//          lib.(elm_val , "keypress" , (function(e){this.input_match(e)}).bind(main));

        // listonly
        if(main.options.listonly === true){
          lib.event(elm_val , "blur" , (function(main,e){new INPUT().blur(main,e)}).bind(this,main));
        }
        
      }
    }
  };


  // optionsセット
  MAIN.prototype.setOptions = function(options){
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

  MAIN.prototype.getListArea = function(flg){
    var main = this;
    if(flg === "all"){
      return document.querySelectorAll("." + main.options.class_area);
    }
    else{
      return document.querySelector("." + main.options.class_area);
    }
    
  };




  // ----------
  // focus
  EVENT.prototype.attach = function(main,e){
    var main  = main;
    var event = this;
    var lists = new LISTS();
    var input = new INPUT();

    // event
    if(typeof main.options.attach === "object"){
      main.options.attach(e);
    }
    
    var target = e.currentTarget;
    if(!target){return}
    var num = target.getAttribute("data-num");

    // close
    lists.close(main);

    // pull-down-areaの作成
    var area = lists.open(main , target , num);

    // 入力文字列チェック
    input.check(main,e);
    
    return area;
  }

  // canceled : プルダウン表示している時に、window クリックに対して対象elementじゃない場合にはcloseする
  EVENT.prototype.cancel = function(main,e){
    var main  = main;
    var lists = new LISTS();

    if(e.target.getAttribute("data-flg-pulldown") === "1"){return;}
    lists.close(main);
  };






  // ----------
  // focus-single
  LISTS.prototype.open = function(main , target , num){
    var main  = main;
    var lib   = new LIB();
    var lists = new LISTS();

    var area = lists.make_area(main,target);
    target.parentElement.appendChild(area);
    for(var i=0; i<main.options.datas.length; i++){
      var li = document.createElement("li");
      area.setAttribute("data-flg-pulldown","1");
      if(typeof main.options.datas[i].key !== "undefined"){
        lists.setAttribute_keyExist(li , main.options.datas[i] , num);
      }
      else{
        lists.setAttribute_keynoexist(li , main.options.datas[i] , num);
      }
      li.innerHTML = main.options.datas[i].value;
      area.appendChild(li);

      if(main.options.multiple === true){
        lib.event(li , "click" , (function(main,e){new LISTS().multi(main,e)}).bind(this,main));
      }
      else{
        lib.event(li , "click" , (function(main,e){new LISTS().single(main,e)}).bind(this,main));
      }
    }
    return area;
  };

  // list-areaのprototypeやattributeの設定
  LISTS.prototype.make_area = function(main , target){
    var area = document.createElement("ol");
    area.setAttribute("data-flg-pulldown","1");
    area.className = main.options.class_area;
    area.setAttribute("data-input_match",main.options.input_match);
    area.style.setProperty("top"  , String(target.offsetTop  + target.offsetHeight + main.options.margin) + "px" , "");
    area.style.setProperty("left" , String(target.offsetLeft) + "px" , "");
    area.style.setProperty("min-width" , String(target.offsetWidth) + "px" , "");
    return area;
  };

  // list項目の属性セット（key要素有り）
  LISTS.prototype.setAttribute_keyExist = function(li , data , num){
    li.setAttribute("data-key" , data.key);
    li.setAttribute("data-val" , data.value);
    li.setAttribute("data-num" , num);
    li.setAttribute("data-flg-pulldown" , "1");
  };
  // list項目の属性セット（key要素無し）
  LISTS.prototype.setAttribute_keyNoexist = function(li , data , num){
    li.setAttribute("data-val" , data.value);
    li.setAttribute("data-num" , num);
    li.setAttribute("data-flg-pulldown" , "1");
  };

  // close
  LISTS.prototype.close = function(main){
    var main = main;

    var elms = main.getListArea("all");
    for(var i=0; i<elms.length; i++){
      elms[i].parentNode.removeChild(elms[i]);
    }
  };


  // selected
  LISTS.prototype.single = function(main,e){
    var main  = main;
    var lists = this;

    var target = e.currentTarget;
    if(!target){return;}
    var key = target.getAttribute("data-key");
    var val = target.getAttribute("data-val");
    var num = target.getAttribute("data-num");

    if(typeof main.options.elements[num] === "undefined"){return;}
    if(typeof main.options.elements[num].elm_key !== "undefined"){
      var elm = document.querySelector(main.options.elements[num].elm_key);
      if(elm){
        elm.value = key;
      }
    }
    if(typeof main.options.elements[num].elm_val !== "undefined"){
      var elm = document.querySelector(main.options.elements[num].elm_val);
      if(elm){
        elm.value = val;
      }
    }

    // リストを閉じる
    lists.close(main);
    
    // 選択時イベントを実行
    main.options.selected(e);
  };

  // selected-multi
  LISTS.prototype.multi = function(main,e){
    var main = main;

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
    
    var key = target.getAttribute("data-key");
    var val = target.getAttribute("data-val");
    var num = target.getAttribute("data-num");

    if(typeof main.options.elements[num] === "undefined"){return;}
    if(typeof main.options.elements[num].elm_key !== "undefined"){
      var elm_key = document.querySelector(main.options.elements[num].elm_key);
      if(elm_key){
        var lists_json = elm_key.getAttribute("data-lists");
        var lists = (lists_json) ? JSON.parse(lists_json) : [];
        switch(mode){
          case "add" : lists.push(key);break;
          case "del" : lists.splice(lists.indexOf(key) , 1);break;
        }
        elm_key.setAttribute("data-lists" , JSON.stringify(lists));
        elm_key.value = lists.join(main.options.mulple_split_string);
      }
    }
    if(typeof main.options.elements[num].elm_val !== "undefined"){
      var elm_val = document.querySelector(main.options.elements[num].elm_val);
      if(elm_val){
        var lists_json = elm_val.getAttribute("data-lists");
        var lists = (lists_json) ? JSON.parse(lists_json) : [];
        switch(mode){
          case "add" : lists.push(val);break;
          case "del" : lists.splice(lists.indexOf(val) , 1);break;
        }
        elm_val.setAttribute("data-lists" , JSON.stringify(lists));
        elm_val.value = lists.join(main.options.mulple_split_string);
      }
    }
    // option処理を実行
    main.options.selected(e);
  };

  LISTS.prototype.area_scroll = function(list){
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

  // list-only
  LISTS.prototype.only = function(main,e){
    var main  = main;
    var input = new INPUT();
    var lists = this;

    if(typeof main.options.listonly === "undefined"){return}
    if(main.options.listonly !== true){return}

    var val_elm = e.target;
    if(!val_elm){return;}

    // key-elmの取得
    var key_elm = input.get_val2key(main,val_elm);
    if(!key_elm){return;}

    // 未入力の場合は、処理終了
    if(val_elm.value === ""){
      return;
    }

    // データ検索マッチしていなければ、value値を削除
    var flg = 0;
    for(var i=0; i<main.options.datas.length; i++){
      if(main.options.datas[i].value !== val_elm.value){continue;}
      flg++;
      break;
    }
    if(!flg){
      val_elm.value = "";
    }
  };

  // 現在表示されているリストが複数ある設定のどの設定にあたるかを取得する
  LISTS.prototype.get_current = function(main){
    // 現在表示されているリスト
    var target = document.querySelector("." + main.options.class_area);
    // リスト親から"data-input_match"を取得
    return target.getAttribute("data-input_match");
  };






  
  // ----------
  // input-match
  INPUT.prototype.check = function(main,e){
    var main    = main;
    var input   = this;
    var pettern = new PETTERN();
    var event   = new EVENT();

    input.cursor(main,e);

    var target = e.target;
    if(!target){return;}

    // リストエリアの取得
    var area = main.getListArea();
    if(!area){
      area = event.attach(main,e);
      area.style.setProperty("display","none","");
    }

    // リスト項目のelementを取得
    var elements = area.querySelectorAll(":scope > li");
    if(!elements || !elements.length){return;}

    // 項目の入力値を取得
    var input_value = target.value;
    if(input_value === ""){
      input.clear(main,e);
      pettern.clear(elements);
    }

    // brank_view : 未入力でリスト表示設定
    if(main.options.brank_view === false){
      if(input.brank_view(area)){return}
    }

    // regexp
    var res = null;
    if(main.options.multiple === true){
      res = pettern.multiple(main,target,elements);
    }
    else if(main.options.input_match === "partial"){
      res = pettern.partial(main,input_value,elements);
    }
    else if(main.options.input_match === "forward"){
      res = pettern.forward(main,input_value,elements);
    }
    // switch(main.options.input_match){
    //   case "partial"  : res = pettern.partial(main,input_value,elements);  break;
    //   case "forward"  : res = pettern.forward(main,input_value,elements);  break;
    //   // case "multiple" : res = pettern.multiple(main,target,elements); break;
    //   // case "always"   :
    //   // default         : res = pettern.always(input_value,elements);   break;
    // }
    if(res === null){return;}

    // empty
    var diff = elements.length - res.hidden_count;
    if(diff === 0){
      area.style.setProperty("display","none","");
    }
    // 入力後に１つだけリスト表示されない処理
    else if(diff === 1 && res.value_match !== false){
      area.style.setProperty("display","none","");
    }
    // 
    else{
      area.style.setProperty("display","block","");
    }

    // 現在入力中の項目から設定form番号を取得 : not-key(id)
    var num = (document.activeElement) ? document.activeElement.getAttribute("data-num") : null;

    // key項目の内容を自動修正
    if(num !== null && typeof main.options.elements[num] !== "undefined" && main.options.elements[num].elm_key){
      var elm_key = document.querySelector(main.options.elements[num].elm_key);

      if(res.value_match === false){
        elm_key.value = "";
      }
      else if(res.value_match !== false && diff === 1){
        elm_key.value = elements[res.value_match].getAttribute("data-key");
      }
    }
  };

  INPUT.prototype.brank_view = function(main , area){
    if(input_value === ""){
      area.style.setProperty("display","none","");
      return true;
    }
    else{
      area.style.setProperty("display","block","");
      return false;
    }
  };

  // キー操作処理
  INPUT.prototype.cursor = function(main,e){
    var main  = main;
    var lists = new LISTS();
    var input = this;

    if(!e.keyCode){return;}
    if(e.keyCode !== 38 && e.keyCode !== 40 && e.keyCode !== 13){return;}

    // areaが表示されているか確認
    var area = main.getListArea();
    if(!area){return;}

    // 現在の選択状態を確認
    var elements = area.querySelectorAll(":scope > *");
    var select = null;
    var match  = null;
    for(var i=0; i<elements.length; i++){
      if(select === null && elements[i].getAttribute("data-select") === "1"){
        select = elements[i];
        // break;
      }
      if(match === null && elements[i].getAttribute("data-match") === "1"){
        match = elements[i];
        // break;
      }
    }

    var current = (select === null && match !== null) ? match : select;

    // カーソル操作
    var next = null;
    switch(e.keyCode){
      case 38: next = input.cursor_over(current  , elements);break; // over
      case 40: next = input.cursor_under(current , elements);break; // under
      case 13: input.cursor_enter(main , current , elements);break; // enter
    }

    if(next !== null){
      lists.area_scroll(next);
    }
  };

  // カーソル実行処理（38:上キー）
  INPUT.prototype.cursor_over = function(current,elements){
    if(current === null){
      current = elements[elements.length -1];
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
    return next;
  };

  // カーソル実行処理（40:下キー）
  INPUT.prototype.cursor_under = function(current,elements){
    if(current === null){
      current = elements[0];
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
    return next;
  };

  // カーソル実行処理（13:Enterキー）
  INPUT.prototype.cursor_enter = function(main , current　,　elements){
    if(current !== null){
      var lists = new LISTS();
      // event.preventDefault();

      var val = current.getAttribute("data-val");
      val = (val !== null) ? val : "";
      
      // リストを閉じる
      // if(elements.get_current(main) === "multiple"){
      if(main.options.multiple === true){
        lists.multi(main,{currentTarget:current});
      }
      else{
        document.activeElement.value = val;
        lists.close(main);
      }
    }
  };

  // event-blur
  INPUT.prototype.blur = function(main,e){
    // 複数選択の場合はblur処理しない
    if(main.options.multiple === true){return}

    var main  = main;
    var lists = new LISTS();
    var input = this;

    input.set_val2key(main,e);
    lists.only(main,e);
  };

  // blur data-set value -> key-data
  INPUT.prototype.set_val2key = function(main,e){
    var main  = main;
    var input = this;

    // 入力項目
    var val_elm = e.target;
    if(!val_elm){return;}

    // key-elmの取得
    var key_elm = input.get_val2key(main,val_elm);
    if(!key_elm){return;}

    // 未入力の場合は、keyデータもクリアして処理終了
    if(val_elm.value === ""){
      key_elm.value = "";
      return;
    }

    // value値をデータリストから検索
    var flg = 0;
    for(var i=0; i<main.options.datas.length; i++){
      if(main.options.datas[i].value !== val_elm.value){continue;}
      flg++;
      key_elm.value = main.options.datas[i].key;
      break;
    }
    if(flg){return}

    // フラグが無い場合は、一番最初にマッチしたデータを強制選択
    for(var i=0; i<main.options.datas.length; i++){
      switch(main.options.input_match){
        case "forward" : if(input.check_forward(main.options.datas[i] , val_elm , key_elm)){return} break; // 前方一致
        default        : if(input.check_partial(main.options.datas[i] , val_elm , key_elm)){return} break; // 部分一致
      }
    }
  };

  // 前方一致処理
  INPUT.prototype.check_forward = function(data , val_elm , key_elm){
    var reg = new RegExp(val_elm.value , "i");
    if(!data.value || !data.value.match(reg)){return false}
    val_elm.value = data.value;
    key_elm.value = data.key;
    return true;
  };

  //部分一致処理
  INPUT.prototype.check_partial = function(data , val_elm , key_elm){
    if(!data.value || data.value.indexOf(val_elm.value) === -1){return false}
    val_elm.value = data.value;
    key_elm.value = data.key;
    return true;
  };


  // val-elementからkey-elementを取得
  INPUT.prototype.get_val2key = function(main,val_elm){
    var main  = main;
    var input = this;

    var num = val_elm.getAttribute("data-num");
    if(typeof main.options.elements[num] !== "undefined"
    && typeof main.options.elements[num].elm_key !== "undefined"){
      return document.querySelector(main.options.elements[num].elm_key);
    }
    return null;
  };

  INPUT.prototype.clear = function(main,e){
    var main = main;

    var target = e.target;
    if(target.value !== ""){return}
    var num = target.getAttribute("data-num");
    if(typeof main.options.elements[num] === "undefined"){return}
    var key = document.querySelector(main.options.elements[num].elm_key);
    key.value = "";
  };


  // ----------

  // 表示リスト内の対象項目の情報をクリアする(data-match=0)
  PETTERN.prototype.clear = function(elements){
    for(var i=0; i<elements.length; i++){
      elements[i].setAttribute("data-match" , "0");
    }
  };

  // 表示リストのマッチしている項目を先頭に持ってくるようにスクロールする処理
  PETTERN.prototype.firstMatch_scroll = function(element){
    if(document.querySelector("[data-select='1']")){return}
    var area = element.parentNode;
    var top = element.offsetTop;
    area.scrollTop = top;
  };

  // 表示リストのマッチしている項目を先頭に持ってくるようにスクロールする処理
  PETTERN.prototype.always = function(input_value , elements){
    var pettern = this;

    var reg = new RegExp(input_value , "i");
    var hidden_count = 0;
    var value_match = false;
    var first_match = null;
    for(var i=0; i<elements.length; i++){
      if(input_value === ""){
        elements[i].style.setProperty("display","block","");
        continue;
      }
      var val = elements[i].getAttribute("data-val");
      if(val !== null && val.match(reg)){
        elements[i].setAttribute("data-match" , "1");
      }
      else{
        elements[i].setAttribute("data-match" , "0");
      }
      if(input_value === val){
        elements[i].setAttribute("data-match" , "1");
        value_match = i;
      }
      // 1番目をスクロールで最上位に持っていく
      if(first_match === null && val.match(reg)){
        pettern.firstMatch_scroll(elements[i]);
        first_match = elements[i];
      }
    }
    return {
      hidden_count : hidden_count,
      value_match  : value_match
    };
  };

  // 部分一致
  PETTERN.prototype.partial = function(main,input_value,lists){
    var reg = new RegExp(input_value , "i");
    var hidden_count = 0;
    var value_match = false;

    for(var i=0; i<lists.length; i++){
      if(input_value === ""){
        lists[i].style.setProperty("display","block","");
        continue;
      }

      var val = lists[i].getAttribute("data-val");
      // 常に全部表示処理
      if(main.options.all_view === true){
        lists[i].style.setProperty("display","block","");
      }
      else if(main.options.multiple === true){
        this.multiple(main,input_value,lists);
        // lists[i].style.setProperty("display","block","");
      }
      // 一部マッチング処理
      else if(val !== null && val.match(reg)){
        lists[i].style.setProperty("display","block","");
      }
      // 一部もマッチしない処理
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
  };

  // 前方一致
  PETTERN.prototype.forward = function(main,input_value,lists){
    reg = new RegExp("^"+input_value , "i");
    var hidden_count = 0;
    var value_match = false;

    for(var i=0; i<lists.length; i++){
      if(input_value === ""){
        lists[i].style.setProperty("display","block","");
        continue;
      }

      var val = lists[i].getAttribute("data-val");
      if(main.options.all_view === true){
        lists[i].style.setProperty("display","block","");
      }
      else if(main.options.multiple === true){
        this.multiple(main,input_value,lists);
        // lists[i].style.setProperty("display","block","");
      }
      else if(val !== null && val.match(reg)){
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
  };

  // 複数選択
  PETTERN.prototype.multiple = function(main,target,lists){
    var main = main;
    var pettern = this;

    var input_value = target.getAttribute("data-lists");
    var input_values = [];
    if(input_value !== null){
      input_values = JSON.parse(input_value);
    }
    var hidden_count = 0;
    var value_matches = [];

    for(var i=0; i<lists.length; i++){
      if(!input_values.length){continue;}

      var val = lists[i].getAttribute("data-val");
      if(val === ""){continue;}

      if(input_values.indexOf(val) !== -1){
        lists[i].setAttribute("data-match" , "1");
        value_matches.push(lists[i]);
      }
      else{
        lists[i].setAttribute("data-match" , "0");
      }
    }

    // 一番上部の選択項目に自動スクロール処理
    var first_match = null;
    for(var i=0; i<value_matches.length; i++){
      if(first_match === null
      || first_match.offsetTop > value_matches[i].offsetTop){
        first_match = value_matches[i];
      }
    }
    if(first_match !== null){
      pettern.firstMatch_scroll(first_match);
    }

    return {
      hidden_count : hidden_count,
      value_match  : value_matches
    };
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


  return MAIN;
})();