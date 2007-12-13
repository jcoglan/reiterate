Function.ChainCollector = function(base) {
  var CLASS = arguments.callee;
  
  this.then = this.and = this;
  var queue = [], baseObject = base || {};
  
  this.____ = function(method, args) {
    queue.push({func: method, args: args});
  };
  
  this.fire = function(base) {
    var object = base || baseObject, method, property;
    for (var i = 0, n = queue.length; i < n; i++) {
      method = queue[i];
      if (object instanceof CLASS) {
        object.____(method.func, method.args);
        continue;
      }
      property = object[method.func];
      object = (typeof property == 'function')
          ? property.apply(object, method.args)
          : property;
    }
    return object;
  };
  
  this.toFunction = function() {
    var chain = this;
    if (it instanceof CLASS) it = new CLASS();
    if (its instanceof CLASS) its = new CLASS();
    return function(o) { return chain.fire(o); };
  };
};

Function.ChainCollector.addMethods = function(object) {
  var methods = [], property, i, n, name;
  var self = this.prototype;
  
  var reservedNames = [], blank = new this();
  for (property in blank) reservedNames.push(property);
  var re = new RegExp('^(?:' + reservedNames.join('|') + ')$');
  
  for (property in object) {
    if (Number(property) != property)
      methods.push(property);
  }
  if (object instanceof Array) {
    for (i = 0, n = object.length; i < n; i++) {
      if (typeof object[i] == 'string')
        methods.push(object[i]);
    }
  }
  for (i = 0, n = methods.length ; i < n; i++)
    (function(name) {
      if (re.test(name)) return;
      self[name] = function() {
        this.____(name, arguments);
        return this;
      };
    })(methods[i]);
  
  if (object.prototype)
    this.addMethods(object.prototype);
};

Function.ALL_METHODS = [
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
];

[Array, Date, Element.Methods, Element.Methods.Simulated, Enumerable, Event,
Form, Form.Element, Function, Hash, Number, Object, ObjectRange, Position,
String, Template].each(function(object) {
  var property;
  for (property in object) Function.ALL_METHODS.push(property);
  for (property in object.prototype || {}) Function.ALL_METHODS.push(property);
});

Function.ALL_METHODS = Function.ALL_METHODS.uniq().sort();
Function.ChainCollector.addMethods(Function.ALL_METHODS);

var it = its = new Function.ChainCollector();
