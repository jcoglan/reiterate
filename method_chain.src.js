Function.MethodChain = function(base) {
  var queue = [], baseObject = base || {};
  
  this.____ = function(method, args) {
    queue.push({func: method, args: args});
  };
  
  this.fire = function(base) {
    return Function.MethodChain.fire(queue, base || baseObject);
  };
};

Function.MethodChain.fire = function(queue, object) {
  var method, property, i, n;
  loop: for (i = 0, n = queue.length; i < n; i++) {
    method = queue[i];
    if (object instanceof Function.MethodChain) {
      object.____(method.func, method.args);
      continue;
    }
    switch (typeof method.func) {
      case 'string':    property = object[method.func];       break;
      case 'function':  property = method.func;               break;
      case 'object':    object = method.func; continue loop;  break;
    }
    object = (typeof property == 'function')
        ? property.apply(object, method.args)
        : property;
  }
  return object;
};

Function.MethodChain.prototype = {
  _: function() {
    var base = arguments[0], args, i, n;
    switch (typeof base) {
      case 'object': case 'function':
        args = [];
        for (i = 1, n = arguments.length; i < n; i++) args.push(arguments[i]);
        this.____(base, args);
    }
    return this;
  },
  
  toFunction: function() {
    var chain = this;
    return function(object) { return chain.fire(object); };
  }
};

Function.MethodChain.reserved = (function() {
  var names = [], key;
  for (key in new Function.MethodChain) names.push(key);
  return new RegExp('^(?:' + names.join('|') + ')$');
})();

Function.MethodChain.addMethod = function(name) {
  if (this.reserved.test(name)) return;
  this.prototype[name] = function() {
    this.____(name, arguments);
    return this;
  };
};

Function.MethodChain.addMethods = function(object) {
  var methods = [], property, i, n;
  
  for (property in object)
    Number(property) != property && methods.push(property);
  
  if (object instanceof Array) {
    for (i = 0, n = object.length; i < n; i++)
      typeof object[i] == 'string' && methods.push(object[i]);
  }
  for (i = 0, n = methods.length; i < n; i++)
    this.addMethod(methods[i]);
  
  object.prototype &&
    this.addMethods(object.prototype);
};

it = its = function() { return new Function.MethodChain; };

Function.MethodChain.addMethods([
  "abbr", "abs", "accept", "acceptCharset", "accesskey", "acos", "action", "addEventListener", 
  "adjacentNode", "align", "alignWithTop", "alink", "alt", "anchor", "appendChild", "appendedNode", 
  "apply", "archive", "arguments", "arity", "asin", "atan", "atan2", "attrNode", "attributes", 
  "axis", "background", "bgcolor", "big", "blink", "blur", "bold", "border", "call", "caller", 
  "ceil", "cellpadding", "cellspacing", "char", "charAt", "charCodeAt", "charoff", "charset", 
  "checked", "childNodes", "cite", "className", "classid", "clear", "click", "clientHeight", 
  "clientLeft", "clientTop", "clientWidth", "cloneNode", "code", "codebase", "codetype", "color", 
  "cols", "colspan", "compact", "concat", "content", "coords", "cos", "data", "datetime", "declare", 
  "deep", "defer", "dir", "disabled", "dispatchEvent", "enctype", "event", "every", "exec", "exp", 
  "face", "filter", "firstChild", "fixed", "floor", "focus", "fontcolor", "fontsize", "forEach", 
  "frame", "frameborder", "fromCharCode", "getAttribute", "getAttributeNS", "getAttributeNode", 
  "getAttributeNodeNS", "getDate", "getDay", "getElementsByTagName", "getElementsByTagNameNS", 
  "getFullYear", "getHours", "getMilliseconds", "getMinutes", "getMonth", "getSeconds", "getTime", 
  "getTimezoneOffset", "getUTCDate", "getUTCDay", "getUTCFullYear", "getUTCHours", 
  "getUTCMilliseconds", "getUTCMinutes", "getUTCMonth", "getUTCSeconds", "getYear", "global", 
  "handler", "hasAttribute", "hasAttributeNS", "hasAttributes", "hasChildNodes", "hasOwnProperty", 
  "headers", "height", "href", "hreflang", "hspace", "htmlFor", "httpEquiv", "id", "ignoreCase", 
  "index", "indexOf", "innerHTML", "input", "insertBefore", "insertedNode", "isPrototypeOf", "ismap", 
  "italics", "join", "label", "lang", "language", "lastChild", "lastIndex", "lastIndexOf", "length", 
  "link", "listener", "localName", "log", "longdesc", "map", "marginheight", "marginwidth", "match", 
  "max", "maxlength", "media", "method", "min", "multiline", "multiple", "name", "namespace", 
  "namespaceURI", "nextSibling", "node", "nodeName", "nodeType", "nodeValue", "nohref", "noresize", 
  "normalize", "noshade", "now", "nowrap", "object", "offsetHeight", "offsetLeft", "offsetParent", 
  "offsetTop", "offsetWidth", "onblur", "onchange", "onclick", "ondblclick", "onfocus", "onkeydown", 
  "onkeypress", "onkeyup", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", 
  "onmouseup", "onreset", "onselect", "onsubmit", "onunload", "ownerDocument", "parentNode", "parse", 
  "pop", "pow", "prefix", "previousSibling", "profile", "prompt", "propertyIsEnumerable", "push", 
  "random", "readonly", "reduce", "reduceRight", "rel", "removeAttribute", "removeAttributeNS", 
  "removeAttributeNode", "removeChild", "removeEventListener", "removedNode", "replace", 
  "replaceChild", "replacedNode", "rev", "reverse", "round", "rows", "rowspan", "rules", "scheme", 
  "scope", "scrollHeight", "scrollIntoView", "scrollLeft", "scrollTop", "scrollWidth", "scrolling", 
  "search", "selected", "setAttribute", "setAttributeNS", "setAttributeNode", "setAttributeNodeNS", 
  "setDate", "setFullYear", "setHours", "setMilliseconds", "setMinutes", "setMonth", "setSeconds", 
  "setTime", "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds", "setUTCMinutes", 
  "setUTCMonth", "setUTCSeconds", "setYear", "shape", "shift", "sin", "size", "slice", "small", 
  "some", "sort", "source", "span", "splice", "split", "sqrt", "src", "standby", "start", "strike", 
  "style", "sub", "substr", "substring", "summary", "sup", "tabIndex", "tabindex", "tagName", "tan", 
  "target", "test", "text", "textContent", "title", "toArray", "toFunction", "toGMTString", 
  "toLocaleDateString", "toLocaleFormat", "toLocaleString", "toLocaleTimeString", "toLowerCase", 
  "toSource", "toString", "toUTCString", "toUpperCase", "type", "unshift", "unwatch", "useCapture", 
  "usemap", "valign", "value", "valueOf", "valuetype", "version", "vlink", "vspace", "watch", "width"
]);
[Ajax, Array, Class, Date, Element, Element.Methods, Element.Methods.Simulated,
Enumerable, Event, Form, Form.Element, Function, Hash, Insertion, Number, Object,
ObjectRange, PeriodicalExecuter, Position, Prototype, String, Template,
document].each(Function.MethodChain.addMethods.bind(Function.MethodChain));
