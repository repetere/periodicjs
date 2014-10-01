(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * classie
 * http://github.amexpub.com/modules/classie
 *
 * Copyright (c) 2013 AmexPub. All rights reserved.
 */

module.exports = require('./lib/classie');

},{"./lib/classie":2}],2:[function(require,module,exports){
/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */
'use strict';

  // class helper functions from bonzo https://github.com/ded/bonzo

  function classReg( className ) {
    return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
  }

  // classList support for class management
  // altho to be fair, the api sucks because it won't accept multiple classes at once
  var hasClass, addClass, removeClass;

  if (typeof document === "object" && 'classList' in document.documentElement ) {
    hasClass = function( elem, c ) {
      return elem.classList.contains( c );
    };
    addClass = function( elem, c ) {
      elem.classList.add( c );
    };
    removeClass = function( elem, c ) {
      elem.classList.remove( c );
    };
  }
  else {
    hasClass = function( elem, c ) {
      return classReg( c ).test( elem.className );
    };
    addClass = function( elem, c ) {
      if ( !hasClass( elem, c ) ) {
        elem.className = elem.className + ' ' + c;
      }
    };
    removeClass = function( elem, c ) {
      elem.className = elem.className.replace( classReg( c ), ' ' );
    };
  }

  function toggleClass( elem, c ) {
    var fn = hasClass( elem, c ) ? removeClass : addClass;
    fn( elem, c );
  }

  var classie = {
    // full names
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    // short names
    has: hasClass,
    add: addClass,
    remove: removeClass,
    toggle: toggleClass
  };

  // transport

  if ( typeof module === "object" && module && typeof module.exports === "object" ) {
    // commonjs / browserify
    module.exports = classie;
  } else {
    // AMD
    define(classie);
  }

  // If there is a window object, that at least has a document property,
  // define classie
  if ( typeof window === "object" && typeof window.document === "object" ) {
    window.classie = classie;
  }
},{}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],4:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],6:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],7:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":6,"_process":5,"inherits":4}],8:[function(require,module,exports){
/*
 * linotype
 * @{@link https://github.com/typesettin/linotype}
 *
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 */

'use strict';

