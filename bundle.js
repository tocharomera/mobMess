(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw f.code = "MODULE_NOT_FOUND", f
      }
      var l = n[o] = {
        exports: {}
      };
      t[o][0].call(l.exports, function(e) {
        var n = t[o][1][e];
        return s(n ? n : e)
      }, l, l.exports, e, t, n, r)
    }
    return n[o].exports
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s
})({
  1: [function(require, module, exports) {
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
          } else {
            // At least give some kind of context to the user
            var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
            err.context = er;
            throw err;
          }
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
            args = Array.prototype.slice.call(arguments, 1);
            handler.apply(this, args);
        }
      } else if (isObject(handler)) {
        args = Array.prototype.slice.call(arguments, 1);
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
      } else if (listeners) {
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

    EventEmitter.prototype.listenerCount = function(type) {
      if (this._events) {
        var evlistener = this._events[type];

        if (isFunction(evlistener))
          return 1;
        else if (evlistener)
          return evlistener.length;
      }
      return 0;
    };

    EventEmitter.listenerCount = function(emitter, type) {
      return emitter.listenerCount(type);
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

  }, {}],
  2: [function(require, module, exports) {
    'use strict';

    var EventEmitter = require('events').EventEmitter;

    /**
     * Constructor
     */
    var BufferedQueue = function BufferedQueue(name, options) {

      // Call parent constructor
      EventEmitter.call(this);

      // Check whether supplied argument is a function or not
      function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
      }

      // Array for queue items
      this.Items = [];

      // Local properties
      this._name = (name ? name : Math.random().toString(16).slice(2));
      this._size = (options && 'size' in options) ? options.size : -1;
      this._flushTimeout = (options && 'flushTimeout' in options) ? options.flushTimeout : 5000;
      this._verbose = (options && 'verbose' in options) ? options.verbose : false;
      this._useCustomResultFunction = false;

      // Custom result function handling
      if (options && 'customResultFunction' in options && isFunction(options.customResultFunction)) {
        this._useCustomResultFunction = true;
        this._customResultFunction = options.customResultFunction;
      }

      // Trigger for the timed Queue flush
      this.intervalId = null;

    };

    /**
     * Inherit from `EventEmitter.prototype`.
     */
    BufferedQueue.prototype = Object.create(EventEmitter.prototype, {
      name: {
        get: function() {
          return this._name;
        }
      },
      size: {
        get: function() {
          return this._size;
        }
      },
      flushTimeout: {
        get: function() {
          return this._flushTimeout;
        }
      },
      verbose: {
        get: function() {
          return this._verbose;
        }
      },
      json: {
        get: function() {
          return JSON.stringify(this.Items);
        }
      },
      items: {
        get: function() {
          return this.Items;
        }
      },
      maxQueueSizeReached: {
        get: function() {
          var bool = this.Items.length >= this._size;
          if (bool) {
            // Trigger Queue flush
            if (this._verbose) console.log('Queue (' + this._name + '): Maximum Queue size reached!');
          } else {
            // Do nothing
            if (this._verbose) console.log('Queue (' + this._name + '): Maximum Queue size not reached. Currently ' + this.Items.length + ' of ' + this._size + ' in queue!');
          }
          return bool;
        }
      },
      add: {
        value: function(item) {

          // Add (fifo)
          this.Items[this.Items.length] = item;

          if (this._verbose) console.log('Queue (' + this._name + '): Added item: ', item);

          // Flush queue if max queue size is reached
          if (this.maxQueueSizeReached) {
            this.onFlush();
            // Start the timeout
          } else {
            this.startTimeout();
          }
        }
      },
      flushItems: {
        value: function() {
          // Erase contents of Items array
          this.Items.length = 0;
        }
      },
      recurringQueue: {
        value: function() {
          // Check if there's some work to do
          if (this.Items.length > 0) {
            if (this._verbose) console.log('Queue (' + this._name + '): The timeout triggered a Queue flush! ' + this.Items.length + ' items are in the Queue.');
            // Trigger Queue flush
            this.onFlush();
          } else {
            if (this._verbose) console.log('Queue (' + this._name + '): The timeout triggered a Queue flush, but there are no items!');
          }
        }
      },
      onFlush: {
        value: function() {
          // Stop the timeout
          this.stopTimeout();
          // Instantiate new Array etc.
          var data = new Array(this.Items.length),
            i = this.Items.length;
          // Populate new Array
          while (i--) {
            data[i] = this.Items[i];
          }
          // Emit flush event
          this.emit('flush', (this._useCustomResultFunction ? this._customResultFunction(data) : data), this.name);
          // Empty the queue
          this.flushItems();
        }
      },
      startTimeout: {
        value: function() {
          if (!this.intervalId) {
            var callback = this.recurringQueue.bind(this);
            this.intervalId = setTimeout(callback, this._flushTimeout);
          }
        }
      },
      stopTimeout: {
        value: function() {
          if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
          }
        }
      }
    });

    /**
     * Expose `BufferedQueue`.
     */
    module.exports = BufferedQueue;

    /**
     * Library version.
     */
    exports.version = '0.1.2';
  }, {
    "events": 1
  }],
  3: [function(require, module, exports) {
    "use strict";
    var Queue = require('buffered-queue');
    $(document).ready(init)
    var socket
    var cells
    $(window).scroll(function() {
      var scrollYpos = $(document).scrollTop();
      $(".sticky").css({
        'top': scrollYpos,
      });

    });
    var font = {
      '1': [1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1],
      '2': [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      '3': [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
      '4': [1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
      '5': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
      '6': [1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
      '7': [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
      '8': [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
      '9': [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1],
      '0': [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
      ' ': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      'a': [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
      'b': [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
      'c': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      'd': [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
      'e': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      'f': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
      'g': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      'h': [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
      'i': [0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0],
      'j': [0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1],
      'k': [0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0],
      'l': [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      'm': [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
      'n': [0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0],
      'o': [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      'p': [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
      'r': [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0],
      's': [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      't': [0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
      'x': [0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
      'v': [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1],
      'u': [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      'w': [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1],
      'y': [0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
      'z': [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      '!': [1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
      '?': [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],


    }

    function init() {
      $("#clear").click(function() {
        var code = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

        displayBits(code)
        $('#code').text("[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]")
      });

      cells = []
      for (var i = 0; i < 35; i++) {
        //select every cell
        var cell = $('#c' + i)
        cells.push(cell)
      }

      function pixels(code) {

        displayBits(code)
      }

      function finnished() {
        
        $("#msgsend").removeAttr('disabled');
        $('#msgsend').val("Send")

      }
      $('table.table td').click(function() {
        $(this).toggleClass('selected')
        var code = getUpdate()
        displayBits(code)

      })

      $(document).keypress(function(e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
          $('#msgsend').trigger("click");
        }
      });
      //message forme
      $('#msgsend').click(function() {
        
        $('#msgsend').val("Please Wait...")
        $('#msgsend').attr('disabled', 'disabled');


        var msg = $('#msginput').val()
        //$.get('/msg/' + msg)
        msgQueue(msg + ' ');
      })
      var displayHandler = null
      var lastMessage;

      function loop() {
        if (displayHandler === null) {
          setTimeout(function() {
            msgQueue(lastMessage)
          }, 1000);
        }
      }


      function msgQueue(msg) {
        lastMessage = msg;

        //msg.length = msg.length || 1000;
        var q = new Queue('msgBuffer', {
          size: 1,
          flushTimeout: 0,
          verbose: false,
          customResultFunction: function(items) {
            var temp = [];
            items.forEach(function(item, index, array) {

              temp.push(item.toLowerCase());
            });
            return temp.join('\n');
          }
        });
        if (displayHandler === null) {
          
          q.on("flush", function(data, name) {
        
            alter(data);

            setTimeout(function() {


            }, (0));
          });
        }
        q.add(msg);
        /*setTimeout(lastMess, lastMessage.length * 100)
         function lastMess(lastMessage){
           if(lastMessage === msg){
           msgQueue(lastMessage);}
         }*/
      }

      function alter(data) {
        
        displayMessage1(data)


        function displayMessage1(data) {
          var counter = 0;
          var mob = [];
          var msgIndex = -1;
          var letter;
          var letra;
          var limit = 50;
          var space;
          var oldMessage = data;
          (function myLoop(i) {
            setTimeout(function() {
              msgIndex++;
              displayHandler = msgIndex;
              displayHandler--;
              if (msgIndex === (data.length) - 1) {
                finnished();
             
                displayHandler = null;
                loop();
                //flag = true;
              }
              letter = data[msgIndex]
              if (letter in font) {
                letra = font[data[msgIndex]]
                //while (flag == false) {

                //}
              }
              pixels(font[data[msgIndex]]);
              if (msgIndex === data.length) {
                pixels(font[' ']);
              }
              if (--i) myLoop(i); //  decrement i and call myLoop again if i > 0
            }, 500)
          })(data.length);

        }


      }


      function getUpdate() {
        var bits = [];
        for (var i = 0; i < cells.length; i++) {
          var cell = cells[i]
          var bit = cell.hasClass('selected')
          //http://stackoverflow.com/questions/7820683/convert-boolean-result-into-number-integer#7820695
          bits.push(bit + false)

        }

        return bits
      }

      function displayBits(bits) {
        var code = ''
        for (var i = 0; i < bits.length; i++) {
          var cell = cells[i]
          var bit = bits[i]
          if (bit) {
            cell.addClass('selected')
            
          } else {
            cell.removeClass('selected')
          }
        }
        $('#code').text(code)
      }
      $(document).ready(function() {
        msgQueue("hello world! ");
      });
    }

  }, {
    "buffered-queue": 2
  }]
}, {}, [3]);
