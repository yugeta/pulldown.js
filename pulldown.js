/**
 * PullDown.js
 * - Author : Yugeta.Koji
 * - Version
 *   1.0 @ 2019.08.27 : Basic-systems
 */
;$$pullDown = (function(){
  var __event = function(target, mode, func){
		if (target.addEventListener){target.addEventListener(mode, func, false)}
		else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
	};
	var __urlinfo = function(uri){
    uri = (uri) ? uri : location.href;
    var data={};
		//URLとクエリ分離分解;
    var urls_hash  = uri.split("#");
    var urls_query = urls_hash[0].split("?");
		//基本情報取得;
		var sp   = urls_query[0].split("/");
		var data = {
      uri      : uri
		,	url      : sp.join("/")
    , dir      : sp.slice(0 , sp.length-1).join("/") +"/"
    , file     : sp.pop()
		,	domain   : sp[2]
    , protocol : sp[0].replace(":","")
    , hash     : (urls_hash[1]) ? urls_hash[1] : ""
		,	query    : (urls_query[1])?(function(urls_query){
				var data = {};
				var sp   = urls_query.split("#")[0].split("&");
				for(var i=0;i<sp .length;i++){
					var kv = sp[i].split("=");
					if(!kv[0]){continue}
					data[kv[0]]=kv[1];
				}
				return data;
			})(urls_query[1]):[]
		};
		return data;
  };
  var __upperSelector = function(elm , selectors) {
    selectors = (typeof selectors === "object") ? selectors : [selectors];
    if(!elm || !selectors){return;}
    var flg = null;
    for(var i=0; i<selectors.length; i++){
      for (var cur=elm; cur; cur=cur.parentElement) {
        if (cur.matches(selectors[i])) {
          flg = true;
          break;
        }
      }
      if(flg){
        break;
      }
    }
    return cur;
  }


  // options
  var __options = {
    class_area : "mynt-pull-down",  // 表示されたリストの親element用class名

    input_match : "partial",  // ["partial":部分一致 , "forward":前方一致 , "always":常に全部表示]
    brank_view  : true,       // [true:ブランクで表示 , false:文字入力で表示]

    datas    : [],  // ex)[{key:--,value:---},{key:--,value:---},{key:--,value:---},...]
    elements : [    // ex) elm_val(value)->表示,elm_key(key,id)->非表示
      {
        elm_val:null, // value値を登録するelement※任意
        elm_key:null  // key(id)値を登録するelement※任意（key値は無くても可） 
      } 
    ],
    margin   : 0,   // 入力フォームとの距離（margin-top:--px値）
    attach   : function(){},  // 項目にアタッチした時のイベント処理
    selected : function(){},  // 項目を選択した後のイベント処理
    canceled : function(){}   // 項目選択をキャンセルした後のイベント処理
  };



  var __construct = function(){
    switch(document.readyState){
      case "complete"    : new $$;break;
      case "interactive" : __event(window , "DOMContentLoaded" , function(){new $$});break;
      default            : __event(window , "load" , function(){new $$});break;
		}
  };
  


  // setup
  var $$ = function(options){
    if(!options){return;}
    this.datas = this.setOptions(options);
    
    switch(document.readyState){
      case "complete"    : this.set();break;
      case "interactive" : __event(window , "DOMContentLoaded" , (function(e){this.set(e)}).bind(this));break;
      default            : __event(window , "load" , (function(e){this.set(e)}).bind(this));break;
    }
    
    // cancel-event
    if($$pullDown.window_click_flg !== true){
      __event(window , "click" , (function(e){this.event_cancel(e)}).bind(this));
      __event(window , "keydown" , (function(e){this.event_cursor(e)}).bind(this));
      $$pullDown.window_click_flg = true;
    }
    
  };

  $$.prototype.set = function(e){
    for(var i=0; i<this.datas.elements.length; i++){
      var elm_val = (this.datas.elements[i].elm_val) ? document.querySelector(this.datas.elements[i].elm_val) : null;
      if(elm_val){
        __event(elm_val , "focus" , (function(e){this.event_attach(e)}).bind(this));
        elm_val.setAttribute("data-flg-pulldown","1");
        elm_val.setAttribute("data-num" , i);
        elm_val.autocomplete = "off";
        // input-match
        __event(elm_val , "keyup" , (function(e){this.input_match(e)}).bind(this));
      }
    }
  };



  
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
    var elms = document.querySelectorAll("." + this.datas.class_area);
    for(var i=0; i<elms.length; i++){
      elms[i].parentNode.removeChild(elms[i]);
    }
  };

  


  // focus
  $$.prototype.event_attach = function(e){

    // event
    this.datas.attach(e);

    var target = e.currentTarget;
    if(!target){return}
    var num = target.getAttribute("data-num");

    // close
    this.all_close();

    // pull-down-areaの作成
    var area = document.createElement("ol");
    area.setAttribute("data-flg-pulldown","1");
    area.className = this.datas.class_area;
    area.style.setProperty("top"  , String(target.offsetTop  + target.offsetHeight + this.datas.margin) + "px" , "");
    area.style.setProperty("left" , String(target.offsetLeft) + "px" , "");
    area.style.setProperty("min-width" , String(target.offsetWidth) + "px" , "");
    target.parentElement.appendChild(area);
    for(var i=0; i<this.datas.datas.length; i++){
      var list = document.createElement("li");
      area.setAttribute("data-flg-pulldown","1");
      if(typeof this.datas.datas[i].key !== "undefined"){
        list.setAttribute("data-key" , this.datas.datas[i].key);
        list.setAttribute("data-val" , this.datas.datas[i].value);
        list.setAttribute("data-num" , num);
      }
      list.innerHTML = this.datas.datas[i].value;
      area.appendChild(list);
      __event(list , "click" , (function(e){this.event_selected(e)}).bind(this));
    }

    this.input_match(e);

    return area;
  };

  // selected
  $$.prototype.event_selected = function(e){
    this.datas.selected(e);
    var target = e.currentTarget;
    if(!target){return;}
    var key = target.getAttribute("data-key");
    var val = target.getAttribute("data-val");
    var num = target.getAttribute("data-num");

    if(typeof this.datas.elements[num] === "undefined"){return;}
    if(typeof this.datas.elements[num].elm_key !== "undefined"){
      var elm = document.querySelector(this.datas.elements[num].elm_key);
      if(elm){
        elm.value = key;
      }
    }
    if(typeof this.datas.elements[num].elm_val !== "undefined"){
      var elm = document.querySelector(this.datas.elements[num].elm_val);
      if(elm){
        elm.value = val;
      }
    }
    this.all_close();
  };

  // canceled : プルダウン表示している時に、window クリックに対して対象elementじゃない場合にはcloseする
  $$.prototype.event_cancel = function(e){
    if(e.target.getAttribute("data-flg-pulldown") === "1"){return;}
    this.all_close();
  };

  

  // input-match
  $$.prototype.input_match = function(e){
    var target = e.target;
    if(!target){return;}
    var input_value = target.value;
    if(input_value === ""){
      this.setKeyElement_clear(e);
    }

    var area = document.querySelector("."+this.datas.class_area);
    if(!area){
      area = this.event_attach(e);
      area.style.setProperty("display","none","");
    }

    // brank_view
    if(this.datas.brank_view === false){
      if(input_value === ""){
        area.style.setProperty("display","none","");
        return;
      }
      else{
        area.style.setProperty("display","block","");
      }
    }

    // regexp
    if(this.datas.input_match === "partial"){
      var reg = new RegExp(input_value , "i");
    }
    else if(this.datas.input_match === "forward"){
      var reg = new RegExp("^"+ input_value , "i");
    }
    
    var lists = area.querySelectorAll(":scope > *");
    if(!lists || !lists.length){return;}

    // 絞り込み処理（非表示）
    var hidden_count = 0;
    var value_match = false;
    for(var i=0; i<lists.length; i++){
      if(input_value === ""){
        lists[i].style.setProperty("display","block","");
        continue;
      }

      var val = lists[i].getAttribute("data-val");
      if(val.match(reg)){
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

    // empty
    var diff = lists.length - hidden_count;
    if(diff === 0){
      area.style.setProperty("display","none","");
    }
    // 入力後に１つだけリスト表示されない処理
    else if(diff === 1 && value_match !== false){
      area.style.setProperty("display","none","");
    }
    else{
      area.style.setProperty("display","block","");
    }

    // not-key(id)
    var num = (document.activeElement) ? document.activeElement.getAttribute("data-num") : null;

    if(num !== null && typeof this.datas.elements[num] !== "undefined"){
      var elm_key = document.querySelector(this.datas.elements[num].elm_key);
      if(value_match === false){
        elm_key.value = "";
      }
      else if(value_match !== false && diff === 1){
        elm_key.value = lists[value_match].getAttribute("data-key");
      }
    }
    

  };

  $$.prototype.setKeyElement_clear = function(e){
    var target = e.target;
    if(target.value !== ""){return}
    var num = target.getAttribute("data-num");
    if(typeof this.datas.elements[num] === "undefined"){return}
    var key = document.querySelector(this.datas.elements[num].elm_key);
    key.value = "";
  };
  
  $$.prototype.event_cursor = function(e){

    if(!e.keyCode){return;}
    if(e.keyCode !== 38 && e.keyCode !== 40 && e.keyCode !== 13){return;}

    // areaが表示されているか確認
    var area = document.querySelector("."+this.datas.class_area);
    if(!area){return;}

    // 現在の選択状態を確認
    var lists = area.querySelectorAll(":scope > *");
    var select = null;
    for(var i=0; i<lists.length; i++){
      if(lists[i].getAttribute("data-select") === "1"){
        select = lists[i];
        break;
      }
    }

    // カーソル操作
    switch(e.keyCode){
      case 38: // over
        if(select === null){
          select = lists[lists.length -1];
          select.setAttribute("data-select" , "1");
        }
        else if(select.previousSibling){
          select.previousSibling.setAttribute("data-select" , "1");
          select.removeAttribute("data-select");
        }
        break;

      case 40: // under
        if(select === null){
          select = lists[0];
          select.setAttribute("data-select" , "1");
        }
        else if(select.nextSibling){
          select.nextSibling.setAttribute("data-select" , "1");
          select.removeAttribute("data-select");
        }
        break;

      case 13: // enter
        document.activeElement.value = select.getAttribute("data-val");
        event.preventDefault();
        this.all_close();
        break;
    }
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


  return $$;
})();