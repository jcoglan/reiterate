// This file contains patches for Prototype that allow its iterator methods to use a much more
// concise syntax, similar to that offered by Symbol#to_proc and Methodphitamine in Ruby.
//
// A #toFunction method is added to Array, Hash and String, and a selection of Enumerable
// methods are patched to take advantage of the new syntax. See this Rails ticket for more info:
//
// http://dev.rubyonrails.org/ticket/9611
//
// Patches are applied unobtrusively to the objects and methods that require them by renaming
// existing methods and intercepting calls to them, so we can convert the iterator argument to
// a function before passing it on to the original method. This has been tested against Prototype
// edge and includes methods defined in Prototype 1.6.0 if they are available.

Function.from = function(iterator) {
  if (iterator.toFunction) return iterator.toFunction();
  if (typeof iterator == 'function') return iterator;
  if (typeof iterator == 'object') return Function.fromObject(iterator);
  return function(x) { return x; };
};

Function.OPERATORS = {
  '+'   : function(x) { return this + x; },
  '-'   : function(x) { return this - x; },
  '*'   : function(x) { return this * x; },
  '/'   : function(x) { return this / x; },
  '%'   : function(x) { return this % x; },
  '<'   : function(x) { return this < x; },
  '<='  : function(x) { return this <= x; },
  '>'   : function(x) { return this > x; },
  '>='  : function(x) { return this >= x; },
  '=='  : function(x) { return this.valueOf() == x; },
  '!='  : function(x) { return this.valueOf() != x; },
  '===' : function(x) { return this.valueOf() === x; },
  '!==' : function(x) { return this.valueOf() !== x; },
  '&&'  : function(x) { return this.valueOf() && x; },
  '&'   : function(x) { return this & x; },
  '||'  : function(x) { return this.valueOf() || x; },
  '|'   : function(x) { return this | x; },
  'typeof': function(x) { return typeof this.valueOf() == x; },
  'instanceof': function(x) { return this instanceof x; }
};

String.prototype.toFunction = function() {
  var properties = this.split('.');
  if (!properties[0]) return function(x) { return x; };
  return function(o) {
    var object, member = o, key;
    for (var i = 0, n = properties.length; i < n; i++) {
      key = properties[i];
      object = member;
      member = object[key];
      if (typeof member == 'function') member = member.apply(object);
    }
    return member;
  };
};

Array.prototype.toFunction = function() {
  var method = this[0], args = this.slice(1), op;
  if (!method) return function(x) { return x; };
  if (op = Function.OPERATORS[method]) method = op;
  return function(o) {
    var fn = (typeof method == 'function') ? method : o[method];
    return (typeof fn == 'function') ? fn.apply(o, args) : undefined;
  };
};

Function.fromObject = function(object) {
  var keys = [];
  for (var field in object) { if (object.hasOwnProperty(field)) keys.push(field); }
  if (keys.length === 0) return function(x) { return x; };
  return function(o) {
    var result = true, key, fn, args, op;
    for (var i = 0, n = keys.length; i < n; i++) {
      key = keys[i];
      fn = o[key]; args = object[key];
      if (op = Function.OPERATORS[key]) fn = op;
      if (typeof fn == 'function' && !(args instanceof Array)) args = [args];
      result = result && ((typeof fn == 'function') ? fn.apply(o, args) : fn == args);
    }
    return result;
  };
};

Hash.prototype.toFunction = function() {
  return Function.fromObject(this._object || this);
};

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

[Enumerable, Array.prototype, Hash.prototype, ObjectRange.prototype,
Ajax.Responders, Element.ClassNames.prototype].each(function(object) {
  $w('each all any collect detect findAll max min partition reject sortBy map find select filter every some').each(function(method) {
    if (!object[method]) { return; }
    var wrapped = object[method];
    object[method] = function() {
      var args = $A(arguments);
      if (args[0]) args[0] = Function.from(args[0]);
      return wrapped.apply(this, args);
    };
  });
  
  object.count = function(iterator, context) {
    return this.findAll(iterator, context).length;
  };
});
