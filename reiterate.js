Function.from=function(a){if(a.toFunction)return a.toFunction();if(typeof a=='function')return a;if(typeof a=='object')return Function.fromObject(a);return function(x){return x}};Function.OPERATORS={'+':function(x){return this+x},'-':function(x){return this-x},'*':function(x){return this*x},'/':function(x){return this/x},'%':function(x){return this%x},'<':function(x){return this<x},'<=':function(x){return this<=x},'>':function(x){return this>x},'>=':function(x){return this>=x},'==':function(x){return this.valueOf()==x},'!=':function(x){return this.valueOf()!=x},'===':function(x){return this.valueOf()===x},'!==':function(x){return this.valueOf()!==x},'&&':function(x){return this.valueOf()&&x},'&':function(x){return this&x},'||':function(x){return this.valueOf()||x},'|':function(x){return this|x},'typeof':function(x){return typeof this.valueOf()==x},'instanceof':function(x){return this instanceof x}};String.prototype.toFunction=function(){var b=this.split('.');if(!b[0])return function(x){return x};return function(o){var a,member=o,key;for(var i=0,n=b.length;i<n;i++){key=b[i];a=member;member=a[key];if(typeof member=='function')member=member.apply(a)}return member}};Array.prototype.toFunction=function(){var b=this[0],args=this.slice(1),op;if(!b)return function(x){return x};if(op=Function.OPERATORS[b])b=op;return function(o){var a=(typeof b=='function')?b:o[b];return(typeof a=='function')?a.apply(o,args):undefined}};Function.fromObject=function(b){var c=[];for(var d in b){if(b.hasOwnProperty(d))c.push(d)}if(c.length===0)return function(x){return x};return function(o){var a=true,key,fn,args,op;for(var i=0,n=c.length;i<n;i++){key=c[i];fn=o[key];args=b[key];if(op=Function.OPERATORS[key])fn=op;if(typeof fn=='function'&&!(args instanceof Array))args=[args];a=a&&((typeof fn=='function')?fn.apply(o,args):fn==args)}return a}};Hash.prototype.toFunction=function(){return Function.fromObject(this._object||this)};Function.ChainCollector=function(c){var d=arguments.callee;this.then=this.and=this;var e=[],baseObject=c||{};this.____=function(a,b){e.push({func:a,args:b})};this.fire=function(a){var b=a||baseObject,method,property;for(var i=0,n=e.length;i<n;i++){method=e[i];if(b instanceof d){b.____(method.func,method.args);continue}property=b[method.func];b=(typeof property=='function')?property.apply(b,method.args):property}return b};this.toFunction=function(){var a=this;return function(o){return a.fire(o)}}};Function.ChainCollector.addMethods=function(b){var c=[],property,i,n,name;var d=this.prototype;var e=[],blank=new this();for(property in blank)e.push(property);var f=new RegExp('^(?:'+e.join('|')+')$');for(property in b){if(Number(property)!=property)c.push(property)}if(b instanceof Array){for(i=0,n=b.length;i<n;i++){if(typeof b[i]=='string')c.push(b[i])}}for(i=0,n=c.length;i<n;i++)(function(a){if(f.test(a))return;d[a]=function(){this.____(a,arguments);return this}})(c[i]);if(b.prototype)this.addMethods(b.prototype)};Function.ALL_METHODS=["__defineGetter__","__defineSetter__","__lookupGetter__","__lookupSetter__","abbr","abs","accept","acceptCharset","accesskey","acos","action","align","alink","alt","apply","archive","arity","asin","atan","atan2","axis","background","bgcolor","border","call","caller","ceil","cellpadding","cellspacing","char","charAt","charCodeAt","charoff","charset","checked","cite","className","classid","clear","code","codebase","codetype","color","cols","colspan","compact","concat","content","coords","cos","data","datetime","declare","defer","dir","disabled","enctype","every","exec","exp","face","filter","floor","forEach","frame","frameborder","fromCharCode","getDate","getDay","getFullYear","getHours","getMilliseconds","getMinutes","getMonth","getSeconds","getTime","getTimezoneOffset","getUTCDate","getUTCDay","getUTCFullYear","getUTCHours","getUTCMilliseconds","getUTCMinutes","getUTCMonth","getUTCSeconds","getYear","global","hasOwnProperty","headers","height","href","hreflang","hspace","htmlFor","httpEquiv","id","ignoreCase","index","indexOf","innerHTML","input","isPrototypeOf","ismap","join","label","lang","language","lastIndex","lastIndexOf","length","link","log","longdesc","map","marginheight","marginwidth","match","max","maxlength","media","method","min","multiline","multiple","name","nohref","noresize","noshade","now","nowrap","object","onblur","onchange","onclick","ondblclick","onfocus","onkeydown","onkeypress","onkeyup","onload","onmousedown","onmousemove","onmouseout","onmouseover","onmouseup","onreset","onselect","onsubmit","onunload","parse","pop","pow","profile","prompt","propertyIsEnumerable","push","random","readonly","reduce","reduceRight","rel","replace","rev","reverse","round","rows","rowspan","rules","scheme","scope","scrolling","search","selected","setDate","setFullYear","setHours","setMilliseconds","setMinutes","setMonth","setSeconds","setTime","setUTCDate","setUTCFullYear","setUTCHours","setUTCMilliseconds","setUTCMinutes","setUTCMonth","setUTCSeconds","setYear","shape","shift","sin","size","slice","some","sort","source","span","splice","split","sqrt","src","standby","start","style","substr","substring","summary","tabindex","tan","target","test","text","title","toExponential","toFixed","toGMTString","toLocaleDateString","toLocaleFormat","toLocaleString","toLocaleTimeString","toLowerCase","toPrecision","toSource","toString","toUTCString","toUpperCase","type","unshift","unwatch","usemap","valign","value","valueOf","valuetype","version","vlink","vspace","watch","width"];[Array,Date,Element.Methods,Element.Methods.Simulated,Enumerable,Event,Form,Form.Element,Function,Hash,Number,Object,ObjectRange,Position,String,Template].each(function(a){var b;for(b in a)Function.ALL_METHODS.push(b);for(b in a.prototype||{})Function.ALL_METHODS.push(b)});Function.ALL_METHODS=Function.ALL_METHODS.uniq().sort();Function.ChainCollector.addMethods(Function.ALL_METHODS);var it=its=function(){return new Function.ChainCollector()};[Enumerable,Array.prototype,Hash.prototype,ObjectRange.prototype,Ajax.Responders,Element.ClassNames.prototype].each(function(d){$w('each all any collect detect findAll max min partition reject sortBy map find select filter every some').each(function(b){if(!d[b]){return}var c=d[b];d[b]=function(){var a=$A(arguments);if(a[0])a[0]=Function.from(a[0]);return c.apply(this,a)}});d.count=function(a,b){return this.findAll(a,b).length}});