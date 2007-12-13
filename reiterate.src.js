Function.from = function(iterator) {
  if (iterator.toFunction) return iterator.toFunction();
  if (typeof iterator == 'function') return iterator;
  if (typeof iterator == 'object') return Function.fromObject(iterator);
  return function(x) { return x; };
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
