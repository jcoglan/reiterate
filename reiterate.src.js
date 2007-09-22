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
  if (typeof iterator == 'function') return iterator;
  if (iterator.toFunction) return iterator.toFunction();
  if (typeof iterator == 'object') return $H(iterator).toFunction();
  return Prototype.K;
};

Function.Operators = {
  '+'   : function(x) { return this + x; },
  '-'   : function(x) { return this - x; },
  '*'   : function(x) { return this * x; },
  '/'   : function(x) { return this / x; },
  '%'   : function(x) { return this % x; },
  '<'   : function(x) { return this < x; },
  '<='  : function(x) { return this <= x; },
  '>'   : function(x) { return this > x; },
  '>='  : function(x) { return this >= x; },
  '=='  : function(x) { return Object.toValue(this, this.constructor) == x; },
  '!='  : function(x) { return Object.toValue(this, this.constructor) != x; },
  '===' : function(x) { return Object.toValue(this, this.constructor) === x; },
  '!==' : function(x) { return Object.toValue(this, this.constructor) !== x; },
  '&&'  : function(x) { return Object.toValue(this, this.constructor) && x; },
  '&'   : function(x) { return this & x; },
  '||'  : function(x) { return Object.toValue(this, this.constructor) || x; },
  '|'   : function(x) { return this | x; },
  'typeof': function(x) { return typeof Object.toValue(this, this.constructor) == x; },
  'instanceof': function(x) { return this instanceof x; }
};

Function.TopLevel = {
  'decodeURI'   : function() { return decodeURI(this); },
  'decodeURIComponent'  : function() { return decodeURIComponent(this); },
  'encodeURI'   : function() { return encodeURI(this); },
  'encodeURIComponent'  : function() { return encodeURIComponent(this); },
  'eval'        : function() { return eval(this); },
  'isFinite'    : function() { return isFinite(this); },
  'isNaN'       : function() { return isNaN(this); },
  'parseInt'    : function() { return parseInt(this); },
  'parseFloat'  : function() { return parseFloat(this); },
  'Number'      : function() { return Number(this); },
  'String'      : function() { return String(this); },
  'Boolean'     : function() { return Boolean(Object.toValue(this, this.constructor)); },
  'Array'       : function() { return (this instanceof Array) ? this : Array(this); },
  'Function'    : function() { return Function.apply(this, this instanceof Array ? this : [this]); },
  'RegExp'      : function() { return RegExp.apply(this, this instanceof Array ? this : [this]); },
  'Error'       : function() { return Error(this); }
};

Object.toValue = function(x, konstructor) {
  if (typeof x == 'undefined' || !konstructor) return undefined;
  if (konstructor == Boolean) return x == true;
  if ([Object, Function, Array].include(konstructor)) return x;
  return konstructor.call(this, x);
};

String.prototype.toFunction = function() {
  var properties = this.split('.');
  if (!properties[0]) return Prototype.K;
  return function(o) {
    var object, member = o, key;
    for (var i = 0, n = properties.length; i < n; i++) {
      key = properties[i];
      object = member;
      member = Function.TopLevel[key] || object[key];
      if (typeof member == 'function') member = member.apply(object);
    }
    return member;
  };
};

Array.prototype.toFunction = function() {
  var method = this[0], args = this.slice(1), op;
  if (!method) return Prototype.K;
  if (op = Function.Operators[method]) method = op;
  return function(o) {
    var fn = (typeof method == 'function') ? method : o[method];
    return (typeof fn == 'function') ? fn.apply(o, args) : undefined;
  };
};

Hash.prototype.toFunction = function() {
  var hash = this, keys = this.keys();
  if (keys.length === 0) return Prototype.K;
  return function(o) {
    var result = true, key, fn, args, op;
    for (var i = 0, n = keys.length; i < n; i++) {
      key = keys[i];
      fn = o[key]; args = hash[key];
      if (op = Function.Operators[key]) fn = op;
      if (typeof fn == 'function' && !(args instanceof Array)) args = [args];
      result = result && ((typeof fn == 'function') ? fn.apply(o, args) : fn == args);
    }
    return result;
  };
};

[Enumerable, Array.prototype, Hash.prototype, ObjectRange.prototype,
Ajax.Responders, Element.ClassNames.prototype].each(function(object) {
  $w('all any collect detect findAll max min partition reject sortBy map find select filter every some').each(function(method) {
    if (!object[method]) { return; }
    object['__' + method + '_sans_function_conversion'] = object[method];
    object[method] = function() {
      var args = $A(arguments);
      if (args[0]) args[0] = Function.from(args[0]);
      return this['__' + method + '_sans_function_conversion'].apply(this, args);
    };
  });
});