module.exports = require('./lib/linotype');

},{"./lib/linotype":9}],9:[function(require,module,exports){
/**
 * @title Linotype
 * @{@link https://github.com/typesettin/Linotype}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 */

'use strict';

var classie = require('classie'),
	extend = require('util-extend'),
	events = require('events'),
	util = require('util'),
	touchStartY = 0,
	touchStartX = 0,
	touchMoveStartY = 0,
	touchMoveStartX = 0,
	touchEndY = 0,
	touchEndX = 0;

/**
 * A module that represents a Linotype object, a Linotyper is a page composition tool.
 * @{@link https://github.com/typesettin/linotype}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @constructor Linotype
 * @requires module:classie
 * @requires module:util-extent
 * @requires module:util
 * @requires module:events
 */
var Linotype = function (options) {
	/** call event emitter */
	events.EventEmitter.call(this);

	/** module default configuration */
	var defaults = {
		idSelector: 'linotype',
		start: 0,
		currentSection: 0,
		delay: 300,
		easingdelay: 700,
		easing: false,
		isMoving: false,
		keyboardScrolling: true,
		touchevents: true,
		mousewheel: true,
		sections: null,
		numSections: 0,
		touchSensitivity: 5,
		sectionHeight: null,
		callback: false,
		normalscroll: false,
		continuous: false
	};
	this.$el = null;

	/** extended default options */
	this.options = extend(defaults, options);

	this.init(this.options);
};

/** Inherit event emitter */
util.inherits(Linotype, events.EventEmitter);

/**
 * Sets up a new lintotype component.
 */
Linotype.prototype.initEventListeners = function () {
	/**
	 * recalculate the window dimensions.
	 * @event resizeEventHandler
	 * @this {Linotype}
	 */
	var resizeEventHandler = function () {
		this.options.sectionHeight = this.options.$el.parentNode.clientHeight;
	}.bind(this);

	/**
	 * handle keyboard arrow events.
	 * @event keyboardEventHandler
	 * @param {object} e touch event object
	 * @this {Linotype}
	 */
	var keyboardEventHandler = function (e) {
		switch (e.which) {
			//up
		case 38:
		case 33:
			this.moveSectionUp();
			break;

			//down
		case 40:
		case 34:
			this.moveSectionDown();
			break;

			// 	//left
			// case 37:
			// 	this.moveSlideLeft();
			// 	break;

			// 	//right
			// case 39:
			// 	this.moveSlideRight();
			// 	break;

		default:
			return; // exit this handler for other keys
		}
	}.bind(this);

	/**
	 * handle mouse scroll wheel events.
	 * @event mouseWheelHandler
	 * @param {object} e touch event object
	 * @this {Linotype}
	 */
	var mouseWheelHandler = function (e) {
		e = window.event || e;
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.deltaY || -e.detail)));

		if (e.wheelDelta && e.deltaY) {
			var scrollratio = (e.wheelDelta / -e.deltaY),
				scrollfactor = (e.wheelDelta / 10);
			if (delta > 0 && scrollfactor > scrollratio) {
				this.moveSectionUp({
					checkScroll: true
				});
			}
			else if (delta < 0 && (scrollfactor * -1) > scrollratio) {
				this.moveSectionDown({
					checkScroll: true
				});
			}
		}
		else {
			if (delta < 0) {
				this.moveSectionDown({
					checkScroll: true
				});
			}
			else {
				this.moveSectionUp({
					checkScroll: true
				});
			}
		}

	}.bind(this);

	/**
	 * Gets the pageX and pageY properties depending on the browser.
	 * https://github.com/alvarotrigo/fullPage.js/issues/194#issuecomment-34069854
	 * @param {object} e touch event object
	 * @returns {object} events object of page touch points
	 */
	var getEventsPage = function (e) {
		var events = [];
		if (window.navigator.msPointerEnabled) {
			events.y = e.pageY;
			events.x = e.pageX;
		}
		else if (e.changedTouches) {
			events.y = e.changedTouches[0].pageY;
			events.x = e.changedTouches[0].pageX;
		}
		else {
			events.y = e.touches[0].pageY;
			events.x = e.touches[0].pageX;
		}
		return events;
	};

	/**
	 * handle touch start events
	 * @event touchStartHandler
	 * @param {object} e touch event object
	 */
	var touchStartHandler = function (e) {
		var touchEvents = getEventsPage(e);
		touchStartY = touchEvents.y;
		touchStartX = touchEvents.x;
		if (e.touches) {
			touchMoveStartY = e.touches[0].screenY;
			touchMoveStartX = e.touches[0].screenX;
		}
	};

	/**
	 * handle touch move events
	 * @event touchMoveHandler
	 * @param {object} e touch event object
	 * @this {Linotype}
	 */
	var touchMoveHandler = function (e) {
		var touchEvents = getEventsPage(e);
		touchEndY = touchEvents.y;
		touchEndX = touchEvents.x;

		// if (e.touches) {
		// 	this.options.firstsection.style['margin-top'] = (Math.abs(touchMoveStartY - e.touches[0].screenY) + (this.options.sectionHeight * this.options.currentSection)) * -1;
		// }
	}.bind(this);

	/**
	 * handle touch end events
	 * @event touchEndHandler
	 * @param {object} e touch event object
	 */
	var touchEndHandler = function (e) {
		var touchEvents = getEventsPage(e);
		touchEndY = touchEvents.y;
		touchEndX = touchEvents.x;

		if (!this.options.isMoving) {
			//is the movement greater than the minimum resistance to scroll?
			if (Math.abs(touchStartY - touchEndY) > (this.options.sectionHeight / 100 * this.options.touchSensitivity)) {
				if (touchStartY > touchEndY) {
					this.moveSectionDown({
						checkScroll: true
					});
				}
				else if (touchEndY > touchStartY) {
					this.moveSectionUp({
						checkScroll: true
					});
				}
			}
		}
	}.bind(this);

	if (typeof window === 'object' && typeof window.document === 'object') {
		window.addEventListener('resize', resizeEventHandler, false);
		if (this.options.keyboardScrolling) {
			//if this.options.$el is visable/getboundingrect is in window viewport, then add handler, if not remove
			window.addEventListener('keydown', keyboardEventHandler, false);
		}
		if (this.options.mousewheel) {
			this.options.$el.addEventListener('mousewheel', mouseWheelHandler, false); //IE9, Chrome, Safari, Oper
			this.options.$el.addEventListener('wheel', mouseWheelHandler, false); //Firefox
		}
		if (this.options.touchevents) {
			this.options.$el.addEventListener('touchstart', touchStartHandler, false);
			this.options.$el.addEventListener('MSPointerDown', touchStartHandler, false);
			this.options.$el.addEventListener('touchmove', touchMoveHandler, false);
			this.options.$el.addEventListener('MSPointerMove', touchMoveHandler, false);
			this.options.$el.addEventListener('touchend', touchEndHandler, false);
			this.options.$el.addEventListener('MSPointerEnd', touchEndHandler, false);
		}
	}
};
/**
 * Sets up a new lintotype component.
 * @param {object} options - configuration options
 * @emits - init
 */
