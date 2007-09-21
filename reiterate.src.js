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
//a function before passing it on to the original method. This has been tested against Prototype
// edge and includes methods defined in Prototype 1.6.0 if they are available.

Function.from = function(iterator) {
  if (typeof iterator == 'function') return iterator;
  if (iterator.toFunction) return iterator.toFunction();
  if (typeof iterator == 'object') return $H(iterator).toFunction();
  return Prototype.K;
};

String.prototype.toFunction = function() {
  var properties = this.split('.');
  if (!properties[0]) return Prototype.K;
  return function(o) {
    var object, member = o;
    properties.each(function(p) {
      object = member;
      member = object[p];
      if (typeof member == 'function') member = member.apply(object);
    });
    return member;
  };
};

Array.prototype.toFunction = function() {
  var method = this[0], args = this.slice(1);
  if (!method) return Prototype.K;
  return function(o) {
    var fn = o[method];
    return (typeof fn == 'function') ? fn.apply(o, args) : undefined;
  };
};

Hash.prototype.toFunction = function() {
  if (this.keys().length === 0) return Prototype.K;
  var hash = this;
  return function(o) {
    return hash.keys().inject(true, function(result, key) {
      var fn = o[key], args = hash[key];
      if (typeof fn == 'function' && !(args instanceof Array)) args = [args];
      return result && ((typeof fn == 'function') ? fn.apply(o, args) : fn == args);
    });
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