Linotype.prototype.init = function (options) {
	this.options = options;
	this.options.$el = document.getElementById(this.options.idSelector);
	this.options.sections = document.querySelectorAll('#' + this.options.idSelector + ' .section');
	this.options.firstsection = this.options.sections[0];
	this.options.numSections = this.options.sections.length;
	this.options.sectionHeight = this.options.$el.parentNode.clientHeight;
	this.options.elementParent = this.options.$el.parentNode;
	if (document.addEventListener && this.options.normalscroll === false) {
		classie.addClass(this.options.$el, 'linotype-has-js');
		this.initEventListeners();
	}
	if (this.options.easing) {
		classie.addClass(this.options.$el, 'easing');
	}
	if (this.options.start !== 0) {
		this.section(this.options.start);
	}
	this.emit('init', this.options);
};
/**
 * Move Section up Shortcut.
 * @param {object} moveOptions - only move if there is not an internal element with a scroll
 */
Linotype.prototype.moveSectionUp = function (moveOptions) {
	var currentIndex = this.options.currentSection,
		limitOnScroll = (moveOptions && moveOptions.checkScroll);
	if (limitOnScroll && this.options.sections[currentIndex].scrollTop > 10) {
		currentIndex = this.options.currentSection;
	}
	else {
		this.moveSection({
			direction: 'up'
		});
	}
};
/**
 * Move Section down Shortcut.
 * @param {object} moveOptions - only move if there is not an internal element with a scroll
 */
Linotype.prototype.moveSectionDown = function (moveOptions) {
	var currentIndex = this.options.currentSection,
		limitOnScroll = (moveOptions && moveOptions.checkScroll);
	if (limitOnScroll && this.options.sections[currentIndex].scrollHeight > this.options.sectionHeight && ((this.options.sections[currentIndex].scrollTop + this.options.sectionHeight) < this.options.sections[currentIndex].scrollHeight)) {
		currentIndex = this.options.currentSection;
	}
	else {
		this.moveSection({
			direction: 'down'
		});
	}
};
/**
 * Move Section down Shortcut.
 * @param {number} sectionIndex - index of section ot jump to
 */
Linotype.prototype.section = function (sectionIndex) {
	if (!this.options.isMoving) {
		var index = (sectionIndex) ? parseInt(sectionIndex, 10) : 0;
		this.options.sections[sectionIndex].scrollTop = 0;
		this.options.isMoving = true;
		this.options.firstsection.style['margin-top'] = this.options.sectionHeight * -1 * index + 'px';
		this.options.currentSection = index;
		for (var i = 0; i < this.options.numSections; i++) {
			classie.removeClass(this.options.sections[i], 'active');
		}
		classie.addClass(this.options.sections[index], 'active');
		var delaytiming = (this.options.easing) ? this.options.easingdelay : this.options.delay;
		var t = setTimeout(function () {
			this.options.isMoving = false;
			clearTimeout(t);
		}.bind(this), delaytiming);
		if (typeof this.options.callback === 'function') {
			this.options.callback(index);
		}
		this.emit('section', index);
	}
};
/**
 * Shift section
 * @inner
 * @param {object} options - move direction options
 */
Linotype.prototype.moveSection = function (options) {
	var direction = 'down';

	switch (options.direction) {
	case 'up':
		direction = 'up';
		if (this.options.currentSection > 0) {
			this.section(this.options.currentSection - 1);
		}
		else if (this.options.continuous && this.options.currentSection === 0) {
			this.section(this.options.numSections - 1);
		}
		break;
	default:
		direction = 'down';
		if (this.options.currentSection < this.options.numSections - 1) {
			this.section(this.options.currentSection + 1);
		}
		else if (this.options.continuous && this.options.currentSection === this.options.numSections - 1) {
			this.section(0);
		}
		break;
	}
	this.emit('movedSection', direction);
};
/**
 * Returns current linotype config element.
 * @return {object} - linotype instance configuration object
 */
Linotype.prototype.config = function () {
	return this.lintotypeDomElement;
};
/**
 * sample event emitter test
 * @event emitTest
 * @fires - emittest
 * @param {object} options sample object to return
 * @return {object} @param options
 */
Linotype.prototype.emitTest = function (options) {
	this.emit('emittest', options);
};

module.exports = Linotype;


// If there is a window object, that at least has a document property,
// define Linotype
if (typeof window === 'object' && typeof window.document === 'object') {
	window.Linotype = Linotype;
}

},{"classie":1,"events":3,"util":7,"util-extend":10}],10:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = extend;
function extend(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || typeof add !== 'object') return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}

},{}],11:[function(require,module,exports){
/*
 * component.navigation-header
 * http://github.amexpub.com/modules/component.navigation-header
 *
 * Copyright (c) 2013 AmexPub. All rights reserved.
 */

'use strict';

module.exports = require('./lib/component.navigation-header');

},{"./lib/component.navigation-header":12}],12:[function(require,module,exports){
/**
 * @title component.navigation-header
 * @{@link https://github.com/typesettin/component.navigation-header}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 */
'use strict';

var classie = require('classie'),
	extend = require('util-extend'),
	events = require('events'),
	util = require('util');

/**
 * recalculate the window dimensions.
 * @method getEventTarget
 * @param {object} e event object
 * @returns {object} dom element event target
 */
var getEventTarget = function (e) {
	// e = e || window.event;
	return e.target || e.srcElement;
};

/**
 * A module that a fixed navigation header.
 * @{@link https://github.com/typesettin/component.navigation-header}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @constructor navigationHeader
 * @requires module:classie
 * @requires module:util-extent
 * @requires module:util
 * @requires module:events
 */
var navigationHeader = function (config) {
	/** call event emitter */
	events.EventEmitter.call(this);

	/** navigation style options array */
	this.navStyles = ['ha-header-large', 'ha-header-small', 'ha-header-hide', 'ha-header-show', 'ha-header-subshow', 'ha-header-shrink', 'ha-header-rotate', 'ha-header-rotateBack', 'ha-header-color', 'ha-header-box', 'ha-header-fullscreen', 'ha-header-subfullscreen'];
	this.emit('navigationInitialized');
	/** sub navigation style object mapper to navigation style, this allows for quick assignmnent of a navigation style and a sub navigaiton style */
	this.subNavStyles = {
		0: 4,
		1: 4,
		2: 4,
		5: 6,
		7: 6,
		8: 11,
		9: 11,
		10: 11
	};

	this.init = function (options) {
		return this._init(options);
	};
	/** set the navigation style
	 * @param {number} style index of style in @this.navStyles
	 */
	this.showNav = function (style) {
		return this._showNav(style);
	};
	/** show the sub navigation style
	 *	@inner showSubNav
	 * @param {number} style index of style in @this.navStyles
	 */
	this.showSubNav = function (subnavToShow) {
		return this._showSubNav(subnavToShow);
	};
	this.hideSubNav = function () {
		return this._hideSubNav();
	};

	this.init(config);
};

util.inherits(navigationHeader, events.EventEmitter);

/**
 * Sets up a new navigation header component.
 * @param {object} options - configuration options
 * @emits - navigationInitialized
 * @private
 */
navigationHeader.prototype._init = function (options) {
	var defaults = {
		idSelector: 'ha-header',
		navStyle: 7,
		subNavStyle: 6
	};
	options = options || {};
	this.options = extend(defaults, options);
	this.options.element = this.options.idSelector;
	this.$el = document.getElementById(this.options.element);
	this._initEvents();
	this.emit('navigationInitialized');
};
/**
 * Returns current navigation header config object.
 * @return {object} - navigation header instance configuration object
 */
navigationHeader.prototype.getOptions = function () {
	return this.options;
};
/**
 * updates the state of the navigation element
 * @private
 */
navigationHeader.prototype._config = function () {
	// the list of items
	this.$list = this.$el.getElementsByTagName('ul')[0];
	this.$items = this.$list.getElementsByTagName('li');
	this.current = 0;
	this.old = 0;
};
/**
 * initializes navigation element events
 * @private
 */
navigationHeader.prototype._initEvents = function () {
	var self = this;
	/**
	 * recalculate the window dimensions.
	 * @event openSubNav
	 * @param {object} event event object
	 */
	var openSubNav = function (event) {
		// console.log('moving on nav');
		var target = getEventTarget(event);
		if (classie.hasClass(target, 'has-sub-nav')) {
			self.showSubNav(target.getAttribute('data-navitr'));
			self.$navbar.removeEventListener('mousemove', openSubNav);
		}
	};
	this.$navbar = document.getElementById(this.options.element + '-nav-id');
	this.$subnavbar = document.getElementById(this.options.element + '-subnav-id');
	this.$navbar.addEventListener('mousemove', openSubNav);
	this.$subnavbar.addEventListener('mouseleave', function () {
		self.hideSubNav();
		self.$navbar.addEventListener('mousemove', openSubNav);
	});
};
/**
 * set the navigation element style, by looking up the style in the navstyle array.
 * @private
 * @param {number} style style option
 * @fires - navigationShowEvent
 */
navigationHeader.prototype._showNav = function (style) {
	if (typeof style === 'number') {
		this.$el.setAttribute('class', 'ha-header ' + this.navStyles[style]);
		this.options.navStyle = style;
		this.emit('navigationShowEvent');
	}
};
/**
 * show the mapped subnav style by looking up the mapping in the style mapping object.
 * @private
 * @param {number} subnavToShow style option
 * @fires - navigationSubNavShowEvent
 */
navigationHeader.prototype._showSubNav = function (subnavToShow) {
	var subNavItems = this.$subnavbar.getElementsByTagName('nav');
	for (var x in subNavItems) {
		if (subNavItems[x].style) {
			subNavItems[x].style.display = 'none';
			if (subNavItems[x].getAttribute('data-itr') === subnavToShow) {
				subNavItems[x].style.display = 'block';
			}
		}
	}
	var subnavid = this.subNavStyles[this.options.navStyle.toString()];
	this.$el.setAttribute('class', 'ha-header ' + this.navStyles[subnavid]);
	this.options.subNavStyle = subnavid;
	this.emit('navigationSubNavShowEvent');
};
/**
 * hides the subnav.
 * @private
 * @fires - navigationHideNavShowEvent
 */
navigationHeader.prototype._hideSubNav = function () {
	var navid = this.options.navStyle;
	this.$el.setAttribute('class', 'ha-header ' + this.navStyles[navid]);
	this.options.navStyle = navid;
	this.emit('navigationHideNavShowEvent');
};
module.exports = navigationHeader;

},{"classie":1,"events":3,"util":7,"util-extend":13}],13:[function(require,module,exports){
module.exports=require(10)
},{"/Users/yawetse/Developer/test/periodic150/periodicjs/content/themes/periodicjs.theme.periodical/node_modules/linotypejs/node_modules/util-extend/extend.js":10}],14:[function(require,module,exports){
'use strict';

var classie = require('classie'),
	periodicalTheme = require('./periodical.theme'),
	theme = new periodicalTheme(),
	// disable/enable scroll (mousewheel and keys) from http://stackoverflow.com/a/4770179					
	// left: 37, up: 38, right: 39, down: 40,
	// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
	docElem = window.document.documentElement,
	scrollVal,
	isRevealed,
	noscroll,
	container,
	trigger,
	Linotype = require('linotypejs'),
	LinotypeCollection,
	linotypeelement;

var scrollY = function () {
	return window.pageYOffset || docElem.scrollTop;
};

var toggle = function (reveal) {

	if (container) {
		if (reveal) {
			classie.add(container, 'modify');

		}
		else {
			classie.remove(container, 'modify');
		}
	}
};

var scrollPage = function () {
	if (container) {
		scrollVal = scrollY();

		if (scrollVal < 5) {
			classie.remove(container, 'modify');
		}
		else {
			classie.add(container, 'modify');
		}
	}
};

window.addEventListener('scroll', scrollPage, false);

window.addEventListener('load', function () {

	//items
	container = document.getElementById('container');
	if (container) {
		trigger = container.querySelector('button.trigger');
		// refreshing the page...
		var pageScroll = scrollY();
		noscroll = pageScroll === 0;

		console.log('pageScroll', pageScroll);
		if (pageScroll) {
			isRevealed = true;
			classie.add(container, 'modify');
		}

		trigger.addEventListener('click', function () {
			toggle('reveal');
		});
	}
	//collections
	linotypeelement = document.getElementById('linotype');
	if (linotypeelement) {
		LinotypeCollection = new Linotype({
			easing: true,
		});
	}
	window.LinotypeCollection = LinotypeCollection;

}, false);

},{"./periodical.theme":15,"classie":1,"linotypejs":8}],15:[function(require,module,exports){
'use strict';

var navigationHeader = require('periodicjs.theme-component.navigation-header'),
	classie = require('classie'),
	periodicalNavigation,
	navScrollElementTransition,
	navElement;

var lazyloadBackgroundMedia = function (backgroundMedia) {
	classie.removeClass(backgroundMedia, 'lazyload');
};

var sizeAndPositionBackgroundMedia = function (backgroundMedia) {
	var mediaWidth = backgroundMedia.clientWidth,
		mediaHeight = backgroundMedia.clientHeight,
		windowWidth = window.innerWidth,
		windowHeight = window.innerHeight,
		widthDifference = mediaWidth / windowWidth,
		heightDifference = mediaHeight / windowHeight;
	// console.log('backgroundMedia', backgroundMedia, mediaWidth, mediaHeight, windowWidth, windowHeight, 'widthDifference', widthDifference, 'heightDifference', heightDifference);
	console.log('resize');

	if (widthDifference < heightDifference) {
		var heightOffset = ((mediaHeight / widthDifference) - windowHeight) / 2 * -1;
		if (widthDifference < 1) {
			heightOffset = ((mediaHeight / widthDifference) / 2) * -1;
		}
		backgroundMedia.style.width = '100%';
		backgroundMedia.style.height = 'auto';
		backgroundMedia.style['margin-top'] = heightOffset + 'px';
	}
	else {
		var widthOffset = ((mediaWidth / heightDifference) - windowWidth) / 2 * -1;
		if (heightDifference < 1) {
			widthOffset = ((mediaWidth / heightDifference) / 2) * -1;
		}
		backgroundMedia.style.height = '100%';
		backgroundMedia.style.width = 'auto';
		backgroundMedia.style['margin-left'] = widthOffset + 'px';
	}
	if (classie.hasClass(backgroundMedia, 'lazyload')) {
		lazyloadBackgroundMedia(backgroundMedia);
	}
};

var scrollListener = function () {
	if (navScrollElementTransition && navElement && window.pageYOffset > 5) {
		classie.remove(navElement, 'transparent');
	}
	else if (navScrollElementTransition && navElement && window.pageYOffset < 5) {
		classie.add(navElement, 'transparent');
	}
};

var periodicaltheme = function () {
	window.addEventListener('load', function () {
		periodicalNavigation = new navigationHeader({
			idSelector: 'ha-header',
			navStyle: 1,
			subNavStyle: 4
		});
		window.periodicalthemenavigation = periodicalNavigation;
		navElement = document.getElementById('ha-header');
		navScrollElementTransition = (typeof window.useNavTransparency === 'undefined' || window.useNavTransparency === true) ? true : false;
		scrollListener();
	}, false);

	window.addEventListener('scroll', scrollListener, false);
	return {
		navigation: periodicalNavigation,
		sizeAndPositionBackgroundMedia: sizeAndPositionBackgroundMedia,
		lazyloadBackgroundMedia: lazyloadBackgroundMedia
	};
};

module.exports = periodicaltheme;

},{"classie":1,"periodicjs.theme-component.navigation-header":11}]},{},[14]);
