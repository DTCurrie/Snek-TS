"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" == typeof require && require;if (!f && c) return c(i, !0);if (u) return u(i, !0);var a = new Error("Cannot find module '" + i + "'");throw a.code = "MODULE_NOT_FOUND", a;
        }var p = n[i] = { exports: {} };e[i][0].call(p.exports, function (r) {
          var n = e[i][1][r];return o(n || r);
        }, p, p.exports, r, e, n, t);
      }return n[i].exports;
    }for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
      o(t[i]);
    }return o;
  }return r;
})()({ 1: [function (require, module, exports) {
    (function (global) {
      "use strict";

      require("core-js/shim");

      require("regenerator-runtime/runtime");

      require("core-js/fn/regexp/escape");

      if (global._babelPolyfill) {
        throw new Error("only one instance of babel-polyfill is allowed");
      }
      global._babelPolyfill = true;

      var DEFINE_PROPERTY = "defineProperty";
      function define(O, key, value) {
        O[key] || Object[DEFINE_PROPERTY](O, key, {
          writable: true,
          configurable: true,
          value: value
        });
      }

      define(String.prototype, "padLeft", "".padStart);
      define(String.prototype, "padRight", "".padEnd);

      "pop,reverse,shift,keys,values,entries,indexOf,every,some,forEach,map,filter,find,findIndex,includes,join,slice,concat,push,splice,unshift,sort,lastIndexOf,reduce,reduceRight,copyWithin,fill".split(",").forEach(function (key) {
        [][key] && define(Array, key, Function.call.bind([][key]));
      });
    }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
  }, { "core-js/fn/regexp/escape": 5, "core-js/shim": 328, "regenerator-runtime/runtime": 331 }], 2: [function (require, module, exports) {
    'use strict';

    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;

    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }

    // Support decoding URL-safe base64 strings, as Node.js does.
    // See: https://en.wikipedia.org/wiki/Base64#URL_applications
    revLookup['-'.charCodeAt(0)] = 62;
    revLookup['_'.charCodeAt(0)] = 63;

    function getLens(b64) {
      var len = b64.length;

      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4');
      }

      // Trim off extra bytes after placeholder bytes are found
      // See: https://github.com/beatgammit/base64-js/issues/42
      var validLen = b64.indexOf('=');
      if (validLen === -1) validLen = len;

      var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;

      return [validLen, placeHoldersLen];
    }

    // base64 is 4/3 + up to two characters of the original data
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }

    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }

    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];

      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));

      var curByte = 0;

      // if there are placeholders, only get up to the last complete 4 chars
      var len = placeHoldersLen > 0 ? validLen - 4 : validLen;

      for (var i = 0; i < len; i += 4) {
        tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
        arr[curByte++] = tmp >> 16 & 0xFF;
        arr[curByte++] = tmp >> 8 & 0xFF;
        arr[curByte++] = tmp & 0xFF;
      }

      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
        arr[curByte++] = tmp & 0xFF;
      }

      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 0xFF;
        arr[curByte++] = tmp & 0xFF;
      }

      return arr;
    }

    function tripletToBase64(num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
    }

    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
        output.push(tripletToBase64(tmp));
      }
      return output.join('');
    }

    function fromByteArray(uint8) {
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
      var parts = [];
      var maxChunkLength = 16383; // must be multiple of 3

      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
      }

      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1];
        parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 0x3F] + '==');
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3F] + lookup[tmp << 2 & 0x3F] + '=');
      }

      return parts.join('');
    }
  }, {}], 3: [function (require, module, exports) {}, {}], 4: [function (require, module, exports) {
    /*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     */
    /* eslint-disable no-proto */

    'use strict';

    var base64 = require('base64-js');
    var ieee754 = require('ieee754');

    exports.Buffer = Buffer;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;

    var K_MAX_LENGTH = 0x7fffffff;
    exports.kMaxLength = K_MAX_LENGTH;

    /**
     * If `Buffer.TYPED_ARRAY_SUPPORT`:
     *   === true    Use Uint8Array implementation (fastest)
     *   === false   Print warning and recommend using `buffer` v4.x which has an Object
     *               implementation (most compatible, even IE6)
     *
     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
     * Opera 11.6+, iOS 4.2+.
     *
     * We report that the browser does not support typed arrays if the are not subclassable
     * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
     * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
     * for __proto__ and has a buggy typed array implementation.
     */
    Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

    if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error('This browser lacks typed array (Uint8Array) support which is required by ' + '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.');
    }

    function typedArraySupport() {
      // Can typed array instances can be augmented?
      try {
        var arr = new Uint8Array(1);
        arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function foo() {
            return 42;
          } };
        return arr.foo() === 42;
      } catch (e) {
        return false;
      }
    }

    Object.defineProperty(Buffer.prototype, 'parent', {
      enumerable: true,
      get: function get() {
        if (!Buffer.isBuffer(this)) return undefined;
        return this.buffer;
      }
    });

    Object.defineProperty(Buffer.prototype, 'offset', {
      enumerable: true,
      get: function get() {
        if (!Buffer.isBuffer(this)) return undefined;
        return this.byteOffset;
      }
    });

    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"');
      }
      // Return an augmented `Uint8Array` instance
      var buf = new Uint8Array(length);
      buf.__proto__ = Buffer.prototype;
      return buf;
    }

    /**
     * The Buffer constructor returns instances of `Uint8Array` that have their
     * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
     * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
     * and the `Uint8Array` methods. Square bracket notation works as expected -- it
     * returns a single octet.
     *
     * The `Uint8Array` prototype remains unmodified.
     */

    function Buffer(arg, encodingOrOffset, length) {
      // Common case.
      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new TypeError('The "string" argument must be of type string. Received type number');
        }
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }

    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    if (typeof Symbol !== 'undefined' && Symbol.species != null && Buffer[Symbol.species] === Buffer) {
      Object.defineProperty(Buffer, Symbol.species, {
        value: null,
        configurable: true,
        enumerable: false,
        writable: false
      });
    }

    Buffer.poolSize = 8192; // not used by this implementation

    function from(value, encodingOrOffset, length) {
      if (typeof value === 'string') {
        return fromString(value, encodingOrOffset);
      }

      if (ArrayBuffer.isView(value)) {
        return fromArrayLike(value);
      }

      if (value == null) {
        throw TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + (typeof value === "undefined" ? "undefined" : _typeof(value)));
      }

      if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }

      if (typeof value === 'number') {
        throw new TypeError('The "value" argument must not be of type number. Received type number');
      }

      var valueOf = value.valueOf && value.valueOf();
      if (valueOf != null && valueOf !== value) {
        return Buffer.from(valueOf, encodingOrOffset, length);
      }

      var b = fromObject(value);
      if (b) return b;

      if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === 'function') {
        return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length);
      }

      throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + (typeof value === "undefined" ? "undefined" : _typeof(value)));
    }

    /**
     * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
     * if value is a number.
     * Buffer.from(str[, encoding])
     * Buffer.from(array)
     * Buffer.from(buffer)
     * Buffer.from(arrayBuffer[, byteOffset[, length]])
     **/
    Buffer.from = function (value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length);
    };

    // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
    // https://github.com/feross/buffer/pull/148
    Buffer.prototype.__proto__ = Uint8Array.prototype;
    Buffer.__proto__ = Uint8Array;

    function assertSize(size) {
      if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be of type number');
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"');
      }
    }

    function alloc(size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(size);
      }
      if (fill !== undefined) {
        // Only pay attention to encoding if it's a string. This
        // prevents accidentally sending in a number that would
        // be interpretted as a start offset.
        return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
      }
      return createBuffer(size);
    }

    /**
     * Creates a new filled Buffer instance.
     * alloc(size[, fill[, encoding]])
     **/
    Buffer.alloc = function (size, fill, encoding) {
      return alloc(size, fill, encoding);
    };

    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0);
    }

    /**
     * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
     * */
    Buffer.allocUnsafe = function (size) {
      return allocUnsafe(size);
    };
    /**
     * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
     */
    Buffer.allocUnsafeSlow = function (size) {
      return allocUnsafe(size);
    };

    function fromString(string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8';
      }

      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('Unknown encoding: ' + encoding);
      }

      var length = byteLength(string, encoding) | 0;
      var buf = createBuffer(length);

      var actual = buf.write(string, encoding);

      if (actual !== length) {
        // Writing a hex string, for example, that contains invalid characters will
        // cause everything after the first invalid character to be ignored. (e.g.
        // 'abxxcd' will be treated as 'ab')
        buf = buf.slice(0, actual);
      }

      return buf;
    }

    function fromArrayLike(array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0;
      var buf = createBuffer(length);
      for (var i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255;
      }
      return buf;
    }

    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds');
      }

      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds');
      }

      var buf;
      if (byteOffset === undefined && length === undefined) {
        buf = new Uint8Array(array);
      } else if (length === undefined) {
        buf = new Uint8Array(array, byteOffset);
      } else {
        buf = new Uint8Array(array, byteOffset, length);
      }

      // Return an augmented `Uint8Array` instance
      buf.__proto__ = Buffer.prototype;
      return buf;
    }

    function fromObject(obj) {
      if (Buffer.isBuffer(obj)) {
        var len = checked(obj.length) | 0;
        var buf = createBuffer(len);

        if (buf.length === 0) {
          return buf;
        }

        obj.copy(buf, 0, 0, len);
        return buf;
      }

      if (obj.length !== undefined) {
        if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
          return createBuffer(0);
        }
        return fromArrayLike(obj);
      }

      if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
      }
    }

    function checked(length) {
      // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
      // length is NaN (which is otherwise coerced to zero.)
      if (length >= K_MAX_LENGTH) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes');
      }
      return length | 0;
    }

    function SlowBuffer(length) {
      if (+length != length) {
        // eslint-disable-line eqeqeq
        length = 0;
      }
      return Buffer.alloc(+length);
    }

    Buffer.isBuffer = function isBuffer(b) {
      return b != null && b._isBuffer === true && b !== Buffer.prototype; // so Buffer.isBuffer(Buffer.prototype) will be false
    };

    Buffer.compare = function compare(a, b) {
      if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
      if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
      if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
        throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
      }

      if (a === b) return 0;

      var x = a.length;
      var y = b.length;

      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
      }

      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };

    Buffer.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'latin1':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return true;
        default:
          return false;
      }
    };

    Buffer.concat = function concat(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }

      if (list.length === 0) {
        return Buffer.alloc(0);
      }

      var i;
      if (length === undefined) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }

      var buffer = Buffer.allocUnsafe(length);
      var pos = 0;
      for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (isInstance(buf, Uint8Array)) {
          buf = Buffer.from(buf);
        }
        if (!Buffer.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        buf.copy(buffer, pos);
        pos += buf.length;
      }
      return buffer;
    };

    function byteLength(string, encoding) {
      if (Buffer.isBuffer(string)) {
        return string.length;
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength;
      }
      if (typeof string !== 'string') {
        throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' + 'Received type ' + (typeof string === "undefined" ? "undefined" : _typeof(string)));
      }

      var len = string.length;
      var mustMatch = arguments.length > 2 && arguments[2] === true;
      if (!mustMatch && len === 0) return 0;

      // Use a for loop to avoid recursion
      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'ascii':
          case 'latin1':
          case 'binary':
            return len;
          case 'utf8':
          case 'utf-8':
            return utf8ToBytes(string).length;
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return len * 2;
          case 'hex':
            return len >>> 1;
          case 'base64':
            return base64ToBytes(string).length;
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes(string).length; // assume utf8
            }
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer.byteLength = byteLength;

    function slowToString(encoding, start, end) {
      var loweredCase = false;

      // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
      // property of a typed array.

      // This behaves neither like String nor Uint8Array in that we set start/end
      // to their upper/lower bounds if the value passed is out of range.
      // undefined is handled specially as per ECMA-262 6th Edition,
      // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
      if (start === undefined || start < 0) {
        start = 0;
      }
      // Return early if start > this.length. Done here to prevent potential uint32
      // coercion fail below.
      if (start > this.length) {
        return '';
      }

      if (end === undefined || end > this.length) {
        end = this.length;
      }

      if (end <= 0) {
        return '';
      }

      // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
      end >>>= 0;
      start >>>= 0;

      if (end <= start) {
        return '';
      }

      if (!encoding) encoding = 'utf8';

      while (true) {
        switch (encoding) {
          case 'hex':
            return hexSlice(this, start, end);

          case 'utf8':
          case 'utf-8':
            return utf8Slice(this, start, end);

          case 'ascii':
            return asciiSlice(this, start, end);

          case 'latin1':
          case 'binary':
            return latin1Slice(this, start, end);

          case 'base64':
            return base64Slice(this, start, end);

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return utf16leSlice(this, start, end);

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
            encoding = (encoding + '').toLowerCase();
            loweredCase = true;
        }
      }
    }

    // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
    // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
    // reliably in a browserify context because there could be multiple different
    // copies of the 'buffer' package in use. This method works even for Buffer
    // instances that were created from another copy of the `buffer` package.
    // See: https://github.com/feross/buffer/issues/154
    Buffer.prototype._isBuffer = true;

    function swap(b, n, m) {
      var i = b[n];
      b[n] = b[m];
      b[m] = i;
    }

    Buffer.prototype.swap16 = function swap16() {
      var len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits');
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this;
    };

    Buffer.prototype.swap32 = function swap32() {
      var len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits');
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this;
    };

    Buffer.prototype.swap64 = function swap64() {
      var len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits');
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this;
    };

    Buffer.prototype.toString = function toString() {
      var length = this.length;
      if (length === 0) return '';
      if (arguments.length === 0) return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };

    Buffer.prototype.toLocaleString = Buffer.prototype.toString;

    Buffer.prototype.equals = function equals(b) {
      if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
      if (this === b) return true;
      return Buffer.compare(this, b) === 0;
    };

    Buffer.prototype.inspect = function inspect() {
      var str = '';
      var max = exports.INSPECT_MAX_BYTES;
      str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
      if (this.length > max) str += ' ... ';
      return '<Buffer ' + str + '>';
    };

    Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer.from(target, target.offset, target.byteLength);
      }
      if (!Buffer.isBuffer(target)) {
        throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. ' + 'Received type ' + (typeof target === "undefined" ? "undefined" : _typeof(target)));
      }

      if (start === undefined) {
        start = 0;
      }
      if (end === undefined) {
        end = target ? target.length : 0;
      }
      if (thisStart === undefined) {
        thisStart = 0;
      }
      if (thisEnd === undefined) {
        thisEnd = this.length;
      }

      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError('out of range index');
      }

      if (thisStart >= thisEnd && start >= end) {
        return 0;
      }
      if (thisStart >= thisEnd) {
        return -1;
      }
      if (start >= end) {
        return 1;
      }

      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;

      if (this === target) return 0;

      var x = thisEnd - thisStart;
      var y = end - start;
      var len = Math.min(x, y);

      var thisCopy = this.slice(thisStart, thisEnd);
      var targetCopy = target.slice(start, end);

      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
      }

      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };

    // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
    // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
    //
    // Arguments:
    // - buffer - a Buffer to search
    // - val - a string, Buffer, or number
    // - byteOffset - an index into `buffer`; will be clamped to an int32
    // - encoding - an optional encoding, relevant is val is a string
    // - dir - true for indexOf, false for lastIndexOf
    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
      // Empty buffer means no match
      if (buffer.length === 0) return -1;

      // Normalize byteOffset
      if (typeof byteOffset === 'string') {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 0x7fffffff) {
        byteOffset = 0x7fffffff;
      } else if (byteOffset < -0x80000000) {
        byteOffset = -0x80000000;
      }
      byteOffset = +byteOffset; // Coerce to Number.
      if (numberIsNaN(byteOffset)) {
        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
        byteOffset = dir ? 0 : buffer.length - 1;
      }

      // Normalize byteOffset: negative offsets start from the end of the buffer
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1;else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;else return -1;
      }

      // Normalize val
      if (typeof val === 'string') {
        val = Buffer.from(val, encoding);
      }

      // Finally, search either indexOf (if dir is true) or lastIndexOf
      if (Buffer.isBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) {
          return -1;
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
      } else if (typeof val === 'number') {
        val = val & 0xFF; // Search for a byte value [0-255]
        if (typeof Uint8Array.prototype.indexOf === 'function') {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
      }

      throw new TypeError('val must be string, number or Buffer');
    }

    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      var indexSize = 1;
      var arrLength = arr.length;
      var valLength = val.length;

      if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
          if (arr.length < 2 || val.length < 2) {
            return -1;
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }

      function read(buf, i) {
        if (indexSize === 1) {
          return buf[i];
        } else {
          return buf.readUInt16BE(i * indexSize);
        }
      }

      var i;
      if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          var found = true;
          for (var j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
          }
          if (found) return i;
        }
      }

      return -1;
    }

    Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };

    Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };

    Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };

    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0;
      var remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }

      var strLen = string.length;

      if (length > strLen / 2) {
        length = strLen / 2;
      }
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16);
        if (numberIsNaN(parsed)) return i;
        buf[offset + i] = parsed;
      }
      return i;
    }

    function utf8Write(buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
    }

    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length);
    }

    function latin1Write(buf, string, offset, length) {
      return asciiWrite(buf, string, offset, length);
    }

    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length);
    }

    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
    }

    Buffer.prototype.write = function write(string, offset, length, encoding) {
      // Buffer#write(string)
      if (offset === undefined) {
        encoding = 'utf8';
        length = this.length;
        offset = 0;
        // Buffer#write(string, encoding)
      } else if (length === undefined && typeof offset === 'string') {
        encoding = offset;
        length = this.length;
        offset = 0;
        // Buffer#write(string, offset[, length][, encoding])
      } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
          length = length >>> 0;
          if (encoding === undefined) encoding = 'utf8';
        } else {
          encoding = length;
          length = undefined;
        }
      } else {
        throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
      }

      var remaining = this.length - offset;
      if (length === undefined || length > remaining) length = remaining;

      if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds');
      }

      if (!encoding) encoding = 'utf8';

      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'hex':
            return hexWrite(this, string, offset, length);

          case 'utf8':
          case 'utf-8':
            return utf8Write(this, string, offset, length);

          case 'ascii':
            return asciiWrite(this, string, offset, length);

          case 'latin1':
          case 'binary':
            return latin1Write(this, string, offset, length);

          case 'base64':
            // Warning: maxLength not taken into account in base64Write
            return base64Write(this, string, offset, length);

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return ucs2Write(this, string, offset, length);

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };

    Buffer.prototype.toJSON = function toJSON() {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };

    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
      } else {
        return base64.fromByteArray(buf.slice(start, end));
      }
    }

    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end);
      var res = [];

      var i = start;
      while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint;

          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte;
              }
              break;
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }

        if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
          codePoint = 0xFFFD;
          bytesPerSequence = 1;
        } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
          codePoint -= 0x10000;
          res.push(codePoint >>> 10 & 0x3FF | 0xD800);
          codePoint = 0xDC00 | codePoint & 0x3FF;
        }

        res.push(codePoint);
        i += bytesPerSequence;
      }

      return decodeCodePointsArray(res);
    }

    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
    // the lowest limit is Chrome, with 0x10000 args.
    // We go 1 magnitude less, for safety
    var MAX_ARGUMENTS_LENGTH = 0x1000;

    function decodeCodePointsArray(codePoints) {
      var len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
      }

      // Decode in chunks to avoid "call stack size exceeded".
      var res = '';
      var i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
      }
      return res;
    }

    function asciiSlice(buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 0x7F);
      }
      return ret;
    }

    function latin1Slice(buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret;
    }

    function hexSlice(buf, start, end) {
      var len = buf.length;

      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;

      var out = '';
      for (var i = start; i < end; ++i) {
        out += toHex(buf[i]);
      }
      return out;
    }

    function utf16leSlice(buf, start, end) {
      var bytes = buf.slice(start, end);
      var res = '';
      for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res;
    }

    Buffer.prototype.slice = function slice(start, end) {
      var len = this.length;
      start = ~~start;
      end = end === undefined ? len : ~~end;

      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }

      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }

      if (end < start) end = start;

      var newBuf = this.subarray(start, end);
      // Return an augmented `Uint8Array` instance
      newBuf.__proto__ = Buffer.prototype;
      return newBuf;
    };

    /*
     * Need to make sure that buffer isn't trying to write out of bounds.
     */
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
    }

    Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
      offset = offset >>> 0;
      byteLength = byteLength >>> 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }

      return val;
    };

    Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
      offset = offset >>> 0;
      byteLength = byteLength >>> 0;
      if (!noAssert) {
        checkOffset(offset, byteLength, this.length);
      }

      var val = this[offset + --byteLength];
      var mul = 1;
      while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul;
      }

      return val;
    };

    Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset];
    };

    Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };

    Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };

    Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
    };

    Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);

      return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };

    Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
      offset = offset >>> 0;
      byteLength = byteLength >>> 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val;
    };

    Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
      offset = offset >>> 0;
      byteLength = byteLength >>> 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var i = byteLength;
      var mul = 1;
      var val = this[offset + --i];
      while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val;
    };

    Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 0x80)) return this[offset];
      return (0xff - this[offset] + 1) * -1;
    };

    Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset] | this[offset + 1] << 8;
      return val & 0x8000 ? val | 0xFFFF0000 : val;
    };

    Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | this[offset] << 8;
      return val & 0x8000 ? val | 0xFFFF0000 : val;
    };

    Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);

      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };

    Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);

      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };

    Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, true, 23, 4);
    };

    Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, false, 23, 4);
    };

    Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, true, 52, 8);
    };

    Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, false, 52, 8);
    };

    function checkInt(buf, value, offset, ext, max, min) {
      if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length) throw new RangeError('Index out of range');
    }

    Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength = byteLength >>> 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var mul = 1;
      var i = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = value / mul & 0xFF;
      }

      return offset + byteLength;
    };

    Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength = byteLength >>> 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var i = byteLength - 1;
      var mul = 1;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = value / mul & 0xFF;
      }

      return offset + byteLength;
    };

    Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
      this[offset] = value & 0xff;
      return offset + 1;
    };

    Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      this[offset] = value & 0xff;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };

    Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 0xff;
      return offset + 2;
    };

    Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      this[offset + 3] = value >>> 24;
      this[offset + 2] = value >>> 16;
      this[offset + 1] = value >>> 8;
      this[offset] = value & 0xff;
      return offset + 4;
    };

    Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 0xff;
      return offset + 4;
    };

    Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = 0;
      var mul = 1;
      var sub = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 0xFF;
      }

      return offset + byteLength;
    };

    Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = byteLength - 1;
      var mul = 1;
      var sub = 0;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 0xFF;
      }

      return offset + byteLength;
    };

    Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
      if (value < 0) value = 0xff + value + 1;
      this[offset] = value & 0xff;
      return offset + 1;
    };

    Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      this[offset] = value & 0xff;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };

    Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 0xff;
      return offset + 2;
    };

    Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      this[offset] = value & 0xff;
      this[offset + 1] = value >>> 8;
      this[offset + 2] = value >>> 16;
      this[offset + 3] = value >>> 24;
      return offset + 4;
    };

    Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (value < 0) value = 0xffffffff + value + 1;
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 0xff;
      return offset + 4;
    };

    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError('Index out of range');
      if (offset < 0) throw new RangeError('Index out of range');
    }

    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4;
    }

    Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert);
    };

    Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert);
    };

    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8;
    }

    Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert);
    };

    Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert);
    };

    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer');
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;

      // Copy 0 bytes; we're done
      if (end === start) return 0;
      if (target.length === 0 || this.length === 0) return 0;

      // Fatal error conditions
      if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds');
      }
      if (start < 0 || start >= this.length) throw new RangeError('Index out of range');
      if (end < 0) throw new RangeError('sourceEnd out of bounds');

      // Are we oob?
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }

      var len = end - start;

      if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
        // Use built-in when available, missing from IE11
        this.copyWithin(targetStart, start, end);
      } else if (this === target && start < targetStart && targetStart < end) {
        // descending copy from end
        for (var i = len - 1; i >= 0; --i) {
          target[i + targetStart] = this[i + start];
        }
      } else {
        Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
      }

      return len;
    };

    // Usage:
    //    buffer.fill(number[, offset[, end]])
    //    buffer.fill(buffer[, offset[, end]])
    //    buffer.fill(string[, offset[, end]][, encoding])
    Buffer.prototype.fill = function fill(val, start, end, encoding) {
      // Handle string cases:
      if (typeof val === 'string') {
        if (typeof start === 'string') {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === 'string') {
          encoding = end;
          end = this.length;
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
          throw new TypeError('encoding must be a string');
        }
        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding);
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0);
          if (encoding === 'utf8' && code < 128 || encoding === 'latin1') {
            // Fast path: If `val` fits into a single byte, use that numeric value.
            val = code;
          }
        }
      } else if (typeof val === 'number') {
        val = val & 255;
      }

      // Invalid ranges are not set to a default, so can range check early.
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index');
      }

      if (end <= start) {
        return this;
      }

      start = start >>> 0;
      end = end === undefined ? this.length : end >>> 0;

      if (!val) val = 0;

      var i;
      if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
        var len = bytes.length;
        if (len === 0) {
          throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        }
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }

      return this;
    };

    // HELPER FUNCTIONS
    // ================

    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

    function base64clean(str) {
      // Node takes equal signs as end of the Base64 encoding
      str = str.split('=')[0];
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = str.trim().replace(INVALID_BASE64_RE, '');
      // Node converts strings with length < 2 to ''
      if (str.length < 2) return '';
      // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '=';
      }
      return str;
    }

    function toHex(n) {
      if (n < 16) return '0' + n.toString(16);
      return n.toString(16);
    }

    function utf8ToBytes(string, units) {
      units = units || Infinity;
      var codePoint;
      var length = string.length;
      var leadSurrogate = null;
      var bytes = [];

      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);

        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
          if (!leadSurrogate) {
            // no lead yet
            if (codePoint > 0xDBFF) {
              // unexpected trail
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue;
            } else if (i + 1 === length) {
              // unpaired lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue;
            }

            // valid lead
            leadSurrogate = codePoint;

            continue;
          }

          // 2 leads in a row
          if (codePoint < 0xDC00) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            leadSurrogate = codePoint;
            continue;
          }

          // valid surrogate pair
          codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        }

        leadSurrogate = null;

        // encode utf8
        if (codePoint < 0x80) {
          if ((units -= 1) < 0) break;
          bytes.push(codePoint);
        } else if (codePoint < 0x800) {
          if ((units -= 2) < 0) break;
          bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
        } else if (codePoint < 0x10000) {
          if ((units -= 3) < 0) break;
          bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
        } else if (codePoint < 0x110000) {
          if ((units -= 4) < 0) break;
          bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
        } else {
          throw new Error('Invalid code point');
        }
      }

      return bytes;
    }

    function asciiToBytes(str) {
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF);
      }
      return byteArray;
    }

    function utf16leToBytes(str, units) {
      var c, hi, lo;
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break;

        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }

      return byteArray;
    }

    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str));
    }

    function blitBuffer(src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if (i + offset >= dst.length || i >= src.length) break;
        dst[i + offset] = src[i];
      }
      return i;
    }

    // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
    // the `instanceof` check but they should be treated as of that type.
    // See: https://github.com/feross/buffer/issues/166
    function isInstance(obj, type) {
      return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
    }
    function numberIsNaN(obj) {
      // For IE11 support
      return obj !== obj; // eslint-disable-line no-self-compare
    }
  }, { "base64-js": 2, "ieee754": 329 }], 5: [function (require, module, exports) {
    require('../../modules/core.regexp.escape');
    module.exports = require('../../modules/_core').RegExp.escape;
  }, { "../../modules/_core": 26, "../../modules/core.regexp.escape": 131 }], 6: [function (require, module, exports) {
    module.exports = function (it) {
      if (typeof it != 'function') throw TypeError(it + ' is not a function!');
      return it;
    };
  }, {}], 7: [function (require, module, exports) {
    var cof = require('./_cof');
    module.exports = function (it, msg) {
      if (typeof it != 'number' && cof(it) != 'Number') throw TypeError(msg);
      return +it;
    };
  }, { "./_cof": 21 }], 8: [function (require, module, exports) {
    // 22.1.3.31 Array.prototype[@@unscopables]
    var UNSCOPABLES = require('./_wks')('unscopables');
    var ArrayProto = Array.prototype;
    if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, {});
    module.exports = function (key) {
      ArrayProto[UNSCOPABLES][key] = true;
    };
  }, { "./_hide": 45, "./_wks": 129 }], 9: [function (require, module, exports) {
    module.exports = function (it, Constructor, name, forbiddenField) {
      if (!(it instanceof Constructor) || forbiddenField !== undefined && forbiddenField in it) {
        throw TypeError(name + ': incorrect invocation!');
      }return it;
    };
  }, {}], 10: [function (require, module, exports) {
    var isObject = require('./_is-object');
    module.exports = function (it) {
      if (!isObject(it)) throw TypeError(it + ' is not an object!');
      return it;
    };
  }, { "./_is-object": 54 }], 11: [function (require, module, exports) {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    'use strict';

    var toObject = require('./_to-object');
    var toAbsoluteIndex = require('./_to-absolute-index');
    var toLength = require('./_to-length');

    module.exports = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
      var O = toObject(this);
      var len = toLength(O.length);
      var to = toAbsoluteIndex(target, len);
      var from = toAbsoluteIndex(start, len);
      var end = arguments.length > 2 ? arguments[2] : undefined;
      var count = Math.min((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
      var inc = 1;
      if (from < to && to < from + count) {
        inc = -1;
        from += count - 1;
        to += count - 1;
      }
      while (count-- > 0) {
        if (from in O) O[to] = O[from];else delete O[to];
        to += inc;
        from += inc;
      }return O;
    };
  }, { "./_to-absolute-index": 114, "./_to-length": 118, "./_to-object": 119 }], 12: [function (require, module, exports) {
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    'use strict';

    var toObject = require('./_to-object');
    var toAbsoluteIndex = require('./_to-absolute-index');
    var toLength = require('./_to-length');
    module.exports = function fill(value /* , start = 0, end = @length */) {
      var O = toObject(this);
      var length = toLength(O.length);
      var aLen = arguments.length;
      var index = toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
      var end = aLen > 2 ? arguments[2] : undefined;
      var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
      while (endPos > index) {
        O[index++] = value;
      }return O;
    };
  }, { "./_to-absolute-index": 114, "./_to-length": 118, "./_to-object": 119 }], 13: [function (require, module, exports) {
    var forOf = require('./_for-of');

    module.exports = function (iter, ITERATOR) {
      var result = [];
      forOf(iter, false, result.push, result, ITERATOR);
      return result;
    };
  }, { "./_for-of": 42 }], 14: [function (require, module, exports) {
    // false -> Array#indexOf
    // true  -> Array#includes
    var toIObject = require('./_to-iobject');
    var toLength = require('./_to-length');
    var toAbsoluteIndex = require('./_to-absolute-index');
    module.exports = function (IS_INCLUDES) {
      return function ($this, el, fromIndex) {
        var O = toIObject($this);
        var length = toLength(O.length);
        var index = toAbsoluteIndex(fromIndex, length);
        var value;
        // Array#includes uses SameValueZero equality algorithm
        // eslint-disable-next-line no-self-compare
        if (IS_INCLUDES && el != el) while (length > index) {
          value = O[index++];
          // eslint-disable-next-line no-self-compare
          if (value != value) return true;
          // Array#indexOf ignores holes, Array#includes - not
        } else for (; length > index; index++) {
          if (IS_INCLUDES || index in O) {
            if (O[index] === el) return IS_INCLUDES || index || 0;
          }
        }return !IS_INCLUDES && -1;
      };
    };
  }, { "./_to-absolute-index": 114, "./_to-iobject": 117, "./_to-length": 118 }], 15: [function (require, module, exports) {
    // 0 -> Array#forEach
    // 1 -> Array#map
    // 2 -> Array#filter
    // 3 -> Array#some
    // 4 -> Array#every
    // 5 -> Array#find
    // 6 -> Array#findIndex
    var ctx = require('./_ctx');
    var IObject = require('./_iobject');
    var toObject = require('./_to-object');
    var toLength = require('./_to-length');
    var asc = require('./_array-species-create');
    module.exports = function (TYPE, $create) {
      var IS_MAP = TYPE == 1;
      var IS_FILTER = TYPE == 2;
      var IS_SOME = TYPE == 3;
      var IS_EVERY = TYPE == 4;
      var IS_FIND_INDEX = TYPE == 6;
      var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
      var create = $create || asc;
      return function ($this, callbackfn, that) {
        var O = toObject($this);
        var self = IObject(O);
        var f = ctx(callbackfn, that, 3);
        var length = toLength(self.length);
        var index = 0;
        var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
        var val, res;
        for (; length > index; index++) {
          if (NO_HOLES || index in self) {
            val = self[index];
            res = f(val, index, O);
            if (TYPE) {
              if (IS_MAP) result[index] = res; // map
              else if (res) switch (TYPE) {
                  case 3:
                    return true; // some
                  case 5:
                    return val; // find
                  case 6:
                    return index; // findIndex
                  case 2:
                    result.push(val); // filter
                } else if (IS_EVERY) return false; // every
            }
          }
        }return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
      };
    };
  }, { "./_array-species-create": 18, "./_ctx": 28, "./_iobject": 50, "./_to-length": 118, "./_to-object": 119 }], 16: [function (require, module, exports) {
    var aFunction = require('./_a-function');
    var toObject = require('./_to-object');
    var IObject = require('./_iobject');
    var toLength = require('./_to-length');

    module.exports = function (that, callbackfn, aLen, memo, isRight) {
      aFunction(callbackfn);
      var O = toObject(that);
      var self = IObject(O);
      var length = toLength(O.length);
      var index = isRight ? length - 1 : 0;
      var i = isRight ? -1 : 1;
      if (aLen < 2) for (;;) {
        if (index in self) {
          memo = self[index];
          index += i;
          break;
        }
        index += i;
        if (isRight ? index < 0 : length <= index) {
          throw TypeError('Reduce of empty array with no initial value');
        }
      }
      for (; isRight ? index >= 0 : length > index; index += i) {
        if (index in self) {
          memo = callbackfn(memo, self[index], index, O);
        }
      }return memo;
    };
  }, { "./_a-function": 6, "./_iobject": 50, "./_to-length": 118, "./_to-object": 119 }], 17: [function (require, module, exports) {
    var isObject = require('./_is-object');
    var isArray = require('./_is-array');
    var SPECIES = require('./_wks')('species');

    module.exports = function (original) {
      var C;
      if (isArray(original)) {
        C = original.constructor;
        // cross-realm fallback
        if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
        if (isObject(C)) {
          C = C[SPECIES];
          if (C === null) C = undefined;
        }
      }return C === undefined ? Array : C;
    };
  }, { "./_is-array": 52, "./_is-object": 54, "./_wks": 129 }], 18: [function (require, module, exports) {
    // 9.4.2.3 ArraySpeciesCreate(originalArray, length)
    var speciesConstructor = require('./_array-species-constructor');

    module.exports = function (original, length) {
      return new (speciesConstructor(original))(length);
    };
  }, { "./_array-species-constructor": 17 }], 19: [function (require, module, exports) {
    'use strict';

    var aFunction = require('./_a-function');
    var isObject = require('./_is-object');
    var invoke = require('./_invoke');
    var arraySlice = [].slice;
    var factories = {};

    var construct = function construct(F, len, args) {
      if (!(len in factories)) {
        for (var n = [], i = 0; i < len; i++) {
          n[i] = 'a[' + i + ']';
        } // eslint-disable-next-line no-new-func
        factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
      }return factories[len](F, args);
    };

    module.exports = Function.bind || function bind(that /* , ...args */) {
      var fn = aFunction(this);
      var partArgs = arraySlice.call(arguments, 1);
      var bound = function bound() /* args... */{
        var args = partArgs.concat(arraySlice.call(arguments));
        return this instanceof bound ? construct(fn, args.length, args) : invoke(fn, args, that);
      };
      if (isObject(fn.prototype)) bound.prototype = fn.prototype;
      return bound;
    };
  }, { "./_a-function": 6, "./_invoke": 49, "./_is-object": 54 }], 20: [function (require, module, exports) {
    // getting tag from 19.1.3.6 Object.prototype.toString()
    var cof = require('./_cof');
    var TAG = require('./_wks')('toStringTag');
    // ES3 wrong here
    var ARG = cof(function () {
      return arguments;
    }()) == 'Arguments';

    // fallback for IE11 Script Access Denied error
    var tryGet = function tryGet(it, key) {
      try {
        return it[key];
      } catch (e) {/* empty */}
    };

    module.exports = function (it) {
      var O, T, B;
      return it === undefined ? 'Undefined' : it === null ? 'Null'
      // @@toStringTag case
      : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
      // builtinTag case
      : ARG ? cof(O)
      // ES3 arguments fallback
      : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
    };
  }, { "./_cof": 21, "./_wks": 129 }], 21: [function (require, module, exports) {
    var toString = {}.toString;

    module.exports = function (it) {
      return toString.call(it).slice(8, -1);
    };
  }, {}], 22: [function (require, module, exports) {
    'use strict';

    var dP = require('./_object-dp').f;
    var create = require('./_object-create');
    var redefineAll = require('./_redefine-all');
    var ctx = require('./_ctx');
    var anInstance = require('./_an-instance');
    var forOf = require('./_for-of');
    var $iterDefine = require('./_iter-define');
    var step = require('./_iter-step');
    var setSpecies = require('./_set-species');
    var DESCRIPTORS = require('./_descriptors');
    var fastKey = require('./_meta').fastKey;
    var validate = require('./_validate-collection');
    var SIZE = DESCRIPTORS ? '_s' : 'size';

    var getEntry = function getEntry(that, key) {
      // fast case
      var index = fastKey(key);
      var entry;
      if (index !== 'F') return that._i[index];
      // frozen object case
      for (entry = that._f; entry; entry = entry.n) {
        if (entry.k == key) return entry;
      }
    };

    module.exports = {
      getConstructor: function getConstructor(wrapper, NAME, IS_MAP, ADDER) {
        var C = wrapper(function (that, iterable) {
          anInstance(that, C, NAME, '_i');
          that._t = NAME; // collection type
          that._i = create(null); // index
          that._f = undefined; // first entry
          that._l = undefined; // last entry
          that[SIZE] = 0; // size
          if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
        });
        redefineAll(C.prototype, {
          // 23.1.3.1 Map.prototype.clear()
          // 23.2.3.2 Set.prototype.clear()
          clear: function clear() {
            for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
              entry.r = true;
              if (entry.p) entry.p = entry.p.n = undefined;
              delete data[entry.i];
            }
            that._f = that._l = undefined;
            that[SIZE] = 0;
          },
          // 23.1.3.3 Map.prototype.delete(key)
          // 23.2.3.4 Set.prototype.delete(value)
          'delete': function _delete(key) {
            var that = validate(this, NAME);
            var entry = getEntry(that, key);
            if (entry) {
              var next = entry.n;
              var prev = entry.p;
              delete that._i[entry.i];
              entry.r = true;
              if (prev) prev.n = next;
              if (next) next.p = prev;
              if (that._f == entry) that._f = next;
              if (that._l == entry) that._l = prev;
              that[SIZE]--;
            }return !!entry;
          },
          // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
          // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
          forEach: function forEach(callbackfn /* , that = undefined */) {
            validate(this, NAME);
            var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
            var entry;
            while (entry = entry ? entry.n : this._f) {
              f(entry.v, entry.k, this);
              // revert to the last existing entry
              while (entry && entry.r) {
                entry = entry.p;
              }
            }
          },
          // 23.1.3.7 Map.prototype.has(key)
          // 23.2.3.7 Set.prototype.has(value)
          has: function has(key) {
            return !!getEntry(validate(this, NAME), key);
          }
        });
        if (DESCRIPTORS) dP(C.prototype, 'size', {
          get: function get() {
            return validate(this, NAME)[SIZE];
          }
        });
        return C;
      },
      def: function def(that, key, value) {
        var entry = getEntry(that, key);
        var prev, index;
        // change existing entry
        if (entry) {
          entry.v = value;
          // create new entry
        } else {
          that._l = entry = {
            i: index = fastKey(key, true), // <- index
            k: key, // <- key
            v: value, // <- value
            p: prev = that._l, // <- previous entry
            n: undefined, // <- next entry
            r: false // <- removed
          };
          if (!that._f) that._f = entry;
          if (prev) prev.n = entry;
          that[SIZE]++;
          // add to index
          if (index !== 'F') that._i[index] = entry;
        }return that;
      },
      getEntry: getEntry,
      setStrong: function setStrong(C, NAME, IS_MAP) {
        // add .keys, .values, .entries, [@@iterator]
        // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
        $iterDefine(C, NAME, function (iterated, kind) {
          this._t = validate(iterated, NAME); // target
          this._k = kind; // kind
          this._l = undefined; // previous
        }, function () {
          var that = this;
          var kind = that._k;
          var entry = that._l;
          // revert to the last existing entry
          while (entry && entry.r) {
            entry = entry.p;
          } // get next entry
          if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
            // or finish the iteration
            that._t = undefined;
            return step(1);
          }
          // return step by kind
          if (kind == 'keys') return step(0, entry.k);
          if (kind == 'values') return step(0, entry.v);
          return step(0, [entry.k, entry.v]);
        }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

        // add [@@species], 23.1.2.2, 23.2.2.2
        setSpecies(NAME);
      }
    };
  }, { "./_an-instance": 9, "./_ctx": 28, "./_descriptors": 32, "./_for-of": 42, "./_iter-define": 58, "./_iter-step": 60, "./_meta": 68, "./_object-create": 73, "./_object-dp": 74, "./_redefine-all": 93, "./_set-species": 100, "./_validate-collection": 126 }], 23: [function (require, module, exports) {
    // https://github.com/DavidBruant/Map-Set.prototype.toJSON
    var classof = require('./_classof');
    var from = require('./_array-from-iterable');
    module.exports = function (NAME) {
      return function toJSON() {
        if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
        return from(this);
      };
    };
  }, { "./_array-from-iterable": 13, "./_classof": 20 }], 24: [function (require, module, exports) {
    'use strict';

    var redefineAll = require('./_redefine-all');
    var getWeak = require('./_meta').getWeak;
    var anObject = require('./_an-object');
    var isObject = require('./_is-object');
    var anInstance = require('./_an-instance');
    var forOf = require('./_for-of');
    var createArrayMethod = require('./_array-methods');
    var $has = require('./_has');
    var validate = require('./_validate-collection');
    var arrayFind = createArrayMethod(5);
    var arrayFindIndex = createArrayMethod(6);
    var id = 0;

    // fallback for uncaught frozen keys
    var uncaughtFrozenStore = function uncaughtFrozenStore(that) {
      return that._l || (that._l = new UncaughtFrozenStore());
    };
    var UncaughtFrozenStore = function UncaughtFrozenStore() {
      this.a = [];
    };
    var findUncaughtFrozen = function findUncaughtFrozen(store, key) {
      return arrayFind(store.a, function (it) {
        return it[0] === key;
      });
    };
    UncaughtFrozenStore.prototype = {
      get: function get(key) {
        var entry = findUncaughtFrozen(this, key);
        if (entry) return entry[1];
      },
      has: function has(key) {
        return !!findUncaughtFrozen(this, key);
      },
      set: function set(key, value) {
        var entry = findUncaughtFrozen(this, key);
        if (entry) entry[1] = value;else this.a.push([key, value]);
      },
      'delete': function _delete(key) {
        var index = arrayFindIndex(this.a, function (it) {
          return it[0] === key;
        });
        if (~index) this.a.splice(index, 1);
        return !!~index;
      }
    };

    module.exports = {
      getConstructor: function getConstructor(wrapper, NAME, IS_MAP, ADDER) {
        var C = wrapper(function (that, iterable) {
          anInstance(that, C, NAME, '_i');
          that._t = NAME; // collection type
          that._i = id++; // collection id
          that._l = undefined; // leak store for uncaught frozen objects
          if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
        });
        redefineAll(C.prototype, {
          // 23.3.3.2 WeakMap.prototype.delete(key)
          // 23.4.3.3 WeakSet.prototype.delete(value)
          'delete': function _delete(key) {
            if (!isObject(key)) return false;
            var data = getWeak(key);
            if (data === true) return uncaughtFrozenStore(validate(this, NAME))['delete'](key);
            return data && $has(data, this._i) && delete data[this._i];
          },
          // 23.3.3.4 WeakMap.prototype.has(key)
          // 23.4.3.4 WeakSet.prototype.has(value)
          has: function has(key) {
            if (!isObject(key)) return false;
            var data = getWeak(key);
            if (data === true) return uncaughtFrozenStore(validate(this, NAME)).has(key);
            return data && $has(data, this._i);
          }
        });
        return C;
      },
      def: function def(that, key, value) {
        var data = getWeak(anObject(key), true);
        if (data === true) uncaughtFrozenStore(that).set(key, value);else data[that._i] = value;
        return that;
      },
      ufstore: uncaughtFrozenStore
    };
  }, { "./_an-instance": 9, "./_an-object": 10, "./_array-methods": 15, "./_for-of": 42, "./_has": 44, "./_is-object": 54, "./_meta": 68, "./_redefine-all": 93, "./_validate-collection": 126 }], 25: [function (require, module, exports) {
    'use strict';

    var global = require('./_global');
    var $export = require('./_export');
    var redefine = require('./_redefine');
    var redefineAll = require('./_redefine-all');
    var meta = require('./_meta');
    var forOf = require('./_for-of');
    var anInstance = require('./_an-instance');
    var isObject = require('./_is-object');
    var fails = require('./_fails');
    var $iterDetect = require('./_iter-detect');
    var setToStringTag = require('./_set-to-string-tag');
    var inheritIfRequired = require('./_inherit-if-required');

    module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
      var Base = global[NAME];
      var C = Base;
      var ADDER = IS_MAP ? 'set' : 'add';
      var proto = C && C.prototype;
      var O = {};
      var fixMethod = function fixMethod(KEY) {
        var fn = proto[KEY];
        redefine(proto, KEY, KEY == 'delete' ? function (a) {
          return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
        } : KEY == 'has' ? function has(a) {
          return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
        } : KEY == 'get' ? function get(a) {
          return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
        } : KEY == 'add' ? function add(a) {
          fn.call(this, a === 0 ? 0 : a);return this;
        } : function set(a, b) {
          fn.call(this, a === 0 ? 0 : a, b);return this;
        });
      };
      if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
        new C().entries().next();
      }))) {
        // create collection constructor
        C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
        redefineAll(C.prototype, methods);
        meta.NEED = true;
      } else {
        var instance = new C();
        // early implementations not supports chaining
        var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
        // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
        var THROWS_ON_PRIMITIVES = fails(function () {
          instance.has(1);
        });
        // most early implementations doesn't supports iterables, most modern - not close it correctly
        var ACCEPT_ITERABLES = $iterDetect(function (iter) {
          new C(iter);
        }); // eslint-disable-line no-new
        // for early implementations -0 and +0 not the same
        var BUGGY_ZERO = !IS_WEAK && fails(function () {
          // V8 ~ Chromium 42- fails only with 5+ elements
          var $instance = new C();
          var index = 5;
          while (index--) {
            $instance[ADDER](index, index);
          }return !$instance.has(-0);
        });
        if (!ACCEPT_ITERABLES) {
          C = wrapper(function (target, iterable) {
            anInstance(target, C, NAME);
            var that = inheritIfRequired(new Base(), target, C);
            if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
            return that;
          });
          C.prototype = proto;
          proto.constructor = C;
        }
        if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
          fixMethod('delete');
          fixMethod('has');
          IS_MAP && fixMethod('get');
        }
        if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
        // weak collections should not contains .clear method
        if (IS_WEAK && proto.clear) delete proto.clear;
      }

      setToStringTag(C, NAME);

      O[NAME] = C;
      $export($export.G + $export.W + $export.F * (C != Base), O);

      if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

      return C;
    };
  }, { "./_an-instance": 9, "./_export": 36, "./_fails": 38, "./_for-of": 42, "./_global": 43, "./_inherit-if-required": 48, "./_is-object": 54, "./_iter-detect": 59, "./_meta": 68, "./_redefine": 94, "./_redefine-all": 93, "./_set-to-string-tag": 101 }], 26: [function (require, module, exports) {
    var core = module.exports = { version: '2.5.7' };
    if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
  }, {}], 27: [function (require, module, exports) {
    'use strict';

    var $defineProperty = require('./_object-dp');
    var createDesc = require('./_property-desc');

    module.exports = function (object, index, value) {
      if (index in object) $defineProperty.f(object, index, createDesc(0, value));else object[index] = value;
    };
  }, { "./_object-dp": 74, "./_property-desc": 92 }], 28: [function (require, module, exports) {
    // optional / simple context binding
    var aFunction = require('./_a-function');
    module.exports = function (fn, that, length) {
      aFunction(fn);
      if (that === undefined) return fn;
      switch (length) {
        case 1:
          return function (a) {
            return fn.call(that, a);
          };
        case 2:
          return function (a, b) {
            return fn.call(that, a, b);
          };
        case 3:
          return function (a, b, c) {
            return fn.call(that, a, b, c);
          };
      }
      return function () /* ...args */{
        return fn.apply(that, arguments);
      };
    };
  }, { "./_a-function": 6 }], 29: [function (require, module, exports) {
    'use strict';
    // 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()

    var fails = require('./_fails');
    var getTime = Date.prototype.getTime;
    var $toISOString = Date.prototype.toISOString;

    var lz = function lz(num) {
      return num > 9 ? num : '0' + num;
    };

    // PhantomJS / old WebKit has a broken implementations
    module.exports = fails(function () {
      return $toISOString.call(new Date(-5e13 - 1)) != '0385-07-25T07:06:39.999Z';
    }) || !fails(function () {
      $toISOString.call(new Date(NaN));
    }) ? function toISOString() {
      if (!isFinite(getTime.call(this))) throw RangeError('Invalid time value');
      var d = this;
      var y = d.getUTCFullYear();
      var m = d.getUTCMilliseconds();
      var s = y < 0 ? '-' : y > 9999 ? '+' : '';
      return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) + '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) + 'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) + ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
    } : $toISOString;
  }, { "./_fails": 38 }], 30: [function (require, module, exports) {
    'use strict';

    var anObject = require('./_an-object');
    var toPrimitive = require('./_to-primitive');
    var NUMBER = 'number';

    module.exports = function (hint) {
      if (hint !== 'string' && hint !== NUMBER && hint !== 'default') throw TypeError('Incorrect hint');
      return toPrimitive(anObject(this), hint != NUMBER);
    };
  }, { "./_an-object": 10, "./_to-primitive": 120 }], 31: [function (require, module, exports) {
    // 7.2.1 RequireObjectCoercible(argument)
    module.exports = function (it) {
      if (it == undefined) throw TypeError("Can't call method on  " + it);
      return it;
    };
  }, {}], 32: [function (require, module, exports) {
    // Thank's IE8 for his funny defineProperty
    module.exports = !require('./_fails')(function () {
      return Object.defineProperty({}, 'a', { get: function get() {
          return 7;
        } }).a != 7;
    });
  }, { "./_fails": 38 }], 33: [function (require, module, exports) {
    var isObject = require('./_is-object');
    var document = require('./_global').document;
    // typeof document.createElement is 'object' in old IE
    var is = isObject(document) && isObject(document.createElement);
    module.exports = function (it) {
      return is ? document.createElement(it) : {};
    };
  }, { "./_global": 43, "./_is-object": 54 }], 34: [function (require, module, exports) {
    // IE 8- don't enum bug keys
    module.exports = 'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'.split(',');
  }, {}], 35: [function (require, module, exports) {
    // all enumerable object keys, includes symbols
    var getKeys = require('./_object-keys');
    var gOPS = require('./_object-gops');
    var pIE = require('./_object-pie');
    module.exports = function (it) {
      var result = getKeys(it);
      var getSymbols = gOPS.f;
      if (getSymbols) {
        var symbols = getSymbols(it);
        var isEnum = pIE.f;
        var i = 0;
        var key;
        while (symbols.length > i) {
          if (isEnum.call(it, key = symbols[i++])) result.push(key);
        }
      }return result;
    };
  }, { "./_object-gops": 80, "./_object-keys": 83, "./_object-pie": 84 }], 36: [function (require, module, exports) {
    var global = require('./_global');
    var core = require('./_core');
    var hide = require('./_hide');
    var redefine = require('./_redefine');
    var ctx = require('./_ctx');
    var PROTOTYPE = 'prototype';

    var $export = function $export(type, name, source) {
      var IS_FORCED = type & $export.F;
      var IS_GLOBAL = type & $export.G;
      var IS_STATIC = type & $export.S;
      var IS_PROTO = type & $export.P;
      var IS_BIND = type & $export.B;
      var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
      var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
      var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
      var key, own, out, exp;
      if (IS_GLOBAL) source = name;
      for (key in source) {
        // contains in native
        own = !IS_FORCED && target && target[key] !== undefined;
        // export native or passed
        out = (own ? target : source)[key];
        // bind timers to global for call from export context
        exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
        // extend global
        if (target) redefine(target, key, out, type & $export.U);
        // export
        if (exports[key] != out) hide(exports, key, exp);
        if (IS_PROTO && expProto[key] != out) expProto[key] = out;
      }
    };
    global.core = core;
    // type bitmap
    $export.F = 1; // forced
    $export.G = 2; // global
    $export.S = 4; // static
    $export.P = 8; // proto
    $export.B = 16; // bind
    $export.W = 32; // wrap
    $export.U = 64; // safe
    $export.R = 128; // real proto method for `library`
    module.exports = $export;
  }, { "./_core": 26, "./_ctx": 28, "./_global": 43, "./_hide": 45, "./_redefine": 94 }], 37: [function (require, module, exports) {
    var MATCH = require('./_wks')('match');
    module.exports = function (KEY) {
      var re = /./;
      try {
        '/./'[KEY](re);
      } catch (e) {
        try {
          re[MATCH] = false;
          return !'/./'[KEY](re);
        } catch (f) {/* empty */}
      }return true;
    };
  }, { "./_wks": 129 }], 38: [function (require, module, exports) {
    module.exports = function (exec) {
      try {
        return !!exec();
      } catch (e) {
        return true;
      }
    };
  }, {}], 39: [function (require, module, exports) {
    'use strict';

    var hide = require('./_hide');
    var redefine = require('./_redefine');
    var fails = require('./_fails');
    var defined = require('./_defined');
    var wks = require('./_wks');

    module.exports = function (KEY, length, exec) {
      var SYMBOL = wks(KEY);
      var fns = exec(defined, SYMBOL, ''[KEY]);
      var strfn = fns[0];
      var rxfn = fns[1];
      if (fails(function () {
        var O = {};
        O[SYMBOL] = function () {
          return 7;
        };
        return ''[KEY](O) != 7;
      })) {
        redefine(String.prototype, KEY, strfn);
        hide(RegExp.prototype, SYMBOL, length == 2
        // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
        // 21.2.5.11 RegExp.prototype[@@split](string, limit)
        ? function (string, arg) {
          return rxfn.call(string, this, arg);
        }
        // 21.2.5.6 RegExp.prototype[@@match](string)
        // 21.2.5.9 RegExp.prototype[@@search](string)
        : function (string) {
          return rxfn.call(string, this);
        });
      }
    };
  }, { "./_defined": 31, "./_fails": 38, "./_hide": 45, "./_redefine": 94, "./_wks": 129 }], 40: [function (require, module, exports) {
    'use strict';
    // 21.2.5.3 get RegExp.prototype.flags

    var anObject = require('./_an-object');
    module.exports = function () {
      var that = anObject(this);
      var result = '';
      if (that.global) result += 'g';
      if (that.ignoreCase) result += 'i';
      if (that.multiline) result += 'm';
      if (that.unicode) result += 'u';
      if (that.sticky) result += 'y';
      return result;
    };
  }, { "./_an-object": 10 }], 41: [function (require, module, exports) {
    'use strict';
    // https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray

    var isArray = require('./_is-array');
    var isObject = require('./_is-object');
    var toLength = require('./_to-length');
    var ctx = require('./_ctx');
    var IS_CONCAT_SPREADABLE = require('./_wks')('isConcatSpreadable');

    function flattenIntoArray(target, original, source, sourceLen, start, depth, mapper, thisArg) {
      var targetIndex = start;
      var sourceIndex = 0;
      var mapFn = mapper ? ctx(mapper, thisArg, 3) : false;
      var element, spreadable;

      while (sourceIndex < sourceLen) {
        if (sourceIndex in source) {
          element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

          spreadable = false;
          if (isObject(element)) {
            spreadable = element[IS_CONCAT_SPREADABLE];
            spreadable = spreadable !== undefined ? !!spreadable : isArray(element);
          }

          if (spreadable && depth > 0) {
            targetIndex = flattenIntoArray(target, original, element, toLength(element.length), targetIndex, depth - 1) - 1;
          } else {
            if (targetIndex >= 0x1fffffffffffff) throw TypeError();
            target[targetIndex] = element;
          }

          targetIndex++;
        }
        sourceIndex++;
      }
      return targetIndex;
    }

    module.exports = flattenIntoArray;
  }, { "./_ctx": 28, "./_is-array": 52, "./_is-object": 54, "./_to-length": 118, "./_wks": 129 }], 42: [function (require, module, exports) {
    var ctx = require('./_ctx');
    var call = require('./_iter-call');
    var isArrayIter = require('./_is-array-iter');
    var anObject = require('./_an-object');
    var toLength = require('./_to-length');
    var getIterFn = require('./core.get-iterator-method');
    var BREAK = {};
    var RETURN = {};
    var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
      var iterFn = ITERATOR ? function () {
        return iterable;
      } : getIterFn(iterable);
      var f = ctx(fn, that, entries ? 2 : 1);
      var index = 0;
      var length, step, iterator, result;
      if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
      // fast case for arrays with default iterator
      if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
        result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
        if (result === BREAK || result === RETURN) return result;
      } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
        result = call(iterator, f, step.value, entries);
        if (result === BREAK || result === RETURN) return result;
      }
    };
    exports.BREAK = BREAK;
    exports.RETURN = RETURN;
  }, { "./_an-object": 10, "./_ctx": 28, "./_is-array-iter": 51, "./_iter-call": 56, "./_to-length": 118, "./core.get-iterator-method": 130 }], 43: [function (require, module, exports) {
    // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
    var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self
    // eslint-disable-next-line no-new-func
    : Function('return this')();
    if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
  }, {}], 44: [function (require, module, exports) {
    var hasOwnProperty = {}.hasOwnProperty;
    module.exports = function (it, key) {
      return hasOwnProperty.call(it, key);
    };
  }, {}], 45: [function (require, module, exports) {
    var dP = require('./_object-dp');
    var createDesc = require('./_property-desc');
    module.exports = require('./_descriptors') ? function (object, key, value) {
      return dP.f(object, key, createDesc(1, value));
    } : function (object, key, value) {
      object[key] = value;
      return object;
    };
  }, { "./_descriptors": 32, "./_object-dp": 74, "./_property-desc": 92 }], 46: [function (require, module, exports) {
    var document = require('./_global').document;
    module.exports = document && document.documentElement;
  }, { "./_global": 43 }], 47: [function (require, module, exports) {
    module.exports = !require('./_descriptors') && !require('./_fails')(function () {
      return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function get() {
          return 7;
        } }).a != 7;
    });
  }, { "./_descriptors": 32, "./_dom-create": 33, "./_fails": 38 }], 48: [function (require, module, exports) {
    var isObject = require('./_is-object');
    var setPrototypeOf = require('./_set-proto').set;
    module.exports = function (that, target, C) {
      var S = target.constructor;
      var P;
      if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
        setPrototypeOf(that, P);
      }return that;
    };
  }, { "./_is-object": 54, "./_set-proto": 99 }], 49: [function (require, module, exports) {
    // fast apply, http://jsperf.lnkit.com/fast-apply/5
    module.exports = function (fn, args, that) {
      var un = that === undefined;
      switch (args.length) {
        case 0:
          return un ? fn() : fn.call(that);
        case 1:
          return un ? fn(args[0]) : fn.call(that, args[0]);
        case 2:
          return un ? fn(args[0], args[1]) : fn.call(that, args[0], args[1]);
        case 3:
          return un ? fn(args[0], args[1], args[2]) : fn.call(that, args[0], args[1], args[2]);
        case 4:
          return un ? fn(args[0], args[1], args[2], args[3]) : fn.call(that, args[0], args[1], args[2], args[3]);
      }return fn.apply(that, args);
    };
  }, {}], 50: [function (require, module, exports) {
    // fallback for non-array-like ES3 and non-enumerable old V8 strings
    var cof = require('./_cof');
    // eslint-disable-next-line no-prototype-builtins
    module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
      return cof(it) == 'String' ? it.split('') : Object(it);
    };
  }, { "./_cof": 21 }], 51: [function (require, module, exports) {
    // check on default Array iterator
    var Iterators = require('./_iterators');
    var ITERATOR = require('./_wks')('iterator');
    var ArrayProto = Array.prototype;

    module.exports = function (it) {
      return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
    };
  }, { "./_iterators": 61, "./_wks": 129 }], 52: [function (require, module, exports) {
    // 7.2.2 IsArray(argument)
    var cof = require('./_cof');
    module.exports = Array.isArray || function isArray(arg) {
      return cof(arg) == 'Array';
    };
  }, { "./_cof": 21 }], 53: [function (require, module, exports) {
    // 20.1.2.3 Number.isInteger(number)
    var isObject = require('./_is-object');
    var floor = Math.floor;
    module.exports = function isInteger(it) {
      return !isObject(it) && isFinite(it) && floor(it) === it;
    };
  }, { "./_is-object": 54 }], 54: [function (require, module, exports) {
    module.exports = function (it) {
      return (typeof it === "undefined" ? "undefined" : _typeof(it)) === 'object' ? it !== null : typeof it === 'function';
    };
  }, {}], 55: [function (require, module, exports) {
    // 7.2.8 IsRegExp(argument)
    var isObject = require('./_is-object');
    var cof = require('./_cof');
    var MATCH = require('./_wks')('match');
    module.exports = function (it) {
      var isRegExp;
      return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
    };
  }, { "./_cof": 21, "./_is-object": 54, "./_wks": 129 }], 56: [function (require, module, exports) {
    // call something on iterator step with safe closing on error
    var anObject = require('./_an-object');
    module.exports = function (iterator, fn, value, entries) {
      try {
        return entries ? fn(anObject(value)[0], value[1]) : fn(value);
        // 7.4.6 IteratorClose(iterator, completion)
      } catch (e) {
        var ret = iterator['return'];
        if (ret !== undefined) anObject(ret.call(iterator));
        throw e;
      }
    };
  }, { "./_an-object": 10 }], 57: [function (require, module, exports) {
    'use strict';

    var create = require('./_object-create');
    var descriptor = require('./_property-desc');
    var setToStringTag = require('./_set-to-string-tag');
    var IteratorPrototype = {};

    // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
    require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () {
      return this;
    });

    module.exports = function (Constructor, NAME, next) {
      Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
      setToStringTag(Constructor, NAME + ' Iterator');
    };
  }, { "./_hide": 45, "./_object-create": 73, "./_property-desc": 92, "./_set-to-string-tag": 101, "./_wks": 129 }], 58: [function (require, module, exports) {
    'use strict';

    var LIBRARY = require('./_library');
    var $export = require('./_export');
    var redefine = require('./_redefine');
    var hide = require('./_hide');
    var Iterators = require('./_iterators');
    var $iterCreate = require('./_iter-create');
    var setToStringTag = require('./_set-to-string-tag');
    var getPrototypeOf = require('./_object-gpo');
    var ITERATOR = require('./_wks')('iterator');
    var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
    var FF_ITERATOR = '@@iterator';
    var KEYS = 'keys';
    var VALUES = 'values';

    var returnThis = function returnThis() {
      return this;
    };

    module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
      $iterCreate(Constructor, NAME, next);
      var getMethod = function getMethod(kind) {
        if (!BUGGY && kind in proto) return proto[kind];
        switch (kind) {
          case KEYS:
            return function keys() {
              return new Constructor(this, kind);
            };
          case VALUES:
            return function values() {
              return new Constructor(this, kind);
            };
        }return function entries() {
          return new Constructor(this, kind);
        };
      };
      var TAG = NAME + ' Iterator';
      var DEF_VALUES = DEFAULT == VALUES;
      var VALUES_BUG = false;
      var proto = Base.prototype;
      var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
      var $default = $native || getMethod(DEFAULT);
      var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
      var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
      var methods, key, IteratorPrototype;
      // Fix native
      if ($anyNative) {
        IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
        if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
          // Set @@toStringTag to native iterators
          setToStringTag(IteratorPrototype, TAG, true);
          // fix for some old engines
          if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
        }
      }
      // fix Array#{values, @@iterator}.name in V8 / FF
      if (DEF_VALUES && $native && $native.name !== VALUES) {
        VALUES_BUG = true;
        $default = function values() {
          return $native.call(this);
        };
      }
      // Define iterator
      if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
        hide(proto, ITERATOR, $default);
      }
      // Plug for library
      Iterators[NAME] = $default;
      Iterators[TAG] = returnThis;
      if (DEFAULT) {
        methods = {
          values: DEF_VALUES ? $default : getMethod(VALUES),
          keys: IS_SET ? $default : getMethod(KEYS),
          entries: $entries
        };
        if (FORCED) for (key in methods) {
          if (!(key in proto)) redefine(proto, key, methods[key]);
        } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
      }
      return methods;
    };
  }, { "./_export": 36, "./_hide": 45, "./_iter-create": 57, "./_iterators": 61, "./_library": 62, "./_object-gpo": 81, "./_redefine": 94, "./_set-to-string-tag": 101, "./_wks": 129 }], 59: [function (require, module, exports) {
    var ITERATOR = require('./_wks')('iterator');
    var SAFE_CLOSING = false;

    try {
      var riter = [7][ITERATOR]();
      riter['return'] = function () {
        SAFE_CLOSING = true;
      };
      // eslint-disable-next-line no-throw-literal
      Array.from(riter, function () {
        throw 2;
      });
    } catch (e) {/* empty */}

    module.exports = function (exec, skipClosing) {
      if (!skipClosing && !SAFE_CLOSING) return false;
      var safe = false;
      try {
        var arr = [7];
        var iter = arr[ITERATOR]();
        iter.next = function () {
          return { done: safe = true };
        };
        arr[ITERATOR] = function () {
          return iter;
        };
        exec(arr);
      } catch (e) {/* empty */}
      return safe;
    };
  }, { "./_wks": 129 }], 60: [function (require, module, exports) {
    module.exports = function (done, value) {
      return { value: value, done: !!done };
    };
  }, {}], 61: [function (require, module, exports) {
    module.exports = {};
  }, {}], 62: [function (require, module, exports) {
    module.exports = false;
  }, {}], 63: [function (require, module, exports) {
    // 20.2.2.14 Math.expm1(x)
    var $expm1 = Math.expm1;
    module.exports = !$expm1
    // Old FF bug
    || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
    // Tor Browser bug
    || $expm1(-2e-17) != -2e-17 ? function expm1(x) {
      return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
    } : $expm1;
  }, {}], 64: [function (require, module, exports) {
    // 20.2.2.16 Math.fround(x)
    var sign = require('./_math-sign');
    var pow = Math.pow;
    var EPSILON = pow(2, -52);
    var EPSILON32 = pow(2, -23);
    var MAX32 = pow(2, 127) * (2 - EPSILON32);
    var MIN32 = pow(2, -126);

    var roundTiesToEven = function roundTiesToEven(n) {
      return n + 1 / EPSILON - 1 / EPSILON;
    };

    module.exports = Math.fround || function fround(x) {
      var $abs = Math.abs(x);
      var $sign = sign(x);
      var a, result;
      if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
      a = (1 + EPSILON32 / EPSILON) * $abs;
      result = a - (a - $abs);
      // eslint-disable-next-line no-self-compare
      if (result > MAX32 || result != result) return $sign * Infinity;
      return $sign * result;
    };
  }, { "./_math-sign": 67 }], 65: [function (require, module, exports) {
    // 20.2.2.20 Math.log1p(x)
    module.exports = Math.log1p || function log1p(x) {
      return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
    };
  }, {}], 66: [function (require, module, exports) {
    // https://rwaldron.github.io/proposal-math-extensions/
    module.exports = Math.scale || function scale(x, inLow, inHigh, outLow, outHigh) {
      if (arguments.length === 0
      // eslint-disable-next-line no-self-compare
      || x != x
      // eslint-disable-next-line no-self-compare
      || inLow != inLow
      // eslint-disable-next-line no-self-compare
      || inHigh != inHigh
      // eslint-disable-next-line no-self-compare
      || outLow != outLow
      // eslint-disable-next-line no-self-compare
      || outHigh != outHigh) return NaN;
      if (x === Infinity || x === -Infinity) return x;
      return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
    };
  }, {}], 67: [function (require, module, exports) {
    // 20.2.2.28 Math.sign(x)
    module.exports = Math.sign || function sign(x) {
      // eslint-disable-next-line no-self-compare
      return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
    };
  }, {}], 68: [function (require, module, exports) {
    var META = require('./_uid')('meta');
    var isObject = require('./_is-object');
    var has = require('./_has');
    var setDesc = require('./_object-dp').f;
    var id = 0;
    var isExtensible = Object.isExtensible || function () {
      return true;
    };
    var FREEZE = !require('./_fails')(function () {
      return isExtensible(Object.preventExtensions({}));
    });
    var setMeta = function setMeta(it) {
      setDesc(it, META, { value: {
          i: 'O' + ++id, // object ID
          w: {} // weak collections IDs
        } });
    };
    var fastKey = function fastKey(it, create) {
      // return primitive with prefix
      if (!isObject(it)) return (typeof it === "undefined" ? "undefined" : _typeof(it)) == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
      if (!has(it, META)) {
        // can't set metadata to uncaught frozen object
        if (!isExtensible(it)) return 'F';
        // not necessary to add metadata
        if (!create) return 'E';
        // add missing metadata
        setMeta(it);
        // return object ID
      }return it[META].i;
    };
    var getWeak = function getWeak(it, create) {
      if (!has(it, META)) {
        // can't set metadata to uncaught frozen object
        if (!isExtensible(it)) return true;
        // not necessary to add metadata
        if (!create) return false;
        // add missing metadata
        setMeta(it);
        // return hash weak collections IDs
      }return it[META].w;
    };
    // add metadata on freeze-family methods calling
    var onFreeze = function onFreeze(it) {
      if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
      return it;
    };
    var meta = module.exports = {
      KEY: META,
      NEED: false,
      fastKey: fastKey,
      getWeak: getWeak,
      onFreeze: onFreeze
    };
  }, { "./_fails": 38, "./_has": 44, "./_is-object": 54, "./_object-dp": 74, "./_uid": 124 }], 69: [function (require, module, exports) {
    var Map = require('./es6.map');
    var $export = require('./_export');
    var shared = require('./_shared')('metadata');
    var store = shared.store || (shared.store = new (require('./es6.weak-map'))());

    var getOrCreateMetadataMap = function getOrCreateMetadataMap(target, targetKey, create) {
      var targetMetadata = store.get(target);
      if (!targetMetadata) {
        if (!create) return undefined;
        store.set(target, targetMetadata = new Map());
      }
      var keyMetadata = targetMetadata.get(targetKey);
      if (!keyMetadata) {
        if (!create) return undefined;
        targetMetadata.set(targetKey, keyMetadata = new Map());
      }return keyMetadata;
    };
    var ordinaryHasOwnMetadata = function ordinaryHasOwnMetadata(MetadataKey, O, P) {
      var metadataMap = getOrCreateMetadataMap(O, P, false);
      return metadataMap === undefined ? false : metadataMap.has(MetadataKey);
    };
    var ordinaryGetOwnMetadata = function ordinaryGetOwnMetadata(MetadataKey, O, P) {
      var metadataMap = getOrCreateMetadataMap(O, P, false);
      return metadataMap === undefined ? undefined : metadataMap.get(MetadataKey);
    };
    var ordinaryDefineOwnMetadata = function ordinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
      getOrCreateMetadataMap(O, P, true).set(MetadataKey, MetadataValue);
    };
    var ordinaryOwnMetadataKeys = function ordinaryOwnMetadataKeys(target, targetKey) {
      var metadataMap = getOrCreateMetadataMap(target, targetKey, false);
      var keys = [];
      if (metadataMap) metadataMap.forEach(function (_, key) {
        keys.push(key);
      });
      return keys;
    };
    var toMetaKey = function toMetaKey(it) {
      return it === undefined || (typeof it === "undefined" ? "undefined" : _typeof(it)) == 'symbol' ? it : String(it);
    };
    var exp = function exp(O) {
      $export($export.S, 'Reflect', O);
    };

    module.exports = {
      store: store,
      map: getOrCreateMetadataMap,
      has: ordinaryHasOwnMetadata,
      get: ordinaryGetOwnMetadata,
      set: ordinaryDefineOwnMetadata,
      keys: ordinaryOwnMetadataKeys,
      key: toMetaKey,
      exp: exp
    };
  }, { "./_export": 36, "./_shared": 103, "./es6.map": 161, "./es6.weak-map": 267 }], 70: [function (require, module, exports) {
    var global = require('./_global');
    var macrotask = require('./_task').set;
    var Observer = global.MutationObserver || global.WebKitMutationObserver;
    var process = global.process;
    var Promise = global.Promise;
    var isNode = require('./_cof')(process) == 'process';

    module.exports = function () {
      var head, last, notify;

      var flush = function flush() {
        var parent, fn;
        if (isNode && (parent = process.domain)) parent.exit();
        while (head) {
          fn = head.fn;
          head = head.next;
          try {
            fn();
          } catch (e) {
            if (head) notify();else last = undefined;
            throw e;
          }
        }last = undefined;
        if (parent) parent.enter();
      };

      // Node.js
      if (isNode) {
        notify = function notify() {
          process.nextTick(flush);
        };
        // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
      } else if (Observer && !(global.navigator && global.navigator.standalone)) {
        var toggle = true;
        var node = document.createTextNode('');
        new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
        notify = function notify() {
          node.data = toggle = !toggle;
        };
        // environments with maybe non-completely correct, but existent Promise
      } else if (Promise && Promise.resolve) {
        // Promise.resolve without an argument throws an error in LG WebOS 2
        var promise = Promise.resolve(undefined);
        notify = function notify() {
          promise.then(flush);
        };
        // for other environments - macrotask based on:
        // - setImmediate
        // - MessageChannel
        // - window.postMessag
        // - onreadystatechange
        // - setTimeout
      } else {
        notify = function notify() {
          // strange IE + webpack dev server bug - use .call(global)
          macrotask.call(global, flush);
        };
      }

      return function (fn) {
        var task = { fn: fn, next: undefined };
        if (last) last.next = task;
        if (!head) {
          head = task;
          notify();
        }last = task;
      };
    };
  }, { "./_cof": 21, "./_global": 43, "./_task": 113 }], 71: [function (require, module, exports) {
    'use strict';
    // 25.4.1.5 NewPromiseCapability(C)

    var aFunction = require('./_a-function');

    function PromiseCapability(C) {
      var resolve, reject;
      this.promise = new C(function ($$resolve, $$reject) {
        if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
        resolve = $$resolve;
        reject = $$reject;
      });
      this.resolve = aFunction(resolve);
      this.reject = aFunction(reject);
    }

    module.exports.f = function (C) {
      return new PromiseCapability(C);
    };
  }, { "./_a-function": 6 }], 72: [function (require, module, exports) {
    'use strict';
    // 19.1.2.1 Object.assign(target, source, ...)

    var getKeys = require('./_object-keys');
    var gOPS = require('./_object-gops');
    var pIE = require('./_object-pie');
    var toObject = require('./_to-object');
    var IObject = require('./_iobject');
    var $assign = Object.assign;

    // should work with symbols and should have deterministic property order (V8 bug)
    module.exports = !$assign || require('./_fails')(function () {
      var A = {};
      var B = {};
      // eslint-disable-next-line no-undef
      var S = Symbol();
      var K = 'abcdefghijklmnopqrst';
      A[S] = 7;
      K.split('').forEach(function (k) {
        B[k] = k;
      });
      return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
    }) ? function assign(target, source) {
      // eslint-disable-line no-unused-vars
      var T = toObject(target);
      var aLen = arguments.length;
      var index = 1;
      var getSymbols = gOPS.f;
      var isEnum = pIE.f;
      while (aLen > index) {
        var S = IObject(arguments[index++]);
        var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
        var length = keys.length;
        var j = 0;
        var key;
        while (length > j) {
          if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
        }
      }return T;
    } : $assign;
  }, { "./_fails": 38, "./_iobject": 50, "./_object-gops": 80, "./_object-keys": 83, "./_object-pie": 84, "./_to-object": 119 }], 73: [function (require, module, exports) {
    // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
    var anObject = require('./_an-object');
    var dPs = require('./_object-dps');
    var enumBugKeys = require('./_enum-bug-keys');
    var IE_PROTO = require('./_shared-key')('IE_PROTO');
    var Empty = function Empty() {/* empty */};
    var PROTOTYPE = 'prototype';

    // Create object with fake `null` prototype: use iframe Object with cleared prototype
    var _createDict = function createDict() {
      // Thrash, waste and sodomy: IE GC bug
      var iframe = require('./_dom-create')('iframe');
      var i = enumBugKeys.length;
      var lt = '<';
      var gt = '>';
      var iframeDocument;
      iframe.style.display = 'none';
      require('./_html').appendChild(iframe);
      iframe.src = 'javascript:'; // eslint-disable-line no-script-url
      // createDict = iframe.contentWindow.Object;
      // html.removeChild(iframe);
      iframeDocument = iframe.contentWindow.document;
      iframeDocument.open();
      iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
      iframeDocument.close();
      _createDict = iframeDocument.F;
      while (i--) {
        delete _createDict[PROTOTYPE][enumBugKeys[i]];
      }return _createDict();
    };

    module.exports = Object.create || function create(O, Properties) {
      var result;
      if (O !== null) {
        Empty[PROTOTYPE] = anObject(O);
        result = new Empty();
        Empty[PROTOTYPE] = null;
        // add "__proto__" for Object.getPrototypeOf polyfill
        result[IE_PROTO] = O;
      } else result = _createDict();
      return Properties === undefined ? result : dPs(result, Properties);
    };
  }, { "./_an-object": 10, "./_dom-create": 33, "./_enum-bug-keys": 34, "./_html": 46, "./_object-dps": 75, "./_shared-key": 102 }], 74: [function (require, module, exports) {
    var anObject = require('./_an-object');
    var IE8_DOM_DEFINE = require('./_ie8-dom-define');
    var toPrimitive = require('./_to-primitive');
    var dP = Object.defineProperty;

    exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
      anObject(O);
      P = toPrimitive(P, true);
      anObject(Attributes);
      if (IE8_DOM_DEFINE) try {
        return dP(O, P, Attributes);
      } catch (e) {/* empty */}
      if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
      if ('value' in Attributes) O[P] = Attributes.value;
      return O;
    };
  }, { "./_an-object": 10, "./_descriptors": 32, "./_ie8-dom-define": 47, "./_to-primitive": 120 }], 75: [function (require, module, exports) {
    var dP = require('./_object-dp');
    var anObject = require('./_an-object');
    var getKeys = require('./_object-keys');

    module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
      anObject(O);
      var keys = getKeys(Properties);
      var length = keys.length;
      var i = 0;
      var P;
      while (length > i) {
        dP.f(O, P = keys[i++], Properties[P]);
      }return O;
    };
  }, { "./_an-object": 10, "./_descriptors": 32, "./_object-dp": 74, "./_object-keys": 83 }], 76: [function (require, module, exports) {
    'use strict';
    // Forced replacement prototype accessors methods

    module.exports = require('./_library') || !require('./_fails')(function () {
      var K = Math.random();
      // In FF throws only define methods
      // eslint-disable-next-line no-undef, no-useless-call
      __defineSetter__.call(null, K, function () {/* empty */});
      delete require('./_global')[K];
    });
  }, { "./_fails": 38, "./_global": 43, "./_library": 62 }], 77: [function (require, module, exports) {
    var pIE = require('./_object-pie');
    var createDesc = require('./_property-desc');
    var toIObject = require('./_to-iobject');
    var toPrimitive = require('./_to-primitive');
    var has = require('./_has');
    var IE8_DOM_DEFINE = require('./_ie8-dom-define');
    var gOPD = Object.getOwnPropertyDescriptor;

    exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
      O = toIObject(O);
      P = toPrimitive(P, true);
      if (IE8_DOM_DEFINE) try {
        return gOPD(O, P);
      } catch (e) {/* empty */}
      if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
    };
  }, { "./_descriptors": 32, "./_has": 44, "./_ie8-dom-define": 47, "./_object-pie": 84, "./_property-desc": 92, "./_to-iobject": 117, "./_to-primitive": 120 }], 78: [function (require, module, exports) {
    // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
    var toIObject = require('./_to-iobject');
    var gOPN = require('./_object-gopn').f;
    var toString = {}.toString;

    var windowNames = (typeof window === "undefined" ? "undefined" : _typeof(window)) == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];

    var getWindowNames = function getWindowNames(it) {
      try {
        return gOPN(it);
      } catch (e) {
        return windowNames.slice();
      }
    };

    module.exports.f = function getOwnPropertyNames(it) {
      return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
    };
  }, { "./_object-gopn": 79, "./_to-iobject": 117 }], 79: [function (require, module, exports) {
    // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
    var $keys = require('./_object-keys-internal');
    var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

    exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
      return $keys(O, hiddenKeys);
    };
  }, { "./_enum-bug-keys": 34, "./_object-keys-internal": 82 }], 80: [function (require, module, exports) {
    exports.f = Object.getOwnPropertySymbols;
  }, {}], 81: [function (require, module, exports) {
    // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
    var has = require('./_has');
    var toObject = require('./_to-object');
    var IE_PROTO = require('./_shared-key')('IE_PROTO');
    var ObjectProto = Object.prototype;

    module.exports = Object.getPrototypeOf || function (O) {
      O = toObject(O);
      if (has(O, IE_PROTO)) return O[IE_PROTO];
      if (typeof O.constructor == 'function' && O instanceof O.constructor) {
        return O.constructor.prototype;
      }return O instanceof Object ? ObjectProto : null;
    };
  }, { "./_has": 44, "./_shared-key": 102, "./_to-object": 119 }], 82: [function (require, module, exports) {
    var has = require('./_has');
    var toIObject = require('./_to-iobject');
    var arrayIndexOf = require('./_array-includes')(false);
    var IE_PROTO = require('./_shared-key')('IE_PROTO');

    module.exports = function (object, names) {
      var O = toIObject(object);
      var i = 0;
      var result = [];
      var key;
      for (key in O) {
        if (key != IE_PROTO) has(O, key) && result.push(key);
      } // Don't enum bug & hidden keys
      while (names.length > i) {
        if (has(O, key = names[i++])) {
          ~arrayIndexOf(result, key) || result.push(key);
        }
      }return result;
    };
  }, { "./_array-includes": 14, "./_has": 44, "./_shared-key": 102, "./_to-iobject": 117 }], 83: [function (require, module, exports) {
    // 19.1.2.14 / 15.2.3.14 Object.keys(O)
    var $keys = require('./_object-keys-internal');
    var enumBugKeys = require('./_enum-bug-keys');

    module.exports = Object.keys || function keys(O) {
      return $keys(O, enumBugKeys);
    };
  }, { "./_enum-bug-keys": 34, "./_object-keys-internal": 82 }], 84: [function (require, module, exports) {
    exports.f = {}.propertyIsEnumerable;
  }, {}], 85: [function (require, module, exports) {
    // most Object methods by ES6 should accept primitives
    var $export = require('./_export');
    var core = require('./_core');
    var fails = require('./_fails');
    module.exports = function (KEY, exec) {
      var fn = (core.Object || {})[KEY] || Object[KEY];
      var exp = {};
      exp[KEY] = exec(fn);
      $export($export.S + $export.F * fails(function () {
        fn(1);
      }), 'Object', exp);
    };
  }, { "./_core": 26, "./_export": 36, "./_fails": 38 }], 86: [function (require, module, exports) {
    var getKeys = require('./_object-keys');
    var toIObject = require('./_to-iobject');
    var isEnum = require('./_object-pie').f;
    module.exports = function (isEntries) {
      return function (it) {
        var O = toIObject(it);
        var keys = getKeys(O);
        var length = keys.length;
        var i = 0;
        var result = [];
        var key;
        while (length > i) {
          if (isEnum.call(O, key = keys[i++])) {
            result.push(isEntries ? [key, O[key]] : O[key]);
          }
        }return result;
      };
    };
  }, { "./_object-keys": 83, "./_object-pie": 84, "./_to-iobject": 117 }], 87: [function (require, module, exports) {
    // all object keys, includes non-enumerable and symbols
    var gOPN = require('./_object-gopn');
    var gOPS = require('./_object-gops');
    var anObject = require('./_an-object');
    var Reflect = require('./_global').Reflect;
    module.exports = Reflect && Reflect.ownKeys || function ownKeys(it) {
      var keys = gOPN.f(anObject(it));
      var getSymbols = gOPS.f;
      return getSymbols ? keys.concat(getSymbols(it)) : keys;
    };
  }, { "./_an-object": 10, "./_global": 43, "./_object-gopn": 79, "./_object-gops": 80 }], 88: [function (require, module, exports) {
    var $parseFloat = require('./_global').parseFloat;
    var $trim = require('./_string-trim').trim;

    module.exports = 1 / $parseFloat(require('./_string-ws') + '-0') !== -Infinity ? function parseFloat(str) {
      var string = $trim(String(str), 3);
      var result = $parseFloat(string);
      return result === 0 && string.charAt(0) == '-' ? -0 : result;
    } : $parseFloat;
  }, { "./_global": 43, "./_string-trim": 111, "./_string-ws": 112 }], 89: [function (require, module, exports) {
    var $parseInt = require('./_global').parseInt;
    var $trim = require('./_string-trim').trim;
    var ws = require('./_string-ws');
    var hex = /^[-+]?0[xX]/;

    module.exports = $parseInt(ws + '08') !== 8 || $parseInt(ws + '0x16') !== 22 ? function parseInt(str, radix) {
      var string = $trim(String(str), 3);
      return $parseInt(string, radix >>> 0 || (hex.test(string) ? 16 : 10));
    } : $parseInt;
  }, { "./_global": 43, "./_string-trim": 111, "./_string-ws": 112 }], 90: [function (require, module, exports) {
    module.exports = function (exec) {
      try {
        return { e: false, v: exec() };
      } catch (e) {
        return { e: true, v: e };
      }
    };
  }, {}], 91: [function (require, module, exports) {
    var anObject = require('./_an-object');
    var isObject = require('./_is-object');
    var newPromiseCapability = require('./_new-promise-capability');

    module.exports = function (C, x) {
      anObject(C);
      if (isObject(x) && x.constructor === C) return x;
      var promiseCapability = newPromiseCapability.f(C);
      var resolve = promiseCapability.resolve;
      resolve(x);
      return promiseCapability.promise;
    };
  }, { "./_an-object": 10, "./_is-object": 54, "./_new-promise-capability": 71 }], 92: [function (require, module, exports) {
    module.exports = function (bitmap, value) {
      return {
        enumerable: !(bitmap & 1),
        configurable: !(bitmap & 2),
        writable: !(bitmap & 4),
        value: value
      };
    };
  }, {}], 93: [function (require, module, exports) {
    var redefine = require('./_redefine');
    module.exports = function (target, src, safe) {
      for (var key in src) {
        redefine(target, key, src[key], safe);
      }return target;
    };
  }, { "./_redefine": 94 }], 94: [function (require, module, exports) {
    var global = require('./_global');
    var hide = require('./_hide');
    var has = require('./_has');
    var SRC = require('./_uid')('src');
    var TO_STRING = 'toString';
    var $toString = Function[TO_STRING];
    var TPL = ('' + $toString).split(TO_STRING);

    require('./_core').inspectSource = function (it) {
      return $toString.call(it);
    };

    (module.exports = function (O, key, val, safe) {
      var isFunction = typeof val == 'function';
      if (isFunction) has(val, 'name') || hide(val, 'name', key);
      if (O[key] === val) return;
      if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
      if (O === global) {
        O[key] = val;
      } else if (!safe) {
        delete O[key];
        hide(O, key, val);
      } else if (O[key]) {
        O[key] = val;
      } else {
        hide(O, key, val);
      }
      // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
    })(Function.prototype, TO_STRING, function toString() {
      return typeof this == 'function' && this[SRC] || $toString.call(this);
    });
  }, { "./_core": 26, "./_global": 43, "./_has": 44, "./_hide": 45, "./_uid": 124 }], 95: [function (require, module, exports) {
    module.exports = function (regExp, replace) {
      var replacer = replace === Object(replace) ? function (part) {
        return replace[part];
      } : replace;
      return function (it) {
        return String(it).replace(regExp, replacer);
      };
    };
  }, {}], 96: [function (require, module, exports) {
    // 7.2.9 SameValue(x, y)
    module.exports = Object.is || function is(x, y) {
      // eslint-disable-next-line no-self-compare
      return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
    };
  }, {}], 97: [function (require, module, exports) {
    'use strict';
    // https://tc39.github.io/proposal-setmap-offrom/

    var $export = require('./_export');
    var aFunction = require('./_a-function');
    var ctx = require('./_ctx');
    var forOf = require('./_for-of');

    module.exports = function (COLLECTION) {
      $export($export.S, COLLECTION, { from: function from(source /* , mapFn, thisArg */) {
          var mapFn = arguments[1];
          var mapping, A, n, cb;
          aFunction(this);
          mapping = mapFn !== undefined;
          if (mapping) aFunction(mapFn);
          if (source == undefined) return new this();
          A = [];
          if (mapping) {
            n = 0;
            cb = ctx(mapFn, arguments[2], 2);
            forOf(source, false, function (nextItem) {
              A.push(cb(nextItem, n++));
            });
          } else {
            forOf(source, false, A.push, A);
          }
          return new this(A);
        } });
    };
  }, { "./_a-function": 6, "./_ctx": 28, "./_export": 36, "./_for-of": 42 }], 98: [function (require, module, exports) {
    'use strict';
    // https://tc39.github.io/proposal-setmap-offrom/

    var $export = require('./_export');

    module.exports = function (COLLECTION) {
      $export($export.S, COLLECTION, { of: function of() {
          var length = arguments.length;
          var A = new Array(length);
          while (length--) {
            A[length] = arguments[length];
          }return new this(A);
        } });
    };
  }, { "./_export": 36 }], 99: [function (require, module, exports) {
    // Works with __proto__ only. Old v8 can't work with null proto objects.
    /* eslint-disable no-proto */
    var isObject = require('./_is-object');
    var anObject = require('./_an-object');
    var check = function check(O, proto) {
      anObject(O);
      if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
    };
    module.exports = {
      set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
      function (test, buggy, set) {
        try {
          set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
          set(test, []);
          buggy = !(test instanceof Array);
        } catch (e) {
          buggy = true;
        }
        return function setPrototypeOf(O, proto) {
          check(O, proto);
          if (buggy) O.__proto__ = proto;else set(O, proto);
          return O;
        };
      }({}, false) : undefined),
      check: check
    };
  }, { "./_an-object": 10, "./_ctx": 28, "./_is-object": 54, "./_object-gopd": 77 }], 100: [function (require, module, exports) {
    'use strict';

    var global = require('./_global');
    var dP = require('./_object-dp');
    var DESCRIPTORS = require('./_descriptors');
    var SPECIES = require('./_wks')('species');

    module.exports = function (KEY) {
      var C = global[KEY];
      if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
        configurable: true,
        get: function get() {
          return this;
        }
      });
    };
  }, { "./_descriptors": 32, "./_global": 43, "./_object-dp": 74, "./_wks": 129 }], 101: [function (require, module, exports) {
    var def = require('./_object-dp').f;
    var has = require('./_has');
    var TAG = require('./_wks')('toStringTag');

    module.exports = function (it, tag, stat) {
      if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
    };
  }, { "./_has": 44, "./_object-dp": 74, "./_wks": 129 }], 102: [function (require, module, exports) {
    var shared = require('./_shared')('keys');
    var uid = require('./_uid');
    module.exports = function (key) {
      return shared[key] || (shared[key] = uid(key));
    };
  }, { "./_shared": 103, "./_uid": 124 }], 103: [function (require, module, exports) {
    var core = require('./_core');
    var global = require('./_global');
    var SHARED = '__core-js_shared__';
    var store = global[SHARED] || (global[SHARED] = {});

    (module.exports = function (key, value) {
      return store[key] || (store[key] = value !== undefined ? value : {});
    })('versions', []).push({
      version: core.version,
      mode: require('./_library') ? 'pure' : 'global',
      copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
    });
  }, { "./_core": 26, "./_global": 43, "./_library": 62 }], 104: [function (require, module, exports) {
    // 7.3.20 SpeciesConstructor(O, defaultConstructor)
    var anObject = require('./_an-object');
    var aFunction = require('./_a-function');
    var SPECIES = require('./_wks')('species');
    module.exports = function (O, D) {
      var C = anObject(O).constructor;
      var S;
      return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
    };
  }, { "./_a-function": 6, "./_an-object": 10, "./_wks": 129 }], 105: [function (require, module, exports) {
    'use strict';

    var fails = require('./_fails');

    module.exports = function (method, arg) {
      return !!method && fails(function () {
        // eslint-disable-next-line no-useless-call
        arg ? method.call(null, function () {/* empty */}, 1) : method.call(null);
      });
    };
  }, { "./_fails": 38 }], 106: [function (require, module, exports) {
    var toInteger = require('./_to-integer');
    var defined = require('./_defined');
    // true  -> String#at
    // false -> String#codePointAt
    module.exports = function (TO_STRING) {
      return function (that, pos) {
        var s = String(defined(that));
        var i = toInteger(pos);
        var l = s.length;
        var a, b;
        if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
        a = s.charCodeAt(i);
        return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
      };
    };
  }, { "./_defined": 31, "./_to-integer": 116 }], 107: [function (require, module, exports) {
    // helper for String#{startsWith, endsWith, includes}
    var isRegExp = require('./_is-regexp');
    var defined = require('./_defined');

    module.exports = function (that, searchString, NAME) {
      if (isRegExp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
      return String(defined(that));
    };
  }, { "./_defined": 31, "./_is-regexp": 55 }], 108: [function (require, module, exports) {
    var $export = require('./_export');
    var fails = require('./_fails');
    var defined = require('./_defined');
    var quot = /"/g;
    // B.2.3.2.1 CreateHTML(string, tag, attribute, value)
    var createHTML = function createHTML(string, tag, attribute, value) {
      var S = String(defined(string));
      var p1 = '<' + tag;
      if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
      return p1 + '>' + S + '</' + tag + '>';
    };
    module.exports = function (NAME, exec) {
      var O = {};
      O[NAME] = exec(createHTML);
      $export($export.P + $export.F * fails(function () {
        var test = ''[NAME]('"');
        return test !== test.toLowerCase() || test.split('"').length > 3;
      }), 'String', O);
    };
  }, { "./_defined": 31, "./_export": 36, "./_fails": 38 }], 109: [function (require, module, exports) {
    // https://github.com/tc39/proposal-string-pad-start-end
    var toLength = require('./_to-length');
    var repeat = require('./_string-repeat');
    var defined = require('./_defined');

    module.exports = function (that, maxLength, fillString, left) {
      var S = String(defined(that));
      var stringLength = S.length;
      var fillStr = fillString === undefined ? ' ' : String(fillString);
      var intMaxLength = toLength(maxLength);
      if (intMaxLength <= stringLength || fillStr == '') return S;
      var fillLen = intMaxLength - stringLength;
      var stringFiller = repeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
      if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
      return left ? stringFiller + S : S + stringFiller;
    };
  }, { "./_defined": 31, "./_string-repeat": 110, "./_to-length": 118 }], 110: [function (require, module, exports) {
    'use strict';

    var toInteger = require('./_to-integer');
    var defined = require('./_defined');

    module.exports = function repeat(count) {
      var str = String(defined(this));
      var res = '';
      var n = toInteger(count);
      if (n < 0 || n == Infinity) throw RangeError("Count can't be negative");
      for (; n > 0; (n >>>= 1) && (str += str)) {
        if (n & 1) res += str;
      }return res;
    };
  }, { "./_defined": 31, "./_to-integer": 116 }], 111: [function (require, module, exports) {
    var $export = require('./_export');
    var defined = require('./_defined');
    var fails = require('./_fails');
    var spaces = require('./_string-ws');
    var space = '[' + spaces + ']';
    var non = "\u200B\x85";
    var ltrim = RegExp('^' + space + space + '*');
    var rtrim = RegExp(space + space + '*$');

    var exporter = function exporter(KEY, exec, ALIAS) {
      var exp = {};
      var FORCE = fails(function () {
        return !!spaces[KEY]() || non[KEY]() != non;
      });
      var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
      if (ALIAS) exp[ALIAS] = fn;
      $export($export.P + $export.F * FORCE, 'String', exp);
    };

    // 1 -> String#trimLeft
    // 2 -> String#trimRight
    // 3 -> String#trim
    var trim = exporter.trim = function (string, TYPE) {
      string = String(defined(string));
      if (TYPE & 1) string = string.replace(ltrim, '');
      if (TYPE & 2) string = string.replace(rtrim, '');
      return string;
    };

    module.exports = exporter;
  }, { "./_defined": 31, "./_export": 36, "./_fails": 38, "./_string-ws": 112 }], 112: [function (require, module, exports) {
    module.exports = "\t\n\x0B\f\r \xA0\u1680\u180E\u2000\u2001\u2002\u2003" + "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
  }, {}], 113: [function (require, module, exports) {
    var ctx = require('./_ctx');
    var invoke = require('./_invoke');
    var html = require('./_html');
    var cel = require('./_dom-create');
    var global = require('./_global');
    var process = global.process;
    var setTask = global.setImmediate;
    var clearTask = global.clearImmediate;
    var MessageChannel = global.MessageChannel;
    var Dispatch = global.Dispatch;
    var counter = 0;
    var queue = {};
    var ONREADYSTATECHANGE = 'onreadystatechange';
    var defer, channel, port;
    var run = function run() {
      var id = +this;
      // eslint-disable-next-line no-prototype-builtins
      if (queue.hasOwnProperty(id)) {
        var fn = queue[id];
        delete queue[id];
        fn();
      }
    };
    var listener = function listener(event) {
      run.call(event.data);
    };
    // Node.js 0.9+ & IE10+ has setImmediate, otherwise:
    if (!setTask || !clearTask) {
      setTask = function setImmediate(fn) {
        var args = [];
        var i = 1;
        while (arguments.length > i) {
          args.push(arguments[i++]);
        }queue[++counter] = function () {
          // eslint-disable-next-line no-new-func
          invoke(typeof fn == 'function' ? fn : Function(fn), args);
        };
        defer(counter);
        return counter;
      };
      clearTask = function clearImmediate(id) {
        delete queue[id];
      };
      // Node.js 0.8-
      if (require('./_cof')(process) == 'process') {
        defer = function defer(id) {
          process.nextTick(ctx(run, id, 1));
        };
        // Sphere (JS game engine) Dispatch API
      } else if (Dispatch && Dispatch.now) {
        defer = function defer(id) {
          Dispatch.now(ctx(run, id, 1));
        };
        // Browsers with MessageChannel, includes WebWorkers
      } else if (MessageChannel) {
        channel = new MessageChannel();
        port = channel.port2;
        channel.port1.onmessage = listener;
        defer = ctx(port.postMessage, port, 1);
        // Browsers with postMessage, skip WebWorkers
        // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
      } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
        defer = function defer(id) {
          global.postMessage(id + '', '*');
        };
        global.addEventListener('message', listener, false);
        // IE8-
      } else if (ONREADYSTATECHANGE in cel('script')) {
        defer = function defer(id) {
          html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
            html.removeChild(this);
            run.call(id);
          };
        };
        // Rest old browsers
      } else {
        defer = function defer(id) {
          setTimeout(ctx(run, id, 1), 0);
        };
      }
    }
    module.exports = {
      set: setTask,
      clear: clearTask
    };
  }, { "./_cof": 21, "./_ctx": 28, "./_dom-create": 33, "./_global": 43, "./_html": 46, "./_invoke": 49 }], 114: [function (require, module, exports) {
    var toInteger = require('./_to-integer');
    var max = Math.max;
    var min = Math.min;
    module.exports = function (index, length) {
      index = toInteger(index);
      return index < 0 ? max(index + length, 0) : min(index, length);
    };
  }, { "./_to-integer": 116 }], 115: [function (require, module, exports) {
    // https://tc39.github.io/ecma262/#sec-toindex
    var toInteger = require('./_to-integer');
    var toLength = require('./_to-length');
    module.exports = function (it) {
      if (it === undefined) return 0;
      var number = toInteger(it);
      var length = toLength(number);
      if (number !== length) throw RangeError('Wrong length!');
      return length;
    };
  }, { "./_to-integer": 116, "./_to-length": 118 }], 116: [function (require, module, exports) {
    // 7.1.4 ToInteger
    var ceil = Math.ceil;
    var floor = Math.floor;
    module.exports = function (it) {
      return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
    };
  }, {}], 117: [function (require, module, exports) {
    // to indexed object, toObject with fallback for non-array-like ES3 strings
    var IObject = require('./_iobject');
    var defined = require('./_defined');
    module.exports = function (it) {
      return IObject(defined(it));
    };
  }, { "./_defined": 31, "./_iobject": 50 }], 118: [function (require, module, exports) {
    // 7.1.15 ToLength
    var toInteger = require('./_to-integer');
    var min = Math.min;
    module.exports = function (it) {
      return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
    };
  }, { "./_to-integer": 116 }], 119: [function (require, module, exports) {
    // 7.1.13 ToObject(argument)
    var defined = require('./_defined');
    module.exports = function (it) {
      return Object(defined(it));
    };
  }, { "./_defined": 31 }], 120: [function (require, module, exports) {
    // 7.1.1 ToPrimitive(input [, PreferredType])
    var isObject = require('./_is-object');
    // instead of the ES6 spec version, we didn't implement @@toPrimitive case
    // and the second argument - flag - preferred type is a string
    module.exports = function (it, S) {
      if (!isObject(it)) return it;
      var fn, val;
      if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
      if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
      if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
      throw TypeError("Can't convert object to primitive value");
    };
  }, { "./_is-object": 54 }], 121: [function (require, module, exports) {
    'use strict';

    if (require('./_descriptors')) {
      var LIBRARY = require('./_library');
      var global = require('./_global');
      var fails = require('./_fails');
      var $export = require('./_export');
      var $typed = require('./_typed');
      var $buffer = require('./_typed-buffer');
      var ctx = require('./_ctx');
      var anInstance = require('./_an-instance');
      var propertyDesc = require('./_property-desc');
      var hide = require('./_hide');
      var redefineAll = require('./_redefine-all');
      var toInteger = require('./_to-integer');
      var toLength = require('./_to-length');
      var toIndex = require('./_to-index');
      var toAbsoluteIndex = require('./_to-absolute-index');
      var toPrimitive = require('./_to-primitive');
      var has = require('./_has');
      var classof = require('./_classof');
      var isObject = require('./_is-object');
      var toObject = require('./_to-object');
      var isArrayIter = require('./_is-array-iter');
      var create = require('./_object-create');
      var getPrototypeOf = require('./_object-gpo');
      var gOPN = require('./_object-gopn').f;
      var getIterFn = require('./core.get-iterator-method');
      var uid = require('./_uid');
      var wks = require('./_wks');
      var createArrayMethod = require('./_array-methods');
      var createArrayIncludes = require('./_array-includes');
      var speciesConstructor = require('./_species-constructor');
      var ArrayIterators = require('./es6.array.iterator');
      var Iterators = require('./_iterators');
      var $iterDetect = require('./_iter-detect');
      var setSpecies = require('./_set-species');
      var arrayFill = require('./_array-fill');
      var arrayCopyWithin = require('./_array-copy-within');
      var $DP = require('./_object-dp');
      var $GOPD = require('./_object-gopd');
      var dP = $DP.f;
      var gOPD = $GOPD.f;
      var RangeError = global.RangeError;
      var TypeError = global.TypeError;
      var Uint8Array = global.Uint8Array;
      var ARRAY_BUFFER = 'ArrayBuffer';
      var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
      var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
      var PROTOTYPE = 'prototype';
      var ArrayProto = Array[PROTOTYPE];
      var $ArrayBuffer = $buffer.ArrayBuffer;
      var $DataView = $buffer.DataView;
      var arrayForEach = createArrayMethod(0);
      var arrayFilter = createArrayMethod(2);
      var arraySome = createArrayMethod(3);
      var arrayEvery = createArrayMethod(4);
      var arrayFind = createArrayMethod(5);
      var arrayFindIndex = createArrayMethod(6);
      var arrayIncludes = createArrayIncludes(true);
      var arrayIndexOf = createArrayIncludes(false);
      var arrayValues = ArrayIterators.values;
      var arrayKeys = ArrayIterators.keys;
      var arrayEntries = ArrayIterators.entries;
      var arrayLastIndexOf = ArrayProto.lastIndexOf;
      var arrayReduce = ArrayProto.reduce;
      var arrayReduceRight = ArrayProto.reduceRight;
      var arrayJoin = ArrayProto.join;
      var arraySort = ArrayProto.sort;
      var arraySlice = ArrayProto.slice;
      var arrayToString = ArrayProto.toString;
      var arrayToLocaleString = ArrayProto.toLocaleString;
      var ITERATOR = wks('iterator');
      var TAG = wks('toStringTag');
      var TYPED_CONSTRUCTOR = uid('typed_constructor');
      var DEF_CONSTRUCTOR = uid('def_constructor');
      var ALL_CONSTRUCTORS = $typed.CONSTR;
      var TYPED_ARRAY = $typed.TYPED;
      var VIEW = $typed.VIEW;
      var WRONG_LENGTH = 'Wrong length!';

      var $map = createArrayMethod(1, function (O, length) {
        return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
      });

      var LITTLE_ENDIAN = fails(function () {
        // eslint-disable-next-line no-undef
        return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
      });

      var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {
        new Uint8Array(1).set({});
      });

      var toOffset = function toOffset(it, BYTES) {
        var offset = toInteger(it);
        if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');
        return offset;
      };

      var validate = function validate(it) {
        if (isObject(it) && TYPED_ARRAY in it) return it;
        throw TypeError(it + ' is not a typed array!');
      };

      var allocate = function allocate(C, length) {
        if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {
          throw TypeError('It is not a typed array constructor!');
        }return new C(length);
      };

      var speciesFromList = function speciesFromList(O, list) {
        return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
      };

      var fromList = function fromList(C, list) {
        var index = 0;
        var length = list.length;
        var result = allocate(C, length);
        while (length > index) {
          result[index] = list[index++];
        }return result;
      };

      var addGetter = function addGetter(it, key, internal) {
        dP(it, key, { get: function get() {
            return this._d[internal];
          } });
      };

      var $from = function from(source /* , mapfn, thisArg */) {
        var O = toObject(source);
        var aLen = arguments.length;
        var mapfn = aLen > 1 ? arguments[1] : undefined;
        var mapping = mapfn !== undefined;
        var iterFn = getIterFn(O);
        var i, length, values, result, step, iterator;
        if (iterFn != undefined && !isArrayIter(iterFn)) {
          for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
            values.push(step.value);
          }O = values;
        }
        if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);
        for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {
          result[i] = mapping ? mapfn(O[i], i) : O[i];
        }
        return result;
      };

      var $of = function of() /* ...items */{
        var index = 0;
        var length = arguments.length;
        var result = allocate(this, length);
        while (length > index) {
          result[index] = arguments[index++];
        }return result;
      };

      // iOS Safari 6.x fails here
      var TO_LOCALE_BUG = !!Uint8Array && fails(function () {
        arrayToLocaleString.call(new Uint8Array(1));
      });

      var $toLocaleString = function toLocaleString() {
        return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
      };

      var proto = {
        copyWithin: function copyWithin(target, start /* , end */) {
          return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
        },
        every: function every(callbackfn /* , thisArg */) {
          return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
        },
        fill: function fill(value /* , start, end */) {
          // eslint-disable-line no-unused-vars
          return arrayFill.apply(validate(this), arguments);
        },
        filter: function filter(callbackfn /* , thisArg */) {
          return speciesFromList(this, arrayFilter(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined));
        },
        find: function find(predicate /* , thisArg */) {
          return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
        },
        findIndex: function findIndex(predicate /* , thisArg */) {
          return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
        },
        forEach: function forEach(callbackfn /* , thisArg */) {
          arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
        },
        indexOf: function indexOf(searchElement /* , fromIndex */) {
          return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
        },
        includes: function includes(searchElement /* , fromIndex */) {
          return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
        },
        join: function join(separator) {
          // eslint-disable-line no-unused-vars
          return arrayJoin.apply(validate(this), arguments);
        },
        lastIndexOf: function lastIndexOf(searchElement /* , fromIndex */) {
          // eslint-disable-line no-unused-vars
          return arrayLastIndexOf.apply(validate(this), arguments);
        },
        map: function map(mapfn /* , thisArg */) {
          return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
        },
        reduce: function reduce(callbackfn /* , initialValue */) {
          // eslint-disable-line no-unused-vars
          return arrayReduce.apply(validate(this), arguments);
        },
        reduceRight: function reduceRight(callbackfn /* , initialValue */) {
          // eslint-disable-line no-unused-vars
          return arrayReduceRight.apply(validate(this), arguments);
        },
        reverse: function reverse() {
          var that = this;
          var length = validate(that).length;
          var middle = Math.floor(length / 2);
          var index = 0;
          var value;
          while (index < middle) {
            value = that[index];
            that[index++] = that[--length];
            that[length] = value;
          }return that;
        },
        some: function some(callbackfn /* , thisArg */) {
          return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
        },
        sort: function sort(comparefn) {
          return arraySort.call(validate(this), comparefn);
        },
        subarray: function subarray(begin, end) {
          var O = validate(this);
          var length = O.length;
          var $begin = toAbsoluteIndex(begin, length);
          return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(O.buffer, O.byteOffset + $begin * O.BYTES_PER_ELEMENT, toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin));
        }
      };

      var $slice = function slice(start, end) {
        return speciesFromList(this, arraySlice.call(validate(this), start, end));
      };

      var $set = function set(arrayLike /* , offset */) {
        validate(this);
        var offset = toOffset(arguments[1], 1);
        var length = this.length;
        var src = toObject(arrayLike);
        var len = toLength(src.length);
        var index = 0;
        if (len + offset > length) throw RangeError(WRONG_LENGTH);
        while (index < len) {
          this[offset + index] = src[index++];
        }
      };

      var $iterators = {
        entries: function entries() {
          return arrayEntries.call(validate(this));
        },
        keys: function keys() {
          return arrayKeys.call(validate(this));
        },
        values: function values() {
          return arrayValues.call(validate(this));
        }
      };

      var isTAIndex = function isTAIndex(target, key) {
        return isObject(target) && target[TYPED_ARRAY] && (typeof key === "undefined" ? "undefined" : _typeof(key)) != 'symbol' && key in target && String(+key) == String(key);
      };
      var $getDesc = function getOwnPropertyDescriptor(target, key) {
        return isTAIndex(target, key = toPrimitive(key, true)) ? propertyDesc(2, target[key]) : gOPD(target, key);
      };
      var $setDesc = function defineProperty(target, key, desc) {
        if (isTAIndex(target, key = toPrimitive(key, true)) && isObject(desc) && has(desc, 'value') && !has(desc, 'get') && !has(desc, 'set')
        // TODO: add validation descriptor w/o calling accessors
        && !desc.configurable && (!has(desc, 'writable') || desc.writable) && (!has(desc, 'enumerable') || desc.enumerable)) {
          target[key] = desc.value;
          return target;
        }return dP(target, key, desc);
      };

      if (!ALL_CONSTRUCTORS) {
        $GOPD.f = $getDesc;
        $DP.f = $setDesc;
      }

      $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
        getOwnPropertyDescriptor: $getDesc,
        defineProperty: $setDesc
      });

      if (fails(function () {
        arrayToString.call({});
      })) {
        arrayToString = arrayToLocaleString = function toString() {
          return arrayJoin.call(this);
        };
      }

      var $TypedArrayPrototype$ = redefineAll({}, proto);
      redefineAll($TypedArrayPrototype$, $iterators);
      hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
      redefineAll($TypedArrayPrototype$, {
        slice: $slice,
        set: $set,
        constructor: function constructor() {/* noop */},
        toString: arrayToString,
        toLocaleString: $toLocaleString
      });
      addGetter($TypedArrayPrototype$, 'buffer', 'b');
      addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
      addGetter($TypedArrayPrototype$, 'byteLength', 'l');
      addGetter($TypedArrayPrototype$, 'length', 'e');
      dP($TypedArrayPrototype$, TAG, {
        get: function get() {
          return this[TYPED_ARRAY];
        }
      });

      // eslint-disable-next-line max-statements
      module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
        CLAMPED = !!CLAMPED;
        var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
        var GETTER = 'get' + KEY;
        var SETTER = 'set' + KEY;
        var TypedArray = global[NAME];
        var Base = TypedArray || {};
        var TAC = TypedArray && getPrototypeOf(TypedArray);
        var FORCED = !TypedArray || !$typed.ABV;
        var O = {};
        var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
        var getter = function getter(that, index) {
          var data = that._d;
          return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
        };
        var setter = function setter(that, index, value) {
          var data = that._d;
          if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
          data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
        };
        var addElement = function addElement(that, index) {
          dP(that, index, {
            get: function get() {
              return getter(this, index);
            },
            set: function set(value) {
              return setter(this, index, value);
            },
            enumerable: true
          });
        };
        if (FORCED) {
          TypedArray = wrapper(function (that, data, $offset, $length) {
            anInstance(that, TypedArray, NAME, '_d');
            var index = 0;
            var offset = 0;
            var buffer, byteLength, length, klass;
            if (!isObject(data)) {
              length = toIndex(data);
              byteLength = length * BYTES;
              buffer = new $ArrayBuffer(byteLength);
            } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
              buffer = data;
              offset = toOffset($offset, BYTES);
              var $len = data.byteLength;
              if ($length === undefined) {
                if ($len % BYTES) throw RangeError(WRONG_LENGTH);
                byteLength = $len - offset;
                if (byteLength < 0) throw RangeError(WRONG_LENGTH);
              } else {
                byteLength = toLength($length) * BYTES;
                if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);
              }
              length = byteLength / BYTES;
            } else if (TYPED_ARRAY in data) {
              return fromList(TypedArray, data);
            } else {
              return $from.call(TypedArray, data);
            }
            hide(that, '_d', {
              b: buffer,
              o: offset,
              l: byteLength,
              e: length,
              v: new $DataView(buffer)
            });
            while (index < length) {
              addElement(that, index++);
            }
          });
          TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
          hide(TypedArrayPrototype, 'constructor', TypedArray);
        } else if (!fails(function () {
          TypedArray(1);
        }) || !fails(function () {
          new TypedArray(-1); // eslint-disable-line no-new
        }) || !$iterDetect(function (iter) {
          new TypedArray(); // eslint-disable-line no-new
          new TypedArray(null); // eslint-disable-line no-new
          new TypedArray(1.5); // eslint-disable-line no-new
          new TypedArray(iter); // eslint-disable-line no-new
        }, true)) {
          TypedArray = wrapper(function (that, data, $offset, $length) {
            anInstance(that, TypedArray, NAME);
            var klass;
            // `ws` module bug, temporarily remove validation length for Uint8Array
            // https://github.com/websockets/ws/pull/645
            if (!isObject(data)) return new Base(toIndex(data));
            if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
              return $length !== undefined ? new Base(data, toOffset($offset, BYTES), $length) : $offset !== undefined ? new Base(data, toOffset($offset, BYTES)) : new Base(data);
            }
            if (TYPED_ARRAY in data) return fromList(TypedArray, data);
            return $from.call(TypedArray, data);
          });
          arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {
            if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
          });
          TypedArray[PROTOTYPE] = TypedArrayPrototype;
          if (!LIBRARY) TypedArrayPrototype.constructor = TypedArray;
        }
        var $nativeIterator = TypedArrayPrototype[ITERATOR];
        var CORRECT_ITER_NAME = !!$nativeIterator && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);
        var $iterator = $iterators.values;
        hide(TypedArray, TYPED_CONSTRUCTOR, true);
        hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
        hide(TypedArrayPrototype, VIEW, true);
        hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

        if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
          dP(TypedArrayPrototype, TAG, {
            get: function get() {
              return NAME;
            }
          });
        }

        O[NAME] = TypedArray;

        $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

        $export($export.S, NAME, {
          BYTES_PER_ELEMENT: BYTES
        });

        $export($export.S + $export.F * fails(function () {
          Base.of.call(TypedArray, 1);
        }), NAME, {
          from: $from,
          of: $of
        });

        if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

        $export($export.P, NAME, proto);

        setSpecies(NAME);

        $export($export.P + $export.F * FORCED_SET, NAME, { set: $set });

        $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

        if (!LIBRARY && TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;

        $export($export.P + $export.F * fails(function () {
          new TypedArray(1).slice();
        }), NAME, { slice: $slice });

        $export($export.P + $export.F * (fails(function () {
          return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();
        }) || !fails(function () {
          TypedArrayPrototype.toLocaleString.call([1, 2]);
        })), NAME, { toLocaleString: $toLocaleString });

        Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
        if (!LIBRARY && !CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);
      };
    } else module.exports = function () {/* empty */};
  }, { "./_an-instance": 9, "./_array-copy-within": 11, "./_array-fill": 12, "./_array-includes": 14, "./_array-methods": 15, "./_classof": 20, "./_ctx": 28, "./_descriptors": 32, "./_export": 36, "./_fails": 38, "./_global": 43, "./_has": 44, "./_hide": 45, "./_is-array-iter": 51, "./_is-object": 54, "./_iter-detect": 59, "./_iterators": 61, "./_library": 62, "./_object-create": 73, "./_object-dp": 74, "./_object-gopd": 77, "./_object-gopn": 79, "./_object-gpo": 81, "./_property-desc": 92, "./_redefine-all": 93, "./_set-species": 100, "./_species-constructor": 104, "./_to-absolute-index": 114, "./_to-index": 115, "./_to-integer": 116, "./_to-length": 118, "./_to-object": 119, "./_to-primitive": 120, "./_typed": 123, "./_typed-buffer": 122, "./_uid": 124, "./_wks": 129, "./core.get-iterator-method": 130, "./es6.array.iterator": 142 }], 122: [function (require, module, exports) {
    'use strict';

    var global = require('./_global');
    var DESCRIPTORS = require('./_descriptors');
    var LIBRARY = require('./_library');
    var $typed = require('./_typed');
    var hide = require('./_hide');
    var redefineAll = require('./_redefine-all');
    var fails = require('./_fails');
    var anInstance = require('./_an-instance');
    var toInteger = require('./_to-integer');
    var toLength = require('./_to-length');
    var toIndex = require('./_to-index');
    var gOPN = require('./_object-gopn').f;
    var dP = require('./_object-dp').f;
    var arrayFill = require('./_array-fill');
    var setToStringTag = require('./_set-to-string-tag');
    var ARRAY_BUFFER = 'ArrayBuffer';
    var DATA_VIEW = 'DataView';
    var PROTOTYPE = 'prototype';
    var WRONG_LENGTH = 'Wrong length!';
    var WRONG_INDEX = 'Wrong index!';
    var $ArrayBuffer = global[ARRAY_BUFFER];
    var $DataView = global[DATA_VIEW];
    var Math = global.Math;
    var RangeError = global.RangeError;
    // eslint-disable-next-line no-shadow-restricted-names
    var Infinity = global.Infinity;
    var BaseBuffer = $ArrayBuffer;
    var abs = Math.abs;
    var pow = Math.pow;
    var floor = Math.floor;
    var log = Math.log;
    var LN2 = Math.LN2;
    var BUFFER = 'buffer';
    var BYTE_LENGTH = 'byteLength';
    var BYTE_OFFSET = 'byteOffset';
    var $BUFFER = DESCRIPTORS ? '_b' : BUFFER;
    var $LENGTH = DESCRIPTORS ? '_l' : BYTE_LENGTH;
    var $OFFSET = DESCRIPTORS ? '_o' : BYTE_OFFSET;

    // IEEE754 conversions based on https://github.com/feross/ieee754
    function packIEEE754(value, mLen, nBytes) {
      var buffer = new Array(nBytes);
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;
      var i = 0;
      var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
      var e, m, c;
      value = abs(value);
      // eslint-disable-next-line no-self-compare
      if (value != value || value === Infinity) {
        // eslint-disable-next-line no-self-compare
        m = value != value ? 1 : 0;
        e = eMax;
      } else {
        e = floor(log(value) / LN2);
        if (value * (c = pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * pow(2, eBias - 1) * pow(2, mLen);
          e = 0;
        }
      }
      for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8) {}
      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8) {}
      buffer[--i] |= s * 128;
      return buffer;
    }
    function unpackIEEE754(buffer, mLen, nBytes) {
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = eLen - 7;
      var i = nBytes - 1;
      var s = buffer[i--];
      var e = s & 127;
      var m;
      s >>= 7;
      for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8) {}
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8) {}
      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : s ? -Infinity : Infinity;
      } else {
        m = m + pow(2, mLen);
        e = e - eBias;
      }return (s ? -1 : 1) * m * pow(2, e - mLen);
    }

    function unpackI32(bytes) {
      return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
    }
    function packI8(it) {
      return [it & 0xff];
    }
    function packI16(it) {
      return [it & 0xff, it >> 8 & 0xff];
    }
    function packI32(it) {
      return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
    }
    function packF64(it) {
      return packIEEE754(it, 52, 8);
    }
    function packF32(it) {
      return packIEEE754(it, 23, 4);
    }

    function addGetter(C, key, internal) {
      dP(C[PROTOTYPE], key, { get: function get() {
          return this[internal];
        } });
    }

    function get(view, bytes, index, isLittleEndian) {
      var numIndex = +index;
      var intIndex = toIndex(numIndex);
      if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
      var store = view[$BUFFER]._b;
      var start = intIndex + view[$OFFSET];
      var pack = store.slice(start, start + bytes);
      return isLittleEndian ? pack : pack.reverse();
    }
    function set(view, bytes, index, conversion, value, isLittleEndian) {
      var numIndex = +index;
      var intIndex = toIndex(numIndex);
      if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
      var store = view[$BUFFER]._b;
      var start = intIndex + view[$OFFSET];
      var pack = conversion(+value);
      for (var i = 0; i < bytes; i++) {
        store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
      }
    }

    if (!$typed.ABV) {
      $ArrayBuffer = function ArrayBuffer(length) {
        anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
        var byteLength = toIndex(length);
        this._b = arrayFill.call(new Array(byteLength), 0);
        this[$LENGTH] = byteLength;
      };

      $DataView = function DataView(buffer, byteOffset, byteLength) {
        anInstance(this, $DataView, DATA_VIEW);
        anInstance(buffer, $ArrayBuffer, DATA_VIEW);
        var bufferLength = buffer[$LENGTH];
        var offset = toInteger(byteOffset);
        if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');
        byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
        if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
        this[$BUFFER] = buffer;
        this[$OFFSET] = offset;
        this[$LENGTH] = byteLength;
      };

      if (DESCRIPTORS) {
        addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
        addGetter($DataView, BUFFER, '_b');
        addGetter($DataView, BYTE_LENGTH, '_l');
        addGetter($DataView, BYTE_OFFSET, '_o');
      }

      redefineAll($DataView[PROTOTYPE], {
        getInt8: function getInt8(byteOffset) {
          return get(this, 1, byteOffset)[0] << 24 >> 24;
        },
        getUint8: function getUint8(byteOffset) {
          return get(this, 1, byteOffset)[0];
        },
        getInt16: function getInt16(byteOffset /* , littleEndian */) {
          var bytes = get(this, 2, byteOffset, arguments[1]);
          return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
        },
        getUint16: function getUint16(byteOffset /* , littleEndian */) {
          var bytes = get(this, 2, byteOffset, arguments[1]);
          return bytes[1] << 8 | bytes[0];
        },
        getInt32: function getInt32(byteOffset /* , littleEndian */) {
          return unpackI32(get(this, 4, byteOffset, arguments[1]));
        },
        getUint32: function getUint32(byteOffset /* , littleEndian */) {
          return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
        },
        getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
          return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
        },
        getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
          return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
        },
        setInt8: function setInt8(byteOffset, value) {
          set(this, 1, byteOffset, packI8, value);
        },
        setUint8: function setUint8(byteOffset, value) {
          set(this, 1, byteOffset, packI8, value);
        },
        setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
          set(this, 2, byteOffset, packI16, value, arguments[2]);
        },
        setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
          set(this, 2, byteOffset, packI16, value, arguments[2]);
        },
        setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
          set(this, 4, byteOffset, packI32, value, arguments[2]);
        },
        setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
          set(this, 4, byteOffset, packI32, value, arguments[2]);
        },
        setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
          set(this, 4, byteOffset, packF32, value, arguments[2]);
        },
        setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
          set(this, 8, byteOffset, packF64, value, arguments[2]);
        }
      });
    } else {
      if (!fails(function () {
        $ArrayBuffer(1);
      }) || !fails(function () {
        new $ArrayBuffer(-1); // eslint-disable-line no-new
      }) || fails(function () {
        new $ArrayBuffer(); // eslint-disable-line no-new
        new $ArrayBuffer(1.5); // eslint-disable-line no-new
        new $ArrayBuffer(NaN); // eslint-disable-line no-new
        return $ArrayBuffer.name != ARRAY_BUFFER;
      })) {
        $ArrayBuffer = function ArrayBuffer(length) {
          anInstance(this, $ArrayBuffer);
          return new BaseBuffer(toIndex(length));
        };
        var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
        for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {
          if (!((key = keys[j++]) in $ArrayBuffer)) hide($ArrayBuffer, key, BaseBuffer[key]);
        }
        if (!LIBRARY) ArrayBufferProto.constructor = $ArrayBuffer;
      }
      // iOS Safari 7.x bug
      var view = new $DataView(new $ArrayBuffer(2));
      var $setInt8 = $DataView[PROTOTYPE].setInt8;
      view.setInt8(0, 2147483648);
      view.setInt8(1, 2147483649);
      if (view.getInt8(0) || !view.getInt8(1)) redefineAll($DataView[PROTOTYPE], {
        setInt8: function setInt8(byteOffset, value) {
          $setInt8.call(this, byteOffset, value << 24 >> 24);
        },
        setUint8: function setUint8(byteOffset, value) {
          $setInt8.call(this, byteOffset, value << 24 >> 24);
        }
      }, true);
    }
    setToStringTag($ArrayBuffer, ARRAY_BUFFER);
    setToStringTag($DataView, DATA_VIEW);
    hide($DataView[PROTOTYPE], $typed.VIEW, true);
    exports[ARRAY_BUFFER] = $ArrayBuffer;
    exports[DATA_VIEW] = $DataView;
  }, { "./_an-instance": 9, "./_array-fill": 12, "./_descriptors": 32, "./_fails": 38, "./_global": 43, "./_hide": 45, "./_library": 62, "./_object-dp": 74, "./_object-gopn": 79, "./_redefine-all": 93, "./_set-to-string-tag": 101, "./_to-index": 115, "./_to-integer": 116, "./_to-length": 118, "./_typed": 123 }], 123: [function (require, module, exports) {
    var global = require('./_global');
    var hide = require('./_hide');
    var uid = require('./_uid');
    var TYPED = uid('typed_array');
    var VIEW = uid('view');
    var ABV = !!(global.ArrayBuffer && global.DataView);
    var CONSTR = ABV;
    var i = 0;
    var l = 9;
    var Typed;

    var TypedArrayConstructors = 'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'.split(',');

    while (i < l) {
      if (Typed = global[TypedArrayConstructors[i++]]) {
        hide(Typed.prototype, TYPED, true);
        hide(Typed.prototype, VIEW, true);
      } else CONSTR = false;
    }

    module.exports = {
      ABV: ABV,
      CONSTR: CONSTR,
      TYPED: TYPED,
      VIEW: VIEW
    };
  }, { "./_global": 43, "./_hide": 45, "./_uid": 124 }], 124: [function (require, module, exports) {
    var id = 0;
    var px = Math.random();
    module.exports = function (key) {
      return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
    };
  }, {}], 125: [function (require, module, exports) {
    var global = require('./_global');
    var navigator = global.navigator;

    module.exports = navigator && navigator.userAgent || '';
  }, { "./_global": 43 }], 126: [function (require, module, exports) {
    var isObject = require('./_is-object');
    module.exports = function (it, TYPE) {
      if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
      return it;
    };
  }, { "./_is-object": 54 }], 127: [function (require, module, exports) {
    var global = require('./_global');
    var core = require('./_core');
    var LIBRARY = require('./_library');
    var wksExt = require('./_wks-ext');
    var defineProperty = require('./_object-dp').f;
    module.exports = function (name) {
      var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
      if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
    };
  }, { "./_core": 26, "./_global": 43, "./_library": 62, "./_object-dp": 74, "./_wks-ext": 128 }], 128: [function (require, module, exports) {
    exports.f = require('./_wks');
  }, { "./_wks": 129 }], 129: [function (require, module, exports) {
    var store = require('./_shared')('wks');
    var uid = require('./_uid');
    var _Symbol = require('./_global').Symbol;
    var USE_SYMBOL = typeof _Symbol == 'function';

    var $exports = module.exports = function (name) {
      return store[name] || (store[name] = USE_SYMBOL && _Symbol[name] || (USE_SYMBOL ? _Symbol : uid)('Symbol.' + name));
    };

    $exports.store = store;
  }, { "./_global": 43, "./_shared": 103, "./_uid": 124 }], 130: [function (require, module, exports) {
    var classof = require('./_classof');
    var ITERATOR = require('./_wks')('iterator');
    var Iterators = require('./_iterators');
    module.exports = require('./_core').getIteratorMethod = function (it) {
      if (it != undefined) return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
    };
  }, { "./_classof": 20, "./_core": 26, "./_iterators": 61, "./_wks": 129 }], 131: [function (require, module, exports) {
    // https://github.com/benjamingr/RexExp.escape
    var $export = require('./_export');
    var $re = require('./_replacer')(/[\\^$*+?.()|[\]{}]/g, '\\$&');

    $export($export.S, 'RegExp', { escape: function escape(it) {
        return $re(it);
      } });
  }, { "./_export": 36, "./_replacer": 95 }], 132: [function (require, module, exports) {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    var $export = require('./_export');

    $export($export.P, 'Array', { copyWithin: require('./_array-copy-within') });

    require('./_add-to-unscopables')('copyWithin');
  }, { "./_add-to-unscopables": 8, "./_array-copy-within": 11, "./_export": 36 }], 133: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var $every = require('./_array-methods')(4);

    $export($export.P + $export.F * !require('./_strict-method')([].every, true), 'Array', {
      // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
      every: function every(callbackfn /* , thisArg */) {
        return $every(this, callbackfn, arguments[1]);
      }
    });
  }, { "./_array-methods": 15, "./_export": 36, "./_strict-method": 105 }], 134: [function (require, module, exports) {
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    var $export = require('./_export');

    $export($export.P, 'Array', { fill: require('./_array-fill') });

    require('./_add-to-unscopables')('fill');
  }, { "./_add-to-unscopables": 8, "./_array-fill": 12, "./_export": 36 }], 135: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var $filter = require('./_array-methods')(2);

    $export($export.P + $export.F * !require('./_strict-method')([].filter, true), 'Array', {
      // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
      filter: function filter(callbackfn /* , thisArg */) {
        return $filter(this, callbackfn, arguments[1]);
      }
    });
  }, { "./_array-methods": 15, "./_export": 36, "./_strict-method": 105 }], 136: [function (require, module, exports) {
    'use strict';
    // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)

    var $export = require('./_export');
    var $find = require('./_array-methods')(6);
    var KEY = 'findIndex';
    var forced = true;
    // Shouldn't skip holes
    if (KEY in []) Array(1)[KEY](function () {
      forced = false;
    });
    $export($export.P + $export.F * forced, 'Array', {
      findIndex: function findIndex(callbackfn /* , that = undefined */) {
        return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      }
    });
    require('./_add-to-unscopables')(KEY);
  }, { "./_add-to-unscopables": 8, "./_array-methods": 15, "./_export": 36 }], 137: [function (require, module, exports) {
    'use strict';
    // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)

    var $export = require('./_export');
    var $find = require('./_array-methods')(5);
    var KEY = 'find';
    var forced = true;
    // Shouldn't skip holes
    if (KEY in []) Array(1)[KEY](function () {
      forced = false;
    });
    $export($export.P + $export.F * forced, 'Array', {
      find: function find(callbackfn /* , that = undefined */) {
        return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      }
    });
    require('./_add-to-unscopables')(KEY);
  }, { "./_add-to-unscopables": 8, "./_array-methods": 15, "./_export": 36 }], 138: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var $forEach = require('./_array-methods')(0);
    var STRICT = require('./_strict-method')([].forEach, true);

    $export($export.P + $export.F * !STRICT, 'Array', {
      // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
      forEach: function forEach(callbackfn /* , thisArg */) {
        return $forEach(this, callbackfn, arguments[1]);
      }
    });
  }, { "./_array-methods": 15, "./_export": 36, "./_strict-method": 105 }], 139: [function (require, module, exports) {
    'use strict';

    var ctx = require('./_ctx');
    var $export = require('./_export');
    var toObject = require('./_to-object');
    var call = require('./_iter-call');
    var isArrayIter = require('./_is-array-iter');
    var toLength = require('./_to-length');
    var createProperty = require('./_create-property');
    var getIterFn = require('./core.get-iterator-method');

    $export($export.S + $export.F * !require('./_iter-detect')(function (iter) {
      Array.from(iter);
    }), 'Array', {
      // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
      from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
        var O = toObject(arrayLike);
        var C = typeof this == 'function' ? this : Array;
        var aLen = arguments.length;
        var mapfn = aLen > 1 ? arguments[1] : undefined;
        var mapping = mapfn !== undefined;
        var index = 0;
        var iterFn = getIterFn(O);
        var length, result, step, iterator;
        if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
        // if object isn't iterable or it's array with default iterator - use simple case
        if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
          for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
            createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
          }
        } else {
          length = toLength(O.length);
          for (result = new C(length); length > index; index++) {
            createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
          }
        }
        result.length = index;
        return result;
      }
    });
  }, { "./_create-property": 27, "./_ctx": 28, "./_export": 36, "./_is-array-iter": 51, "./_iter-call": 56, "./_iter-detect": 59, "./_to-length": 118, "./_to-object": 119, "./core.get-iterator-method": 130 }], 140: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var $indexOf = require('./_array-includes')(false);
    var $native = [].indexOf;
    var NEGATIVE_ZERO = !!$native && 1 / [1].indexOf(1, -0) < 0;

    $export($export.P + $export.F * (NEGATIVE_ZERO || !require('./_strict-method')($native)), 'Array', {
      // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
      indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
        return NEGATIVE_ZERO
        // convert -0 to +0
        ? $native.apply(this, arguments) || 0 : $indexOf(this, searchElement, arguments[1]);
      }
    });
  }, { "./_array-includes": 14, "./_export": 36, "./_strict-method": 105 }], 141: [function (require, module, exports) {
    // 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
    var $export = require('./_export');

    $export($export.S, 'Array', { isArray: require('./_is-array') });
  }, { "./_export": 36, "./_is-array": 52 }], 142: [function (require, module, exports) {
    'use strict';

    var addToUnscopables = require('./_add-to-unscopables');
    var step = require('./_iter-step');
    var Iterators = require('./_iterators');
    var toIObject = require('./_to-iobject');

    // 22.1.3.4 Array.prototype.entries()
    // 22.1.3.13 Array.prototype.keys()
    // 22.1.3.29 Array.prototype.values()
    // 22.1.3.30 Array.prototype[@@iterator]()
    module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
      this._t = toIObject(iterated); // target
      this._i = 0; // next index
      this._k = kind; // kind
      // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
    }, function () {
      var O = this._t;
      var kind = this._k;
      var index = this._i++;
      if (!O || index >= O.length) {
        this._t = undefined;
        return step(1);
      }
      if (kind == 'keys') return step(0, index);
      if (kind == 'values') return step(0, O[index]);
      return step(0, [index, O[index]]);
    }, 'values');

    // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
    Iterators.Arguments = Iterators.Array;

    addToUnscopables('keys');
    addToUnscopables('values');
    addToUnscopables('entries');
  }, { "./_add-to-unscopables": 8, "./_iter-define": 58, "./_iter-step": 60, "./_iterators": 61, "./_to-iobject": 117 }], 143: [function (require, module, exports) {
    'use strict';
    // 22.1.3.13 Array.prototype.join(separator)

    var $export = require('./_export');
    var toIObject = require('./_to-iobject');
    var arrayJoin = [].join;

    // fallback for not array-like strings
    $export($export.P + $export.F * (require('./_iobject') != Object || !require('./_strict-method')(arrayJoin)), 'Array', {
      join: function join(separator) {
        return arrayJoin.call(toIObject(this), separator === undefined ? ',' : separator);
      }
    });
  }, { "./_export": 36, "./_iobject": 50, "./_strict-method": 105, "./_to-iobject": 117 }], 144: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var toIObject = require('./_to-iobject');
    var toInteger = require('./_to-integer');
    var toLength = require('./_to-length');
    var $native = [].lastIndexOf;
    var NEGATIVE_ZERO = !!$native && 1 / [1].lastIndexOf(1, -0) < 0;

    $export($export.P + $export.F * (NEGATIVE_ZERO || !require('./_strict-method')($native)), 'Array', {
      // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
      lastIndexOf: function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
        // convert -0 to +0
        if (NEGATIVE_ZERO) return $native.apply(this, arguments) || 0;
        var O = toIObject(this);
        var length = toLength(O.length);
        var index = length - 1;
        if (arguments.length > 1) index = Math.min(index, toInteger(arguments[1]));
        if (index < 0) index = length + index;
        for (; index >= 0; index--) {
          if (index in O) if (O[index] === searchElement) return index || 0;
        }return -1;
      }
    });
  }, { "./_export": 36, "./_strict-method": 105, "./_to-integer": 116, "./_to-iobject": 117, "./_to-length": 118 }], 145: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var $map = require('./_array-methods')(1);

    $export($export.P + $export.F * !require('./_strict-method')([].map, true), 'Array', {
      // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
      map: function map(callbackfn /* , thisArg */) {
        return $map(this, callbackfn, arguments[1]);
      }
    });
  }, { "./_array-methods": 15, "./_export": 36, "./_strict-method": 105 }], 146: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var createProperty = require('./_create-property');

    // WebKit Array.of isn't generic
    $export($export.S + $export.F * require('./_fails')(function () {
      function F() {/* empty */}
      return !(Array.of.call(F) instanceof F);
    }), 'Array', {
      // 22.1.2.3 Array.of( ...items)
      of: function of() /* ...args */{
        var index = 0;
        var aLen = arguments.length;
        var result = new (typeof this == 'function' ? this : Array)(aLen);
        while (aLen > index) {
          createProperty(result, index, arguments[index++]);
        }result.length = aLen;
        return result;
      }
    });
  }, { "./_create-property": 27, "./_export": 36, "./_fails": 38 }], 147: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var $reduce = require('./_array-reduce');

    $export($export.P + $export.F * !require('./_strict-method')([].reduceRight, true), 'Array', {
      // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
      reduceRight: function reduceRight(callbackfn /* , initialValue */) {
        return $reduce(this, callbackfn, arguments.length, arguments[1], true);
      }
    });
  }, { "./_array-reduce": 16, "./_export": 36, "./_strict-method": 105 }], 148: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var $reduce = require('./_array-reduce');

    $export($export.P + $export.F * !require('./_strict-method')([].reduce, true), 'Array', {
      // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
      reduce: function reduce(callbackfn /* , initialValue */) {
        return $reduce(this, callbackfn, arguments.length, arguments[1], false);
      }
    });
  }, { "./_array-reduce": 16, "./_export": 36, "./_strict-method": 105 }], 149: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var html = require('./_html');
    var cof = require('./_cof');
    var toAbsoluteIndex = require('./_to-absolute-index');
    var toLength = require('./_to-length');
    var arraySlice = [].slice;

    // fallback for not array-like ES3 strings and DOM objects
    $export($export.P + $export.F * require('./_fails')(function () {
      if (html) arraySlice.call(html);
    }), 'Array', {
      slice: function slice(begin, end) {
        var len = toLength(this.length);
        var klass = cof(this);
        end = end === undefined ? len : end;
        if (klass == 'Array') return arraySlice.call(this, begin, end);
        var start = toAbsoluteIndex(begin, len);
        var upTo = toAbsoluteIndex(end, len);
        var size = toLength(upTo - start);
        var cloned = new Array(size);
        var i = 0;
        for (; i < size; i++) {
          cloned[i] = klass == 'String' ? this.charAt(start + i) : this[start + i];
        }return cloned;
      }
    });
  }, { "./_cof": 21, "./_export": 36, "./_fails": 38, "./_html": 46, "./_to-absolute-index": 114, "./_to-length": 118 }], 150: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var $some = require('./_array-methods')(3);

    $export($export.P + $export.F * !require('./_strict-method')([].some, true), 'Array', {
      // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
      some: function some(callbackfn /* , thisArg */) {
        return $some(this, callbackfn, arguments[1]);
      }
    });
  }, { "./_array-methods": 15, "./_export": 36, "./_strict-method": 105 }], 151: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var aFunction = require('./_a-function');
    var toObject = require('./_to-object');
    var fails = require('./_fails');
    var $sort = [].sort;
    var test = [1, 2, 3];

    $export($export.P + $export.F * (fails(function () {
      // IE8-
      test.sort(undefined);
    }) || !fails(function () {
      // V8 bug
      test.sort(null);
      // Old WebKit
    }) || !require('./_strict-method')($sort)), 'Array', {
      // 22.1.3.25 Array.prototype.sort(comparefn)
      sort: function sort(comparefn) {
        return comparefn === undefined ? $sort.call(toObject(this)) : $sort.call(toObject(this), aFunction(comparefn));
      }
    });
  }, { "./_a-function": 6, "./_export": 36, "./_fails": 38, "./_strict-method": 105, "./_to-object": 119 }], 152: [function (require, module, exports) {
    require('./_set-species')('Array');
  }, { "./_set-species": 100 }], 153: [function (require, module, exports) {
    // 20.3.3.1 / 15.9.4.4 Date.now()
    var $export = require('./_export');

    $export($export.S, 'Date', { now: function now() {
        return new Date().getTime();
      } });
  }, { "./_export": 36 }], 154: [function (require, module, exports) {
    // 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
    var $export = require('./_export');
    var toISOString = require('./_date-to-iso-string');

    // PhantomJS / old WebKit has a broken implementations
    $export($export.P + $export.F * (Date.prototype.toISOString !== toISOString), 'Date', {
      toISOString: toISOString
    });
  }, { "./_date-to-iso-string": 29, "./_export": 36 }], 155: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var toObject = require('./_to-object');
    var toPrimitive = require('./_to-primitive');

    $export($export.P + $export.F * require('./_fails')(function () {
      return new Date(NaN).toJSON() !== null || Date.prototype.toJSON.call({ toISOString: function toISOString() {
          return 1;
        } }) !== 1;
    }), 'Date', {
      // eslint-disable-next-line no-unused-vars
      toJSON: function toJSON(key) {
        var O = toObject(this);
        var pv = toPrimitive(O);
        return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
      }
    });
  }, { "./_export": 36, "./_fails": 38, "./_to-object": 119, "./_to-primitive": 120 }], 156: [function (require, module, exports) {
    var TO_PRIMITIVE = require('./_wks')('toPrimitive');
    var proto = Date.prototype;

    if (!(TO_PRIMITIVE in proto)) require('./_hide')(proto, TO_PRIMITIVE, require('./_date-to-primitive'));
  }, { "./_date-to-primitive": 30, "./_hide": 45, "./_wks": 129 }], 157: [function (require, module, exports) {
    var DateProto = Date.prototype;
    var INVALID_DATE = 'Invalid Date';
    var TO_STRING = 'toString';
    var $toString = DateProto[TO_STRING];
    var getTime = DateProto.getTime;
    if (new Date(NaN) + '' != INVALID_DATE) {
      require('./_redefine')(DateProto, TO_STRING, function toString() {
        var value = getTime.call(this);
        // eslint-disable-next-line no-self-compare
        return value === value ? $toString.call(this) : INVALID_DATE;
      });
    }
  }, { "./_redefine": 94 }], 158: [function (require, module, exports) {
    // 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
    var $export = require('./_export');

    $export($export.P, 'Function', { bind: require('./_bind') });
  }, { "./_bind": 19, "./_export": 36 }], 159: [function (require, module, exports) {
    'use strict';

    var isObject = require('./_is-object');
    var getPrototypeOf = require('./_object-gpo');
    var HAS_INSTANCE = require('./_wks')('hasInstance');
    var FunctionProto = Function.prototype;
    // 19.2.3.6 Function.prototype[@@hasInstance](V)
    if (!(HAS_INSTANCE in FunctionProto)) require('./_object-dp').f(FunctionProto, HAS_INSTANCE, { value: function value(O) {
        if (typeof this != 'function' || !isObject(O)) return false;
        if (!isObject(this.prototype)) return O instanceof this;
        // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
        while (O = getPrototypeOf(O)) {
          if (this.prototype === O) return true;
        }return false;
      } });
  }, { "./_is-object": 54, "./_object-dp": 74, "./_object-gpo": 81, "./_wks": 129 }], 160: [function (require, module, exports) {
    var dP = require('./_object-dp').f;
    var FProto = Function.prototype;
    var nameRE = /^\s*function ([^ (]*)/;
    var NAME = 'name';

    // 19.2.4.2 name
    NAME in FProto || require('./_descriptors') && dP(FProto, NAME, {
      configurable: true,
      get: function get() {
        try {
          return ('' + this).match(nameRE)[1];
        } catch (e) {
          return '';
        }
      }
    });
  }, { "./_descriptors": 32, "./_object-dp": 74 }], 161: [function (require, module, exports) {
    'use strict';

    var strong = require('./_collection-strong');
    var validate = require('./_validate-collection');
    var MAP = 'Map';

    // 23.1 Map Objects
    module.exports = require('./_collection')(MAP, function (get) {
      return function Map() {
        return get(this, arguments.length > 0 ? arguments[0] : undefined);
      };
    }, {
      // 23.1.3.6 Map.prototype.get(key)
      get: function get(key) {
        var entry = strong.getEntry(validate(this, MAP), key);
        return entry && entry.v;
      },
      // 23.1.3.9 Map.prototype.set(key, value)
      set: function set(key, value) {
        return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
      }
    }, strong, true);
  }, { "./_collection": 25, "./_collection-strong": 22, "./_validate-collection": 126 }], 162: [function (require, module, exports) {
    // 20.2.2.3 Math.acosh(x)
    var $export = require('./_export');
    var log1p = require('./_math-log1p');
    var sqrt = Math.sqrt;
    var $acosh = Math.acosh;

    $export($export.S + $export.F * !($acosh
    // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
    && Math.floor($acosh(Number.MAX_VALUE)) == 710
    // Tor Browser bug: Math.acosh(Infinity) -> NaN
    && $acosh(Infinity) == Infinity), 'Math', {
      acosh: function acosh(x) {
        return (x = +x) < 1 ? NaN : x > 94906265.62425156 ? Math.log(x) + Math.LN2 : log1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
      }
    });
  }, { "./_export": 36, "./_math-log1p": 65 }], 163: [function (require, module, exports) {
    // 20.2.2.5 Math.asinh(x)
    var $export = require('./_export');
    var $asinh = Math.asinh;

    function asinh(x) {
      return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
    }

    // Tor Browser bug: Math.asinh(0) -> -0
    $export($export.S + $export.F * !($asinh && 1 / $asinh(0) > 0), 'Math', { asinh: asinh });
  }, { "./_export": 36 }], 164: [function (require, module, exports) {
    // 20.2.2.7 Math.atanh(x)
    var $export = require('./_export');
    var $atanh = Math.atanh;

    // Tor Browser bug: Math.atanh(-0) -> 0
    $export($export.S + $export.F * !($atanh && 1 / $atanh(-0) < 0), 'Math', {
      atanh: function atanh(x) {
        return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
      }
    });
  }, { "./_export": 36 }], 165: [function (require, module, exports) {
    // 20.2.2.9 Math.cbrt(x)
    var $export = require('./_export');
    var sign = require('./_math-sign');

    $export($export.S, 'Math', {
      cbrt: function cbrt(x) {
        return sign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
      }
    });
  }, { "./_export": 36, "./_math-sign": 67 }], 166: [function (require, module, exports) {
    // 20.2.2.11 Math.clz32(x)
    var $export = require('./_export');

    $export($export.S, 'Math', {
      clz32: function clz32(x) {
        return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
      }
    });
  }, { "./_export": 36 }], 167: [function (require, module, exports) {
    // 20.2.2.12 Math.cosh(x)
    var $export = require('./_export');
    var exp = Math.exp;

    $export($export.S, 'Math', {
      cosh: function cosh(x) {
        return (exp(x = +x) + exp(-x)) / 2;
      }
    });
  }, { "./_export": 36 }], 168: [function (require, module, exports) {
    // 20.2.2.14 Math.expm1(x)
    var $export = require('./_export');
    var $expm1 = require('./_math-expm1');

    $export($export.S + $export.F * ($expm1 != Math.expm1), 'Math', { expm1: $expm1 });
  }, { "./_export": 36, "./_math-expm1": 63 }], 169: [function (require, module, exports) {
    // 20.2.2.16 Math.fround(x)
    var $export = require('./_export');

    $export($export.S, 'Math', { fround: require('./_math-fround') });
  }, { "./_export": 36, "./_math-fround": 64 }], 170: [function (require, module, exports) {
    // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
    var $export = require('./_export');
    var abs = Math.abs;

    $export($export.S, 'Math', {
      hypot: function hypot(value1, value2) {
        // eslint-disable-line no-unused-vars
        var sum = 0;
        var i = 0;
        var aLen = arguments.length;
        var larg = 0;
        var arg, div;
        while (i < aLen) {
          arg = abs(arguments[i++]);
          if (larg < arg) {
            div = larg / arg;
            sum = sum * div * div + 1;
            larg = arg;
          } else if (arg > 0) {
            div = arg / larg;
            sum += div * div;
          } else sum += arg;
        }
        return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
      }
    });
  }, { "./_export": 36 }], 171: [function (require, module, exports) {
    // 20.2.2.18 Math.imul(x, y)
    var $export = require('./_export');
    var $imul = Math.imul;

    // some WebKit versions fails with big numbers, some has wrong arity
    $export($export.S + $export.F * require('./_fails')(function () {
      return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
    }), 'Math', {
      imul: function imul(x, y) {
        var UINT16 = 0xffff;
        var xn = +x;
        var yn = +y;
        var xl = UINT16 & xn;
        var yl = UINT16 & yn;
        return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
      }
    });
  }, { "./_export": 36, "./_fails": 38 }], 172: [function (require, module, exports) {
    // 20.2.2.21 Math.log10(x)
    var $export = require('./_export');

    $export($export.S, 'Math', {
      log10: function log10(x) {
        return Math.log(x) * Math.LOG10E;
      }
    });
  }, { "./_export": 36 }], 173: [function (require, module, exports) {
    // 20.2.2.20 Math.log1p(x)
    var $export = require('./_export');

    $export($export.S, 'Math', { log1p: require('./_math-log1p') });
  }, { "./_export": 36, "./_math-log1p": 65 }], 174: [function (require, module, exports) {
    // 20.2.2.22 Math.log2(x)
    var $export = require('./_export');

    $export($export.S, 'Math', {
      log2: function log2(x) {
        return Math.log(x) / Math.LN2;
      }
    });
  }, { "./_export": 36 }], 175: [function (require, module, exports) {
    // 20.2.2.28 Math.sign(x)
    var $export = require('./_export');

    $export($export.S, 'Math', { sign: require('./_math-sign') });
  }, { "./_export": 36, "./_math-sign": 67 }], 176: [function (require, module, exports) {
    // 20.2.2.30 Math.sinh(x)
    var $export = require('./_export');
    var expm1 = require('./_math-expm1');
    var exp = Math.exp;

    // V8 near Chromium 38 has a problem with very small numbers
    $export($export.S + $export.F * require('./_fails')(function () {
      return !Math.sinh(-2e-17) != -2e-17;
    }), 'Math', {
      sinh: function sinh(x) {
        return Math.abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (Math.E / 2);
      }
    });
  }, { "./_export": 36, "./_fails": 38, "./_math-expm1": 63 }], 177: [function (require, module, exports) {
    // 20.2.2.33 Math.tanh(x)
    var $export = require('./_export');
    var expm1 = require('./_math-expm1');
    var exp = Math.exp;

    $export($export.S, 'Math', {
      tanh: function tanh(x) {
        var a = expm1(x = +x);
        var b = expm1(-x);
        return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
      }
    });
  }, { "./_export": 36, "./_math-expm1": 63 }], 178: [function (require, module, exports) {
    // 20.2.2.34 Math.trunc(x)
    var $export = require('./_export');

    $export($export.S, 'Math', {
      trunc: function trunc(it) {
        return (it > 0 ? Math.floor : Math.ceil)(it);
      }
    });
  }, { "./_export": 36 }], 179: [function (require, module, exports) {
    'use strict';

    var global = require('./_global');
    var has = require('./_has');
    var cof = require('./_cof');
    var inheritIfRequired = require('./_inherit-if-required');
    var toPrimitive = require('./_to-primitive');
    var fails = require('./_fails');
    var gOPN = require('./_object-gopn').f;
    var gOPD = require('./_object-gopd').f;
    var dP = require('./_object-dp').f;
    var $trim = require('./_string-trim').trim;
    var NUMBER = 'Number';
    var $Number = global[NUMBER];
    var Base = $Number;
    var proto = $Number.prototype;
    // Opera ~12 has broken Object#toString
    var BROKEN_COF = cof(require('./_object-create')(proto)) == NUMBER;
    var TRIM = 'trim' in String.prototype;

    // 7.1.3 ToNumber(argument)
    var toNumber = function toNumber(argument) {
      var it = toPrimitive(argument, false);
      if (typeof it == 'string' && it.length > 2) {
        it = TRIM ? it.trim() : $trim(it, 3);
        var first = it.charCodeAt(0);
        var third, radix, maxCode;
        if (first === 43 || first === 45) {
          third = it.charCodeAt(2);
          if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
        } else if (first === 48) {
          switch (it.charCodeAt(1)) {
            case 66:case 98:
              radix = 2;maxCode = 49;break; // fast equal /^0b[01]+$/i
            case 79:case 111:
              radix = 8;maxCode = 55;break; // fast equal /^0o[0-7]+$/i
            default:
              return +it;
          }
          for (var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++) {
            code = digits.charCodeAt(i);
            // parseInt parses a string to a first unavailable symbol
            // but ToNumber should return NaN if a string contains unavailable symbols
            if (code < 48 || code > maxCode) return NaN;
          }return parseInt(digits, radix);
        }
      }return +it;
    };

    if (!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')) {
      $Number = function Number(value) {
        var it = arguments.length < 1 ? 0 : value;
        var that = this;
        return that instanceof $Number
        // check on 1..constructor(foo) case
        && (BROKEN_COF ? fails(function () {
          proto.valueOf.call(that);
        }) : cof(that) != NUMBER) ? inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
      };
      for (var keys = require('./_descriptors') ? gOPN(Base) : (
      // ES3:
      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
      // ES6 (in case, if modules with ES6 Number statics required before):
      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' + 'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger').split(','), j = 0, key; keys.length > j; j++) {
        if (has(Base, key = keys[j]) && !has($Number, key)) {
          dP($Number, key, gOPD(Base, key));
        }
      }
      $Number.prototype = proto;
      proto.constructor = $Number;
      require('./_redefine')(global, NUMBER, $Number);
    }
  }, { "./_cof": 21, "./_descriptors": 32, "./_fails": 38, "./_global": 43, "./_has": 44, "./_inherit-if-required": 48, "./_object-create": 73, "./_object-dp": 74, "./_object-gopd": 77, "./_object-gopn": 79, "./_redefine": 94, "./_string-trim": 111, "./_to-primitive": 120 }], 180: [function (require, module, exports) {
    // 20.1.2.1 Number.EPSILON
    var $export = require('./_export');

    $export($export.S, 'Number', { EPSILON: Math.pow(2, -52) });
  }, { "./_export": 36 }], 181: [function (require, module, exports) {
    // 20.1.2.2 Number.isFinite(number)
    var $export = require('./_export');
    var _isFinite = require('./_global').isFinite;

    $export($export.S, 'Number', {
      isFinite: function isFinite(it) {
        return typeof it == 'number' && _isFinite(it);
      }
    });
  }, { "./_export": 36, "./_global": 43 }], 182: [function (require, module, exports) {
    // 20.1.2.3 Number.isInteger(number)
    var $export = require('./_export');

    $export($export.S, 'Number', { isInteger: require('./_is-integer') });
  }, { "./_export": 36, "./_is-integer": 53 }], 183: [function (require, module, exports) {
    // 20.1.2.4 Number.isNaN(number)
    var $export = require('./_export');

    $export($export.S, 'Number', {
      isNaN: function isNaN(number) {
        // eslint-disable-next-line no-self-compare
        return number != number;
      }
    });
  }, { "./_export": 36 }], 184: [function (require, module, exports) {
    // 20.1.2.5 Number.isSafeInteger(number)
    var $export = require('./_export');
    var isInteger = require('./_is-integer');
    var abs = Math.abs;

    $export($export.S, 'Number', {
      isSafeInteger: function isSafeInteger(number) {
        return isInteger(number) && abs(number) <= 0x1fffffffffffff;
      }
    });
  }, { "./_export": 36, "./_is-integer": 53 }], 185: [function (require, module, exports) {
    // 20.1.2.6 Number.MAX_SAFE_INTEGER
    var $export = require('./_export');

    $export($export.S, 'Number', { MAX_SAFE_INTEGER: 0x1fffffffffffff });
  }, { "./_export": 36 }], 186: [function (require, module, exports) {
    // 20.1.2.10 Number.MIN_SAFE_INTEGER
    var $export = require('./_export');

    $export($export.S, 'Number', { MIN_SAFE_INTEGER: -0x1fffffffffffff });
  }, { "./_export": 36 }], 187: [function (require, module, exports) {
    var $export = require('./_export');
    var $parseFloat = require('./_parse-float');
    // 20.1.2.12 Number.parseFloat(string)
    $export($export.S + $export.F * (Number.parseFloat != $parseFloat), 'Number', { parseFloat: $parseFloat });
  }, { "./_export": 36, "./_parse-float": 88 }], 188: [function (require, module, exports) {
    var $export = require('./_export');
    var $parseInt = require('./_parse-int');
    // 20.1.2.13 Number.parseInt(string, radix)
    $export($export.S + $export.F * (Number.parseInt != $parseInt), 'Number', { parseInt: $parseInt });
  }, { "./_export": 36, "./_parse-int": 89 }], 189: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var toInteger = require('./_to-integer');
    var aNumberValue = require('./_a-number-value');
    var repeat = require('./_string-repeat');
    var $toFixed = 1.0.toFixed;
    var floor = Math.floor;
    var data = [0, 0, 0, 0, 0, 0];
    var ERROR = 'Number.toFixed: incorrect invocation!';
    var ZERO = '0';

    var multiply = function multiply(n, c) {
      var i = -1;
      var c2 = c;
      while (++i < 6) {
        c2 += n * data[i];
        data[i] = c2 % 1e7;
        c2 = floor(c2 / 1e7);
      }
    };
    var divide = function divide(n) {
      var i = 6;
      var c = 0;
      while (--i >= 0) {
        c += data[i];
        data[i] = floor(c / n);
        c = c % n * 1e7;
      }
    };
    var numToString = function numToString() {
      var i = 6;
      var s = '';
      while (--i >= 0) {
        if (s !== '' || i === 0 || data[i] !== 0) {
          var t = String(data[i]);
          s = s === '' ? t : s + repeat.call(ZERO, 7 - t.length) + t;
        }
      }return s;
    };
    var pow = function pow(x, n, acc) {
      return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
    };
    var log = function log(x) {
      var n = 0;
      var x2 = x;
      while (x2 >= 4096) {
        n += 12;
        x2 /= 4096;
      }
      while (x2 >= 2) {
        n += 1;
        x2 /= 2;
      }return n;
    };

    $export($export.P + $export.F * (!!$toFixed && (0.00008.toFixed(3) !== '0.000' || 0.9.toFixed(0) !== '1' || 1.255.toFixed(2) !== '1.25' || 1000000000000000128.0.toFixed(0) !== '1000000000000000128') || !require('./_fails')(function () {
      // V8 ~ Android 4.3-
      $toFixed.call({});
    })), 'Number', {
      toFixed: function toFixed(fractionDigits) {
        var x = aNumberValue(this, ERROR);
        var f = toInteger(fractionDigits);
        var s = '';
        var m = ZERO;
        var e, z, j, k;
        if (f < 0 || f > 20) throw RangeError(ERROR);
        // eslint-disable-next-line no-self-compare
        if (x != x) return 'NaN';
        if (x <= -1e21 || x >= 1e21) return String(x);
        if (x < 0) {
          s = '-';
          x = -x;
        }
        if (x > 1e-21) {
          e = log(x * pow(2, 69, 1)) - 69;
          z = e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1);
          z *= 0x10000000000000;
          e = 52 - e;
          if (e > 0) {
            multiply(0, z);
            j = f;
            while (j >= 7) {
              multiply(1e7, 0);
              j -= 7;
            }
            multiply(pow(10, j, 1), 0);
            j = e - 1;
            while (j >= 23) {
              divide(1 << 23);
              j -= 23;
            }
            divide(1 << j);
            multiply(1, 1);
            divide(2);
            m = numToString();
          } else {
            multiply(0, z);
            multiply(1 << -e, 0);
            m = numToString() + repeat.call(ZERO, f);
          }
        }
        if (f > 0) {
          k = m.length;
          m = s + (k <= f ? '0.' + repeat.call(ZERO, f - k) + m : m.slice(0, k - f) + '.' + m.slice(k - f));
        } else {
          m = s + m;
        }return m;
      }
    });
  }, { "./_a-number-value": 7, "./_export": 36, "./_fails": 38, "./_string-repeat": 110, "./_to-integer": 116 }], 190: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var $fails = require('./_fails');
    var aNumberValue = require('./_a-number-value');
    var $toPrecision = 1.0.toPrecision;

    $export($export.P + $export.F * ($fails(function () {
      // IE7-
      return $toPrecision.call(1, undefined) !== '1';
    }) || !$fails(function () {
      // V8 ~ Android 4.3-
      $toPrecision.call({});
    })), 'Number', {
      toPrecision: function toPrecision(precision) {
        var that = aNumberValue(this, 'Number#toPrecision: incorrect invocation!');
        return precision === undefined ? $toPrecision.call(that) : $toPrecision.call(that, precision);
      }
    });
  }, { "./_a-number-value": 7, "./_export": 36, "./_fails": 38 }], 191: [function (require, module, exports) {
    // 19.1.3.1 Object.assign(target, source)
    var $export = require('./_export');

    $export($export.S + $export.F, 'Object', { assign: require('./_object-assign') });
  }, { "./_export": 36, "./_object-assign": 72 }], 192: [function (require, module, exports) {
    var $export = require('./_export');
    // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
    $export($export.S, 'Object', { create: require('./_object-create') });
  }, { "./_export": 36, "./_object-create": 73 }], 193: [function (require, module, exports) {
    var $export = require('./_export');
    // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
    $export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperties: require('./_object-dps') });
  }, { "./_descriptors": 32, "./_export": 36, "./_object-dps": 75 }], 194: [function (require, module, exports) {
    var $export = require('./_export');
    // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
    $export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });
  }, { "./_descriptors": 32, "./_export": 36, "./_object-dp": 74 }], 195: [function (require, module, exports) {
    // 19.1.2.5 Object.freeze(O)
    var isObject = require('./_is-object');
    var meta = require('./_meta').onFreeze;

    require('./_object-sap')('freeze', function ($freeze) {
      return function freeze(it) {
        return $freeze && isObject(it) ? $freeze(meta(it)) : it;
      };
    });
  }, { "./_is-object": 54, "./_meta": 68, "./_object-sap": 85 }], 196: [function (require, module, exports) {
    // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
    var toIObject = require('./_to-iobject');
    var $getOwnPropertyDescriptor = require('./_object-gopd').f;

    require('./_object-sap')('getOwnPropertyDescriptor', function () {
      return function getOwnPropertyDescriptor(it, key) {
        return $getOwnPropertyDescriptor(toIObject(it), key);
      };
    });
  }, { "./_object-gopd": 77, "./_object-sap": 85, "./_to-iobject": 117 }], 197: [function (require, module, exports) {
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    require('./_object-sap')('getOwnPropertyNames', function () {
      return require('./_object-gopn-ext').f;
    });
  }, { "./_object-gopn-ext": 78, "./_object-sap": 85 }], 198: [function (require, module, exports) {
    // 19.1.2.9 Object.getPrototypeOf(O)
    var toObject = require('./_to-object');
    var $getPrototypeOf = require('./_object-gpo');

    require('./_object-sap')('getPrototypeOf', function () {
      return function getPrototypeOf(it) {
        return $getPrototypeOf(toObject(it));
      };
    });
  }, { "./_object-gpo": 81, "./_object-sap": 85, "./_to-object": 119 }], 199: [function (require, module, exports) {
    // 19.1.2.11 Object.isExtensible(O)
    var isObject = require('./_is-object');

    require('./_object-sap')('isExtensible', function ($isExtensible) {
      return function isExtensible(it) {
        return isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
      };
    });
  }, { "./_is-object": 54, "./_object-sap": 85 }], 200: [function (require, module, exports) {
    // 19.1.2.12 Object.isFrozen(O)
    var isObject = require('./_is-object');

    require('./_object-sap')('isFrozen', function ($isFrozen) {
      return function isFrozen(it) {
        return isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
      };
    });
  }, { "./_is-object": 54, "./_object-sap": 85 }], 201: [function (require, module, exports) {
    // 19.1.2.13 Object.isSealed(O)
    var isObject = require('./_is-object');

    require('./_object-sap')('isSealed', function ($isSealed) {
      return function isSealed(it) {
        return isObject(it) ? $isSealed ? $isSealed(it) : false : true;
      };
    });
  }, { "./_is-object": 54, "./_object-sap": 85 }], 202: [function (require, module, exports) {
    // 19.1.3.10 Object.is(value1, value2)
    var $export = require('./_export');
    $export($export.S, 'Object', { is: require('./_same-value') });
  }, { "./_export": 36, "./_same-value": 96 }], 203: [function (require, module, exports) {
    // 19.1.2.14 Object.keys(O)
    var toObject = require('./_to-object');
    var $keys = require('./_object-keys');

    require('./_object-sap')('keys', function () {
      return function keys(it) {
        return $keys(toObject(it));
      };
    });
  }, { "./_object-keys": 83, "./_object-sap": 85, "./_to-object": 119 }], 204: [function (require, module, exports) {
    // 19.1.2.15 Object.preventExtensions(O)
    var isObject = require('./_is-object');
    var meta = require('./_meta').onFreeze;

    require('./_object-sap')('preventExtensions', function ($preventExtensions) {
      return function preventExtensions(it) {
        return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
      };
    });
  }, { "./_is-object": 54, "./_meta": 68, "./_object-sap": 85 }], 205: [function (require, module, exports) {
    // 19.1.2.17 Object.seal(O)
    var isObject = require('./_is-object');
    var meta = require('./_meta').onFreeze;

    require('./_object-sap')('seal', function ($seal) {
      return function seal(it) {
        return $seal && isObject(it) ? $seal(meta(it)) : it;
      };
    });
  }, { "./_is-object": 54, "./_meta": 68, "./_object-sap": 85 }], 206: [function (require, module, exports) {
    // 19.1.3.19 Object.setPrototypeOf(O, proto)
    var $export = require('./_export');
    $export($export.S, 'Object', { setPrototypeOf: require('./_set-proto').set });
  }, { "./_export": 36, "./_set-proto": 99 }], 207: [function (require, module, exports) {
    'use strict';
    // 19.1.3.6 Object.prototype.toString()

    var classof = require('./_classof');
    var test = {};
    test[require('./_wks')('toStringTag')] = 'z';
    if (test + '' != '[object z]') {
      require('./_redefine')(Object.prototype, 'toString', function toString() {
        return '[object ' + classof(this) + ']';
      }, true);
    }
  }, { "./_classof": 20, "./_redefine": 94, "./_wks": 129 }], 208: [function (require, module, exports) {
    var $export = require('./_export');
    var $parseFloat = require('./_parse-float');
    // 18.2.4 parseFloat(string)
    $export($export.G + $export.F * (parseFloat != $parseFloat), { parseFloat: $parseFloat });
  }, { "./_export": 36, "./_parse-float": 88 }], 209: [function (require, module, exports) {
    var $export = require('./_export');
    var $parseInt = require('./_parse-int');
    // 18.2.5 parseInt(string, radix)
    $export($export.G + $export.F * (parseInt != $parseInt), { parseInt: $parseInt });
  }, { "./_export": 36, "./_parse-int": 89 }], 210: [function (require, module, exports) {
    'use strict';

    var LIBRARY = require('./_library');
    var global = require('./_global');
    var ctx = require('./_ctx');
    var classof = require('./_classof');
    var $export = require('./_export');
    var isObject = require('./_is-object');
    var aFunction = require('./_a-function');
    var anInstance = require('./_an-instance');
    var forOf = require('./_for-of');
    var speciesConstructor = require('./_species-constructor');
    var task = require('./_task').set;
    var microtask = require('./_microtask')();
    var newPromiseCapabilityModule = require('./_new-promise-capability');
    var perform = require('./_perform');
    var userAgent = require('./_user-agent');
    var promiseResolve = require('./_promise-resolve');
    var PROMISE = 'Promise';
    var TypeError = global.TypeError;
    var process = global.process;
    var versions = process && process.versions;
    var v8 = versions && versions.v8 || '';
    var $Promise = global[PROMISE];
    var isNode = classof(process) == 'process';
    var empty = function empty() {/* empty */};
    var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
    var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

    var USE_NATIVE = !!function () {
      try {
        // correct subclassing with @@species support
        var promise = $Promise.resolve(1);
        var FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function (exec) {
          exec(empty, empty);
        };
        // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
        return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise
        // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
        // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
        // we can't detect it synchronously, so just check versions
        && v8.indexOf('6.6') !== 0 && userAgent.indexOf('Chrome/66') === -1;
      } catch (e) {/* empty */}
    }();

    // helpers
    var isThenable = function isThenable(it) {
      var then;
      return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
    };
    var notify = function notify(promise, isReject) {
      if (promise._n) return;
      promise._n = true;
      var chain = promise._c;
      microtask(function () {
        var value = promise._v;
        var ok = promise._s == 1;
        var i = 0;
        var run = function run(reaction) {
          var handler = ok ? reaction.ok : reaction.fail;
          var resolve = reaction.resolve;
          var reject = reaction.reject;
          var domain = reaction.domain;
          var result, then, exited;
          try {
            if (handler) {
              if (!ok) {
                if (promise._h == 2) onHandleUnhandled(promise);
                promise._h = 1;
              }
              if (handler === true) result = value;else {
                if (domain) domain.enter();
                result = handler(value); // may throw
                if (domain) {
                  domain.exit();
                  exited = true;
                }
              }
              if (result === reaction.promise) {
                reject(TypeError('Promise-chain cycle'));
              } else if (then = isThenable(result)) {
                then.call(result, resolve, reject);
              } else resolve(result);
            } else reject(value);
          } catch (e) {
            if (domain && !exited) domain.exit();
            reject(e);
          }
        };
        while (chain.length > i) {
          run(chain[i++]);
        } // variable length - can't use forEach
        promise._c = [];
        promise._n = false;
        if (isReject && !promise._h) onUnhandled(promise);
      });
    };
    var onUnhandled = function onUnhandled(promise) {
      task.call(global, function () {
        var value = promise._v;
        var unhandled = isUnhandled(promise);
        var result, handler, console;
        if (unhandled) {
          result = perform(function () {
            if (isNode) {
              process.emit('unhandledRejection', value, promise);
            } else if (handler = global.onunhandledrejection) {
              handler({ promise: promise, reason: value });
            } else if ((console = global.console) && console.error) {
              console.error('Unhandled promise rejection', value);
            }
          });
          // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
          promise._h = isNode || isUnhandled(promise) ? 2 : 1;
        }promise._a = undefined;
        if (unhandled && result.e) throw result.v;
      });
    };
    var isUnhandled = function isUnhandled(promise) {
      return promise._h !== 1 && (promise._a || promise._c).length === 0;
    };
    var onHandleUnhandled = function onHandleUnhandled(promise) {
      task.call(global, function () {
        var handler;
        if (isNode) {
          process.emit('rejectionHandled', promise);
        } else if (handler = global.onrejectionhandled) {
          handler({ promise: promise, reason: promise._v });
        }
      });
    };
    var $reject = function $reject(value) {
      var promise = this;
      if (promise._d) return;
      promise._d = true;
      promise = promise._w || promise; // unwrap
      promise._v = value;
      promise._s = 2;
      if (!promise._a) promise._a = promise._c.slice();
      notify(promise, true);
    };
    var $resolve = function $resolve(value) {
      var promise = this;
      var then;
      if (promise._d) return;
      promise._d = true;
      promise = promise._w || promise; // unwrap
      try {
        if (promise === value) throw TypeError("Promise can't be resolved itself");
        if (then = isThenable(value)) {
          microtask(function () {
            var wrapper = { _w: promise, _d: false }; // wrap
            try {
              then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
            } catch (e) {
              $reject.call(wrapper, e);
            }
          });
        } else {
          promise._v = value;
          promise._s = 1;
          notify(promise, false);
        }
      } catch (e) {
        $reject.call({ _w: promise, _d: false }, e); // wrap
      }
    };

    // constructor polyfill
    if (!USE_NATIVE) {
      // 25.4.3.1 Promise(executor)
      $Promise = function Promise(executor) {
        anInstance(this, $Promise, PROMISE, '_h');
        aFunction(executor);
        Internal.call(this);
        try {
          executor(ctx($resolve, this, 1), ctx($reject, this, 1));
        } catch (err) {
          $reject.call(this, err);
        }
      };
      // eslint-disable-next-line no-unused-vars
      Internal = function Promise(executor) {
        this._c = []; // <- awaiting reactions
        this._a = undefined; // <- checked in isUnhandled reactions
        this._s = 0; // <- state
        this._d = false; // <- done
        this._v = undefined; // <- value
        this._h = 0; // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
        this._n = false; // <- notify
      };
      Internal.prototype = require('./_redefine-all')($Promise.prototype, {
        // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
        then: function then(onFulfilled, onRejected) {
          var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
          reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
          reaction.fail = typeof onRejected == 'function' && onRejected;
          reaction.domain = isNode ? process.domain : undefined;
          this._c.push(reaction);
          if (this._a) this._a.push(reaction);
          if (this._s) notify(this, false);
          return reaction.promise;
        },
        // 25.4.5.1 Promise.prototype.catch(onRejected)
        'catch': function _catch(onRejected) {
          return this.then(undefined, onRejected);
        }
      });
      OwnPromiseCapability = function OwnPromiseCapability() {
        var promise = new Internal();
        this.promise = promise;
        this.resolve = ctx($resolve, promise, 1);
        this.reject = ctx($reject, promise, 1);
      };
      newPromiseCapabilityModule.f = newPromiseCapability = function newPromiseCapability(C) {
        return C === $Promise || C === Wrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
      };
    }

    $export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
    require('./_set-to-string-tag')($Promise, PROMISE);
    require('./_set-species')(PROMISE);
    Wrapper = require('./_core')[PROMISE];

    // statics
    $export($export.S + $export.F * !USE_NATIVE, PROMISE, {
      // 25.4.4.5 Promise.reject(r)
      reject: function reject(r) {
        var capability = newPromiseCapability(this);
        var $$reject = capability.reject;
        $$reject(r);
        return capability.promise;
      }
    });
    $export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
      // 25.4.4.6 Promise.resolve(x)
      resolve: function resolve(x) {
        return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
      }
    });
    $export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function (iter) {
      $Promise.all(iter)['catch'](empty);
    })), PROMISE, {
      // 25.4.4.1 Promise.all(iterable)
      all: function all(iterable) {
        var C = this;
        var capability = newPromiseCapability(C);
        var resolve = capability.resolve;
        var reject = capability.reject;
        var result = perform(function () {
          var values = [];
          var index = 0;
          var remaining = 1;
          forOf(iterable, false, function (promise) {
            var $index = index++;
            var alreadyCalled = false;
            values.push(undefined);
            remaining++;
            C.resolve(promise).then(function (value) {
              if (alreadyCalled) return;
              alreadyCalled = true;
              values[$index] = value;
              --remaining || resolve(values);
            }, reject);
          });
          --remaining || resolve(values);
        });
        if (result.e) reject(result.v);
        return capability.promise;
      },
      // 25.4.4.4 Promise.race(iterable)
      race: function race(iterable) {
        var C = this;
        var capability = newPromiseCapability(C);
        var reject = capability.reject;
        var result = perform(function () {
          forOf(iterable, false, function (promise) {
            C.resolve(promise).then(capability.resolve, reject);
          });
        });
        if (result.e) reject(result.v);
        return capability.promise;
      }
    });
  }, { "./_a-function": 6, "./_an-instance": 9, "./_classof": 20, "./_core": 26, "./_ctx": 28, "./_export": 36, "./_for-of": 42, "./_global": 43, "./_is-object": 54, "./_iter-detect": 59, "./_library": 62, "./_microtask": 70, "./_new-promise-capability": 71, "./_perform": 90, "./_promise-resolve": 91, "./_redefine-all": 93, "./_set-species": 100, "./_set-to-string-tag": 101, "./_species-constructor": 104, "./_task": 113, "./_user-agent": 125, "./_wks": 129 }], 211: [function (require, module, exports) {
    // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
    var $export = require('./_export');
    var aFunction = require('./_a-function');
    var anObject = require('./_an-object');
    var rApply = (require('./_global').Reflect || {}).apply;
    var fApply = Function.apply;
    // MS Edge argumentsList argument is optional
    $export($export.S + $export.F * !require('./_fails')(function () {
      rApply(function () {/* empty */});
    }), 'Reflect', {
      apply: function apply(target, thisArgument, argumentsList) {
        var T = aFunction(target);
        var L = anObject(argumentsList);
        return rApply ? rApply(T, thisArgument, L) : fApply.call(T, thisArgument, L);
      }
    });
  }, { "./_a-function": 6, "./_an-object": 10, "./_export": 36, "./_fails": 38, "./_global": 43 }], 212: [function (require, module, exports) {
    // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
    var $export = require('./_export');
    var create = require('./_object-create');
    var aFunction = require('./_a-function');
    var anObject = require('./_an-object');
    var isObject = require('./_is-object');
    var fails = require('./_fails');
    var bind = require('./_bind');
    var rConstruct = (require('./_global').Reflect || {}).construct;

    // MS Edge supports only 2 arguments and argumentsList argument is optional
    // FF Nightly sets third argument as `new.target`, but does not create `this` from it
    var NEW_TARGET_BUG = fails(function () {
      function F() {/* empty */}
      return !(rConstruct(function () {/* empty */}, [], F) instanceof F);
    });
    var ARGS_BUG = !fails(function () {
      rConstruct(function () {/* empty */});
    });

    $export($export.S + $export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
      construct: function construct(Target, args /* , newTarget */) {
        aFunction(Target);
        anObject(args);
        var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
        if (ARGS_BUG && !NEW_TARGET_BUG) return rConstruct(Target, args, newTarget);
        if (Target == newTarget) {
          // w/o altered newTarget, optimization for 0-4 arguments
          switch (args.length) {
            case 0:
              return new Target();
            case 1:
              return new Target(args[0]);
            case 2:
              return new Target(args[0], args[1]);
            case 3:
              return new Target(args[0], args[1], args[2]);
            case 4:
              return new Target(args[0], args[1], args[2], args[3]);
          }
          // w/o altered newTarget, lot of arguments case
          var $args = [null];
          $args.push.apply($args, args);
          return new (bind.apply(Target, $args))();
        }
        // with altered newTarget, not support built-in constructors
        var proto = newTarget.prototype;
        var instance = create(isObject(proto) ? proto : Object.prototype);
        var result = Function.apply.call(Target, instance, args);
        return isObject(result) ? result : instance;
      }
    });
  }, { "./_a-function": 6, "./_an-object": 10, "./_bind": 19, "./_export": 36, "./_fails": 38, "./_global": 43, "./_is-object": 54, "./_object-create": 73 }], 213: [function (require, module, exports) {
    // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
    var dP = require('./_object-dp');
    var $export = require('./_export');
    var anObject = require('./_an-object');
    var toPrimitive = require('./_to-primitive');

    // MS Edge has broken Reflect.defineProperty - throwing instead of returning false
    $export($export.S + $export.F * require('./_fails')(function () {
      // eslint-disable-next-line no-undef
      Reflect.defineProperty(dP.f({}, 1, { value: 1 }), 1, { value: 2 });
    }), 'Reflect', {
      defineProperty: function defineProperty(target, propertyKey, attributes) {
        anObject(target);
        propertyKey = toPrimitive(propertyKey, true);
        anObject(attributes);
        try {
          dP.f(target, propertyKey, attributes);
          return true;
        } catch (e) {
          return false;
        }
      }
    });
  }, { "./_an-object": 10, "./_export": 36, "./_fails": 38, "./_object-dp": 74, "./_to-primitive": 120 }], 214: [function (require, module, exports) {
    // 26.1.4 Reflect.deleteProperty(target, propertyKey)
    var $export = require('./_export');
    var gOPD = require('./_object-gopd').f;
    var anObject = require('./_an-object');

    $export($export.S, 'Reflect', {
      deleteProperty: function deleteProperty(target, propertyKey) {
        var desc = gOPD(anObject(target), propertyKey);
        return desc && !desc.configurable ? false : delete target[propertyKey];
      }
    });
  }, { "./_an-object": 10, "./_export": 36, "./_object-gopd": 77 }], 215: [function (require, module, exports) {
    'use strict';
    // 26.1.5 Reflect.enumerate(target)

    var $export = require('./_export');
    var anObject = require('./_an-object');
    var Enumerate = function Enumerate(iterated) {
      this._t = anObject(iterated); // target
      this._i = 0; // next index
      var keys = this._k = []; // keys
      var key;
      for (key in iterated) {
        keys.push(key);
      }
    };
    require('./_iter-create')(Enumerate, 'Object', function () {
      var that = this;
      var keys = that._k;
      var key;
      do {
        if (that._i >= keys.length) return { value: undefined, done: true };
      } while (!((key = keys[that._i++]) in that._t));
      return { value: key, done: false };
    });

    $export($export.S, 'Reflect', {
      enumerate: function enumerate(target) {
        return new Enumerate(target);
      }
    });
  }, { "./_an-object": 10, "./_export": 36, "./_iter-create": 57 }], 216: [function (require, module, exports) {
    // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
    var gOPD = require('./_object-gopd');
    var $export = require('./_export');
    var anObject = require('./_an-object');

    $export($export.S, 'Reflect', {
      getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
        return gOPD.f(anObject(target), propertyKey);
      }
    });
  }, { "./_an-object": 10, "./_export": 36, "./_object-gopd": 77 }], 217: [function (require, module, exports) {
    // 26.1.8 Reflect.getPrototypeOf(target)
    var $export = require('./_export');
    var getProto = require('./_object-gpo');
    var anObject = require('./_an-object');

    $export($export.S, 'Reflect', {
      getPrototypeOf: function getPrototypeOf(target) {
        return getProto(anObject(target));
      }
    });
  }, { "./_an-object": 10, "./_export": 36, "./_object-gpo": 81 }], 218: [function (require, module, exports) {
    // 26.1.6 Reflect.get(target, propertyKey [, receiver])
    var gOPD = require('./_object-gopd');
    var getPrototypeOf = require('./_object-gpo');
    var has = require('./_has');
    var $export = require('./_export');
    var isObject = require('./_is-object');
    var anObject = require('./_an-object');

    function get(target, propertyKey /* , receiver */) {
      var receiver = arguments.length < 3 ? target : arguments[2];
      var desc, proto;
      if (anObject(target) === receiver) return target[propertyKey];
      if (desc = gOPD.f(target, propertyKey)) return has(desc, 'value') ? desc.value : desc.get !== undefined ? desc.get.call(receiver) : undefined;
      if (isObject(proto = getPrototypeOf(target))) return get(proto, propertyKey, receiver);
    }

    $export($export.S, 'Reflect', { get: get });
  }, { "./_an-object": 10, "./_export": 36, "./_has": 44, "./_is-object": 54, "./_object-gopd": 77, "./_object-gpo": 81 }], 219: [function (require, module, exports) {
    // 26.1.9 Reflect.has(target, propertyKey)
    var $export = require('./_export');

    $export($export.S, 'Reflect', {
      has: function has(target, propertyKey) {
        return propertyKey in target;
      }
    });
  }, { "./_export": 36 }], 220: [function (require, module, exports) {
    // 26.1.10 Reflect.isExtensible(target)
    var $export = require('./_export');
    var anObject = require('./_an-object');
    var $isExtensible = Object.isExtensible;

    $export($export.S, 'Reflect', {
      isExtensible: function isExtensible(target) {
        anObject(target);
        return $isExtensible ? $isExtensible(target) : true;
      }
    });
  }, { "./_an-object": 10, "./_export": 36 }], 221: [function (require, module, exports) {
    // 26.1.11 Reflect.ownKeys(target)
    var $export = require('./_export');

    $export($export.S, 'Reflect', { ownKeys: require('./_own-keys') });
  }, { "./_export": 36, "./_own-keys": 87 }], 222: [function (require, module, exports) {
    // 26.1.12 Reflect.preventExtensions(target)
    var $export = require('./_export');
    var anObject = require('./_an-object');
    var $preventExtensions = Object.preventExtensions;

    $export($export.S, 'Reflect', {
      preventExtensions: function preventExtensions(target) {
        anObject(target);
        try {
          if ($preventExtensions) $preventExtensions(target);
          return true;
        } catch (e) {
          return false;
        }
      }
    });
  }, { "./_an-object": 10, "./_export": 36 }], 223: [function (require, module, exports) {
    // 26.1.14 Reflect.setPrototypeOf(target, proto)
    var $export = require('./_export');
    var setProto = require('./_set-proto');

    if (setProto) $export($export.S, 'Reflect', {
      setPrototypeOf: function setPrototypeOf(target, proto) {
        setProto.check(target, proto);
        try {
          setProto.set(target, proto);
          return true;
        } catch (e) {
          return false;
        }
      }
    });
  }, { "./_export": 36, "./_set-proto": 99 }], 224: [function (require, module, exports) {
    // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
    var dP = require('./_object-dp');
    var gOPD = require('./_object-gopd');
    var getPrototypeOf = require('./_object-gpo');
    var has = require('./_has');
    var $export = require('./_export');
    var createDesc = require('./_property-desc');
    var anObject = require('./_an-object');
    var isObject = require('./_is-object');

    function set(target, propertyKey, V /* , receiver */) {
      var receiver = arguments.length < 4 ? target : arguments[3];
      var ownDesc = gOPD.f(anObject(target), propertyKey);
      var existingDescriptor, proto;
      if (!ownDesc) {
        if (isObject(proto = getPrototypeOf(target))) {
          return set(proto, propertyKey, V, receiver);
        }
        ownDesc = createDesc(0);
      }
      if (has(ownDesc, 'value')) {
        if (ownDesc.writable === false || !isObject(receiver)) return false;
        if (existingDescriptor = gOPD.f(receiver, propertyKey)) {
          if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
          existingDescriptor.value = V;
          dP.f(receiver, propertyKey, existingDescriptor);
        } else dP.f(receiver, propertyKey, createDesc(0, V));
        return true;
      }
      return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
    }

    $export($export.S, 'Reflect', { set: set });
  }, { "./_an-object": 10, "./_export": 36, "./_has": 44, "./_is-object": 54, "./_object-dp": 74, "./_object-gopd": 77, "./_object-gpo": 81, "./_property-desc": 92 }], 225: [function (require, module, exports) {
    var global = require('./_global');
    var inheritIfRequired = require('./_inherit-if-required');
    var dP = require('./_object-dp').f;
    var gOPN = require('./_object-gopn').f;
    var isRegExp = require('./_is-regexp');
    var $flags = require('./_flags');
    var $RegExp = global.RegExp;
    var Base = $RegExp;
    var proto = $RegExp.prototype;
    var re1 = /a/g;
    var re2 = /a/g;
    // "new" creates a new object, old webkit buggy here
    var CORRECT_NEW = new $RegExp(re1) !== re1;

    if (require('./_descriptors') && (!CORRECT_NEW || require('./_fails')(function () {
      re2[require('./_wks')('match')] = false;
      // RegExp constructor can alter flags and IsRegExp works correct with @@match
      return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
    }))) {
      $RegExp = function RegExp(p, f) {
        var tiRE = this instanceof $RegExp;
        var piRE = isRegExp(p);
        var fiU = f === undefined;
        return !tiRE && piRE && p.constructor === $RegExp && fiU ? p : inheritIfRequired(CORRECT_NEW ? new Base(piRE && !fiU ? p.source : p, f) : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f), tiRE ? this : proto, $RegExp);
      };
      var proxy = function proxy(key) {
        key in $RegExp || dP($RegExp, key, {
          configurable: true,
          get: function get() {
            return Base[key];
          },
          set: function set(it) {
            Base[key] = it;
          }
        });
      };
      for (var keys = gOPN(Base), i = 0; keys.length > i;) {
        proxy(keys[i++]);
      }proto.constructor = $RegExp;
      $RegExp.prototype = proto;
      require('./_redefine')(global, 'RegExp', $RegExp);
    }

    require('./_set-species')('RegExp');
  }, { "./_descriptors": 32, "./_fails": 38, "./_flags": 40, "./_global": 43, "./_inherit-if-required": 48, "./_is-regexp": 55, "./_object-dp": 74, "./_object-gopn": 79, "./_redefine": 94, "./_set-species": 100, "./_wks": 129 }], 226: [function (require, module, exports) {
    // 21.2.5.3 get RegExp.prototype.flags()
    if (require('./_descriptors') && /./g.flags != 'g') require('./_object-dp').f(RegExp.prototype, 'flags', {
      configurable: true,
      get: require('./_flags')
    });
  }, { "./_descriptors": 32, "./_flags": 40, "./_object-dp": 74 }], 227: [function (require, module, exports) {
    // @@match logic
    require('./_fix-re-wks')('match', 1, function (defined, MATCH, $match) {
      // 21.1.3.11 String.prototype.match(regexp)
      return [function match(regexp) {
        'use strict';

        var O = defined(this);
        var fn = regexp == undefined ? undefined : regexp[MATCH];
        return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
      }, $match];
    });
  }, { "./_fix-re-wks": 39 }], 228: [function (require, module, exports) {
    // @@replace logic
    require('./_fix-re-wks')('replace', 2, function (defined, REPLACE, $replace) {
      // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
      return [function replace(searchValue, replaceValue) {
        'use strict';

        var O = defined(this);
        var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
        return fn !== undefined ? fn.call(searchValue, O, replaceValue) : $replace.call(String(O), searchValue, replaceValue);
      }, $replace];
    });
  }, { "./_fix-re-wks": 39 }], 229: [function (require, module, exports) {
    // @@search logic
    require('./_fix-re-wks')('search', 1, function (defined, SEARCH, $search) {
      // 21.1.3.15 String.prototype.search(regexp)
      return [function search(regexp) {
        'use strict';

        var O = defined(this);
        var fn = regexp == undefined ? undefined : regexp[SEARCH];
        return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
      }, $search];
    });
  }, { "./_fix-re-wks": 39 }], 230: [function (require, module, exports) {
    // @@split logic
    require('./_fix-re-wks')('split', 2, function (defined, SPLIT, $split) {
      'use strict';

      var isRegExp = require('./_is-regexp');
      var _split = $split;
      var $push = [].push;
      var $SPLIT = 'split';
      var LENGTH = 'length';
      var LAST_INDEX = 'lastIndex';
      if ('abbc'[$SPLIT](/(b)*/)[1] == 'c' || 'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 || 'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 || '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 || '.'[$SPLIT](/()()/)[LENGTH] > 1 || ''[$SPLIT](/.?/)[LENGTH]) {
        var NPCG = /()??/.exec('')[1] === undefined; // nonparticipating capturing group
        // based on es5-shim implementation, need to rework it
        $split = function $split(separator, limit) {
          var string = String(this);
          if (separator === undefined && limit === 0) return [];
          // If `separator` is not a regex, use native split
          if (!isRegExp(separator)) return _split.call(string, separator, limit);
          var output = [];
          var flags = (separator.ignoreCase ? 'i' : '') + (separator.multiline ? 'm' : '') + (separator.unicode ? 'u' : '') + (separator.sticky ? 'y' : '');
          var lastLastIndex = 0;
          var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
          // Make `global` and avoid `lastIndex` issues by working with a copy
          var separatorCopy = new RegExp(separator.source, flags + 'g');
          var separator2, match, lastIndex, lastLength, i;
          // Doesn't need flags gy, but they don't hurt
          if (!NPCG) separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
          while (match = separatorCopy.exec(string)) {
            // `separatorCopy.lastIndex` is not reliable cross-browser
            lastIndex = match.index + match[0][LENGTH];
            if (lastIndex > lastLastIndex) {
              output.push(string.slice(lastLastIndex, match.index));
              // Fix browsers whose `exec` methods don't consistently return `undefined` for NPCG
              // eslint-disable-next-line no-loop-func
              if (!NPCG && match[LENGTH] > 1) match[0].replace(separator2, function () {
                for (i = 1; i < arguments[LENGTH] - 2; i++) {
                  if (arguments[i] === undefined) match[i] = undefined;
                }
              });
              if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
              lastLength = match[0][LENGTH];
              lastLastIndex = lastIndex;
              if (output[LENGTH] >= splitLimit) break;
            }
            if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
          }
          if (lastLastIndex === string[LENGTH]) {
            if (lastLength || !separatorCopy.test('')) output.push('');
          } else output.push(string.slice(lastLastIndex));
          return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
        };
        // Chakra, V8
      } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
        $split = function $split(separator, limit) {
          return separator === undefined && limit === 0 ? [] : _split.call(this, separator, limit);
        };
      }
      // 21.1.3.17 String.prototype.split(separator, limit)
      return [function split(separator, limit) {
        var O = defined(this);
        var fn = separator == undefined ? undefined : separator[SPLIT];
        return fn !== undefined ? fn.call(separator, O, limit) : $split.call(String(O), separator, limit);
      }, $split];
    });
  }, { "./_fix-re-wks": 39, "./_is-regexp": 55 }], 231: [function (require, module, exports) {
    'use strict';

    require('./es6.regexp.flags');
    var anObject = require('./_an-object');
    var $flags = require('./_flags');
    var DESCRIPTORS = require('./_descriptors');
    var TO_STRING = 'toString';
    var $toString = /./[TO_STRING];

    var define = function define(fn) {
      require('./_redefine')(RegExp.prototype, TO_STRING, fn, true);
    };

    // 21.2.5.14 RegExp.prototype.toString()
    if (require('./_fails')(function () {
      return $toString.call({ source: 'a', flags: 'b' }) != '/a/b';
    })) {
      define(function toString() {
        var R = anObject(this);
        return '/'.concat(R.source, '/', 'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
      });
      // FF44- RegExp#toString has a wrong name
    } else if ($toString.name != TO_STRING) {
      define(function toString() {
        return $toString.call(this);
      });
    }
  }, { "./_an-object": 10, "./_descriptors": 32, "./_fails": 38, "./_flags": 40, "./_redefine": 94, "./es6.regexp.flags": 226 }], 232: [function (require, module, exports) {
    'use strict';

    var strong = require('./_collection-strong');
    var validate = require('./_validate-collection');
    var SET = 'Set';

    // 23.2 Set Objects
    module.exports = require('./_collection')(SET, function (get) {
      return function Set() {
        return get(this, arguments.length > 0 ? arguments[0] : undefined);
      };
    }, {
      // 23.2.3.1 Set.prototype.add(value)
      add: function add(value) {
        return strong.def(validate(this, SET), value = value === 0 ? 0 : value, value);
      }
    }, strong);
  }, { "./_collection": 25, "./_collection-strong": 22, "./_validate-collection": 126 }], 233: [function (require, module, exports) {
    'use strict';
    // B.2.3.2 String.prototype.anchor(name)

    require('./_string-html')('anchor', function (createHTML) {
      return function anchor(name) {
        return createHTML(this, 'a', 'name', name);
      };
    });
  }, { "./_string-html": 108 }], 234: [function (require, module, exports) {
    'use strict';
    // B.2.3.3 String.prototype.big()

    require('./_string-html')('big', function (createHTML) {
      return function big() {
        return createHTML(this, 'big', '', '');
      };
    });
  }, { "./_string-html": 108 }], 235: [function (require, module, exports) {
    'use strict';
    // B.2.3.4 String.prototype.blink()

    require('./_string-html')('blink', function (createHTML) {
      return function blink() {
        return createHTML(this, 'blink', '', '');
      };
    });
  }, { "./_string-html": 108 }], 236: [function (require, module, exports) {
    'use strict';
    // B.2.3.5 String.prototype.bold()

    require('./_string-html')('bold', function (createHTML) {
      return function bold() {
        return createHTML(this, 'b', '', '');
      };
    });
  }, { "./_string-html": 108 }], 237: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var $at = require('./_string-at')(false);
    $export($export.P, 'String', {
      // 21.1.3.3 String.prototype.codePointAt(pos)
      codePointAt: function codePointAt(pos) {
        return $at(this, pos);
      }
    });
  }, { "./_export": 36, "./_string-at": 106 }], 238: [function (require, module, exports) {
    // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
    'use strict';

    var $export = require('./_export');
    var toLength = require('./_to-length');
    var context = require('./_string-context');
    var ENDS_WITH = 'endsWith';
    var $endsWith = ''[ENDS_WITH];

    $export($export.P + $export.F * require('./_fails-is-regexp')(ENDS_WITH), 'String', {
      endsWith: function endsWith(searchString /* , endPosition = @length */) {
        var that = context(this, searchString, ENDS_WITH);
        var endPosition = arguments.length > 1 ? arguments[1] : undefined;
        var len = toLength(that.length);
        var end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
        var search = String(searchString);
        return $endsWith ? $endsWith.call(that, search, end) : that.slice(end - search.length, end) === search;
      }
    });
  }, { "./_export": 36, "./_fails-is-regexp": 37, "./_string-context": 107, "./_to-length": 118 }], 239: [function (require, module, exports) {
    'use strict';
    // B.2.3.6 String.prototype.fixed()

    require('./_string-html')('fixed', function (createHTML) {
      return function fixed() {
        return createHTML(this, 'tt', '', '');
      };
    });
  }, { "./_string-html": 108 }], 240: [function (require, module, exports) {
    'use strict';
    // B.2.3.7 String.prototype.fontcolor(color)

    require('./_string-html')('fontcolor', function (createHTML) {
      return function fontcolor(color) {
        return createHTML(this, 'font', 'color', color);
      };
    });
  }, { "./_string-html": 108 }], 241: [function (require, module, exports) {
    'use strict';
    // B.2.3.8 String.prototype.fontsize(size)

    require('./_string-html')('fontsize', function (createHTML) {
      return function fontsize(size) {
        return createHTML(this, 'font', 'size', size);
      };
    });
  }, { "./_string-html": 108 }], 242: [function (require, module, exports) {
    var $export = require('./_export');
    var toAbsoluteIndex = require('./_to-absolute-index');
    var fromCharCode = String.fromCharCode;
    var $fromCodePoint = String.fromCodePoint;

    // length should be 1, old FF problem
    $export($export.S + $export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
      // 21.1.2.2 String.fromCodePoint(...codePoints)
      fromCodePoint: function fromCodePoint(x) {
        // eslint-disable-line no-unused-vars
        var res = [];
        var aLen = arguments.length;
        var i = 0;
        var code;
        while (aLen > i) {
          code = +arguments[i++];
          if (toAbsoluteIndex(code, 0x10ffff) !== code) throw RangeError(code + ' is not a valid code point');
          res.push(code < 0x10000 ? fromCharCode(code) : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00));
        }return res.join('');
      }
    });
  }, { "./_export": 36, "./_to-absolute-index": 114 }], 243: [function (require, module, exports) {
    // 21.1.3.7 String.prototype.includes(searchString, position = 0)
    'use strict';

    var $export = require('./_export');
    var context = require('./_string-context');
    var INCLUDES = 'includes';

    $export($export.P + $export.F * require('./_fails-is-regexp')(INCLUDES), 'String', {
      includes: function includes(searchString /* , position = 0 */) {
        return !!~context(this, searchString, INCLUDES).indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
      }
    });
  }, { "./_export": 36, "./_fails-is-regexp": 37, "./_string-context": 107 }], 244: [function (require, module, exports) {
    'use strict';
    // B.2.3.9 String.prototype.italics()

    require('./_string-html')('italics', function (createHTML) {
      return function italics() {
        return createHTML(this, 'i', '', '');
      };
    });
  }, { "./_string-html": 108 }], 245: [function (require, module, exports) {
    'use strict';

    var $at = require('./_string-at')(true);

    // 21.1.3.27 String.prototype[@@iterator]()
    require('./_iter-define')(String, 'String', function (iterated) {
      this._t = String(iterated); // target
      this._i = 0; // next index
      // 21.1.5.2.1 %StringIteratorPrototype%.next()
    }, function () {
      var O = this._t;
      var index = this._i;
      var point;
      if (index >= O.length) return { value: undefined, done: true };
      point = $at(O, index);
      this._i += point.length;
      return { value: point, done: false };
    });
  }, { "./_iter-define": 58, "./_string-at": 106 }], 246: [function (require, module, exports) {
    'use strict';
    // B.2.3.10 String.prototype.link(url)

    require('./_string-html')('link', function (createHTML) {
      return function link(url) {
        return createHTML(this, 'a', 'href', url);
      };
    });
  }, { "./_string-html": 108 }], 247: [function (require, module, exports) {
    var $export = require('./_export');
    var toIObject = require('./_to-iobject');
    var toLength = require('./_to-length');

    $export($export.S, 'String', {
      // 21.1.2.4 String.raw(callSite, ...substitutions)
      raw: function raw(callSite) {
        var tpl = toIObject(callSite.raw);
        var len = toLength(tpl.length);
        var aLen = arguments.length;
        var res = [];
        var i = 0;
        while (len > i) {
          res.push(String(tpl[i++]));
          if (i < aLen) res.push(String(arguments[i]));
        }return res.join('');
      }
    });
  }, { "./_export": 36, "./_to-iobject": 117, "./_to-length": 118 }], 248: [function (require, module, exports) {
    var $export = require('./_export');

    $export($export.P, 'String', {
      // 21.1.3.13 String.prototype.repeat(count)
      repeat: require('./_string-repeat')
    });
  }, { "./_export": 36, "./_string-repeat": 110 }], 249: [function (require, module, exports) {
    'use strict';
    // B.2.3.11 String.prototype.small()

    require('./_string-html')('small', function (createHTML) {
      return function small() {
        return createHTML(this, 'small', '', '');
      };
    });
  }, { "./_string-html": 108 }], 250: [function (require, module, exports) {
    // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
    'use strict';

    var $export = require('./_export');
    var toLength = require('./_to-length');
    var context = require('./_string-context');
    var STARTS_WITH = 'startsWith';
    var $startsWith = ''[STARTS_WITH];

    $export($export.P + $export.F * require('./_fails-is-regexp')(STARTS_WITH), 'String', {
      startsWith: function startsWith(searchString /* , position = 0 */) {
        var that = context(this, searchString, STARTS_WITH);
        var index = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
        var search = String(searchString);
        return $startsWith ? $startsWith.call(that, search, index) : that.slice(index, index + search.length) === search;
      }
    });
  }, { "./_export": 36, "./_fails-is-regexp": 37, "./_string-context": 107, "./_to-length": 118 }], 251: [function (require, module, exports) {
    'use strict';
    // B.2.3.12 String.prototype.strike()

    require('./_string-html')('strike', function (createHTML) {
      return function strike() {
        return createHTML(this, 'strike', '', '');
      };
    });
  }, { "./_string-html": 108 }], 252: [function (require, module, exports) {
    'use strict';
    // B.2.3.13 String.prototype.sub()

    require('./_string-html')('sub', function (createHTML) {
      return function sub() {
        return createHTML(this, 'sub', '', '');
      };
    });
  }, { "./_string-html": 108 }], 253: [function (require, module, exports) {
    'use strict';
    // B.2.3.14 String.prototype.sup()

    require('./_string-html')('sup', function (createHTML) {
      return function sup() {
        return createHTML(this, 'sup', '', '');
      };
    });
  }, { "./_string-html": 108 }], 254: [function (require, module, exports) {
    'use strict';
    // 21.1.3.25 String.prototype.trim()

    require('./_string-trim')('trim', function ($trim) {
      return function trim() {
        return $trim(this, 3);
      };
    });
  }, { "./_string-trim": 111 }], 255: [function (require, module, exports) {
    'use strict';
    // ECMAScript 6 symbols shim

    var global = require('./_global');
    var has = require('./_has');
    var DESCRIPTORS = require('./_descriptors');
    var $export = require('./_export');
    var redefine = require('./_redefine');
    var META = require('./_meta').KEY;
    var $fails = require('./_fails');
    var shared = require('./_shared');
    var setToStringTag = require('./_set-to-string-tag');
    var uid = require('./_uid');
    var wks = require('./_wks');
    var wksExt = require('./_wks-ext');
    var wksDefine = require('./_wks-define');
    var enumKeys = require('./_enum-keys');
    var isArray = require('./_is-array');
    var anObject = require('./_an-object');
    var isObject = require('./_is-object');
    var toIObject = require('./_to-iobject');
    var toPrimitive = require('./_to-primitive');
    var createDesc = require('./_property-desc');
    var _create = require('./_object-create');
    var gOPNExt = require('./_object-gopn-ext');
    var $GOPD = require('./_object-gopd');
    var $DP = require('./_object-dp');
    var $keys = require('./_object-keys');
    var gOPD = $GOPD.f;
    var dP = $DP.f;
    var gOPN = gOPNExt.f;
    var $Symbol = global.Symbol;
    var $JSON = global.JSON;
    var _stringify = $JSON && $JSON.stringify;
    var PROTOTYPE = 'prototype';
    var HIDDEN = wks('_hidden');
    var TO_PRIMITIVE = wks('toPrimitive');
    var isEnum = {}.propertyIsEnumerable;
    var SymbolRegistry = shared('symbol-registry');
    var AllSymbols = shared('symbols');
    var OPSymbols = shared('op-symbols');
    var ObjectProto = Object[PROTOTYPE];
    var USE_NATIVE = typeof $Symbol == 'function';
    var QObject = global.QObject;
    // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
    var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

    // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
    var setSymbolDesc = DESCRIPTORS && $fails(function () {
      return _create(dP({}, 'a', {
        get: function get() {
          return dP(this, 'a', { value: 7 }).a;
        }
      })).a != 7;
    }) ? function (it, key, D) {
      var protoDesc = gOPD(ObjectProto, key);
      if (protoDesc) delete ObjectProto[key];
      dP(it, key, D);
      if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
    } : dP;

    var wrap = function wrap(tag) {
      var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
      sym._k = tag;
      return sym;
    };

    var isSymbol = USE_NATIVE && _typeof($Symbol.iterator) == 'symbol' ? function (it) {
      return (typeof it === "undefined" ? "undefined" : _typeof(it)) == 'symbol';
    } : function (it) {
      return it instanceof $Symbol;
    };

    var $defineProperty = function defineProperty(it, key, D) {
      if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
      anObject(it);
      key = toPrimitive(key, true);
      anObject(D);
      if (has(AllSymbols, key)) {
        if (!D.enumerable) {
          if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
          it[HIDDEN][key] = true;
        } else {
          if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
          D = _create(D, { enumerable: createDesc(0, false) });
        }return setSymbolDesc(it, key, D);
      }return dP(it, key, D);
    };
    var $defineProperties = function defineProperties(it, P) {
      anObject(it);
      var keys = enumKeys(P = toIObject(P));
      var i = 0;
      var l = keys.length;
      var key;
      while (l > i) {
        $defineProperty(it, key = keys[i++], P[key]);
      }return it;
    };
    var $create = function create(it, P) {
      return P === undefined ? _create(it) : $defineProperties(_create(it), P);
    };
    var $propertyIsEnumerable = function propertyIsEnumerable(key) {
      var E = isEnum.call(this, key = toPrimitive(key, true));
      if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
      return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
    };
    var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
      it = toIObject(it);
      key = toPrimitive(key, true);
      if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
      var D = gOPD(it, key);
      if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
      return D;
    };
    var $getOwnPropertyNames = function getOwnPropertyNames(it) {
      var names = gOPN(toIObject(it));
      var result = [];
      var i = 0;
      var key;
      while (names.length > i) {
        if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
      }return result;
    };
    var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
      var IS_OP = it === ObjectProto;
      var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
      var result = [];
      var i = 0;
      var key;
      while (names.length > i) {
        if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
      }return result;
    };

    // 19.4.1.1 Symbol([description])
    if (!USE_NATIVE) {
      $Symbol = function _Symbol2() {
        if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
        var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
        var $set = function $set(value) {
          if (this === ObjectProto) $set.call(OPSymbols, value);
          if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
          setSymbolDesc(this, tag, createDesc(1, value));
        };
        if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
        return wrap(tag);
      };
      redefine($Symbol[PROTOTYPE], 'toString', function toString() {
        return this._k;
      });

      $GOPD.f = $getOwnPropertyDescriptor;
      $DP.f = $defineProperty;
      require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
      require('./_object-pie').f = $propertyIsEnumerable;
      require('./_object-gops').f = $getOwnPropertySymbols;

      if (DESCRIPTORS && !require('./_library')) {
        redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
      }

      wksExt.f = function (name) {
        return wrap(wks(name));
      };
    }

    $export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

    for (var es6Symbols =
    // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'.split(','), j = 0; es6Symbols.length > j;) {
      wks(es6Symbols[j++]);
    }for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) {
      wksDefine(wellKnownSymbols[k++]);
    }$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
      // 19.4.2.1 Symbol.for(key)
      'for': function _for(key) {
        return has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
      },
      // 19.4.2.5 Symbol.keyFor(sym)
      keyFor: function keyFor(sym) {
        if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
        for (var key in SymbolRegistry) {
          if (SymbolRegistry[key] === sym) return key;
        }
      },
      useSetter: function useSetter() {
        setter = true;
      },
      useSimple: function useSimple() {
        setter = false;
      }
    });

    $export($export.S + $export.F * !USE_NATIVE, 'Object', {
      // 19.1.2.2 Object.create(O [, Properties])
      create: $create,
      // 19.1.2.4 Object.defineProperty(O, P, Attributes)
      defineProperty: $defineProperty,
      // 19.1.2.3 Object.defineProperties(O, Properties)
      defineProperties: $defineProperties,
      // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
      getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
      // 19.1.2.7 Object.getOwnPropertyNames(O)
      getOwnPropertyNames: $getOwnPropertyNames,
      // 19.1.2.8 Object.getOwnPropertySymbols(O)
      getOwnPropertySymbols: $getOwnPropertySymbols
    });

    // 24.3.2 JSON.stringify(value [, replacer [, space]])
    $JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
      var S = $Symbol();
      // MS Edge converts symbol values to JSON as {}
      // WebKit converts symbol values to JSON as null
      // V8 throws on boxed symbols
      return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
    })), 'JSON', {
      stringify: function stringify(it) {
        var args = [it];
        var i = 1;
        var replacer, $replacer;
        while (arguments.length > i) {
          args.push(arguments[i++]);
        }$replacer = replacer = args[1];
        if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
        if (!isArray(replacer)) replacer = function replacer(key, value) {
          if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
          if (!isSymbol(value)) return value;
        };
        args[1] = replacer;
        return _stringify.apply($JSON, args);
      }
    });

    // 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
    $Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
    // 19.4.3.5 Symbol.prototype[@@toStringTag]
    setToStringTag($Symbol, 'Symbol');
    // 20.2.1.9 Math[@@toStringTag]
    setToStringTag(Math, 'Math', true);
    // 24.3.3 JSON[@@toStringTag]
    setToStringTag(global.JSON, 'JSON', true);
  }, { "./_an-object": 10, "./_descriptors": 32, "./_enum-keys": 35, "./_export": 36, "./_fails": 38, "./_global": 43, "./_has": 44, "./_hide": 45, "./_is-array": 52, "./_is-object": 54, "./_library": 62, "./_meta": 68, "./_object-create": 73, "./_object-dp": 74, "./_object-gopd": 77, "./_object-gopn": 79, "./_object-gopn-ext": 78, "./_object-gops": 80, "./_object-keys": 83, "./_object-pie": 84, "./_property-desc": 92, "./_redefine": 94, "./_set-to-string-tag": 101, "./_shared": 103, "./_to-iobject": 117, "./_to-primitive": 120, "./_uid": 124, "./_wks": 129, "./_wks-define": 127, "./_wks-ext": 128 }], 256: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var $typed = require('./_typed');
    var buffer = require('./_typed-buffer');
    var anObject = require('./_an-object');
    var toAbsoluteIndex = require('./_to-absolute-index');
    var toLength = require('./_to-length');
    var isObject = require('./_is-object');
    var ArrayBuffer = require('./_global').ArrayBuffer;
    var speciesConstructor = require('./_species-constructor');
    var $ArrayBuffer = buffer.ArrayBuffer;
    var $DataView = buffer.DataView;
    var $isView = $typed.ABV && ArrayBuffer.isView;
    var $slice = $ArrayBuffer.prototype.slice;
    var VIEW = $typed.VIEW;
    var ARRAY_BUFFER = 'ArrayBuffer';

    $export($export.G + $export.W + $export.F * (ArrayBuffer !== $ArrayBuffer), { ArrayBuffer: $ArrayBuffer });

    $export($export.S + $export.F * !$typed.CONSTR, ARRAY_BUFFER, {
      // 24.1.3.1 ArrayBuffer.isView(arg)
      isView: function isView(it) {
        return $isView && $isView(it) || isObject(it) && VIEW in it;
      }
    });

    $export($export.P + $export.U + $export.F * require('./_fails')(function () {
      return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
    }), ARRAY_BUFFER, {
      // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
      slice: function slice(start, end) {
        if ($slice !== undefined && end === undefined) return $slice.call(anObject(this), start); // FF fix
        var len = anObject(this).byteLength;
        var first = toAbsoluteIndex(start, len);
        var fin = toAbsoluteIndex(end === undefined ? len : end, len);
        var result = new (speciesConstructor(this, $ArrayBuffer))(toLength(fin - first));
        var viewS = new $DataView(this);
        var viewT = new $DataView(result);
        var index = 0;
        while (first < fin) {
          viewT.setUint8(index++, viewS.getUint8(first++));
        }return result;
      }
    });

    require('./_set-species')(ARRAY_BUFFER);
  }, { "./_an-object": 10, "./_export": 36, "./_fails": 38, "./_global": 43, "./_is-object": 54, "./_set-species": 100, "./_species-constructor": 104, "./_to-absolute-index": 114, "./_to-length": 118, "./_typed": 123, "./_typed-buffer": 122 }], 257: [function (require, module, exports) {
    var $export = require('./_export');
    $export($export.G + $export.W + $export.F * !require('./_typed').ABV, {
      DataView: require('./_typed-buffer').DataView
    });
  }, { "./_export": 36, "./_typed": 123, "./_typed-buffer": 122 }], 258: [function (require, module, exports) {
    require('./_typed-array')('Float32', 4, function (init) {
      return function Float32Array(data, byteOffset, length) {
        return init(this, data, byteOffset, length);
      };
    });
  }, { "./_typed-array": 121 }], 259: [function (require, module, exports) {
    require('./_typed-array')('Float64', 8, function (init) {
      return function Float64Array(data, byteOffset, length) {
        return init(this, data, byteOffset, length);
      };
    });
  }, { "./_typed-array": 121 }], 260: [function (require, module, exports) {
    require('./_typed-array')('Int16', 2, function (init) {
      return function Int16Array(data, byteOffset, length) {
        return init(this, data, byteOffset, length);
      };
    });
  }, { "./_typed-array": 121 }], 261: [function (require, module, exports) {
    require('./_typed-array')('Int32', 4, function (init) {
      return function Int32Array(data, byteOffset, length) {
        return init(this, data, byteOffset, length);
      };
    });
  }, { "./_typed-array": 121 }], 262: [function (require, module, exports) {
    require('./_typed-array')('Int8', 1, function (init) {
      return function Int8Array(data, byteOffset, length) {
        return init(this, data, byteOffset, length);
      };
    });
  }, { "./_typed-array": 121 }], 263: [function (require, module, exports) {
    require('./_typed-array')('Uint16', 2, function (init) {
      return function Uint16Array(data, byteOffset, length) {
        return init(this, data, byteOffset, length);
      };
    });
  }, { "./_typed-array": 121 }], 264: [function (require, module, exports) {
    require('./_typed-array')('Uint32', 4, function (init) {
      return function Uint32Array(data, byteOffset, length) {
        return init(this, data, byteOffset, length);
      };
    });
  }, { "./_typed-array": 121 }], 265: [function (require, module, exports) {
    require('./_typed-array')('Uint8', 1, function (init) {
      return function Uint8Array(data, byteOffset, length) {
        return init(this, data, byteOffset, length);
      };
    });
  }, { "./_typed-array": 121 }], 266: [function (require, module, exports) {
    require('./_typed-array')('Uint8', 1, function (init) {
      return function Uint8ClampedArray(data, byteOffset, length) {
        return init(this, data, byteOffset, length);
      };
    }, true);
  }, { "./_typed-array": 121 }], 267: [function (require, module, exports) {
    'use strict';

    var each = require('./_array-methods')(0);
    var redefine = require('./_redefine');
    var meta = require('./_meta');
    var assign = require('./_object-assign');
    var weak = require('./_collection-weak');
    var isObject = require('./_is-object');
    var fails = require('./_fails');
    var validate = require('./_validate-collection');
    var WEAK_MAP = 'WeakMap';
    var getWeak = meta.getWeak;
    var isExtensible = Object.isExtensible;
    var uncaughtFrozenStore = weak.ufstore;
    var tmp = {};
    var InternalMap;

    var wrapper = function wrapper(get) {
      return function WeakMap() {
        return get(this, arguments.length > 0 ? arguments[0] : undefined);
      };
    };

    var methods = {
      // 23.3.3.3 WeakMap.prototype.get(key)
      get: function get(key) {
        if (isObject(key)) {
          var data = getWeak(key);
          if (data === true) return uncaughtFrozenStore(validate(this, WEAK_MAP)).get(key);
          return data ? data[this._i] : undefined;
        }
      },
      // 23.3.3.5 WeakMap.prototype.set(key, value)
      set: function set(key, value) {
        return weak.def(validate(this, WEAK_MAP), key, value);
      }
    };

    // 23.3 WeakMap Objects
    var $WeakMap = module.exports = require('./_collection')(WEAK_MAP, wrapper, methods, weak, true, true);

    // IE11 WeakMap frozen keys fix
    if (fails(function () {
      return new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7;
    })) {
      InternalMap = weak.getConstructor(wrapper, WEAK_MAP);
      assign(InternalMap.prototype, methods);
      meta.NEED = true;
      each(['delete', 'has', 'get', 'set'], function (key) {
        var proto = $WeakMap.prototype;
        var method = proto[key];
        redefine(proto, key, function (a, b) {
          // store frozen objects on internal weakmap shim
          if (isObject(a) && !isExtensible(a)) {
            if (!this._f) this._f = new InternalMap();
            var result = this._f[key](a, b);
            return key == 'set' ? this : result;
            // store all the rest on native weakmap
          }return method.call(this, a, b);
        });
      });
    }
  }, { "./_array-methods": 15, "./_collection": 25, "./_collection-weak": 24, "./_fails": 38, "./_is-object": 54, "./_meta": 68, "./_object-assign": 72, "./_redefine": 94, "./_validate-collection": 126 }], 268: [function (require, module, exports) {
    'use strict';

    var weak = require('./_collection-weak');
    var validate = require('./_validate-collection');
    var WEAK_SET = 'WeakSet';

    // 23.4 WeakSet Objects
    require('./_collection')(WEAK_SET, function (get) {
      return function WeakSet() {
        return get(this, arguments.length > 0 ? arguments[0] : undefined);
      };
    }, {
      // 23.4.3.1 WeakSet.prototype.add(value)
      add: function add(value) {
        return weak.def(validate(this, WEAK_SET), value, true);
      }
    }, weak, false, true);
  }, { "./_collection": 25, "./_collection-weak": 24, "./_validate-collection": 126 }], 269: [function (require, module, exports) {
    'use strict';
    // https://tc39.github.io/proposal-flatMap/#sec-Array.prototype.flatMap

    var $export = require('./_export');
    var flattenIntoArray = require('./_flatten-into-array');
    var toObject = require('./_to-object');
    var toLength = require('./_to-length');
    var aFunction = require('./_a-function');
    var arraySpeciesCreate = require('./_array-species-create');

    $export($export.P, 'Array', {
      flatMap: function flatMap(callbackfn /* , thisArg */) {
        var O = toObject(this);
        var sourceLen, A;
        aFunction(callbackfn);
        sourceLen = toLength(O.length);
        A = arraySpeciesCreate(O, 0);
        flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments[1]);
        return A;
      }
    });

    require('./_add-to-unscopables')('flatMap');
  }, { "./_a-function": 6, "./_add-to-unscopables": 8, "./_array-species-create": 18, "./_export": 36, "./_flatten-into-array": 41, "./_to-length": 118, "./_to-object": 119 }], 270: [function (require, module, exports) {
    'use strict';
    // https://tc39.github.io/proposal-flatMap/#sec-Array.prototype.flatten

    var $export = require('./_export');
    var flattenIntoArray = require('./_flatten-into-array');
    var toObject = require('./_to-object');
    var toLength = require('./_to-length');
    var toInteger = require('./_to-integer');
    var arraySpeciesCreate = require('./_array-species-create');

    $export($export.P, 'Array', {
      flatten: function flatten() /* depthArg = 1 */{
        var depthArg = arguments[0];
        var O = toObject(this);
        var sourceLen = toLength(O.length);
        var A = arraySpeciesCreate(O, 0);
        flattenIntoArray(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toInteger(depthArg));
        return A;
      }
    });

    require('./_add-to-unscopables')('flatten');
  }, { "./_add-to-unscopables": 8, "./_array-species-create": 18, "./_export": 36, "./_flatten-into-array": 41, "./_to-integer": 116, "./_to-length": 118, "./_to-object": 119 }], 271: [function (require, module, exports) {
    'use strict';
    // https://github.com/tc39/Array.prototype.includes

    var $export = require('./_export');
    var $includes = require('./_array-includes')(true);

    $export($export.P, 'Array', {
      includes: function includes(el /* , fromIndex = 0 */) {
        return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
      }
    });

    require('./_add-to-unscopables')('includes');
  }, { "./_add-to-unscopables": 8, "./_array-includes": 14, "./_export": 36 }], 272: [function (require, module, exports) {
    // https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-09/sept-25.md#510-globalasap-for-enqueuing-a-microtask
    var $export = require('./_export');
    var microtask = require('./_microtask')();
    var process = require('./_global').process;
    var isNode = require('./_cof')(process) == 'process';

    $export($export.G, {
      asap: function asap(fn) {
        var domain = isNode && process.domain;
        microtask(domain ? domain.bind(fn) : fn);
      }
    });
  }, { "./_cof": 21, "./_export": 36, "./_global": 43, "./_microtask": 70 }], 273: [function (require, module, exports) {
    // https://github.com/ljharb/proposal-is-error
    var $export = require('./_export');
    var cof = require('./_cof');

    $export($export.S, 'Error', {
      isError: function isError(it) {
        return cof(it) === 'Error';
      }
    });
  }, { "./_cof": 21, "./_export": 36 }], 274: [function (require, module, exports) {
    // https://github.com/tc39/proposal-global
    var $export = require('./_export');

    $export($export.G, { global: require('./_global') });
  }, { "./_export": 36, "./_global": 43 }], 275: [function (require, module, exports) {
    // https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
    require('./_set-collection-from')('Map');
  }, { "./_set-collection-from": 97 }], 276: [function (require, module, exports) {
    // https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
    require('./_set-collection-of')('Map');
  }, { "./_set-collection-of": 98 }], 277: [function (require, module, exports) {
    // https://github.com/DavidBruant/Map-Set.prototype.toJSON
    var $export = require('./_export');

    $export($export.P + $export.R, 'Map', { toJSON: require('./_collection-to-json')('Map') });
  }, { "./_collection-to-json": 23, "./_export": 36 }], 278: [function (require, module, exports) {
    // https://rwaldron.github.io/proposal-math-extensions/
    var $export = require('./_export');

    $export($export.S, 'Math', {
      clamp: function clamp(x, lower, upper) {
        return Math.min(upper, Math.max(lower, x));
      }
    });
  }, { "./_export": 36 }], 279: [function (require, module, exports) {
    // https://rwaldron.github.io/proposal-math-extensions/
    var $export = require('./_export');

    $export($export.S, 'Math', { DEG_PER_RAD: Math.PI / 180 });
  }, { "./_export": 36 }], 280: [function (require, module, exports) {
    // https://rwaldron.github.io/proposal-math-extensions/
    var $export = require('./_export');
    var RAD_PER_DEG = 180 / Math.PI;

    $export($export.S, 'Math', {
      degrees: function degrees(radians) {
        return radians * RAD_PER_DEG;
      }
    });
  }, { "./_export": 36 }], 281: [function (require, module, exports) {
    // https://rwaldron.github.io/proposal-math-extensions/
    var $export = require('./_export');
    var scale = require('./_math-scale');
    var fround = require('./_math-fround');

    $export($export.S, 'Math', {
      fscale: function fscale(x, inLow, inHigh, outLow, outHigh) {
        return fround(scale(x, inLow, inHigh, outLow, outHigh));
      }
    });
  }, { "./_export": 36, "./_math-fround": 64, "./_math-scale": 66 }], 282: [function (require, module, exports) {
    // https://gist.github.com/BrendanEich/4294d5c212a6d2254703
    var $export = require('./_export');

    $export($export.S, 'Math', {
      iaddh: function iaddh(x0, x1, y0, y1) {
        var $x0 = x0 >>> 0;
        var $x1 = x1 >>> 0;
        var $y0 = y0 >>> 0;
        return $x1 + (y1 >>> 0) + (($x0 & $y0 | ($x0 | $y0) & ~($x0 + $y0 >>> 0)) >>> 31) | 0;
      }
    });
  }, { "./_export": 36 }], 283: [function (require, module, exports) {
    // https://gist.github.com/BrendanEich/4294d5c212a6d2254703
    var $export = require('./_export');

    $export($export.S, 'Math', {
      imulh: function imulh(u, v) {
        var UINT16 = 0xffff;
        var $u = +u;
        var $v = +v;
        var u0 = $u & UINT16;
        var v0 = $v & UINT16;
        var u1 = $u >> 16;
        var v1 = $v >> 16;
        var t = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
        return u1 * v1 + (t >> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >> 16);
      }
    });
  }, { "./_export": 36 }], 284: [function (require, module, exports) {
    // https://gist.github.com/BrendanEich/4294d5c212a6d2254703
    var $export = require('./_export');

    $export($export.S, 'Math', {
      isubh: function isubh(x0, x1, y0, y1) {
        var $x0 = x0 >>> 0;
        var $x1 = x1 >>> 0;
        var $y0 = y0 >>> 0;
        return $x1 - (y1 >>> 0) - ((~$x0 & $y0 | ~($x0 ^ $y0) & $x0 - $y0 >>> 0) >>> 31) | 0;
      }
    });
  }, { "./_export": 36 }], 285: [function (require, module, exports) {
    // https://rwaldron.github.io/proposal-math-extensions/
    var $export = require('./_export');

    $export($export.S, 'Math', { RAD_PER_DEG: 180 / Math.PI });
  }, { "./_export": 36 }], 286: [function (require, module, exports) {
    // https://rwaldron.github.io/proposal-math-extensions/
    var $export = require('./_export');
    var DEG_PER_RAD = Math.PI / 180;

    $export($export.S, 'Math', {
      radians: function radians(degrees) {
        return degrees * DEG_PER_RAD;
      }
    });
  }, { "./_export": 36 }], 287: [function (require, module, exports) {
    // https://rwaldron.github.io/proposal-math-extensions/
    var $export = require('./_export');

    $export($export.S, 'Math', { scale: require('./_math-scale') });
  }, { "./_export": 36, "./_math-scale": 66 }], 288: [function (require, module, exports) {
    // http://jfbastien.github.io/papers/Math.signbit.html
    var $export = require('./_export');

    $export($export.S, 'Math', { signbit: function signbit(x) {
        // eslint-disable-next-line no-self-compare
        return (x = +x) != x ? x : x == 0 ? 1 / x == Infinity : x > 0;
      } });
  }, { "./_export": 36 }], 289: [function (require, module, exports) {
    // https://gist.github.com/BrendanEich/4294d5c212a6d2254703
    var $export = require('./_export');

    $export($export.S, 'Math', {
      umulh: function umulh(u, v) {
        var UINT16 = 0xffff;
        var $u = +u;
        var $v = +v;
        var u0 = $u & UINT16;
        var v0 = $v & UINT16;
        var u1 = $u >>> 16;
        var v1 = $v >>> 16;
        var t = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
        return u1 * v1 + (t >>> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >>> 16);
      }
    });
  }, { "./_export": 36 }], 290: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var toObject = require('./_to-object');
    var aFunction = require('./_a-function');
    var $defineProperty = require('./_object-dp');

    // B.2.2.2 Object.prototype.__defineGetter__(P, getter)
    require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
      __defineGetter__: function __defineGetter__(P, getter) {
        $defineProperty.f(toObject(this), P, { get: aFunction(getter), enumerable: true, configurable: true });
      }
    });
  }, { "./_a-function": 6, "./_descriptors": 32, "./_export": 36, "./_object-dp": 74, "./_object-forced-pam": 76, "./_to-object": 119 }], 291: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var toObject = require('./_to-object');
    var aFunction = require('./_a-function');
    var $defineProperty = require('./_object-dp');

    // B.2.2.3 Object.prototype.__defineSetter__(P, setter)
    require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
      __defineSetter__: function __defineSetter__(P, setter) {
        $defineProperty.f(toObject(this), P, { set: aFunction(setter), enumerable: true, configurable: true });
      }
    });
  }, { "./_a-function": 6, "./_descriptors": 32, "./_export": 36, "./_object-dp": 74, "./_object-forced-pam": 76, "./_to-object": 119 }], 292: [function (require, module, exports) {
    // https://github.com/tc39/proposal-object-values-entries
    var $export = require('./_export');
    var $entries = require('./_object-to-array')(true);

    $export($export.S, 'Object', {
      entries: function entries(it) {
        return $entries(it);
      }
    });
  }, { "./_export": 36, "./_object-to-array": 86 }], 293: [function (require, module, exports) {
    // https://github.com/tc39/proposal-object-getownpropertydescriptors
    var $export = require('./_export');
    var ownKeys = require('./_own-keys');
    var toIObject = require('./_to-iobject');
    var gOPD = require('./_object-gopd');
    var createProperty = require('./_create-property');

    $export($export.S, 'Object', {
      getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
        var O = toIObject(object);
        var getDesc = gOPD.f;
        var keys = ownKeys(O);
        var result = {};
        var i = 0;
        var key, desc;
        while (keys.length > i) {
          desc = getDesc(O, key = keys[i++]);
          if (desc !== undefined) createProperty(result, key, desc);
        }
        return result;
      }
    });
  }, { "./_create-property": 27, "./_export": 36, "./_object-gopd": 77, "./_own-keys": 87, "./_to-iobject": 117 }], 294: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var toObject = require('./_to-object');
    var toPrimitive = require('./_to-primitive');
    var getPrototypeOf = require('./_object-gpo');
    var getOwnPropertyDescriptor = require('./_object-gopd').f;

    // B.2.2.4 Object.prototype.__lookupGetter__(P)
    require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
      __lookupGetter__: function __lookupGetter__(P) {
        var O = toObject(this);
        var K = toPrimitive(P, true);
        var D;
        do {
          if (D = getOwnPropertyDescriptor(O, K)) return D.get;
        } while (O = getPrototypeOf(O));
      }
    });
  }, { "./_descriptors": 32, "./_export": 36, "./_object-forced-pam": 76, "./_object-gopd": 77, "./_object-gpo": 81, "./_to-object": 119, "./_to-primitive": 120 }], 295: [function (require, module, exports) {
    'use strict';

    var $export = require('./_export');
    var toObject = require('./_to-object');
    var toPrimitive = require('./_to-primitive');
    var getPrototypeOf = require('./_object-gpo');
    var getOwnPropertyDescriptor = require('./_object-gopd').f;

    // B.2.2.5 Object.prototype.__lookupSetter__(P)
    require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
      __lookupSetter__: function __lookupSetter__(P) {
        var O = toObject(this);
        var K = toPrimitive(P, true);
        var D;
        do {
          if (D = getOwnPropertyDescriptor(O, K)) return D.set;
        } while (O = getPrototypeOf(O));
      }
    });
  }, { "./_descriptors": 32, "./_export": 36, "./_object-forced-pam": 76, "./_object-gopd": 77, "./_object-gpo": 81, "./_to-object": 119, "./_to-primitive": 120 }], 296: [function (require, module, exports) {
    // https://github.com/tc39/proposal-object-values-entries
    var $export = require('./_export');
    var $values = require('./_object-to-array')(false);

    $export($export.S, 'Object', {
      values: function values(it) {
        return $values(it);
      }
    });
  }, { "./_export": 36, "./_object-to-array": 86 }], 297: [function (require, module, exports) {
    'use strict';
    // https://github.com/zenparsing/es-observable

    var $export = require('./_export');
    var global = require('./_global');
    var core = require('./_core');
    var microtask = require('./_microtask')();
    var OBSERVABLE = require('./_wks')('observable');
    var aFunction = require('./_a-function');
    var anObject = require('./_an-object');
    var anInstance = require('./_an-instance');
    var redefineAll = require('./_redefine-all');
    var hide = require('./_hide');
    var forOf = require('./_for-of');
    var RETURN = forOf.RETURN;

    var getMethod = function getMethod(fn) {
      return fn == null ? undefined : aFunction(fn);
    };

    var cleanupSubscription = function cleanupSubscription(subscription) {
      var cleanup = subscription._c;
      if (cleanup) {
        subscription._c = undefined;
        cleanup();
      }
    };

    var subscriptionClosed = function subscriptionClosed(subscription) {
      return subscription._o === undefined;
    };

    var closeSubscription = function closeSubscription(subscription) {
      if (!subscriptionClosed(subscription)) {
        subscription._o = undefined;
        cleanupSubscription(subscription);
      }
    };

    var Subscription = function Subscription(observer, subscriber) {
      anObject(observer);
      this._c = undefined;
      this._o = observer;
      observer = new SubscriptionObserver(this);
      try {
        var cleanup = subscriber(observer);
        var subscription = cleanup;
        if (cleanup != null) {
          if (typeof cleanup.unsubscribe === 'function') cleanup = function cleanup() {
            subscription.unsubscribe();
          };else aFunction(cleanup);
          this._c = cleanup;
        }
      } catch (e) {
        observer.error(e);
        return;
      }if (subscriptionClosed(this)) cleanupSubscription(this);
    };

    Subscription.prototype = redefineAll({}, {
      unsubscribe: function unsubscribe() {
        closeSubscription(this);
      }
    });

    var SubscriptionObserver = function SubscriptionObserver(subscription) {
      this._s = subscription;
    };

    SubscriptionObserver.prototype = redefineAll({}, {
      next: function next(value) {
        var subscription = this._s;
        if (!subscriptionClosed(subscription)) {
          var observer = subscription._o;
          try {
            var m = getMethod(observer.next);
            if (m) return m.call(observer, value);
          } catch (e) {
            try {
              closeSubscription(subscription);
            } finally {
              throw e;
            }
          }
        }
      },
      error: function error(value) {
        var subscription = this._s;
        if (subscriptionClosed(subscription)) throw value;
        var observer = subscription._o;
        subscription._o = undefined;
        try {
          var m = getMethod(observer.error);
          if (!m) throw value;
          value = m.call(observer, value);
        } catch (e) {
          try {
            cleanupSubscription(subscription);
          } finally {
            throw e;
          }
        }cleanupSubscription(subscription);
        return value;
      },
      complete: function complete(value) {
        var subscription = this._s;
        if (!subscriptionClosed(subscription)) {
          var observer = subscription._o;
          subscription._o = undefined;
          try {
            var m = getMethod(observer.complete);
            value = m ? m.call(observer, value) : undefined;
          } catch (e) {
            try {
              cleanupSubscription(subscription);
            } finally {
              throw e;
            }
          }cleanupSubscription(subscription);
          return value;
        }
      }
    });

    var $Observable = function Observable(subscriber) {
      anInstance(this, $Observable, 'Observable', '_f')._f = aFunction(subscriber);
    };

    redefineAll($Observable.prototype, {
      subscribe: function subscribe(observer) {
        return new Subscription(observer, this._f);
      },
      forEach: function forEach(fn) {
        var that = this;
        return new (core.Promise || global.Promise)(function (resolve, reject) {
          aFunction(fn);
          var subscription = that.subscribe({
            next: function next(value) {
              try {
                return fn(value);
              } catch (e) {
                reject(e);
                subscription.unsubscribe();
              }
            },
            error: reject,
            complete: resolve
          });
        });
      }
    });

    redefineAll($Observable, {
      from: function from(x) {
        var C = typeof this === 'function' ? this : $Observable;
        var method = getMethod(anObject(x)[OBSERVABLE]);
        if (method) {
          var observable = anObject(method.call(x));
          return observable.constructor === C ? observable : new C(function (observer) {
            return observable.subscribe(observer);
          });
        }
        return new C(function (observer) {
          var done = false;
          microtask(function () {
            if (!done) {
              try {
                if (forOf(x, false, function (it) {
                  observer.next(it);
                  if (done) return RETURN;
                }) === RETURN) return;
              } catch (e) {
                if (done) throw e;
                observer.error(e);
                return;
              }observer.complete();
            }
          });
          return function () {
            done = true;
          };
        });
      },
      of: function of() {
        for (var i = 0, l = arguments.length, items = new Array(l); i < l;) {
          items[i] = arguments[i++];
        }return new (typeof this === 'function' ? this : $Observable)(function (observer) {
          var done = false;
          microtask(function () {
            if (!done) {
              for (var j = 0; j < items.length; ++j) {
                observer.next(items[j]);
                if (done) return;
              }observer.complete();
            }
          });
          return function () {
            done = true;
          };
        });
      }
    });

    hide($Observable.prototype, OBSERVABLE, function () {
      return this;
    });

    $export($export.G, { Observable: $Observable });

    require('./_set-species')('Observable');
  }, { "./_a-function": 6, "./_an-instance": 9, "./_an-object": 10, "./_core": 26, "./_export": 36, "./_for-of": 42, "./_global": 43, "./_hide": 45, "./_microtask": 70, "./_redefine-all": 93, "./_set-species": 100, "./_wks": 129 }], 298: [function (require, module, exports) {
    // https://github.com/tc39/proposal-promise-finally
    'use strict';

    var $export = require('./_export');
    var core = require('./_core');
    var global = require('./_global');
    var speciesConstructor = require('./_species-constructor');
    var promiseResolve = require('./_promise-resolve');

    $export($export.P + $export.R, 'Promise', { 'finally': function _finally(onFinally) {
        var C = speciesConstructor(this, core.Promise || global.Promise);
        var isFunction = typeof onFinally == 'function';
        return this.then(isFunction ? function (x) {
          return promiseResolve(C, onFinally()).then(function () {
            return x;
          });
        } : onFinally, isFunction ? function (e) {
          return promiseResolve(C, onFinally()).then(function () {
            throw e;
          });
        } : onFinally);
      } });
  }, { "./_core": 26, "./_export": 36, "./_global": 43, "./_promise-resolve": 91, "./_species-constructor": 104 }], 299: [function (require, module, exports) {
    'use strict';
    // https://github.com/tc39/proposal-promise-try

    var $export = require('./_export');
    var newPromiseCapability = require('./_new-promise-capability');
    var perform = require('./_perform');

    $export($export.S, 'Promise', { 'try': function _try(callbackfn) {
        var promiseCapability = newPromiseCapability.f(this);
        var result = perform(callbackfn);
        (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
        return promiseCapability.promise;
      } });
  }, { "./_export": 36, "./_new-promise-capability": 71, "./_perform": 90 }], 300: [function (require, module, exports) {
    var metadata = require('./_metadata');
    var anObject = require('./_an-object');
    var toMetaKey = metadata.key;
    var ordinaryDefineOwnMetadata = metadata.set;

    metadata.exp({ defineMetadata: function defineMetadata(metadataKey, metadataValue, target, targetKey) {
        ordinaryDefineOwnMetadata(metadataKey, metadataValue, anObject(target), toMetaKey(targetKey));
      } });
  }, { "./_an-object": 10, "./_metadata": 69 }], 301: [function (require, module, exports) {
    var metadata = require('./_metadata');
    var anObject = require('./_an-object');
    var toMetaKey = metadata.key;
    var getOrCreateMetadataMap = metadata.map;
    var store = metadata.store;

    metadata.exp({ deleteMetadata: function deleteMetadata(metadataKey, target /* , targetKey */) {
        var targetKey = arguments.length < 3 ? undefined : toMetaKey(arguments[2]);
        var metadataMap = getOrCreateMetadataMap(anObject(target), targetKey, false);
        if (metadataMap === undefined || !metadataMap['delete'](metadataKey)) return false;
        if (metadataMap.size) return true;
        var targetMetadata = store.get(target);
        targetMetadata['delete'](targetKey);
        return !!targetMetadata.size || store['delete'](target);
      } });
  }, { "./_an-object": 10, "./_metadata": 69 }], 302: [function (require, module, exports) {
    var Set = require('./es6.set');
    var from = require('./_array-from-iterable');
    var metadata = require('./_metadata');
    var anObject = require('./_an-object');
    var getPrototypeOf = require('./_object-gpo');
    var ordinaryOwnMetadataKeys = metadata.keys;
    var toMetaKey = metadata.key;

    var ordinaryMetadataKeys = function ordinaryMetadataKeys(O, P) {
      var oKeys = ordinaryOwnMetadataKeys(O, P);
      var parent = getPrototypeOf(O);
      if (parent === null) return oKeys;
      var pKeys = ordinaryMetadataKeys(parent, P);
      return pKeys.length ? oKeys.length ? from(new Set(oKeys.concat(pKeys))) : pKeys : oKeys;
    };

    metadata.exp({ getMetadataKeys: function getMetadataKeys(target /* , targetKey */) {
        return ordinaryMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
      } });
  }, { "./_an-object": 10, "./_array-from-iterable": 13, "./_metadata": 69, "./_object-gpo": 81, "./es6.set": 232 }], 303: [function (require, module, exports) {
    var metadata = require('./_metadata');
    var anObject = require('./_an-object');
    var getPrototypeOf = require('./_object-gpo');
    var ordinaryHasOwnMetadata = metadata.has;
    var ordinaryGetOwnMetadata = metadata.get;
    var toMetaKey = metadata.key;

    var ordinaryGetMetadata = function ordinaryGetMetadata(MetadataKey, O, P) {
      var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
      if (hasOwn) return ordinaryGetOwnMetadata(MetadataKey, O, P);
      var parent = getPrototypeOf(O);
      return parent !== null ? ordinaryGetMetadata(MetadataKey, parent, P) : undefined;
    };

    metadata.exp({ getMetadata: function getMetadata(metadataKey, target /* , targetKey */) {
        return ordinaryGetMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
      } });
  }, { "./_an-object": 10, "./_metadata": 69, "./_object-gpo": 81 }], 304: [function (require, module, exports) {
    var metadata = require('./_metadata');
    var anObject = require('./_an-object');
    var ordinaryOwnMetadataKeys = metadata.keys;
    var toMetaKey = metadata.key;

    metadata.exp({ getOwnMetadataKeys: function getOwnMetadataKeys(target /* , targetKey */) {
        return ordinaryOwnMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
      } });
  }, { "./_an-object": 10, "./_metadata": 69 }], 305: [function (require, module, exports) {
    var metadata = require('./_metadata');
    var anObject = require('./_an-object');
    var ordinaryGetOwnMetadata = metadata.get;
    var toMetaKey = metadata.key;

    metadata.exp({ getOwnMetadata: function getOwnMetadata(metadataKey, target /* , targetKey */) {
        return ordinaryGetOwnMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
      } });
  }, { "./_an-object": 10, "./_metadata": 69 }], 306: [function (require, module, exports) {
    var metadata = require('./_metadata');
    var anObject = require('./_an-object');
    var getPrototypeOf = require('./_object-gpo');
    var ordinaryHasOwnMetadata = metadata.has;
    var toMetaKey = metadata.key;

    var ordinaryHasMetadata = function ordinaryHasMetadata(MetadataKey, O, P) {
      var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
      if (hasOwn) return true;
      var parent = getPrototypeOf(O);
      return parent !== null ? ordinaryHasMetadata(MetadataKey, parent, P) : false;
    };

    metadata.exp({ hasMetadata: function hasMetadata(metadataKey, target /* , targetKey */) {
        return ordinaryHasMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
      } });
  }, { "./_an-object": 10, "./_metadata": 69, "./_object-gpo": 81 }], 307: [function (require, module, exports) {
    var metadata = require('./_metadata');
    var anObject = require('./_an-object');
    var ordinaryHasOwnMetadata = metadata.has;
    var toMetaKey = metadata.key;

    metadata.exp({ hasOwnMetadata: function hasOwnMetadata(metadataKey, target /* , targetKey */) {
        return ordinaryHasOwnMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
      } });
  }, { "./_an-object": 10, "./_metadata": 69 }], 308: [function (require, module, exports) {
    var $metadata = require('./_metadata');
    var anObject = require('./_an-object');
    var aFunction = require('./_a-function');
    var toMetaKey = $metadata.key;
    var ordinaryDefineOwnMetadata = $metadata.set;

    $metadata.exp({ metadata: function metadata(metadataKey, metadataValue) {
        return function decorator(target, targetKey) {
          ordinaryDefineOwnMetadata(metadataKey, metadataValue, (targetKey !== undefined ? anObject : aFunction)(target), toMetaKey(targetKey));
        };
      } });
  }, { "./_a-function": 6, "./_an-object": 10, "./_metadata": 69 }], 309: [function (require, module, exports) {
    // https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
    require('./_set-collection-from')('Set');
  }, { "./_set-collection-from": 97 }], 310: [function (require, module, exports) {
    // https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
    require('./_set-collection-of')('Set');
  }, { "./_set-collection-of": 98 }], 311: [function (require, module, exports) {
    // https://github.com/DavidBruant/Map-Set.prototype.toJSON
    var $export = require('./_export');

    $export($export.P + $export.R, 'Set', { toJSON: require('./_collection-to-json')('Set') });
  }, { "./_collection-to-json": 23, "./_export": 36 }], 312: [function (require, module, exports) {
    'use strict';
    // https://github.com/mathiasbynens/String.prototype.at

    var $export = require('./_export');
    var $at = require('./_string-at')(true);

    $export($export.P, 'String', {
      at: function at(pos) {
        return $at(this, pos);
      }
    });
  }, { "./_export": 36, "./_string-at": 106 }], 313: [function (require, module, exports) {
    'use strict';
    // https://tc39.github.io/String.prototype.matchAll/

    var $export = require('./_export');
    var defined = require('./_defined');
    var toLength = require('./_to-length');
    var isRegExp = require('./_is-regexp');
    var getFlags = require('./_flags');
    var RegExpProto = RegExp.prototype;

    var $RegExpStringIterator = function $RegExpStringIterator(regexp, string) {
      this._r = regexp;
      this._s = string;
    };

    require('./_iter-create')($RegExpStringIterator, 'RegExp String', function next() {
      var match = this._r.exec(this._s);
      return { value: match, done: match === null };
    });

    $export($export.P, 'String', {
      matchAll: function matchAll(regexp) {
        defined(this);
        if (!isRegExp(regexp)) throw TypeError(regexp + ' is not a regexp!');
        var S = String(this);
        var flags = 'flags' in RegExpProto ? String(regexp.flags) : getFlags.call(regexp);
        var rx = new RegExp(regexp.source, ~flags.indexOf('g') ? flags : 'g' + flags);
        rx.lastIndex = toLength(regexp.lastIndex);
        return new $RegExpStringIterator(rx, S);
      }
    });
  }, { "./_defined": 31, "./_export": 36, "./_flags": 40, "./_is-regexp": 55, "./_iter-create": 57, "./_to-length": 118 }], 314: [function (require, module, exports) {
    'use strict';
    // https://github.com/tc39/proposal-string-pad-start-end

    var $export = require('./_export');
    var $pad = require('./_string-pad');
    var userAgent = require('./_user-agent');

    // https://github.com/zloirock/core-js/issues/280
    $export($export.P + $export.F * /Version\/10\.\d+(\.\d+)? Safari\//.test(userAgent), 'String', {
      padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
        return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
      }
    });
  }, { "./_export": 36, "./_string-pad": 109, "./_user-agent": 125 }], 315: [function (require, module, exports) {
    'use strict';
    // https://github.com/tc39/proposal-string-pad-start-end

    var $export = require('./_export');
    var $pad = require('./_string-pad');
    var userAgent = require('./_user-agent');

    // https://github.com/zloirock/core-js/issues/280
    $export($export.P + $export.F * /Version\/10\.\d+(\.\d+)? Safari\//.test(userAgent), 'String', {
      padStart: function padStart(maxLength /* , fillString = ' ' */) {
        return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
      }
    });
  }, { "./_export": 36, "./_string-pad": 109, "./_user-agent": 125 }], 316: [function (require, module, exports) {
    'use strict';
    // https://github.com/sebmarkbage/ecmascript-string-left-right-trim

    require('./_string-trim')('trimLeft', function ($trim) {
      return function trimLeft() {
        return $trim(this, 1);
      };
    }, 'trimStart');
  }, { "./_string-trim": 111 }], 317: [function (require, module, exports) {
    'use strict';
    // https://github.com/sebmarkbage/ecmascript-string-left-right-trim

    require('./_string-trim')('trimRight', function ($trim) {
      return function trimRight() {
        return $trim(this, 2);
      };
    }, 'trimEnd');
  }, { "./_string-trim": 111 }], 318: [function (require, module, exports) {
    require('./_wks-define')('asyncIterator');
  }, { "./_wks-define": 127 }], 319: [function (require, module, exports) {
    require('./_wks-define')('observable');
  }, { "./_wks-define": 127 }], 320: [function (require, module, exports) {
    // https://github.com/tc39/proposal-global
    var $export = require('./_export');

    $export($export.S, 'System', { global: require('./_global') });
  }, { "./_export": 36, "./_global": 43 }], 321: [function (require, module, exports) {
    // https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.from
    require('./_set-collection-from')('WeakMap');
  }, { "./_set-collection-from": 97 }], 322: [function (require, module, exports) {
    // https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.of
    require('./_set-collection-of')('WeakMap');
  }, { "./_set-collection-of": 98 }], 323: [function (require, module, exports) {
    // https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.from
    require('./_set-collection-from')('WeakSet');
  }, { "./_set-collection-from": 97 }], 324: [function (require, module, exports) {
    // https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.of
    require('./_set-collection-of')('WeakSet');
  }, { "./_set-collection-of": 98 }], 325: [function (require, module, exports) {
    var $iterators = require('./es6.array.iterator');
    var getKeys = require('./_object-keys');
    var redefine = require('./_redefine');
    var global = require('./_global');
    var hide = require('./_hide');
    var Iterators = require('./_iterators');
    var wks = require('./_wks');
    var ITERATOR = wks('iterator');
    var TO_STRING_TAG = wks('toStringTag');
    var ArrayValues = Iterators.Array;

    var DOMIterables = {
      CSSRuleList: true, // TODO: Not spec compliant, should be false.
      CSSStyleDeclaration: false,
      CSSValueList: false,
      ClientRectList: false,
      DOMRectList: false,
      DOMStringList: false,
      DOMTokenList: true,
      DataTransferItemList: false,
      FileList: false,
      HTMLAllCollection: false,
      HTMLCollection: false,
      HTMLFormElement: false,
      HTMLSelectElement: false,
      MediaList: true, // TODO: Not spec compliant, should be false.
      MimeTypeArray: false,
      NamedNodeMap: false,
      NodeList: true,
      PaintRequestList: false,
      Plugin: false,
      PluginArray: false,
      SVGLengthList: false,
      SVGNumberList: false,
      SVGPathSegList: false,
      SVGPointList: false,
      SVGStringList: false,
      SVGTransformList: false,
      SourceBufferList: false,
      StyleSheetList: true, // TODO: Not spec compliant, should be false.
      TextTrackCueList: false,
      TextTrackList: false,
      TouchList: false
    };

    for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
      var NAME = collections[i];
      var explicit = DOMIterables[NAME];
      var Collection = global[NAME];
      var proto = Collection && Collection.prototype;
      var key;
      if (proto) {
        if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
        if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
        Iterators[NAME] = ArrayValues;
        if (explicit) for (key in $iterators) {
          if (!proto[key]) redefine(proto, key, $iterators[key], true);
        }
      }
    }
  }, { "./_global": 43, "./_hide": 45, "./_iterators": 61, "./_object-keys": 83, "./_redefine": 94, "./_wks": 129, "./es6.array.iterator": 142 }], 326: [function (require, module, exports) {
    var $export = require('./_export');
    var $task = require('./_task');
    $export($export.G + $export.B, {
      setImmediate: $task.set,
      clearImmediate: $task.clear
    });
  }, { "./_export": 36, "./_task": 113 }], 327: [function (require, module, exports) {
    // ie9- setTimeout & setInterval additional parameters fix
    var global = require('./_global');
    var $export = require('./_export');
    var userAgent = require('./_user-agent');
    var slice = [].slice;
    var MSIE = /MSIE .\./.test(userAgent); // <- dirty ie9- check
    var wrap = function wrap(set) {
      return function (fn, time /* , ...args */) {
        var boundArgs = arguments.length > 2;
        var args = boundArgs ? slice.call(arguments, 2) : false;
        return set(boundArgs ? function () {
          // eslint-disable-next-line no-new-func
          (typeof fn == 'function' ? fn : Function(fn)).apply(this, args);
        } : fn, time);
      };
    };
    $export($export.G + $export.B + $export.F * MSIE, {
      setTimeout: wrap(global.setTimeout),
      setInterval: wrap(global.setInterval)
    });
  }, { "./_export": 36, "./_global": 43, "./_user-agent": 125 }], 328: [function (require, module, exports) {
    require('./modules/es6.symbol');
    require('./modules/es6.object.create');
    require('./modules/es6.object.define-property');
    require('./modules/es6.object.define-properties');
    require('./modules/es6.object.get-own-property-descriptor');
    require('./modules/es6.object.get-prototype-of');
    require('./modules/es6.object.keys');
    require('./modules/es6.object.get-own-property-names');
    require('./modules/es6.object.freeze');
    require('./modules/es6.object.seal');
    require('./modules/es6.object.prevent-extensions');
    require('./modules/es6.object.is-frozen');
    require('./modules/es6.object.is-sealed');
    require('./modules/es6.object.is-extensible');
    require('./modules/es6.object.assign');
    require('./modules/es6.object.is');
    require('./modules/es6.object.set-prototype-of');
    require('./modules/es6.object.to-string');
    require('./modules/es6.function.bind');
    require('./modules/es6.function.name');
    require('./modules/es6.function.has-instance');
    require('./modules/es6.parse-int');
    require('./modules/es6.parse-float');
    require('./modules/es6.number.constructor');
    require('./modules/es6.number.to-fixed');
    require('./modules/es6.number.to-precision');
    require('./modules/es6.number.epsilon');
    require('./modules/es6.number.is-finite');
    require('./modules/es6.number.is-integer');
    require('./modules/es6.number.is-nan');
    require('./modules/es6.number.is-safe-integer');
    require('./modules/es6.number.max-safe-integer');
    require('./modules/es6.number.min-safe-integer');
    require('./modules/es6.number.parse-float');
    require('./modules/es6.number.parse-int');
    require('./modules/es6.math.acosh');
    require('./modules/es6.math.asinh');
    require('./modules/es6.math.atanh');
    require('./modules/es6.math.cbrt');
    require('./modules/es6.math.clz32');
    require('./modules/es6.math.cosh');
    require('./modules/es6.math.expm1');
    require('./modules/es6.math.fround');
    require('./modules/es6.math.hypot');
    require('./modules/es6.math.imul');
    require('./modules/es6.math.log10');
    require('./modules/es6.math.log1p');
    require('./modules/es6.math.log2');
    require('./modules/es6.math.sign');
    require('./modules/es6.math.sinh');
    require('./modules/es6.math.tanh');
    require('./modules/es6.math.trunc');
    require('./modules/es6.string.from-code-point');
    require('./modules/es6.string.raw');
    require('./modules/es6.string.trim');
    require('./modules/es6.string.iterator');
    require('./modules/es6.string.code-point-at');
    require('./modules/es6.string.ends-with');
    require('./modules/es6.string.includes');
    require('./modules/es6.string.repeat');
    require('./modules/es6.string.starts-with');
    require('./modules/es6.string.anchor');
    require('./modules/es6.string.big');
    require('./modules/es6.string.blink');
    require('./modules/es6.string.bold');
    require('./modules/es6.string.fixed');
    require('./modules/es6.string.fontcolor');
    require('./modules/es6.string.fontsize');
    require('./modules/es6.string.italics');
    require('./modules/es6.string.link');
    require('./modules/es6.string.small');
    require('./modules/es6.string.strike');
    require('./modules/es6.string.sub');
    require('./modules/es6.string.sup');
    require('./modules/es6.date.now');
    require('./modules/es6.date.to-json');
    require('./modules/es6.date.to-iso-string');
    require('./modules/es6.date.to-string');
    require('./modules/es6.date.to-primitive');
    require('./modules/es6.array.is-array');
    require('./modules/es6.array.from');
    require('./modules/es6.array.of');
    require('./modules/es6.array.join');
    require('./modules/es6.array.slice');
    require('./modules/es6.array.sort');
    require('./modules/es6.array.for-each');
    require('./modules/es6.array.map');
    require('./modules/es6.array.filter');
    require('./modules/es6.array.some');
    require('./modules/es6.array.every');
    require('./modules/es6.array.reduce');
    require('./modules/es6.array.reduce-right');
    require('./modules/es6.array.index-of');
    require('./modules/es6.array.last-index-of');
    require('./modules/es6.array.copy-within');
    require('./modules/es6.array.fill');
    require('./modules/es6.array.find');
    require('./modules/es6.array.find-index');
    require('./modules/es6.array.species');
    require('./modules/es6.array.iterator');
    require('./modules/es6.regexp.constructor');
    require('./modules/es6.regexp.to-string');
    require('./modules/es6.regexp.flags');
    require('./modules/es6.regexp.match');
    require('./modules/es6.regexp.replace');
    require('./modules/es6.regexp.search');
    require('./modules/es6.regexp.split');
    require('./modules/es6.promise');
    require('./modules/es6.map');
    require('./modules/es6.set');
    require('./modules/es6.weak-map');
    require('./modules/es6.weak-set');
    require('./modules/es6.typed.array-buffer');
    require('./modules/es6.typed.data-view');
    require('./modules/es6.typed.int8-array');
    require('./modules/es6.typed.uint8-array');
    require('./modules/es6.typed.uint8-clamped-array');
    require('./modules/es6.typed.int16-array');
    require('./modules/es6.typed.uint16-array');
    require('./modules/es6.typed.int32-array');
    require('./modules/es6.typed.uint32-array');
    require('./modules/es6.typed.float32-array');
    require('./modules/es6.typed.float64-array');
    require('./modules/es6.reflect.apply');
    require('./modules/es6.reflect.construct');
    require('./modules/es6.reflect.define-property');
    require('./modules/es6.reflect.delete-property');
    require('./modules/es6.reflect.enumerate');
    require('./modules/es6.reflect.get');
    require('./modules/es6.reflect.get-own-property-descriptor');
    require('./modules/es6.reflect.get-prototype-of');
    require('./modules/es6.reflect.has');
    require('./modules/es6.reflect.is-extensible');
    require('./modules/es6.reflect.own-keys');
    require('./modules/es6.reflect.prevent-extensions');
    require('./modules/es6.reflect.set');
    require('./modules/es6.reflect.set-prototype-of');
    require('./modules/es7.array.includes');
    require('./modules/es7.array.flat-map');
    require('./modules/es7.array.flatten');
    require('./modules/es7.string.at');
    require('./modules/es7.string.pad-start');
    require('./modules/es7.string.pad-end');
    require('./modules/es7.string.trim-left');
    require('./modules/es7.string.trim-right');
    require('./modules/es7.string.match-all');
    require('./modules/es7.symbol.async-iterator');
    require('./modules/es7.symbol.observable');
    require('./modules/es7.object.get-own-property-descriptors');
    require('./modules/es7.object.values');
    require('./modules/es7.object.entries');
    require('./modules/es7.object.define-getter');
    require('./modules/es7.object.define-setter');
    require('./modules/es7.object.lookup-getter');
    require('./modules/es7.object.lookup-setter');
    require('./modules/es7.map.to-json');
    require('./modules/es7.set.to-json');
    require('./modules/es7.map.of');
    require('./modules/es7.set.of');
    require('./modules/es7.weak-map.of');
    require('./modules/es7.weak-set.of');
    require('./modules/es7.map.from');
    require('./modules/es7.set.from');
    require('./modules/es7.weak-map.from');
    require('./modules/es7.weak-set.from');
    require('./modules/es7.global');
    require('./modules/es7.system.global');
    require('./modules/es7.error.is-error');
    require('./modules/es7.math.clamp');
    require('./modules/es7.math.deg-per-rad');
    require('./modules/es7.math.degrees');
    require('./modules/es7.math.fscale');
    require('./modules/es7.math.iaddh');
    require('./modules/es7.math.isubh');
    require('./modules/es7.math.imulh');
    require('./modules/es7.math.rad-per-deg');
    require('./modules/es7.math.radians');
    require('./modules/es7.math.scale');
    require('./modules/es7.math.umulh');
    require('./modules/es7.math.signbit');
    require('./modules/es7.promise.finally');
    require('./modules/es7.promise.try');
    require('./modules/es7.reflect.define-metadata');
    require('./modules/es7.reflect.delete-metadata');
    require('./modules/es7.reflect.get-metadata');
    require('./modules/es7.reflect.get-metadata-keys');
    require('./modules/es7.reflect.get-own-metadata');
    require('./modules/es7.reflect.get-own-metadata-keys');
    require('./modules/es7.reflect.has-metadata');
    require('./modules/es7.reflect.has-own-metadata');
    require('./modules/es7.reflect.metadata');
    require('./modules/es7.asap');
    require('./modules/es7.observable');
    require('./modules/web.timers');
    require('./modules/web.immediate');
    require('./modules/web.dom.iterable');
    module.exports = require('./modules/_core');
  }, { "./modules/_core": 26, "./modules/es6.array.copy-within": 132, "./modules/es6.array.every": 133, "./modules/es6.array.fill": 134, "./modules/es6.array.filter": 135, "./modules/es6.array.find": 137, "./modules/es6.array.find-index": 136, "./modules/es6.array.for-each": 138, "./modules/es6.array.from": 139, "./modules/es6.array.index-of": 140, "./modules/es6.array.is-array": 141, "./modules/es6.array.iterator": 142, "./modules/es6.array.join": 143, "./modules/es6.array.last-index-of": 144, "./modules/es6.array.map": 145, "./modules/es6.array.of": 146, "./modules/es6.array.reduce": 148, "./modules/es6.array.reduce-right": 147, "./modules/es6.array.slice": 149, "./modules/es6.array.some": 150, "./modules/es6.array.sort": 151, "./modules/es6.array.species": 152, "./modules/es6.date.now": 153, "./modules/es6.date.to-iso-string": 154, "./modules/es6.date.to-json": 155, "./modules/es6.date.to-primitive": 156, "./modules/es6.date.to-string": 157, "./modules/es6.function.bind": 158, "./modules/es6.function.has-instance": 159, "./modules/es6.function.name": 160, "./modules/es6.map": 161, "./modules/es6.math.acosh": 162, "./modules/es6.math.asinh": 163, "./modules/es6.math.atanh": 164, "./modules/es6.math.cbrt": 165, "./modules/es6.math.clz32": 166, "./modules/es6.math.cosh": 167, "./modules/es6.math.expm1": 168, "./modules/es6.math.fround": 169, "./modules/es6.math.hypot": 170, "./modules/es6.math.imul": 171, "./modules/es6.math.log10": 172, "./modules/es6.math.log1p": 173, "./modules/es6.math.log2": 174, "./modules/es6.math.sign": 175, "./modules/es6.math.sinh": 176, "./modules/es6.math.tanh": 177, "./modules/es6.math.trunc": 178, "./modules/es6.number.constructor": 179, "./modules/es6.number.epsilon": 180, "./modules/es6.number.is-finite": 181, "./modules/es6.number.is-integer": 182, "./modules/es6.number.is-nan": 183, "./modules/es6.number.is-safe-integer": 184, "./modules/es6.number.max-safe-integer": 185, "./modules/es6.number.min-safe-integer": 186, "./modules/es6.number.parse-float": 187, "./modules/es6.number.parse-int": 188, "./modules/es6.number.to-fixed": 189, "./modules/es6.number.to-precision": 190, "./modules/es6.object.assign": 191, "./modules/es6.object.create": 192, "./modules/es6.object.define-properties": 193, "./modules/es6.object.define-property": 194, "./modules/es6.object.freeze": 195, "./modules/es6.object.get-own-property-descriptor": 196, "./modules/es6.object.get-own-property-names": 197, "./modules/es6.object.get-prototype-of": 198, "./modules/es6.object.is": 202, "./modules/es6.object.is-extensible": 199, "./modules/es6.object.is-frozen": 200, "./modules/es6.object.is-sealed": 201, "./modules/es6.object.keys": 203, "./modules/es6.object.prevent-extensions": 204, "./modules/es6.object.seal": 205, "./modules/es6.object.set-prototype-of": 206, "./modules/es6.object.to-string": 207, "./modules/es6.parse-float": 208, "./modules/es6.parse-int": 209, "./modules/es6.promise": 210, "./modules/es6.reflect.apply": 211, "./modules/es6.reflect.construct": 212, "./modules/es6.reflect.define-property": 213, "./modules/es6.reflect.delete-property": 214, "./modules/es6.reflect.enumerate": 215, "./modules/es6.reflect.get": 218, "./modules/es6.reflect.get-own-property-descriptor": 216, "./modules/es6.reflect.get-prototype-of": 217, "./modules/es6.reflect.has": 219, "./modules/es6.reflect.is-extensible": 220, "./modules/es6.reflect.own-keys": 221, "./modules/es6.reflect.prevent-extensions": 222, "./modules/es6.reflect.set": 224, "./modules/es6.reflect.set-prototype-of": 223, "./modules/es6.regexp.constructor": 225, "./modules/es6.regexp.flags": 226, "./modules/es6.regexp.match": 227, "./modules/es6.regexp.replace": 228, "./modules/es6.regexp.search": 229, "./modules/es6.regexp.split": 230, "./modules/es6.regexp.to-string": 231, "./modules/es6.set": 232, "./modules/es6.string.anchor": 233, "./modules/es6.string.big": 234, "./modules/es6.string.blink": 235, "./modules/es6.string.bold": 236, "./modules/es6.string.code-point-at": 237, "./modules/es6.string.ends-with": 238, "./modules/es6.string.fixed": 239, "./modules/es6.string.fontcolor": 240, "./modules/es6.string.fontsize": 241, "./modules/es6.string.from-code-point": 242, "./modules/es6.string.includes": 243, "./modules/es6.string.italics": 244, "./modules/es6.string.iterator": 245, "./modules/es6.string.link": 246, "./modules/es6.string.raw": 247, "./modules/es6.string.repeat": 248, "./modules/es6.string.small": 249, "./modules/es6.string.starts-with": 250, "./modules/es6.string.strike": 251, "./modules/es6.string.sub": 252, "./modules/es6.string.sup": 253, "./modules/es6.string.trim": 254, "./modules/es6.symbol": 255, "./modules/es6.typed.array-buffer": 256, "./modules/es6.typed.data-view": 257, "./modules/es6.typed.float32-array": 258, "./modules/es6.typed.float64-array": 259, "./modules/es6.typed.int16-array": 260, "./modules/es6.typed.int32-array": 261, "./modules/es6.typed.int8-array": 262, "./modules/es6.typed.uint16-array": 263, "./modules/es6.typed.uint32-array": 264, "./modules/es6.typed.uint8-array": 265, "./modules/es6.typed.uint8-clamped-array": 266, "./modules/es6.weak-map": 267, "./modules/es6.weak-set": 268, "./modules/es7.array.flat-map": 269, "./modules/es7.array.flatten": 270, "./modules/es7.array.includes": 271, "./modules/es7.asap": 272, "./modules/es7.error.is-error": 273, "./modules/es7.global": 274, "./modules/es7.map.from": 275, "./modules/es7.map.of": 276, "./modules/es7.map.to-json": 277, "./modules/es7.math.clamp": 278, "./modules/es7.math.deg-per-rad": 279, "./modules/es7.math.degrees": 280, "./modules/es7.math.fscale": 281, "./modules/es7.math.iaddh": 282, "./modules/es7.math.imulh": 283, "./modules/es7.math.isubh": 284, "./modules/es7.math.rad-per-deg": 285, "./modules/es7.math.radians": 286, "./modules/es7.math.scale": 287, "./modules/es7.math.signbit": 288, "./modules/es7.math.umulh": 289, "./modules/es7.object.define-getter": 290, "./modules/es7.object.define-setter": 291, "./modules/es7.object.entries": 292, "./modules/es7.object.get-own-property-descriptors": 293, "./modules/es7.object.lookup-getter": 294, "./modules/es7.object.lookup-setter": 295, "./modules/es7.object.values": 296, "./modules/es7.observable": 297, "./modules/es7.promise.finally": 298, "./modules/es7.promise.try": 299, "./modules/es7.reflect.define-metadata": 300, "./modules/es7.reflect.delete-metadata": 301, "./modules/es7.reflect.get-metadata": 303, "./modules/es7.reflect.get-metadata-keys": 302, "./modules/es7.reflect.get-own-metadata": 305, "./modules/es7.reflect.get-own-metadata-keys": 304, "./modules/es7.reflect.has-metadata": 306, "./modules/es7.reflect.has-own-metadata": 307, "./modules/es7.reflect.metadata": 308, "./modules/es7.set.from": 309, "./modules/es7.set.of": 310, "./modules/es7.set.to-json": 311, "./modules/es7.string.at": 312, "./modules/es7.string.match-all": 313, "./modules/es7.string.pad-end": 314, "./modules/es7.string.pad-start": 315, "./modules/es7.string.trim-left": 316, "./modules/es7.string.trim-right": 317, "./modules/es7.symbol.async-iterator": 318, "./modules/es7.symbol.observable": 319, "./modules/es7.system.global": 320, "./modules/es7.weak-map.from": 321, "./modules/es7.weak-map.of": 322, "./modules/es7.weak-set.from": 323, "./modules/es7.weak-set.of": 324, "./modules/web.dom.iterable": 325, "./modules/web.immediate": 326, "./modules/web.timers": 327 }], 329: [function (require, module, exports) {
    exports.read = function (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];

      i += d;

      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };

    exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

      buffer[offset + i - d] |= s * 128;
    };
  }, {}], 330: [function (require, module, exports) {
    // shim for using process in browser
    var process = module.exports = {};

    // cached from whatever global is present so that test runners that stub it
    // don't break things.  But we need to wrap it in a try catch in case it is
    // wrapped in strict mode code which doesn't define any globals.  It's inside a
    // function because try/catches deoptimize in certain engines.

    var cachedSetTimeout;
    var cachedClearTimeout;

    function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout() {
      throw new Error('clearTimeout has not been defined');
    }
    (function () {
      try {
        if (typeof setTimeout === 'function') {
          cachedSetTimeout = setTimeout;
        } else {
          cachedSetTimeout = defaultSetTimout;
        }
      } catch (e) {
        cachedSetTimeout = defaultSetTimout;
      }
      try {
        if (typeof clearTimeout === 'function') {
          cachedClearTimeout = clearTimeout;
        } else {
          cachedClearTimeout = defaultClearTimeout;
        }
      } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
      }
    })();
    function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
      }
      // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
      }
      try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
      } catch (e) {
        try {
          // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
          return cachedSetTimeout.call(null, fun, 0);
        } catch (e) {
          // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
          return cachedSetTimeout.call(this, fun, 0);
        }
      }
    }
    function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
      }
      // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
      }
      try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
      } catch (e) {
        try {
          // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
          return cachedClearTimeout.call(null, marker);
        } catch (e) {
          // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
          // Some versions of I.E. have different rules for clearTimeout vs setTimeout
          return cachedClearTimeout.call(this, marker);
        }
      }
    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
      if (!draining || !currentQueue) {
        return;
      }
      draining = false;
      if (currentQueue.length) {
        queue = currentQueue.concat(queue);
      } else {
        queueIndex = -1;
      }
      if (queue.length) {
        drainQueue();
      }
    }

    function drainQueue() {
      if (draining) {
        return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;

      var len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
          if (currentQueue) {
            currentQueue[queueIndex].run();
          }
        }
        queueIndex = -1;
        len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
    }

    process.nextTick = function (fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
          args[i - 1] = arguments[i];
        }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
      }
    };

    // v8 likes predictible objects
    function Item(fun, array) {
      this.fun = fun;
      this.array = array;
    }
    Item.prototype.run = function () {
      this.fun.apply(null, this.array);
    };
    process.title = 'browser';
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = ''; // empty string to avoid regexp issues
    process.versions = {};

    function noop() {}

    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.prependListener = noop;
    process.prependOnceListener = noop;

    process.listeners = function (name) {
      return [];
    };

    process.binding = function (name) {
      throw new Error('process.binding is not supported');
    };

    process.cwd = function () {
      return '/';
    };
    process.chdir = function (dir) {
      throw new Error('process.chdir is not supported');
    };
    process.umask = function () {
      return 0;
    };
  }, {}], 331: [function (require, module, exports) {
    (function (global) {
      /**
       * Copyright (c) 2014, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the BSD-style license found in the
       * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
       * additional grant of patent rights can be found in the PATENTS file in
       * the same directory.
       */

      !function (global) {
        "use strict";

        var Op = Object.prototype;
        var hasOwn = Op.hasOwnProperty;
        var undefined; // More compressible than void 0.
        var $Symbol = typeof Symbol === "function" ? Symbol : {};
        var iteratorSymbol = $Symbol.iterator || "@@iterator";
        var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
        var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

        var inModule = (typeof module === "undefined" ? "undefined" : _typeof(module)) === "object";
        var runtime = global.regeneratorRuntime;
        if (runtime) {
          if (inModule) {
            // If regeneratorRuntime is defined globally and we're in a module,
            // make the exports object identical to regeneratorRuntime.
            module.exports = runtime;
          }
          // Don't bother evaluating the rest of this file if the runtime was
          // already defined globally.
          return;
        }

        // Define the runtime globally (as expected by generated code) as either
        // module.exports (if we're in a module) or a new, empty object.
        runtime = global.regeneratorRuntime = inModule ? module.exports : {};

        function wrap(innerFn, outerFn, self, tryLocsList) {
          // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
          var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
          var generator = Object.create(protoGenerator.prototype);
          var context = new Context(tryLocsList || []);

          // The ._invoke method unifies the implementations of the .next,
          // .throw, and .return methods.
          generator._invoke = makeInvokeMethod(innerFn, self, context);

          return generator;
        }
        runtime.wrap = wrap;

        // Try/catch helper to minimize deoptimizations. Returns a completion
        // record like context.tryEntries[i].completion. This interface could
        // have been (and was previously) designed to take a closure to be
        // invoked without arguments, but in all the cases we care about we
        // already have an existing method we want to call, so there's no need
        // to create a new function object. We can even get away with assuming
        // the method takes exactly one argument, since that happens to be true
        // in every case, so we don't have to touch the arguments object. The
        // only additional allocation required is the completion record, which
        // has a stable shape and so hopefully should be cheap to allocate.
        function tryCatch(fn, obj, arg) {
          try {
            return { type: "normal", arg: fn.call(obj, arg) };
          } catch (err) {
            return { type: "throw", arg: err };
          }
        }

        var GenStateSuspendedStart = "suspendedStart";
        var GenStateSuspendedYield = "suspendedYield";
        var GenStateExecuting = "executing";
        var GenStateCompleted = "completed";

        // Returning this object from the innerFn has the same effect as
        // breaking out of the dispatch switch statement.
        var ContinueSentinel = {};

        // Dummy constructor functions that we use as the .constructor and
        // .constructor.prototype properties for functions that return Generator
        // objects. For full spec compliance, you may wish to configure your
        // minifier not to mangle the names of these two functions.
        function Generator() {}
        function GeneratorFunction() {}
        function GeneratorFunctionPrototype() {}

        // This is a polyfill for %IteratorPrototype% for environments that
        // don't natively support it.
        var IteratorPrototype = {};
        IteratorPrototype[iteratorSymbol] = function () {
          return this;
        };

        var getProto = Object.getPrototypeOf;
        var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
        if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
          // This environment has a native %IteratorPrototype%; use it instead
          // of the polyfill.
          IteratorPrototype = NativeIteratorPrototype;
        }

        var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
        GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
        GeneratorFunctionPrototype.constructor = GeneratorFunction;
        GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";

        // Helper for defining the .next, .throw, and .return methods of the
        // Iterator interface in terms of a single ._invoke method.
        function defineIteratorMethods(prototype) {
          ["next", "throw", "return"].forEach(function (method) {
            prototype[method] = function (arg) {
              return this._invoke(method, arg);
            };
          });
        }

        runtime.isGeneratorFunction = function (genFun) {
          var ctor = typeof genFun === "function" && genFun.constructor;
          return ctor ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
        };

        runtime.mark = function (genFun) {
          if (Object.setPrototypeOf) {
            Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
          } else {
            genFun.__proto__ = GeneratorFunctionPrototype;
            if (!(toStringTagSymbol in genFun)) {
              genFun[toStringTagSymbol] = "GeneratorFunction";
            }
          }
          genFun.prototype = Object.create(Gp);
          return genFun;
        };

        // Within the body of any async function, `await x` is transformed to
        // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
        // `hasOwn.call(value, "__await")` to determine if the yielded value is
        // meant to be awaited.
        runtime.awrap = function (arg) {
          return { __await: arg };
        };

        function AsyncIterator(generator) {
          function invoke(method, arg, resolve, reject) {
            var record = tryCatch(generator[method], generator, arg);
            if (record.type === "throw") {
              reject(record.arg);
            } else {
              var result = record.arg;
              var value = result.value;
              if (value && (typeof value === "undefined" ? "undefined" : _typeof(value)) === "object" && hasOwn.call(value, "__await")) {
                return Promise.resolve(value.__await).then(function (value) {
                  invoke("next", value, resolve, reject);
                }, function (err) {
                  invoke("throw", err, resolve, reject);
                });
              }

              return Promise.resolve(value).then(function (unwrapped) {
                // When a yielded Promise is resolved, its final value becomes
                // the .value of the Promise<{value,done}> result for the
                // current iteration. If the Promise is rejected, however, the
                // result for this iteration will be rejected with the same
                // reason. Note that rejections of yielded Promises are not
                // thrown back into the generator function, as is the case
                // when an awaited Promise is rejected. This difference in
                // behavior between yield and await is important, because it
                // allows the consumer to decide what to do with the yielded
                // rejection (swallow it and continue, manually .throw it back
                // into the generator, abandon iteration, whatever). With
                // await, by contrast, there is no opportunity to examine the
                // rejection reason outside the generator function, so the
                // only option is to throw it from the await expression, and
                // let the generator function handle the exception.
                result.value = unwrapped;
                resolve(result);
              }, reject);
            }
          }

          if (_typeof(global.process) === "object" && global.process.domain) {
            invoke = global.process.domain.bind(invoke);
          }

          var previousPromise;

          function enqueue(method, arg) {
            function callInvokeWithMethodAndArg() {
              return new Promise(function (resolve, reject) {
                invoke(method, arg, resolve, reject);
              });
            }

            return previousPromise =
            // If enqueue has been called before, then we want to wait until
            // all previous Promises have been resolved before calling invoke,
            // so that results are always delivered in the correct order. If
            // enqueue has not been called before, then it is important to
            // call invoke immediately, without waiting on a callback to fire,
            // so that the async generator function has the opportunity to do
            // any necessary setup in a predictable way. This predictability
            // is why the Promise constructor synchronously invokes its
            // executor callback, and why async functions synchronously
            // execute code before the first await. Since we implement simple
            // async functions in terms of async generators, it is especially
            // important to get this right, even though it requires care.
            previousPromise ? previousPromise.then(callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
          }

          // Define the unified helper method that is used to implement .next,
          // .throw, and .return (see defineIteratorMethods).
          this._invoke = enqueue;
        }

        defineIteratorMethods(AsyncIterator.prototype);
        AsyncIterator.prototype[asyncIteratorSymbol] = function () {
          return this;
        };
        runtime.AsyncIterator = AsyncIterator;

        // Note that simple async functions are implemented on top of
        // AsyncIterator objects; they just return a Promise for the value of
        // the final result produced by the iterator.
        runtime.async = function (innerFn, outerFn, self, tryLocsList) {
          var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));

          return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
          : iter.next().then(function (result) {
            return result.done ? result.value : iter.next();
          });
        };

        function makeInvokeMethod(innerFn, self, context) {
          var state = GenStateSuspendedStart;

          return function invoke(method, arg) {
            if (state === GenStateExecuting) {
              throw new Error("Generator is already running");
            }

            if (state === GenStateCompleted) {
              if (method === "throw") {
                throw arg;
              }

              // Be forgiving, per 25.3.3.3.3 of the spec:
              // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
              return doneResult();
            }

            context.method = method;
            context.arg = arg;

            while (true) {
              var delegate = context.delegate;
              if (delegate) {
                var delegateResult = maybeInvokeDelegate(delegate, context);
                if (delegateResult) {
                  if (delegateResult === ContinueSentinel) continue;
                  return delegateResult;
                }
              }

              if (context.method === "next") {
                // Setting context._sent for legacy support of Babel's
                // function.sent implementation.
                context.sent = context._sent = context.arg;
              } else if (context.method === "throw") {
                if (state === GenStateSuspendedStart) {
                  state = GenStateCompleted;
                  throw context.arg;
                }

                context.dispatchException(context.arg);
              } else if (context.method === "return") {
                context.abrupt("return", context.arg);
              }

              state = GenStateExecuting;

              var record = tryCatch(innerFn, self, context);
              if (record.type === "normal") {
                // If an exception is thrown from innerFn, we leave state ===
                // GenStateExecuting and loop back for another invocation.
                state = context.done ? GenStateCompleted : GenStateSuspendedYield;

                if (record.arg === ContinueSentinel) {
                  continue;
                }

                return {
                  value: record.arg,
                  done: context.done
                };
              } else if (record.type === "throw") {
                state = GenStateCompleted;
                // Dispatch the exception by looping back around to the
                // context.dispatchException(context.arg) call above.
                context.method = "throw";
                context.arg = record.arg;
              }
            }
          };
        }

        // Call delegate.iterator[context.method](context.arg) and handle the
        // result, either by returning a { value, done } result from the
        // delegate iterator, or by modifying context.method and context.arg,
        // setting context.delegate to null, and returning the ContinueSentinel.
        function maybeInvokeDelegate(delegate, context) {
          var method = delegate.iterator[context.method];
          if (method === undefined) {
            // A .throw or .return when the delegate iterator has no .throw
            // method always terminates the yield* loop.
            context.delegate = null;

            if (context.method === "throw") {
              if (delegate.iterator.return) {
                // If the delegate iterator has a return method, give it a
                // chance to clean up.
                context.method = "return";
                context.arg = undefined;
                maybeInvokeDelegate(delegate, context);

                if (context.method === "throw") {
                  // If maybeInvokeDelegate(context) changed context.method from
                  // "return" to "throw", let that override the TypeError below.
                  return ContinueSentinel;
                }
              }

              context.method = "throw";
              context.arg = new TypeError("The iterator does not provide a 'throw' method");
            }

            return ContinueSentinel;
          }

          var record = tryCatch(method, delegate.iterator, context.arg);

          if (record.type === "throw") {
            context.method = "throw";
            context.arg = record.arg;
            context.delegate = null;
            return ContinueSentinel;
          }

          var info = record.arg;

          if (!info) {
            context.method = "throw";
            context.arg = new TypeError("iterator result is not an object");
            context.delegate = null;
            return ContinueSentinel;
          }

          if (info.done) {
            // Assign the result of the finished delegate to the temporary
            // variable specified by delegate.resultName (see delegateYield).
            context[delegate.resultName] = info.value;

            // Resume execution at the desired location (see delegateYield).
            context.next = delegate.nextLoc;

            // If context.method was "throw" but the delegate handled the
            // exception, let the outer generator proceed normally. If
            // context.method was "next", forget context.arg since it has been
            // "consumed" by the delegate iterator. If context.method was
            // "return", allow the original .return call to continue in the
            // outer generator.
            if (context.method !== "return") {
              context.method = "next";
              context.arg = undefined;
            }
          } else {
            // Re-yield the result returned by the delegate method.
            return info;
          }

          // The delegate iterator is finished, so forget it and continue with
          // the outer generator.
          context.delegate = null;
          return ContinueSentinel;
        }

        // Define Generator.prototype.{next,throw,return} in terms of the
        // unified ._invoke helper method.
        defineIteratorMethods(Gp);

        Gp[toStringTagSymbol] = "Generator";

        // A Generator should always return itself as the iterator object when the
        // @@iterator function is called on it. Some browsers' implementations of the
        // iterator prototype chain incorrectly implement this, causing the Generator
        // object to not be returned from this call. This ensures that doesn't happen.
        // See https://github.com/facebook/regenerator/issues/274 for more details.
        Gp[iteratorSymbol] = function () {
          return this;
        };

        Gp.toString = function () {
          return "[object Generator]";
        };

        function pushTryEntry(locs) {
          var entry = { tryLoc: locs[0] };

          if (1 in locs) {
            entry.catchLoc = locs[1];
          }

          if (2 in locs) {
            entry.finallyLoc = locs[2];
            entry.afterLoc = locs[3];
          }

          this.tryEntries.push(entry);
        }

        function resetTryEntry(entry) {
          var record = entry.completion || {};
          record.type = "normal";
          delete record.arg;
          entry.completion = record;
        }

        function Context(tryLocsList) {
          // The root entry object (effectively a try statement without a catch
          // or a finally block) gives us a place to store values thrown from
          // locations where there is no enclosing try statement.
          this.tryEntries = [{ tryLoc: "root" }];
          tryLocsList.forEach(pushTryEntry, this);
          this.reset(true);
        }

        runtime.keys = function (object) {
          var keys = [];
          for (var key in object) {
            keys.push(key);
          }
          keys.reverse();

          // Rather than returning an object with a next method, we keep
          // things simple and return the next function itself.
          return function next() {
            while (keys.length) {
              var key = keys.pop();
              if (key in object) {
                next.value = key;
                next.done = false;
                return next;
              }
            }

            // To avoid creating an additional object, we just hang the .value
            // and .done properties off the next function object itself. This
            // also ensures that the minifier will not anonymize the function.
            next.done = true;
            return next;
          };
        };

        function values(iterable) {
          if (iterable) {
            var iteratorMethod = iterable[iteratorSymbol];
            if (iteratorMethod) {
              return iteratorMethod.call(iterable);
            }

            if (typeof iterable.next === "function") {
              return iterable;
            }

            if (!isNaN(iterable.length)) {
              var i = -1,
                  next = function next() {
                while (++i < iterable.length) {
                  if (hasOwn.call(iterable, i)) {
                    next.value = iterable[i];
                    next.done = false;
                    return next;
                  }
                }

                next.value = undefined;
                next.done = true;

                return next;
              };

              return next.next = next;
            }
          }

          // Return an iterator with no values.
          return { next: doneResult };
        }
        runtime.values = values;

        function doneResult() {
          return { value: undefined, done: true };
        }

        Context.prototype = {
          constructor: Context,

          reset: function reset(skipTempReset) {
            this.prev = 0;
            this.next = 0;
            // Resetting context._sent for legacy support of Babel's
            // function.sent implementation.
            this.sent = this._sent = undefined;
            this.done = false;
            this.delegate = null;

            this.method = "next";
            this.arg = undefined;

            this.tryEntries.forEach(resetTryEntry);

            if (!skipTempReset) {
              for (var name in this) {
                // Not sure about the optimal order of these conditions:
                if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                  this[name] = undefined;
                }
              }
            }
          },

          stop: function stop() {
            this.done = true;

            var rootEntry = this.tryEntries[0];
            var rootRecord = rootEntry.completion;
            if (rootRecord.type === "throw") {
              throw rootRecord.arg;
            }

            return this.rval;
          },

          dispatchException: function dispatchException(exception) {
            if (this.done) {
              throw exception;
            }

            var context = this;
            function handle(loc, caught) {
              record.type = "throw";
              record.arg = exception;
              context.next = loc;

              if (caught) {
                // If the dispatched exception was caught by a catch block,
                // then let that catch block handle the exception normally.
                context.method = "next";
                context.arg = undefined;
              }

              return !!caught;
            }

            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              var record = entry.completion;

              if (entry.tryLoc === "root") {
                // Exception thrown outside of any try block that could handle
                // it, so set the completion value of the entire function to
                // throw the exception.
                return handle("end");
              }

              if (entry.tryLoc <= this.prev) {
                var hasCatch = hasOwn.call(entry, "catchLoc");
                var hasFinally = hasOwn.call(entry, "finallyLoc");

                if (hasCatch && hasFinally) {
                  if (this.prev < entry.catchLoc) {
                    return handle(entry.catchLoc, true);
                  } else if (this.prev < entry.finallyLoc) {
                    return handle(entry.finallyLoc);
                  }
                } else if (hasCatch) {
                  if (this.prev < entry.catchLoc) {
                    return handle(entry.catchLoc, true);
                  }
                } else if (hasFinally) {
                  if (this.prev < entry.finallyLoc) {
                    return handle(entry.finallyLoc);
                  }
                } else {
                  throw new Error("try statement without catch or finally");
                }
              }
            }
          },

          abrupt: function abrupt(type, arg) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
                var finallyEntry = entry;
                break;
              }
            }

            if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
              // Ignore the finally entry if control is not jumping to a
              // location outside the try/catch block.
              finallyEntry = null;
            }

            var record = finallyEntry ? finallyEntry.completion : {};
            record.type = type;
            record.arg = arg;

            if (finallyEntry) {
              this.method = "next";
              this.next = finallyEntry.finallyLoc;
              return ContinueSentinel;
            }

            return this.complete(record);
          },

          complete: function complete(record, afterLoc) {
            if (record.type === "throw") {
              throw record.arg;
            }

            if (record.type === "break" || record.type === "continue") {
              this.next = record.arg;
            } else if (record.type === "return") {
              this.rval = this.arg = record.arg;
              this.method = "return";
              this.next = "end";
            } else if (record.type === "normal" && afterLoc) {
              this.next = afterLoc;
            }

            return ContinueSentinel;
          },

          finish: function finish(finallyLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.finallyLoc === finallyLoc) {
                this.complete(entry.completion, entry.afterLoc);
                resetTryEntry(entry);
                return ContinueSentinel;
              }
            }
          },

          "catch": function _catch(tryLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc === tryLoc) {
                var record = entry.completion;
                if (record.type === "throw") {
                  var thrown = record.arg;
                  resetTryEntry(entry);
                }
                return thrown;
              }
            }

            // The context.catch method must only be called with a location
            // argument that corresponds to a known catch block.
            throw new Error("illegal catch attempt");
          },

          delegateYield: function delegateYield(iterable, resultName, nextLoc) {
            this.delegate = {
              iterator: values(iterable),
              resultName: resultName,
              nextLoc: nextLoc
            };

            if (this.method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              this.arg = undefined;
            }

            return ContinueSentinel;
          }
        };
      }(
      // Among the various tricks for obtaining a reference to the global
      // object, this seems to be the most reliable technique that does not
      // use indirect eval (which violates Content Security Policy).
      (typeof global === "undefined" ? "undefined" : _typeof(global)) === "object" ? global : (typeof window === "undefined" ? "undefined" : _typeof(window)) === "object" ? window : (typeof self === "undefined" ? "undefined" : _typeof(self)) === "object" ? self : this);
    }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
  }, {}], 332: [function (require, module, exports) {
    (function (process, global, Buffer, __argument0, __argument1, __argument2, __argument3, __filename) {
      /*
          * SystemJS v0.21.4 Dev
          */
      (function () {
        'use strict';

        /*
         * Environment
         */

        var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
        var isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
        var isWindows = typeof process !== 'undefined' && typeof process.platform === 'string' && process.platform.match(/^win/);

        var envGlobal = typeof self !== 'undefined' ? self : global;

        /*
         * Simple Symbol() shim
         */
        var hasSymbol = typeof Symbol !== 'undefined';
        function createSymbol(name) {
          return hasSymbol ? Symbol() : '@@' + name;
        }

        var toStringTag = hasSymbol && Symbol.toStringTag;

        /*
         * Environment baseURI
         */
        var baseURI;

        // environent baseURI detection
        if (typeof document != 'undefined' && document.getElementsByTagName) {
          baseURI = document.baseURI;

          if (!baseURI) {
            var bases = document.getElementsByTagName('base');
            baseURI = bases[0] && bases[0].href || window.location.href;
          }
        } else if (typeof location != 'undefined') {
          baseURI = location.href;
        }

        // sanitize out the hash and querystring
        if (baseURI) {
          baseURI = baseURI.split('#')[0].split('?')[0];
          var slashIndex = baseURI.lastIndexOf('/');
          if (slashIndex !== -1) baseURI = baseURI.substr(0, slashIndex + 1);
        } else if (typeof process !== 'undefined' && process.cwd) {
          baseURI = 'file://' + (isWindows ? '/' : '') + process.cwd();
          if (isWindows) baseURI = baseURI.replace(/\\/g, '/');
        } else {
          throw new TypeError('No environment baseURI');
        }

        // ensure baseURI has trailing "/"
        if (baseURI[baseURI.length - 1] !== '/') baseURI += '/';

        /*
         * LoaderError with chaining for loader stacks
         */
        var errArgs = new Error(0, '_').fileName == '_';
        function LoaderError__Check_error_message_for_loader_stack(childErr, newMessage) {
          // Convert file:/// URLs to paths in Node
          if (!isBrowser) newMessage = newMessage.replace(isWindows ? /file:\/\/\//g : /file:\/\//g, '');

          var message = (childErr.message || childErr) + '\n  ' + newMessage;

          var err;
          if (errArgs && childErr.fileName) err = new Error(message, childErr.fileName, childErr.lineNumber);else err = new Error(message);

          var stack = childErr.originalErr ? childErr.originalErr.stack : childErr.stack;

          if (isNode)
            // node doesn't show the message otherwise
            err.stack = message + '\n  ' + stack;else err.stack = stack;

          err.originalErr = childErr.originalErr || childErr;

          return err;
        }

        /*
         * Optimized URL normalization assuming a syntax-valid URL parent
         */
        function throwResolveError(relUrl, parentUrl) {
          throw new RangeError('Unable to resolve "' + relUrl + '" to ' + parentUrl);
        }
        var backslashRegEx = /\\/g;
        function resolveIfNotPlain(relUrl, parentUrl) {
          if (relUrl[0] === ' ' || relUrl[relUrl.length - 1] === ' ') relUrl = relUrl.trim();
          var parentProtocol = parentUrl && parentUrl.substr(0, parentUrl.indexOf(':') + 1);

          var firstChar = relUrl[0];
          var secondChar = relUrl[1];

          // protocol-relative
          if (firstChar === '/' && secondChar === '/') {
            if (!parentProtocol) throwResolveError(relUrl, parentUrl);
            if (relUrl.indexOf('\\') !== -1) relUrl = relUrl.replace(backslashRegEx, '/');
            return parentProtocol + relUrl;
          }
          // relative-url
          else if (firstChar === '.' && (secondChar === '/' || secondChar === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) || relUrl.length === 1 && (relUrl += '/')) || firstChar === '/') {
              if (relUrl.indexOf('\\') !== -1) relUrl = relUrl.replace(backslashRegEx, '/');
              var parentIsPlain = !parentProtocol || parentUrl[parentProtocol.length] !== '/';

              // read pathname from parent if a URL
              // pathname taken to be part after leading "/"
              var pathname;
              if (parentIsPlain) {
                // resolving to a plain parent -> skip standard URL prefix, and treat entire parent as pathname
                if (parentUrl === undefined) throwResolveError(relUrl, parentUrl);
                pathname = parentUrl;
              } else if (parentUrl[parentProtocol.length + 1] === '/') {
                // resolving to a :// so we need to read out the auth and host
                if (parentProtocol !== 'file:') {
                  pathname = parentUrl.substr(parentProtocol.length + 2);
                  pathname = pathname.substr(pathname.indexOf('/') + 1);
                } else {
                  pathname = parentUrl.substr(8);
                }
              } else {
                // resolving to :/ so pathname is the /... part
                pathname = parentUrl.substr(parentProtocol.length + 1);
              }

              if (firstChar === '/') {
                if (parentIsPlain) throwResolveError(relUrl, parentUrl);else return parentUrl.substr(0, parentUrl.length - pathname.length - 1) + relUrl;
              }

              // join together and split for removal of .. and . segments
              // looping the string instead of anything fancy for perf reasons
              // '../../../../../z' resolved to 'x/y' is just 'z' regardless of parentIsPlain
              var segmented = pathname.substr(0, pathname.lastIndexOf('/') + 1) + relUrl;

              var output = [];
              var segmentIndex = -1;

              for (var i = 0; i < segmented.length; i++) {
                // busy reading a segment - only terminate on '/'
                if (segmentIndex !== -1) {
                  if (segmented[i] === '/') {
                    output.push(segmented.substring(segmentIndex, i + 1));
                    segmentIndex = -1;
                  }
                  continue;
                }

                // new segment - check if it is relative
                if (segmented[i] === '.') {
                  // ../ segment
                  if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i + 2 === segmented.length)) {
                    output.pop();
                    i += 2;
                  }
                  // ./ segment
                  else if (segmented[i + 1] === '/' || i + 1 === segmented.length) {
                      i += 1;
                    } else {
                      // the start of a new segment as below
                      segmentIndex = i;
                      continue;
                    }

                  // this is the plain URI backtracking error (../, package:x -> error)
                  if (parentIsPlain && output.length === 0) throwResolveError(relUrl, parentUrl);

                  continue;
                }

                // it is the start of a new segment
                segmentIndex = i;
              }
              // finish reading out the last segment
              if (segmentIndex !== -1) output.push(segmented.substr(segmentIndex));

              return parentUrl.substr(0, parentUrl.length - pathname.length) + output.join('');
            }

          // sanitizes and verifies (by returning undefined if not a valid URL-like form)
          // Windows filepath compatibility is an added convenience here
          var protocolIndex = relUrl.indexOf(':');
          if (protocolIndex !== -1) {
            if (isNode) {
              // C:\x becomes file:///c:/x (we don't support C|\x)
              if (relUrl[1] === ':' && relUrl[2] === '\\' && relUrl[0].match(/[a-z]/i)) return 'file:///' + relUrl.replace(backslashRegEx, '/');
            }
            return relUrl;
          }
        }

        var resolvedPromise = Promise.resolve();

        /*
         * Simple Array values shim
         */
        function arrayValues(arr) {
          if (arr.values) return arr.values();

          if (typeof Symbol === 'undefined' || !Symbol.iterator) throw new Error('Symbol.iterator not supported in this browser');

          var iterable = {};
          iterable[Symbol.iterator] = function () {
            var keys = Object.keys(arr);
            var keyIndex = 0;
            return {
              next: function next() {
                if (keyIndex < keys.length) return {
                  value: arr[keys[keyIndex++]],
                  done: false
                };else return {
                  value: undefined,
                  done: true
                };
              }
            };
          };
          return iterable;
        }

        /*
         * 3. Reflect.Loader
         *
         * We skip the entire native internal pipeline, just providing the bare API
         */
        // 3.1.1
        function Loader() {
          this.registry = new Registry();
        }
        // 3.3.1
        Loader.prototype.constructor = Loader;

        function ensureInstantiated(module) {
          if (module === undefined) return;
          if (module instanceof ModuleNamespace === false && module[toStringTag] !== 'module') throw new TypeError('Module instantiation did not return a valid namespace object.');
          return module;
        }

        // 3.3.2
        Loader.prototype.import = function (key, parent) {
          if (typeof key !== 'string') throw new TypeError('Loader import method must be passed a module key string');
          // custom resolveInstantiate combined hook for better perf
          var loader = this;
          return resolvedPromise.then(function () {
            return loader[RESOLVE_INSTANTIATE](key, parent);
          }).then(ensureInstantiated)
          //.then(Module.evaluate)
          .catch(function (err) {
            throw LoaderError__Check_error_message_for_loader_stack(err, 'Loading ' + key + (parent ? ' from ' + parent : ''));
          });
        };
        // 3.3.3
        var RESOLVE = Loader.resolve = createSymbol('resolve');

        /*
         * Combined resolve / instantiate hook
         *
         * Not in current reduced spec, but necessary to separate RESOLVE from RESOLVE + INSTANTIATE as described
         * in the spec notes of this repo to ensure that loader.resolve doesn't instantiate when not wanted.
         *
         * We implement RESOLVE_INSTANTIATE as a single hook instead of a separate INSTANTIATE in order to avoid
         * the need for double registry lookups as a performance optimization.
         */
        var RESOLVE_INSTANTIATE = Loader.resolveInstantiate = createSymbol('resolveInstantiate');

        // default resolveInstantiate is just to call resolve and then get from the registry
        // this provides compatibility for the resolveInstantiate optimization
        Loader.prototype[RESOLVE_INSTANTIATE] = function (key, parent) {
          var loader = this;
          return loader.resolve(key, parent).then(function (resolved) {
            return loader.registry.get(resolved);
          });
        };

        function ensureResolution(resolvedKey) {
          if (resolvedKey === undefined) throw new RangeError('No resolution found.');
          return resolvedKey;
        }

        Loader.prototype.resolve = function (key, parent) {
          var loader = this;
          return resolvedPromise.then(function () {
            return loader[RESOLVE](key, parent);
          }).then(ensureResolution).catch(function (err) {
            throw LoaderError__Check_error_message_for_loader_stack(err, 'Resolving ' + key + (parent ? ' to ' + parent : ''));
          });
        };

        // 3.3.4 (import without evaluate)
        // this is not documented because the use of deferred evaluation as in Module.evaluate is not
        // documented, as it is not considered a stable feature to be encouraged
        // Loader.prototype.load may well be deprecated if this stays disabled
        /* Loader.prototype.load = function (key, parent) {
          return Promise.resolve(this[RESOLVE_INSTANTIATE](key, parent || this.key))
          .catch(function (err) {
            throw addToError(err, 'Loading ' + key + (parent ? ' from ' + parent : ''));
          });
        }; */

        /*
         * 4. Registry
         *
         * Instead of structuring through a Map, just use a dictionary object
         * We throw for construction attempts so this doesn't affect the public API
         *
         * Registry has been adjusted to use Namespace objects over ModuleStatus objects
         * as part of simplifying loader API implementation
         */
        var iteratorSupport = typeof Symbol !== 'undefined' && Symbol.iterator;
        var REGISTRY = createSymbol('registry');
        function Registry() {
          this[REGISTRY] = {};
        }
        // 4.4.1
        if (iteratorSupport) {
          // 4.4.2
          Registry.prototype[Symbol.iterator] = function () {
            return this.entries()[Symbol.iterator]();
          };

          // 4.4.3
          Registry.prototype.entries = function () {
            var registry = this[REGISTRY];
            return arrayValues(Object.keys(registry).map(function (key) {
              return [key, registry[key]];
            }));
          };
        }

        // 4.4.4
        Registry.prototype.keys = function () {
          return arrayValues(Object.keys(this[REGISTRY]));
        };
        // 4.4.5
        Registry.prototype.values = function () {
          var registry = this[REGISTRY];
          return arrayValues(Object.keys(registry).map(function (key) {
            return registry[key];
          }));
        };
        // 4.4.6
        Registry.prototype.get = function (key) {
          return this[REGISTRY][key];
        };
        // 4.4.7
        Registry.prototype.set = function (key, namespace) {
          if (!(namespace instanceof ModuleNamespace || namespace[toStringTag] === 'module')) throw new Error('Registry must be set with an instance of Module Namespace');
          this[REGISTRY][key] = namespace;
          return this;
        };
        // 4.4.8
        Registry.prototype.has = function (key) {
          return Object.hasOwnProperty.call(this[REGISTRY], key);
        };
        // 4.4.9
        Registry.prototype.delete = function (key) {
          if (Object.hasOwnProperty.call(this[REGISTRY], key)) {
            delete this[REGISTRY][key];
            return true;
          }
          return false;
        };

        /*
         * Simple ModuleNamespace Exotic object based on a baseObject
         * We export this for allowing a fast-path for module namespace creation over Module descriptors
         */
        // var EVALUATE = createSymbol('evaluate');
        var BASE_OBJECT = createSymbol('baseObject');

        // 8.3.1 Reflect.Module
        /*
         * Best-effort simplified non-spec implementation based on
         * a baseObject referenced via getters.
         *
         * Allows:
         *
         *   loader.registry.set('x', new Module({ default: 'x' }));
         *
         * Optional evaluation function provides experimental Module.evaluate
         * support for non-executed modules in registry.
         */
        function ModuleNamespace(baseObject /*, evaluate*/) {
          Object.defineProperty(this, BASE_OBJECT, {
            value: baseObject
          });

          // evaluate defers namespace population
          /* if (evaluate) {
            Object.defineProperty(this, EVALUATE, {
              value: evaluate,
              configurable: true,
              writable: true
            });
          }
          else { */
          Object.keys(baseObject).forEach(extendNamespace, this);
          //}
        } // 8.4.2
        ModuleNamespace.prototype = Object.create(null);

        if (toStringTag) Object.defineProperty(ModuleNamespace.prototype, toStringTag, {
          value: 'Module'
        });

        function extendNamespace(key) {
          Object.defineProperty(this, key, {
            enumerable: true,
            get: function get() {
              return this[BASE_OBJECT][key];
            }
          });
        }

        /* function doEvaluate (evaluate, context) {
          try {
            evaluate.call(context);
          }
          catch (e) {
            return e;
          }
        }
          // 8.4.1 Module.evaluate... not documented or used because this is potentially unstable
        Module.evaluate = function (ns) {
          var evaluate = ns[EVALUATE];
          if (evaluate) {
            ns[EVALUATE] = undefined;
            var err = doEvaluate(evaluate);
            if (err) {
              // cache the error
              ns[EVALUATE] = function () {
                throw err;
              };
              throw err;
            }
            Object.keys(ns[BASE_OBJECT]).forEach(extendNamespace, ns);
          }
          // make chainable
          return ns;
        }; */

        var resolvedPromise$1 = Promise.resolve();

        /*
         * Register Loader
         *
         * Builds directly on top of loader polyfill to provide:
         * - loader.register support
         * - hookable higher-level resolve
         * - instantiate hook returning a ModuleNamespace or undefined for es module loading
         * - loader error behaviour as in HTML and loader specs, caching load and eval errors separately
         * - build tracing support by providing a .trace=true and .loads object format
         */

        var REGISTER_INTERNAL = createSymbol('register-internal');

        function RegisterLoader() {
          Loader.call(this);

          var registryDelete = this.registry.delete;
          this.registry.delete = function (key) {
            var deleted = registryDelete.call(this, key);

            // also delete from register registry if linked
            if (records.hasOwnProperty(key) && !records[key].linkRecord) {
              delete records[key];
              deleted = true;
            }

            return deleted;
          };

          var records = {};

          this[REGISTER_INTERNAL] = {
            // last anonymous System.register call
            lastRegister: undefined,
            // in-flight es module load records
            records: records
          };

          // tracing
          this.trace = false;
        }

        RegisterLoader.prototype = Object.create(Loader.prototype);
        RegisterLoader.prototype.constructor = RegisterLoader;

        var INSTANTIATE = RegisterLoader.instantiate = createSymbol('instantiate');

        // default normalize is the WhatWG style normalizer
        RegisterLoader.prototype[RegisterLoader.resolve = Loader.resolve] = function (key, parentKey) {
          return resolveIfNotPlain(key, parentKey || baseURI);
        };

        RegisterLoader.prototype[INSTANTIATE] = function (key, processAnonRegister) {};

        // once evaluated, the linkRecord is set to undefined leaving just the other load record properties
        // this allows tracking new binding listeners for es modules through importerSetters
        // for dynamic modules, the load record is removed entirely.
        function createLoadRecord(state, key, registration) {
          return state.records[key] = {
            key: key,

            // defined System.register cache
            registration: registration,

            // module namespace object
            module: undefined,

            // es-only
            // this sticks around so new module loads can listen to binding changes
            // for already-loaded modules by adding themselves to their importerSetters
            importerSetters: undefined,

            loadError: undefined,
            evalError: undefined,

            // in-flight linking record
            linkRecord: {
              // promise for instantiated
              instantiatePromise: undefined,
              dependencies: undefined,
              execute: undefined,
              executingRequire: false,

              // underlying module object bindings
              moduleObj: undefined,

              // es only, also indicates if es or not
              setters: undefined,

              // promise for instantiated dependencies (dependencyInstantiations populated)
              depsInstantiatePromise: undefined,
              // will be the array of dependency load record or a module namespace
              dependencyInstantiations: undefined,

              // top-level await!
              evaluatePromise: undefined

              // NB optimization and way of ensuring module objects in setters
              // indicates setters which should run pre-execution of that dependency
              // setters is then just for completely executed module objects
              // alternatively we just pass the partially filled module objects as
              // arguments into the execute function
              // hoisted: undefined
            }
          };
        }

        RegisterLoader.prototype[Loader.resolveInstantiate] = function (key, parentKey) {
          var loader = this;
          var state = this[REGISTER_INTERNAL];
          var registry = this.registry[REGISTRY];

          return resolveInstantiate(loader, key, parentKey, registry, state).then(function (instantiated) {
            if (instantiated instanceof ModuleNamespace || instantiated[toStringTag] === 'module') return instantiated;

            // resolveInstantiate always returns a load record with a link record and no module value
            var link = instantiated.linkRecord;

            // if already beaten to done, return
            if (!link) {
              if (instantiated.module) return instantiated.module;
              throw instantiated.evalError;
            }

            return deepInstantiateDeps(loader, instantiated, link, registry, state).then(function () {
              return ensureEvaluate(loader, instantiated, link, registry, state);
            });
          });
        };

        function resolveInstantiate(loader, key, parentKey, registry, state) {
          // normalization shortpath for already-normalized key
          // could add a plain name filter, but doesn't yet seem necessary for perf
          var module = registry[key];
          if (module) return Promise.resolve(module);

          var load = state.records[key];

          // already linked but not in main registry is ignored
          if (load && !load.module) {
            if (load.loadError) return Promise.reject(load.loadError);
            return instantiate(loader, load, load.linkRecord, registry, state);
          }

          return loader.resolve(key, parentKey).then(function (resolvedKey) {
            // main loader registry always takes preference
            module = registry[resolvedKey];
            if (module) return module;

            load = state.records[resolvedKey];

            // already has a module value but not already in the registry (load.module)
            // means it was removed by registry.delete, so we should
            // disgard the current load record creating a new one over it
            // but keep any existing registration
            if (!load || load.module) load = createLoadRecord(state, resolvedKey, load && load.registration);

            if (load.loadError) return Promise.reject(load.loadError);

            var link = load.linkRecord;
            if (!link) return load;

            return instantiate(loader, load, link, registry, state);
          });
        }

        function createProcessAnonRegister(loader, load, state) {
          return function () {
            var lastRegister = state.lastRegister;

            if (!lastRegister) return !!load.registration;

            state.lastRegister = undefined;
            load.registration = lastRegister;

            return true;
          };
        }

        function instantiate(loader, load, link, registry, state) {
          return link.instantiatePromise || (link.instantiatePromise =
          // if there is already an existing registration, skip running instantiate
          (load.registration ? resolvedPromise$1 : resolvedPromise$1.then(function () {
            state.lastRegister = undefined;
            return loader[INSTANTIATE](load.key, loader[INSTANTIATE].length > 1 && createProcessAnonRegister(loader, load, state));
          })).then(function (instantiation) {
            // direct module return from instantiate -> we're done
            if (instantiation !== undefined) {
              if (!(instantiation instanceof ModuleNamespace || instantiation[toStringTag] === 'module')) throw new TypeError('Instantiate did not return a valid Module object.');

              delete state.records[load.key];
              if (loader.trace) traceLoad(loader, load, link);
              return registry[load.key] = instantiation;
            }

            // run the cached loader.register declaration if there is one
            var registration = load.registration;
            // clear to allow new registrations for future loads (combined with registry delete)
            load.registration = undefined;
            if (!registration) throw new TypeError('Module instantiation did not call an anonymous or correctly named System.register.');

            link.dependencies = registration[0];

            load.importerSetters = [];

            link.moduleObj = {};

            // process System.registerDynamic declaration
            if (registration[2]) {
              link.moduleObj.default = link.moduleObj.__useDefault = {};
              link.executingRequire = registration[1];
              link.execute = registration[2];
            }

            // process System.register declaration
            else {
                registerDeclarative(loader, load, link, registration[1]);
              }

            return load;
          }).catch(function (err) {
            load.linkRecord = undefined;
            throw load.loadError = load.loadError || LoaderError__Check_error_message_for_loader_stack(err, 'Instantiating ' + load.key);
          }));
        }

        // like resolveInstantiate, but returning load records for linking
        function resolveInstantiateDep(loader, key, parentKey, registry, state, traceDepMap) {
          // normalization shortpaths for already-normalized key
          // DISABLED to prioritise consistent resolver calls
          // could add a plain name filter, but doesn't yet seem necessary for perf
          /* var load = state.records[key];
          var module = registry[key];
            if (module) {
            if (traceDepMap)
              traceDepMap[key] = key;
              // registry authority check in case module was deleted or replaced in main registry
            if (load && load.module && load.module === module)
              return load;
            else
              return module;
          }
            // already linked but not in main registry is ignored
          if (load && !load.module) {
            if (traceDepMap)
              traceDepMap[key] = key;
            return instantiate(loader, load, load.linkRecord, registry, state);
          } */
          return loader.resolve(key, parentKey).then(function (resolvedKey) {
            if (traceDepMap) traceDepMap[key] = resolvedKey;

            // normalization shortpaths for already-normalized key
            var load = state.records[resolvedKey];
            var module = registry[resolvedKey];

            // main loader registry always takes preference
            if (module && (!load || load.module && module !== load.module)) return module;

            if (load && load.loadError) throw load.loadError;

            // already has a module value but not already in the registry (load.module)
            // means it was removed by registry.delete, so we should
            // disgard the current load record creating a new one over it
            // but keep any existing registration
            if (!load || !module && load.module) load = createLoadRecord(state, resolvedKey, load && load.registration);

            var link = load.linkRecord;
            if (!link) return load;

            return instantiate(loader, load, link, registry, state);
          });
        }

        function traceLoad(loader, load, link) {
          loader.loads = loader.loads || {};
          loader.loads[load.key] = {
            key: load.key,
            deps: link.dependencies,
            dynamicDeps: [],
            depMap: link.depMap || {}
          };
        }

        /*
         * Convert a CJS module.exports into a valid object for new Module:
         *
         *   new Module(getEsModule(module.exports))
         *
         * Sets the default value to the module, while also reading off named exports carefully.
         */
        function registerDeclarative(loader, load, link, declare) {
          var moduleObj = link.moduleObj;
          var importerSetters = load.importerSetters;

          var definedExports = false;

          // closure especially not based on link to allow link record disposal
          var declared = declare.call(envGlobal, function (name, value) {
            if ((typeof name === "undefined" ? "undefined" : _typeof(name)) === 'object') {
              var changed = false;
              for (var p in name) {
                value = name[p];
                if (p !== '__useDefault' && (!(p in moduleObj) || moduleObj[p] !== value)) {
                  changed = true;
                  moduleObj[p] = value;
                }
              }
              if (changed === false) return value;
            } else {
              if ((definedExports || name in moduleObj) && moduleObj[name] === value) return value;
              moduleObj[name] = value;
            }

            for (var i = 0; i < importerSetters.length; i++) {
              importerSetters[i](moduleObj);
            }return value;
          }, new ContextualLoader(loader, load.key));

          link.setters = declared.setters || [];
          link.execute = declared.execute;
          if (declared.exports) {
            link.moduleObj = moduleObj = declared.exports;
            definedExports = true;
          }
        }

        function instantiateDeps(loader, load, link, registry, state) {
          if (link.depsInstantiatePromise) return link.depsInstantiatePromise;

          var depsInstantiatePromises = Array(link.dependencies.length);

          for (var i = 0; i < link.dependencies.length; i++) {
            depsInstantiatePromises[i] = resolveInstantiateDep(loader, link.dependencies[i], load.key, registry, state, loader.trace && link.depMap || (link.depMap = {}));
          }var depsInstantiatePromise = Promise.all(depsInstantiatePromises).then(function (dependencyInstantiations) {
            link.dependencyInstantiations = dependencyInstantiations;

            // run setters to set up bindings to instantiated dependencies
            if (link.setters) {
              for (var i = 0; i < dependencyInstantiations.length; i++) {
                var setter = link.setters[i];
                if (setter) {
                  var instantiation = dependencyInstantiations[i];

                  if (instantiation instanceof ModuleNamespace || instantiation[toStringTag] === 'module') {
                    setter(instantiation);
                  } else {
                    if (instantiation.loadError) throw instantiation.loadError;
                    setter(instantiation.module || instantiation.linkRecord.moduleObj);
                    // this applies to both es and dynamic registrations
                    if (instantiation.importerSetters) instantiation.importerSetters.push(setter);
                  }
                }
              }
            }

            return load;
          });

          if (loader.trace) depsInstantiatePromise = depsInstantiatePromise.then(function () {
            traceLoad(loader, load, link);
            return load;
          });

          depsInstantiatePromise = depsInstantiatePromise.catch(function (err) {
            // throw up the instantiateDeps stack
            link.depsInstantiatePromise = undefined;
            throw LoaderError__Check_error_message_for_loader_stack(err, 'Loading ' + load.key);
          });

          depsInstantiatePromise.catch(function () {});

          return link.depsInstantiatePromise = depsInstantiatePromise;
        }

        function deepInstantiateDeps(loader, load, link, registry, state) {
          var seen = [];
          function addDeps(load, link) {
            if (!link) return resolvedPromise$1;
            if (seen.indexOf(load) !== -1) return resolvedPromise$1;
            seen.push(load);

            return instantiateDeps(loader, load, link, registry, state).then(function () {
              var depPromises;
              for (var i = 0; i < link.dependencies.length; i++) {
                var depLoad = link.dependencyInstantiations[i];
                if (!(depLoad instanceof ModuleNamespace || depLoad[toStringTag] === 'module')) {
                  depPromises = depPromises || [];
                  depPromises.push(addDeps(depLoad, depLoad.linkRecord));
                }
              }
              if (depPromises) return Promise.all(depPromises);
            });
          }
          return addDeps(load, link);
        }

        /*
         * System.register
         */
        RegisterLoader.prototype.register = function (key, deps, declare) {
          var state = this[REGISTER_INTERNAL];

          // anonymous modules get stored as lastAnon
          if (declare === undefined) {
            state.lastRegister = [key, deps, undefined];
          }

          // everything else registers into the register cache
          else {
              var load = state.records[key] || createLoadRecord(state, key, undefined);
              load.registration = [deps, declare, undefined];
            }
        };

        /*
         * System.registerDyanmic
         */
        RegisterLoader.prototype.registerDynamic = function (key, deps, executingRequire, execute) {
          var state = this[REGISTER_INTERNAL];

          // anonymous modules get stored as lastAnon
          if (typeof key !== 'string') {
            state.lastRegister = [key, deps, executingRequire];
          }

          // everything else registers into the register cache
          else {
              var load = state.records[key] || createLoadRecord(state, key, undefined);
              load.registration = [deps, executingRequire, execute];
            }
        };

        // ContextualLoader class
        // backwards-compatible with previous System.register context argument by exposing .id, .key
        function ContextualLoader(loader, key) {
          this.loader = loader;
          this.key = this.id = key;
          this.meta = {
            url: key
            // scriptElement: null
          };
        }
        /*ContextualLoader.prototype.constructor = function () {
          throw new TypeError('Cannot subclass the contextual loader only Reflect.Loader.');
        };*/
        ContextualLoader.prototype.import = function (key) {
          if (this.loader.trace) this.loader.loads[this.key].dynamicDeps.push(key);
          return this.loader.import(key, this.key);
        };
        /*ContextualLoader.prototype.resolve = function (key) {
          return this.loader.resolve(key, this.key);
        };*/

        function ensureEvaluate(loader, load, link, registry, state) {
          if (load.module) return load.module;
          if (load.evalError) throw load.evalError;
          if (link.evaluatePromise) return link.evaluatePromise;

          if (link.setters) {
            var evaluatePromise = doEvaluateDeclarative(loader, load, link, registry, state, [load]);
            if (evaluatePromise) return evaluatePromise;
          } else {
            doEvaluateDynamic(loader, load, link, registry, state, [load]);
          }
          return load.module;
        }

        function makeDynamicRequire(loader, key, dependencies, dependencyInstantiations, registry, state, seen) {
          // we can only require from already-known dependencies
          return function (name) {
            for (var i = 0; i < dependencies.length; i++) {
              if (dependencies[i] === name) {
                var depLoad = dependencyInstantiations[i];
                var module;

                if (depLoad instanceof ModuleNamespace || depLoad[toStringTag] === 'module') {
                  module = depLoad;
                } else {
                  if (depLoad.evalError) throw depLoad.evalError;
                  if (depLoad.module === undefined && seen.indexOf(depLoad) === -1 && !depLoad.linkRecord.evaluatePromise) {
                    if (depLoad.linkRecord.setters) {
                      doEvaluateDeclarative(loader, depLoad, depLoad.linkRecord, registry, state, [depLoad]);
                    } else {
                      seen.push(depLoad);
                      doEvaluateDynamic(loader, depLoad, depLoad.linkRecord, registry, state, seen);
                    }
                  }
                  module = depLoad.module || depLoad.linkRecord.moduleObj;
                }

                return '__useDefault' in module ? module.__useDefault : module;
              }
            }
            throw new Error('Module ' + name + ' not declared as a System.registerDynamic dependency of ' + key);
          };
        }

        function evalError(load, err) {
          load.linkRecord = undefined;
          var evalError = LoaderError__Check_error_message_for_loader_stack(err, 'Evaluating ' + load.key);
          if (load.evalError === undefined) load.evalError = evalError;
          throw evalError;
        }

        // es modules evaluate dependencies first
        // returns the error if any
        function doEvaluateDeclarative(loader, load, link, registry, state, seen) {
          var depLoad, depLink;
          var depLoadPromises;
          for (var i = 0; i < link.dependencies.length; i++) {
            var depLoad = link.dependencyInstantiations[i];
            if (depLoad instanceof ModuleNamespace || depLoad[toStringTag] === 'module') continue;

            // custom Module returned from instantiate
            depLink = depLoad.linkRecord;
            if (depLink) {
              if (depLoad.evalError) {
                evalError(load, depLoad.evalError);
              } else if (depLink.setters) {
                if (seen.indexOf(depLoad) === -1) {
                  seen.push(depLoad);
                  try {
                    var depLoadPromise = doEvaluateDeclarative(loader, depLoad, depLink, registry, state, seen);
                  } catch (e) {
                    evalError(load, e);
                  }
                  if (depLoadPromise) {
                    depLoadPromises = depLoadPromises || [];
                    depLoadPromises.push(depLoadPromise.catch(function (err) {
                      evalError(load, err);
                    }));
                  }
                }
              } else {
                try {
                  doEvaluateDynamic(loader, depLoad, depLink, registry, state, [depLoad]);
                } catch (e) {
                  evalError(load, e);
                }
              }
            }
          }

          if (depLoadPromises) return link.evaluatePromise = Promise.all(depLoadPromises).then(function () {
            if (link.execute) {
              // ES System.register execute
              // "this" is null in ES
              try {
                var execPromise = link.execute.call(nullContext);
              } catch (e) {
                evalError(load, e);
              }
              if (execPromise) return execPromise.catch(function (e) {
                evalError(load, e);
              }).then(function () {
                load.linkRecord = undefined;
                return registry[load.key] = load.module = new ModuleNamespace(link.moduleObj);
              });
            }

            // dispose link record
            load.linkRecord = undefined;
            registry[load.key] = load.module = new ModuleNamespace(link.moduleObj);
          });

          if (link.execute) {
            // ES System.register execute
            // "this" is null in ES
            try {
              var execPromise = link.execute.call(nullContext);
            } catch (e) {
              evalError(load, e);
            }
            if (execPromise) return link.evaluatePromise = execPromise.catch(function (e) {
              evalError(load, e);
            }).then(function () {
              load.linkRecord = undefined;
              return registry[load.key] = load.module = new ModuleNamespace(link.moduleObj);
            });
          }

          // dispose link record
          load.linkRecord = undefined;
          registry[load.key] = load.module = new ModuleNamespace(link.moduleObj);
        }

        // non es modules explicitly call moduleEvaluate through require
        function doEvaluateDynamic(loader, load, link, registry, state, seen) {
          // System.registerDynamic execute
          // "this" is "exports" in CJS
          var module = { id: load.key };
          var moduleObj = link.moduleObj;
          Object.defineProperty(module, 'exports', {
            configurable: true,
            set: function set(exports) {
              moduleObj.default = moduleObj.__useDefault = exports;
            },
            get: function get() {
              return moduleObj.__useDefault;
            }
          });

          var require = makeDynamicRequire(loader, load.key, link.dependencies, link.dependencyInstantiations, registry, state, seen);

          // evaluate deps first
          if (!link.executingRequire) for (var i = 0; i < link.dependencies.length; i++) {
            require(link.dependencies[i]);
          }try {
            var output = link.execute.call(envGlobal, require, moduleObj.default, module);
            if (output !== undefined) module.exports = output;
          } catch (e) {
            evalError(load, e);
          }

          load.linkRecord = undefined;

          // pick up defineProperty calls to module.exports when we can
          if (module.exports !== moduleObj.__useDefault) moduleObj.default = moduleObj.__useDefault = module.exports;

          var moduleDefault = moduleObj.default;

          // __esModule flag extension support via lifting
          if (moduleDefault && moduleDefault.__esModule) {
            for (var p in moduleDefault) {
              if (Object.hasOwnProperty.call(moduleDefault, p)) moduleObj[p] = moduleDefault[p];
            }
          }

          registry[load.key] = load.module = new ModuleNamespace(link.moduleObj);

          // run importer setters and clear them
          // this allows dynamic modules to update themselves into es modules
          // as soon as execution has completed
          if (load.importerSetters) for (var i = 0; i < load.importerSetters.length; i++) {
            load.importerSetters[i](load.module);
          }load.importerSetters = undefined;
        }

        // the closest we can get to call(undefined)
        var nullContext = Object.create(null);
        if (Object.freeze) Object.freeze(nullContext);

        var resolvedPromise$2 = Promise.resolve();
        function noop() {}
        var emptyModule = new ModuleNamespace({});

        function protectedCreateNamespace(bindings) {
          if (bindings) {
            if (bindings instanceof ModuleNamespace || bindings[toStringTag] === 'module') return bindings;

            if (bindings.__esModule) return new ModuleNamespace(bindings);
          }

          return new ModuleNamespace({ default: bindings, __useDefault: bindings });
        }

        function isModule(m) {
          return m instanceof ModuleNamespace || m[toStringTag] === 'module';
        }

        var CONFIG = createSymbol('loader-config');
        var METADATA = createSymbol('metadata');

        var isWorker = typeof window === 'undefined' && typeof self !== 'undefined' && typeof importScripts !== 'undefined';

        function warn(msg, force) {
          if (force || this.warnings && typeof console !== 'undefined' && console.warn) console.warn(msg);
        }

        function checkInstantiateWasm(loader, wasmBuffer, processAnonRegister) {
          var bytes = new Uint8Array(wasmBuffer);

          // detect by leading bytes
          // Can be (new Uint32Array(fetched))[0] === 0x6D736100 when working in Node
          if (bytes[0] === 0 && bytes[1] === 97 && bytes[2] === 115) {
            return WebAssembly.compile(wasmBuffer).then(function (m) {
              var deps = [];
              var setters = [];
              var importObj = {};

              // we can only set imports if supported (eg Safari doesnt support)
              if (WebAssembly.Module.imports) WebAssembly.Module.imports(m).forEach(function (i) {
                var key = i.module;
                setters.push(function (m) {
                  importObj[key] = m;
                });
                if (deps.indexOf(key) === -1) deps.push(key);
              });
              loader.register(deps, function (_export) {
                return {
                  setters: setters,
                  execute: function execute() {
                    _export(new WebAssembly.Instance(m, importObj).exports);
                  }
                };
              });
              processAnonRegister();

              return true;
            });
          }

          return Promise.resolve(false);
        }

        var parentModuleContext;
        function loadNodeModule(key, baseURL) {
          if (key[0] === '.') throw new Error('Node module ' + key + ' can\'t be loaded as it is not a package require.');

          if (!parentModuleContext) {
            var Module = this._nodeRequire('module');
            var base = decodeURI(baseURL.substr(isWindows ? 8 : 7));
            parentModuleContext = new Module(base);
            parentModuleContext.paths = Module._nodeModulePaths(base);
          }
          return parentModuleContext.require(key);
        }

        function extend(a, b) {
          for (var p in b) {
            if (!Object.hasOwnProperty.call(b, p)) continue;
            a[p] = b[p];
          }
          return a;
        }

        function prepend(a, b) {
          for (var p in b) {
            if (!Object.hasOwnProperty.call(b, p)) continue;
            if (a[p] === undefined) a[p] = b[p];
          }
          return a;
        }

        // meta first-level extends where:
        // array + array appends
        // object + object extends
        // other properties replace
        function extendMeta(a, b, _prepend) {
          for (var p in b) {
            if (!Object.hasOwnProperty.call(b, p)) continue;
            var val = b[p];
            if (a[p] === undefined) a[p] = val;else if (val instanceof Array && a[p] instanceof Array) a[p] = [].concat(_prepend ? val : a[p]).concat(_prepend ? a[p] : val);else if ((typeof val === "undefined" ? "undefined" : _typeof(val)) == 'object' && val !== null && _typeof(a[p]) == 'object') a[p] = (_prepend ? prepend : extend)(extend({}, a[p]), val);else if (!_prepend) a[p] = val;
          }
        }

        var supportsPreload = false,
            supportsPrefetch = false;
        if (isBrowser) (function () {
          var relList = document.createElement('link').relList;
          if (relList && relList.supports) {
            supportsPrefetch = true;
            try {
              supportsPreload = relList.supports('preload');
            } catch (e) {}
          }
        })();

        function preloadScript(url) {
          // fallback to old fashioned image technique which still works in safari
          if (!supportsPreload && !supportsPrefetch) {
            var preloadImage = new Image();
            preloadImage.src = url;
            return;
          }

          var link = document.createElement('link');
          if (supportsPreload) {
            link.rel = 'preload';
            link.as = 'script';
          } else {
            // this works for all except Safari (detected by relList.supports lacking)
            link.rel = 'prefetch';
          }
          link.href = url;
          document.head.appendChild(link);
        }

        function workerImport(src, resolve, reject) {
          try {
            importScripts(src);
          } catch (e) {
            reject(e);
          }
          resolve();
        }

        if (isBrowser) {
          var onerror = window.onerror;
          window.onerror = function globalOnerror(msg, src) {
            if (onerror) onerror.apply(this, arguments);
          };
        }

        function scriptLoad(src, crossOrigin, integrity, resolve, reject) {
          // percent encode just "#" for HTTP requests
          src = src.replace(/#/g, '%23');

          // subresource integrity is not supported in web workers
          if (isWorker) return workerImport(src, resolve, reject);

          var script = document.createElement('script');
          script.type = 'text/javascript';
          script.charset = 'utf-8';
          script.async = true;

          if (crossOrigin) script.crossOrigin = crossOrigin;
          if (integrity) script.integrity = integrity;

          script.addEventListener('load', load, false);
          script.addEventListener('error', error, false);

          script.src = src;
          document.head.appendChild(script);

          function load() {
            resolve();
            cleanup();
          }

          // note this does not catch execution errors
          function error(err) {
            cleanup();
            reject(new Error('Fetching ' + src));
          }

          function cleanup() {
            script.removeEventListener('load', load, false);
            script.removeEventListener('error', error, false);
            document.head.removeChild(script);
          }
        }

        function readMemberExpression(p, value) {
          var pParts = p.split('.');
          while (pParts.length) {
            value = value[pParts.shift()];
          }return value;
        }

        // separate out paths cache as a baseURL lock process
        function applyPaths(baseURL, paths, key) {
          var mapMatch = getMapMatch(paths, key);
          if (mapMatch) {
            var target = paths[mapMatch] + key.substr(mapMatch.length);

            var resolved = resolveIfNotPlain(target, baseURI);
            if (resolved !== undefined) return resolved;

            return baseURL + target;
          } else if (key.indexOf(':') !== -1) {
            return key;
          } else {
            return baseURL + key;
          }
        }

        function checkMap(p) {
          var name = this.name;
          // can add ':' here if we want paths to match the behaviour of map
          if (name.substr(0, p.length) === p && (name.length === p.length || name[p.length] === '/' || p[p.length - 1] === '/' || p[p.length - 1] === ':')) {
            var curLen = p.split('/').length;
            if (curLen > this.len) {
              this.match = p;
              this.len = curLen;
            }
          }
        }

        function getMapMatch(map, name) {
          if (Object.hasOwnProperty.call(map, name)) return name;

          var bestMatch = {
            name: name,
            match: undefined,
            len: 0
          };

          Object.keys(map).forEach(checkMap, bestMatch);

          return bestMatch.match;
        }

        // RegEx adjusted from https://github.com/jbrantly/yabble/blob/master/lib/yabble.js#L339
        var cjsRequireRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)\s*\)/g;

        /*
         * Source loading
         */
        function fetchFetch(url, authorization, integrity, asBuffer) {
          // fetch doesn't support file:/// urls
          if (url.substr(0, 8) === 'file:///') {
            if (hasXhr) return xhrFetch(url, authorization, integrity, asBuffer);else throw new Error('Unable to fetch file URLs in this environment.');
          }

          // percent encode just "#" for HTTP requests
          url = url.replace(/#/g, '%23');

          var opts = {
            // NB deprecate
            headers: { Accept: 'application/x-es-module, */*' }
          };

          if (integrity) opts.integrity = integrity;

          if (authorization) {
            if (typeof authorization == 'string') opts.headers['Authorization'] = authorization;
            opts.credentials = 'include';
          }

          return fetch(url, opts).then(function (res) {
            if (res.ok) return asBuffer ? res.arrayBuffer() : res.text();else throw new Error('Fetch error: ' + res.status + ' ' + res.statusText);
          });
        }

        function xhrFetch(url, authorization, integrity, asBuffer) {
          return new Promise(function (resolve, reject) {
            // percent encode just "#" for HTTP requests
            url = url.replace(/#/g, '%23');

            var xhr = new XMLHttpRequest();
            if (asBuffer) xhr.responseType = 'arraybuffer';
            function load() {
              resolve(asBuffer ? xhr.response : xhr.responseText);
            }
            function error() {
              reject(new Error('XHR error: ' + (xhr.status ? ' (' + xhr.status + (xhr.statusText ? ' ' + xhr.statusText : '') + ')' : '') + ' loading ' + url));
            }

            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                // in Chrome on file:/// URLs, status is 0
                if (xhr.status == 0) {
                  if (xhr.response) {
                    load();
                  } else {
                    // when responseText is empty, wait for load or error event
                    // to inform if it is a 404 or empty file
                    xhr.addEventListener('error', error);
                    xhr.addEventListener('load', load);
                  }
                } else if (xhr.status === 200) {
                  load();
                } else {
                  error();
                }
              }
            };
            xhr.open("GET", url, true);

            if (xhr.setRequestHeader) {
              xhr.setRequestHeader('Accept', 'application/x-es-module, */*');
              // can set "authorization: true" to enable withCredentials only
              if (authorization) {
                if (typeof authorization == 'string') xhr.setRequestHeader('Authorization', authorization);
                xhr.withCredentials = true;
              }
            }

            xhr.send(null);
          });
        }

        var fs;
        function nodeFetch(url, authorization, integrity, asBuffer) {
          if (url.substr(0, 8) != 'file:///') {
            if (hasFetch) return fetchFetch(url, authorization, integrity, asBuffer);else return Promise.reject(new Error('Unable to fetch "' + url + '". Only file URLs of the form file:/// supported running in Node without fetch.'));
          }

          fs = fs || require('fs');
          if (isWindows) url = url.replace(/\//g, '\\').substr(8);else url = url.substr(7);

          return new Promise(function (resolve, reject) {
            fs.readFile(url, function (err, data) {
              if (err) {
                return reject(err);
              } else {
                if (asBuffer) {
                  resolve(data);
                } else {
                  // Strip Byte Order Mark out if it's the leading char
                  var dataString = data + '';
                  if (dataString[0] === "\uFEFF") dataString = dataString.substr(1);

                  resolve(dataString);
                }
              }
            });
          });
        }

        function noFetch() {
          throw new Error('No fetch method is defined for this environment.');
        }

        var fetchFunction;

        var hasXhr = typeof XMLHttpRequest !== 'undefined';
        var hasFetch = typeof fetch !== 'undefined';

        if (typeof self !== 'undefined' && typeof self.fetch !== 'undefined') fetchFunction = fetchFetch;else if (hasXhr) fetchFunction = xhrFetch;else if (typeof require !== 'undefined' && typeof process !== 'undefined') fetchFunction = nodeFetch;else fetchFunction = noFetch;

        var fetch$1 = fetchFunction;

        function createMetadata() {
          return {
            pluginKey: undefined,
            pluginArgument: undefined,
            pluginModule: undefined,
            packageKey: undefined,
            packageConfig: undefined,
            load: undefined
          };
        }

        function getParentMetadata(loader, config, parentKey) {
          var parentMetadata = createMetadata();

          if (parentKey) {
            // detect parent plugin
            // we just need pluginKey to be truthy for package configurations
            // so we duplicate it as pluginArgument - although not correct its not used
            var parentPluginIndex;
            if (config.pluginFirst) {
              if ((parentPluginIndex = parentKey.lastIndexOf('!')) !== -1) parentMetadata.pluginArgument = parentMetadata.pluginKey = parentKey.substr(0, parentPluginIndex);
            } else {
              if ((parentPluginIndex = parentKey.indexOf('!')) !== -1) parentMetadata.pluginArgument = parentMetadata.pluginKey = parentKey.substr(parentPluginIndex + 1);
            }

            // detect parent package
            parentMetadata.packageKey = getMapMatch(config.packages, parentKey);
            if (parentMetadata.packageKey) parentMetadata.packageConfig = config.packages[parentMetadata.packageKey];
          }

          return parentMetadata;
        }

        function normalize(key, parentKey) {
          var config = this[CONFIG];

          var metadata = createMetadata();
          var parentMetadata = getParentMetadata(this, config, parentKey);

          var loader = this;

          return Promise.resolve()

          // boolean conditional
          .then(function () {
            // first we normalize the conditional
            var booleanIndex = key.lastIndexOf('#?');

            if (booleanIndex === -1) return Promise.resolve(key);

            var conditionObj = parseCondition.call(loader, key.substr(booleanIndex + 2));

            // in builds, return normalized conditional
            /*if (this.builder)
              return this.resolve(conditionObj.module, parentKey)
              .then(function (conditionModule) {
                conditionObj.module = conditionModule;
                return key.substr(0, booleanIndex) + '#?' + serializeCondition(conditionObj);
              });*/

            return resolveCondition.call(loader, conditionObj, parentKey, true).then(function (conditionValue) {
              return conditionValue ? key.substr(0, booleanIndex) : '@empty';
            });
          })

          // plugin
          .then(function (key) {
            var parsed = parsePlugin(config.pluginFirst, key);

            if (!parsed) return packageResolve.call(loader, config, key, parentMetadata && parentMetadata.pluginArgument || parentKey, metadata, parentMetadata, false);

            metadata.pluginKey = parsed.plugin;

            return Promise.all([packageResolve.call(loader, config, parsed.argument, parentMetadata && parentMetadata.pluginArgument || parentKey, metadata, parentMetadata, true), loader.resolve(parsed.plugin, parentKey)]).then(function (normalized) {
              metadata.pluginArgument = normalized[0];
              metadata.pluginKey = normalized[1];

              // don't allow a plugin to load itself
              if (metadata.pluginArgument === metadata.pluginKey) throw new Error('Plugin ' + metadata.pluginArgument + ' cannot load itself, make sure it is excluded from any wildcard meta configuration via a custom loader: false rule.');

              return combinePluginParts(config.pluginFirst, normalized[0], normalized[1]);
            });
          }).then(function (normalized) {
            return interpolateConditional.call(loader, normalized, parentKey, parentMetadata);
          }).then(function (normalized) {
            setMeta.call(loader, config, normalized, metadata);

            if (metadata.pluginKey || !metadata.load.loader) return normalized;

            // loader by configuration
            // normalizes to parent to support package loaders
            return loader.resolve(metadata.load.loader, normalized).then(function (pluginKey) {
              metadata.pluginKey = pluginKey;
              metadata.pluginArgument = normalized;
              return normalized;
            });
          }).then(function (normalized) {
            loader[METADATA][normalized] = metadata;
            return normalized;
          });
        }

        // normalization function used for registry keys
        // just does coreResolve without map
        function decanonicalize(config, key) {
          var parsed = parsePlugin(config.pluginFirst, key);

          // plugin
          if (parsed) {
            var pluginKey = decanonicalize.call(this, config, parsed.plugin);
            return combinePluginParts(config.pluginFirst, coreResolve.call(this, config, parsed.argument, undefined, false, false), pluginKey);
          }

          return coreResolve.call(this, config, key, undefined, false, false);
        }

        function normalizeSync(key, parentKey) {
          var config = this[CONFIG];

          // normalizeSync is metadataless, so create metadata
          var metadata = createMetadata();
          var parentMetadata = parentMetadata || getParentMetadata(this, config, parentKey);

          var parsed = parsePlugin(config.pluginFirst, key);

          // plugin
          if (parsed) {
            metadata.pluginKey = normalizeSync.call(this, parsed.plugin, parentKey);
            return combinePluginParts(config.pluginFirst, packageResolveSync.call(this, config, parsed.argument, parentMetadata.pluginArgument || parentKey, metadata, parentMetadata, !!metadata.pluginKey), metadata.pluginKey);
          }

          return packageResolveSync.call(this, config, key, parentMetadata.pluginArgument || parentKey, metadata, parentMetadata, !!metadata.pluginKey);
        }

        function coreResolve(config, key, parentKey, doMap, packageName) {
          var relativeResolved = resolveIfNotPlain(key, parentKey || baseURI);

          // standard URL resolution
          if (relativeResolved) return applyPaths(config.baseURL, config.paths, relativeResolved);

          // plain keys not starting with './', 'x://' and '/' go through custom resolution
          if (doMap) {
            var mapMatch = getMapMatch(config.map, key);

            if (mapMatch) {
              key = config.map[mapMatch] + key.substr(mapMatch.length);

              relativeResolved = resolveIfNotPlain(key, baseURI);
              if (relativeResolved) return applyPaths(config.baseURL, config.paths, relativeResolved);
            }
          }

          if (this.registry.has(key)) return key;

          if (key.substr(0, 6) === '@node/') return key;

          var trailingSlash = packageName && key[key.length - 1] !== '/';
          var resolved = applyPaths(config.baseURL, config.paths, trailingSlash ? key + '/' : key);
          if (trailingSlash) return resolved.substr(0, resolved.length - 1);
          return resolved;
        }

        function packageResolveSync(config, key, parentKey, metadata, parentMetadata, skipExtensions) {
          // ignore . since internal maps handled by standard package resolution
          if (parentMetadata && parentMetadata.packageConfig && key[0] !== '.') {
            var parentMap = parentMetadata.packageConfig.map;
            var parentMapMatch = parentMap && getMapMatch(parentMap, key);

            if (parentMapMatch && typeof parentMap[parentMapMatch] === 'string') {
              var mapped = doMapSync(this, config, parentMetadata.packageConfig, parentMetadata.packageKey, parentMapMatch, key, metadata, skipExtensions);
              if (mapped) return mapped;
            }
          }

          var normalized = coreResolve.call(this, config, key, parentKey, true, true);

          var pkgConfigMatch = getPackageConfigMatch(config, normalized);
          metadata.packageKey = pkgConfigMatch && pkgConfigMatch.packageKey || getMapMatch(config.packages, normalized);

          if (!metadata.packageKey) return normalized;

          if (config.packageConfigKeys.indexOf(normalized) !== -1) {
            metadata.packageKey = undefined;
            return normalized;
          }

          metadata.packageConfig = config.packages[metadata.packageKey] || (config.packages[metadata.packageKey] = createPackage());

          var subPath = normalized.substr(metadata.packageKey.length + 1);

          return applyPackageConfigSync(this, config, metadata.packageConfig, metadata.packageKey, subPath, metadata, skipExtensions);
        }

        function packageResolve(config, key, parentKey, metadata, parentMetadata, skipExtensions) {
          var loader = this;

          return resolvedPromise$2.then(function () {
            // ignore . since internal maps handled by standard package resolution
            if (parentMetadata && parentMetadata.packageConfig && key.substr(0, 2) !== './') {
              var parentMap = parentMetadata.packageConfig.map;
              var parentMapMatch = parentMap && getMapMatch(parentMap, key);

              if (parentMapMatch) return doMap(loader, config, parentMetadata.packageConfig, parentMetadata.packageKey, parentMapMatch, key, metadata, skipExtensions);
            }

            return resolvedPromise$2;
          }).then(function (mapped) {
            if (mapped) return mapped;

            // apply map, core, paths, contextual package map
            var normalized = coreResolve.call(loader, config, key, parentKey, true, true);

            var pkgConfigMatch = getPackageConfigMatch(config, normalized);
            metadata.packageKey = pkgConfigMatch && pkgConfigMatch.packageKey || getMapMatch(config.packages, normalized);

            if (!metadata.packageKey) return Promise.resolve(normalized);

            if (config.packageConfigKeys.indexOf(normalized) !== -1) {
              metadata.packageKey = undefined;
              metadata.load = createMeta();
              metadata.load.format = 'json';
              // ensure no loader
              metadata.load.loader = '';
              return Promise.resolve(normalized);
            }

            metadata.packageConfig = config.packages[metadata.packageKey] || (config.packages[metadata.packageKey] = createPackage());

            // load configuration when it matches packageConfigPaths, not already configured, and not the config itself
            var loadConfig = pkgConfigMatch && !metadata.packageConfig.configured;

            return (loadConfig ? loadPackageConfigPath(loader, config, pkgConfigMatch.configPath, metadata) : resolvedPromise$2).then(function () {
              var subPath = normalized.substr(metadata.packageKey.length + 1);

              return applyPackageConfig(loader, config, metadata.packageConfig, metadata.packageKey, subPath, metadata, skipExtensions);
            });
          });
        }

        function createMeta() {
          return {
            extension: '',
            deps: undefined,
            format: undefined,
            loader: undefined,
            scriptLoad: undefined,
            globals: undefined,
            nonce: undefined,
            integrity: undefined,
            sourceMap: undefined,
            exports: undefined,
            encapsulateGlobal: false,
            crossOrigin: undefined,
            cjsRequireDetection: true,
            cjsDeferDepsExecute: false,
            esModule: false
          };
        }

        function setMeta(config, key, metadata) {
          metadata.load = metadata.load || createMeta();

          // apply wildcard metas
          var bestDepth = 0;
          var wildcardIndex;
          for (var module in config.meta) {
            wildcardIndex = module.indexOf('*');
            if (wildcardIndex === -1) continue;
            if (module.substr(0, wildcardIndex) === key.substr(0, wildcardIndex) && module.substr(wildcardIndex + 1) === key.substr(key.length - module.length + wildcardIndex + 1)) {
              var depth = module.split('/').length;
              if (depth > bestDepth) bestDepth = depth;
              extendMeta(metadata.load, config.meta[module], bestDepth !== depth);
            }
          }

          // apply exact meta
          if (config.meta[key]) extendMeta(metadata.load, config.meta[key], false);

          // apply package meta
          if (metadata.packageKey) {
            var subPath = key.substr(metadata.packageKey.length + 1);

            var meta = {};
            if (metadata.packageConfig.meta) {
              var bestDepth = 0;
              getMetaMatches(metadata.packageConfig.meta, subPath, function (metaPattern, matchMeta, matchDepth) {
                if (matchDepth > bestDepth) bestDepth = matchDepth;
                extendMeta(meta, matchMeta, matchDepth && bestDepth > matchDepth);
              });

              extendMeta(metadata.load, meta, false);
            }

            // format
            if (metadata.packageConfig.format && !metadata.pluginKey && !metadata.load.loader) metadata.load.format = metadata.load.format || metadata.packageConfig.format;
          }
        }

        function parsePlugin(pluginFirst, key) {
          var argumentKey;
          var pluginKey;

          var pluginIndex = pluginFirst ? key.indexOf('!') : key.lastIndexOf('!');

          if (pluginIndex === -1) return;

          if (pluginFirst) {
            argumentKey = key.substr(pluginIndex + 1);
            pluginKey = key.substr(0, pluginIndex);
          } else {
            argumentKey = key.substr(0, pluginIndex);
            pluginKey = key.substr(pluginIndex + 1) || argumentKey.substr(argumentKey.lastIndexOf('.') + 1);
          }

          return {
            argument: argumentKey,
            plugin: pluginKey
          };
        }

        // put key back together after parts have been normalized
        function combinePluginParts(pluginFirst, argumentKey, pluginKey) {
          if (pluginFirst) return pluginKey + '!' + argumentKey;else return argumentKey + '!' + pluginKey;
        }

        /*
         * Package Configuration Extension
         *
         * Example:
         *
         * SystemJS.packages = {
         *   jquery: {
         *     main: 'index.js', // when not set, package key is requested directly
         *     format: 'amd',
         *     defaultExtension: 'ts', // defaults to 'js', can be set to false
         *     modules: {
         *       '*.ts': {
         *         loader: 'typescript'
         *       },
         *       'vendor/sizzle.js': {
         *         format: 'global'
         *       }
         *     },
         *     map: {
         *        // map internal require('sizzle') to local require('./vendor/sizzle')
         *        sizzle: './vendor/sizzle.js',
         *        // map any internal or external require of 'jquery/vendor/another' to 'another/index.js'
         *        './vendor/another.js': './another/index.js',
         *        // test.js / test -> lib/test.js
         *        './test.js': './lib/test.js',
         *
         *        // environment-specific map configurations
         *        './index.js': {
         *          '~browser': './index-node.js',
         *          './custom-condition.js|~export': './index-custom.js'
         *        }
         *     },
         *     // allows for setting package-prefixed depCache
         *     // keys are normalized module keys relative to the package itself
         *     depCache: {
         *       // import 'package/index.js' loads in parallel package/lib/test.js,package/vendor/sizzle.js
         *       './index.js': ['./test'],
         *       './test.js': ['external-dep'],
         *       'external-dep/path.js': ['./another.js']
         *     }
         *   }
         * };
         *
         * Then:
         *   import 'jquery'                       -> jquery/index.js
         *   import 'jquery/submodule'             -> jquery/submodule.js
         *   import 'jquery/submodule.ts'          -> jquery/submodule.ts loaded as typescript
         *   import 'jquery/vendor/another'        -> another/index.js
         *
         * Detailed Behaviours
         * - main can have a leading "./" can be added optionally
         * - map and defaultExtension are applied to the main
         * - defaultExtension adds the extension only if the exact extension is not present
           * - if a meta value is available for a module, map and defaultExtension are skipped
         * - like global map, package map also applies to subpaths (sizzle/x, ./vendor/another/sub)
         * - condition module map is '@env' module in package or '@system-env' globally
         * - map targets support conditional interpolation ('./x': './x.#{|env}.js')
         * - internal package map targets cannot use boolean conditionals
         *
         * Package Configuration Loading
         *
         * Not all packages may already have their configuration present in the System config
         * For these cases, a list of packageConfigPaths can be provided, which when matched against
         * a request, will first request a ".json" file by the package key to derive the package
         * configuration from. This allows dynamic loading of non-predetermined code, a key use
         * case in SystemJS.
         *
         * Example:
         *
         *   SystemJS.packageConfigPaths = ['packages/test/package.json', 'packages/*.json'];
         *
         *   // will first request 'packages/new-package/package.json' for the package config
         *   // before completing the package request to 'packages/new-package/path'
         *   SystemJS.import('packages/new-package/path');
         *
         *   // will first request 'packages/test/package.json' before the main
         *   SystemJS.import('packages/test');
         *
         * When a package matches packageConfigPaths, it will always send a config request for
         * the package configuration.
         * The package key itself is taken to be the match up to and including the last wildcard
         * or trailing slash.
         * The most specific package config path will be used.
         * Any existing package configurations for the package will deeply merge with the
         * package config, with the existing package configurations taking preference.
         * To opt-out of the package configuration request for a package that matches
         * packageConfigPaths, use the { configured: true } package config option.
         *
         */

        function addDefaultExtension(config, pkg, pkgKey, subPath, skipExtensions) {
          // don't apply extensions to folders or if defaultExtension = false
          if (!subPath || !pkg.defaultExtension || subPath[subPath.length - 1] === '/' || skipExtensions) return subPath;

          var metaMatch = false;

          // exact meta or meta with any content after the last wildcard skips extension
          if (pkg.meta) getMetaMatches(pkg.meta, subPath, function (metaPattern, matchMeta, matchDepth) {
            if (matchDepth === 0 || metaPattern.lastIndexOf('*') !== metaPattern.length - 1) return metaMatch = true;
          });

          // exact global meta or meta with any content after the last wildcard skips extension
          if (!metaMatch && config.meta) getMetaMatches(config.meta, pkgKey + '/' + subPath, function (metaPattern, matchMeta, matchDepth) {
            if (matchDepth === 0 || metaPattern.lastIndexOf('*') !== metaPattern.length - 1) return metaMatch = true;
          });

          if (metaMatch) return subPath;

          // work out what the defaultExtension is and add if not there already
          var defaultExtension = '.' + pkg.defaultExtension;
          if (subPath.substr(subPath.length - defaultExtension.length) !== defaultExtension) return subPath + defaultExtension;else return subPath;
        }

        function applyPackageConfigSync(loader, config, pkg, pkgKey, subPath, metadata, skipExtensions) {
          // main
          if (!subPath) {
            if (pkg.main) subPath = pkg.main.substr(0, 2) === './' ? pkg.main.substr(2) : pkg.main;else
              // also no submap if key is package itself (import 'pkg' -> 'path/to/pkg.js')
              // NB can add a default package main convention here
              // if it becomes internal to the package then it would no longer be an exit path
              return pkgKey;
          }

          // map config checking without then with extensions
          if (pkg.map) {
            var mapPath = './' + subPath;

            var mapMatch = getMapMatch(pkg.map, mapPath);

            // we then check map with the default extension adding
            if (!mapMatch) {
              mapPath = './' + addDefaultExtension(config, pkg, pkgKey, subPath, skipExtensions);
              if (mapPath !== './' + subPath) mapMatch = getMapMatch(pkg.map, mapPath);
            }
            if (mapMatch) {
              var mapped = doMapSync(loader, config, pkg, pkgKey, mapMatch, mapPath, metadata, skipExtensions);
              if (mapped) return mapped;
            }
          }

          // normal package resolution
          return pkgKey + '/' + addDefaultExtension(config, pkg, pkgKey, subPath, skipExtensions);
        }

        function validMapping(mapMatch, mapped, path) {
          // allow internal ./x -> ./x/y or ./x/ -> ./x/y recursive maps
          // but only if the path is exactly ./x and not ./x/z
          if (mapped.substr(0, mapMatch.length) === mapMatch && path.length > mapMatch.length) return false;

          return true;
        }

        function doMapSync(loader, config, pkg, pkgKey, mapMatch, path, metadata, skipExtensions) {
          if (path[path.length - 1] === '/') path = path.substr(0, path.length - 1);
          var mapped = pkg.map[mapMatch];

          if ((typeof mapped === "undefined" ? "undefined" : _typeof(mapped)) === 'object') throw new Error('Synchronous conditional normalization not supported sync normalizing ' + mapMatch + ' in ' + pkgKey);

          if (!validMapping(mapMatch, mapped, path) || typeof mapped !== 'string') return;

          return packageResolveSync.call(loader, config, mapped + path.substr(mapMatch.length), pkgKey + '/', metadata, metadata, skipExtensions);
        }

        function applyPackageConfig(loader, config, pkg, pkgKey, subPath, metadata, skipExtensions) {
          // main
          if (!subPath) {
            if (pkg.main) subPath = pkg.main.substr(0, 2) === './' ? pkg.main.substr(2) : pkg.main;
            // also no submap if key is package itself (import 'pkg' -> 'path/to/pkg.js')
            else
              // NB can add a default package main convention here
              // if it becomes internal to the package then it would no longer be an exit path
              return Promise.resolve(pkgKey);
          }

          // map config checking without then with extensions
          var mapPath, mapMatch;

          if (pkg.map) {
            mapPath = './' + subPath;
            mapMatch = getMapMatch(pkg.map, mapPath);

            // we then check map with the default extension adding
            if (!mapMatch) {
              mapPath = './' + addDefaultExtension(config, pkg, pkgKey, subPath, skipExtensions);
              if (mapPath !== './' + subPath) mapMatch = getMapMatch(pkg.map, mapPath);
            }
          }

          return (mapMatch ? doMap(loader, config, pkg, pkgKey, mapMatch, mapPath, metadata, skipExtensions) : resolvedPromise$2).then(function (mapped) {
            if (mapped) return Promise.resolve(mapped);

            // normal package resolution / fallback resolution for no conditional match
            return Promise.resolve(pkgKey + '/' + addDefaultExtension(config, pkg, pkgKey, subPath, skipExtensions));
          });
        }

        function doMap(loader, config, pkg, pkgKey, mapMatch, path, metadata, skipExtensions) {
          if (path[path.length - 1] === '/') path = path.substr(0, path.length - 1);

          var mapped = pkg.map[mapMatch];

          if (typeof mapped === 'string') {
            if (!validMapping(mapMatch, mapped, path)) return resolvedPromise$2;
            return packageResolve.call(loader, config, mapped + path.substr(mapMatch.length), pkgKey + '/', metadata, metadata, skipExtensions).then(function (normalized) {
              return interpolateConditional.call(loader, normalized, pkgKey + '/', metadata);
            });
          }

          // we use a special conditional syntax to allow the builder to handle conditional branch points further
          /*if (loader.builder)
            return Promise.resolve(pkgKey + '/#:' + path);*/

          // we load all conditions upfront
          var conditionPromises = [];
          var conditions = [];
          for (var e in mapped) {
            var c = parseCondition(e);
            conditions.push({
              condition: c,
              map: mapped[e]
            });
            conditionPromises.push(RegisterLoader.prototype.import.call(loader, c.module, pkgKey));
          }

          // map object -> conditional map
          return Promise.all(conditionPromises).then(function (conditionValues) {
            // first map condition to match is used
            for (var i = 0; i < conditions.length; i++) {
              var c = conditions[i].condition;
              var value = readMemberExpression(c.prop, '__useDefault' in conditionValues[i] ? conditionValues[i].__useDefault : conditionValues[i]);
              if (!c.negate && value || c.negate && !value) return conditions[i].map;
            }
          }).then(function (mapped) {
            if (mapped) {
              if (!validMapping(mapMatch, mapped, path)) return resolvedPromise$2;
              return packageResolve.call(loader, config, mapped + path.substr(mapMatch.length), pkgKey + '/', metadata, metadata, skipExtensions).then(function (normalized) {
                return interpolateConditional.call(loader, normalized, pkgKey + '/', metadata);
              });
            }

            // no environment match -> fallback to original subPath by returning undefined
          });
        }

        // check if the given normalized key matches a packageConfigPath
        // if so, loads the config
        var packageConfigPaths = {};

        // data object for quick checks against package paths
        function createPkgConfigPathObj(path) {
          var lastWildcard = path.lastIndexOf('*');
          var length = Math.max(lastWildcard + 1, path.lastIndexOf('/'));
          return {
            length: length,
            regEx: new RegExp('^(' + path.substr(0, length).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^\\/]+') + ')(\\/|$)'),
            wildcard: lastWildcard !== -1
          };
        }

        // most specific match wins
        function getPackageConfigMatch(config, normalized) {
          var pkgKey,
              exactMatch = false,
              configPath;
          for (var i = 0; i < config.packageConfigPaths.length; i++) {
            var packageConfigPath = config.packageConfigPaths[i];
            var p = packageConfigPaths[packageConfigPath] || (packageConfigPaths[packageConfigPath] = createPkgConfigPathObj(packageConfigPath));
            if (normalized.length < p.length) continue;
            var match = normalized.match(p.regEx);
            if (match && (!pkgKey || !(exactMatch && p.wildcard) && pkgKey.length < match[1].length)) {
              pkgKey = match[1];
              exactMatch = !p.wildcard;
              configPath = pkgKey + packageConfigPath.substr(p.length);
            }
          }

          if (!pkgKey) return;

          return {
            packageKey: pkgKey,
            configPath: configPath
          };
        }

        function loadPackageConfigPath(loader, config, pkgConfigPath, metadata, normalized) {
          var configLoader = loader.pluginLoader || loader;

          // ensure we note this is a package config file path
          // it will then be skipped from getting other normalizations itself to ensure idempotency
          if (config.packageConfigKeys.indexOf(pkgConfigPath) === -1) config.packageConfigKeys.push(pkgConfigPath);

          return configLoader.import(pkgConfigPath).then(function (pkgConfig) {
            setPkgConfig(metadata.packageConfig, pkgConfig, metadata.packageKey, true, config);
            metadata.packageConfig.configured = true;
          }).catch(function (err) {
            throw LoaderError__Check_error_message_for_loader_stack(err, 'Unable to fetch package configuration file ' + pkgConfigPath);
          });
        }

        function getMetaMatches(pkgMeta, subPath, matchFn) {
          // wildcard meta
          var wildcardIndex;
          for (var module in pkgMeta) {
            // allow meta to start with ./ for flexibility
            var dotRel = module.substr(0, 2) === './' ? './' : '';
            if (dotRel) module = module.substr(2);

            wildcardIndex = module.indexOf('*');
            if (wildcardIndex === -1) continue;

            if (module.substr(0, wildcardIndex) === subPath.substr(0, wildcardIndex) && module.substr(wildcardIndex + 1) === subPath.substr(subPath.length - module.length + wildcardIndex + 1)) {
              // alow match function to return true for an exit path
              if (matchFn(module, pkgMeta[dotRel + module], module.split('/').length)) return;
            }
          }
          // exact meta
          var exactMeta = pkgMeta[subPath] && Object.hasOwnProperty.call(pkgMeta, subPath) ? pkgMeta[subPath] : pkgMeta['./' + subPath];
          if (exactMeta) matchFn(exactMeta, exactMeta, 0);
        }

        /*
         * Conditions Extension
         *
         *   Allows a condition module to alter the resolution of an import via syntax:
         *
         *     import $ from 'jquery/#{browser}';
         *
         *   Will first load the module 'browser' via `SystemJS.import('browser')` and
         *   take the default export of that module.
         *   If the default export is not a string, an error is thrown.
         *
         *   We then substitute the string into the require to get the conditional resolution
         *   enabling environment-specific variations like:
         *
         *     import $ from 'jquery/ie'
         *     import $ from 'jquery/firefox'
         *     import $ from 'jquery/chrome'
         *     import $ from 'jquery/safari'
         *
         *   It can be useful for a condition module to define multiple conditions.
         *   This can be done via the `|` modifier to specify an export member expression:
         *
         *     import 'jquery/#{./browser.js|grade.version}'
         *
         *   Where the `grade` export `version` member in the `browser.js` module  is substituted.
         *
         *
         * Boolean Conditionals
         *
         *   For polyfill modules, that are used as imports but have no module value,
         *   a binary conditional allows a module not to be loaded at all if not needed:
         *
         *     import 'es5-shim#?./conditions.js|needs-es5shim'
         *
         *   These conditions can also be negated via:
         *
         *     import 'es5-shim#?./conditions.js|~es6'
         *
         */

        var sysConditions = ['browser', 'node', 'dev', 'build', 'production', 'default'];

        function parseCondition(condition) {
          var conditionExport, conditionModule, negation;

          var negation;
          var conditionExportIndex = condition.lastIndexOf('|');
          if (conditionExportIndex !== -1) {
            conditionExport = condition.substr(conditionExportIndex + 1);
            conditionModule = condition.substr(0, conditionExportIndex);

            if (conditionExport[0] === '~') {
              negation = true;
              conditionExport = conditionExport.substr(1);
            }
          } else {
            negation = condition[0] === '~';
            conditionExport = 'default';
            conditionModule = condition.substr(negation);
            if (sysConditions.indexOf(conditionModule) !== -1) {
              conditionExport = conditionModule;
              conditionModule = null;
            }
          }

          return {
            module: conditionModule || '@system-env',
            prop: conditionExport,
            negate: negation
          };
        }

        function resolveCondition(conditionObj, parentKey, bool) {
          // import without __useDefault handling here
          return RegisterLoader.prototype.import.call(this, conditionObj.module, parentKey).then(function (condition) {
            var m = readMemberExpression(conditionObj.prop, condition);

            if (bool && typeof m !== 'boolean') throw new TypeError('Condition did not resolve to a boolean.');

            return conditionObj.negate ? !m : m;
          });
        }

        var interpolationRegEx = /#\{[^\}]+\}/;
        function interpolateConditional(key, parentKey, parentMetadata) {
          // first we normalize the conditional
          var conditionalMatch = key.match(interpolationRegEx);

          if (!conditionalMatch) return Promise.resolve(key);

          var conditionObj = parseCondition.call(this, conditionalMatch[0].substr(2, conditionalMatch[0].length - 3));

          // in builds, return normalized conditional
          /*if (this.builder)
            return this.normalize(conditionObj.module, parentKey, createMetadata(), parentMetadata)
            .then(function (conditionModule) {
              conditionObj.module = conditionModule;
              return key.replace(interpolationRegEx, '#{' + serializeCondition(conditionObj) + '}');
            });*/

          return resolveCondition.call(this, conditionObj, parentKey, false).then(function (conditionValue) {
            if (typeof conditionValue !== 'string') throw new TypeError('The condition value for ' + key + ' doesn\'t resolve to a string.');

            if (conditionValue.indexOf('/') !== -1) throw new TypeError('Unabled to interpolate conditional ' + key + (parentKey ? ' in ' + parentKey : '') + '\n\tThe condition value ' + conditionValue + ' cannot contain a "/" separator.');

            return key.replace(interpolationRegEx, conditionValue);
          });
        }

        /*
         Extend config merging one deep only
            loader.config({
            some: 'random',
            config: 'here',
            deep: {
              config: { too: 'too' }
            }
          });
            <=>
            loader.some = 'random';
          loader.config = 'here'
          loader.deep = loader.deep || {};
          loader.deep.config = { too: 'too' };
        
          Normalizes meta and package configs allowing for:
            SystemJS.config({
            meta: {
              './index.js': {}
            }
          });
            To become
            SystemJS.meta['https://thissite.com/index.js'] = {};
            For easy normalization canonicalization with latest URL support.
          */
        var envConfigNames = ['browserConfig', 'nodeConfig', 'devConfig', 'buildConfig', 'productionConfig'];
        function envSet(loader, cfg, envCallback) {
          for (var i = 0; i < envConfigNames.length; i++) {
            var envConfig = envConfigNames[i];
            if (cfg[envConfig] && envModule[envConfig.substr(0, envConfig.length - 6)]) envCallback(cfg[envConfig]);
          }
        }

        function cloneObj(obj, maxDepth) {
          var clone = {};
          for (var p in obj) {
            var prop = obj[p];
            if (maxDepth > 1) {
              if (prop instanceof Array) clone[p] = [].concat(prop);else if ((typeof prop === "undefined" ? "undefined" : _typeof(prop)) === 'object') clone[p] = cloneObj(prop, maxDepth - 1);else if (p !== 'packageConfig') clone[p] = prop;
            } else {
              clone[p] = prop;
            }
          }
          return clone;
        }

        function getConfigItem(config, p) {
          var cfgItem = config[p];

          // getConfig must return an unmodifiable clone of the configuration
          if (cfgItem instanceof Array) return config[p].concat([]);else if ((typeof cfgItem === "undefined" ? "undefined" : _typeof(cfgItem)) === 'object') return cloneObj(cfgItem, 3);else return config[p];
        }

        function getConfig(configName) {
          if (configName) {
            if (configNames.indexOf(configName) !== -1) return getConfigItem(this[CONFIG], configName);
            throw new Error('"' + configName + '" is not a valid configuration name. Must be one of ' + configNames.join(', ') + '.');
          }

          var cfg = {};
          for (var i = 0; i < configNames.length; i++) {
            var p = configNames[i];
            var configItem = getConfigItem(this[CONFIG], p);
            if (configItem !== undefined) cfg[p] = configItem;
          }
          return cfg;
        }

        function setConfig(cfg, isEnvConfig) {
          var loader = this;
          var config = this[CONFIG];

          if ('warnings' in cfg) config.warnings = cfg.warnings;

          if ('wasm' in cfg) config.wasm = typeof WebAssembly !== 'undefined' && cfg.wasm;

          if ('production' in cfg || 'build' in cfg) setProduction.call(loader, !!cfg.production, !!(cfg.build || envModule && envModule.build));

          if (!isEnvConfig) {
            // if using nodeConfig / browserConfig / productionConfig, take baseURL from there
            // these exceptions will be unnecessary when we can properly implement config queuings
            var baseURL;
            envSet(loader, cfg, function (cfg) {
              baseURL = baseURL || cfg.baseURL;
            });
            baseURL = baseURL || cfg.baseURL;

            // always configure baseURL first
            if (baseURL) {
              config.baseURL = resolveIfNotPlain(baseURL, baseURI) || resolveIfNotPlain('./' + baseURL, baseURI);
              if (config.baseURL[config.baseURL.length - 1] !== '/') config.baseURL += '/';
            }

            if (cfg.paths) extend(config.paths, cfg.paths);

            envSet(loader, cfg, function (cfg) {
              if (cfg.paths) extend(config.paths, cfg.paths);
            });

            for (var p in config.paths) {
              if (config.paths[p].indexOf('*') === -1) continue;
              warn.call(config, 'Path config ' + p + ' -> ' + config.paths[p] + ' is no longer supported as wildcards are deprecated.');
              delete config.paths[p];
            }
          }

          if (cfg.defaultJSExtensions) warn.call(config, 'The defaultJSExtensions configuration option is deprecated.\n  Use packages defaultExtension instead.', true);

          if (typeof cfg.pluginFirst === 'boolean') config.pluginFirst = cfg.pluginFirst;

          if (cfg.map) {
            for (var p in cfg.map) {
              var v = cfg.map[p];

              if (typeof v === 'string') {
                var mapped = coreResolve.call(loader, config, v, undefined, false, false);
                if (mapped[mapped.length - 1] === '/' && p[p.length - 1] !== ':' && p[p.length - 1] !== '/') mapped = mapped.substr(0, mapped.length - 1);
                config.map[p] = mapped;
              }

              // object map
              else {
                  var pkgName = coreResolve.call(loader, config, p[p.length - 1] !== '/' ? p + '/' : p, undefined, true, true);
                  pkgName = pkgName.substr(0, pkgName.length - 1);

                  var pkg = config.packages[pkgName];
                  if (!pkg) {
                    pkg = config.packages[pkgName] = createPackage();
                    // use '' instead of false to keep type consistent
                    pkg.defaultExtension = '';
                  }
                  setPkgConfig(pkg, { map: v }, pkgName, false, config);
                }
            }
          }

          if (cfg.packageConfigPaths) {
            var packageConfigPaths = [];
            for (var i = 0; i < cfg.packageConfigPaths.length; i++) {
              var path = cfg.packageConfigPaths[i];
              var packageLength = Math.max(path.lastIndexOf('*') + 1, path.lastIndexOf('/'));
              var normalized = coreResolve.call(loader, config, path.substr(0, packageLength), undefined, false, false);
              packageConfigPaths[i] = normalized + path.substr(packageLength);
            }
            config.packageConfigPaths = packageConfigPaths;
          }

          if (cfg.bundles) {
            for (var p in cfg.bundles) {
              var bundle = [];
              for (var i = 0; i < cfg.bundles[p].length; i++) {
                bundle.push(loader.normalizeSync(cfg.bundles[p][i]));
              }config.bundles[p] = bundle;
            }
          }

          if (cfg.packages) {
            for (var p in cfg.packages) {
              if (p.match(/^([^\/]+:)?\/\/$/)) throw new TypeError('"' + p + '" is not a valid package name.');

              var pkgName = coreResolve.call(loader, config, p[p.length - 1] !== '/' ? p + '/' : p, undefined, true, true);
              pkgName = pkgName.substr(0, pkgName.length - 1);

              setPkgConfig(config.packages[pkgName] = config.packages[pkgName] || createPackage(), cfg.packages[p], pkgName, false, config);
            }
          }

          if (cfg.depCache) {
            for (var p in cfg.depCache) {
              config.depCache[loader.normalizeSync(p)] = [].concat(cfg.depCache[p]);
            }
          }

          if (cfg.meta) {
            for (var p in cfg.meta) {
              // base wildcard stays base
              if (p[0] === '*') {
                extend(config.meta[p] = config.meta[p] || {}, cfg.meta[p]);
              } else {
                var resolved = coreResolve.call(loader, config, p, undefined, true, true);
                extend(config.meta[resolved] = config.meta[resolved] || {}, cfg.meta[p]);
              }
            }
          }

          if ('transpiler' in cfg) config.transpiler = cfg.transpiler;

          // copy any remaining non-standard configuration properties
          for (var c in cfg) {
            if (configNames.indexOf(c) !== -1) continue;
            if (envConfigNames.indexOf(c) !== -1) continue;

            // warn.call(config, 'Setting custom config option `System.config({ ' + c + ': ... })` is deprecated. Avoid custom config options or set SystemJS.' + c + ' = ... directly.');
            loader[c] = cfg[c];
          }

          envSet(loader, cfg, function (cfg) {
            loader.config(cfg, true);
          });
        }

        function createPackage() {
          return {
            defaultExtension: undefined,
            main: undefined,
            format: undefined,
            meta: undefined,
            map: undefined,
            packageConfig: undefined,
            configured: false
          };
        }

        // deeply-merge (to first level) config with any existing package config
        function setPkgConfig(pkg, cfg, pkgName, prependConfig, config) {
          for (var prop in cfg) {
            if (prop === 'main' || prop === 'format' || prop === 'defaultExtension' || prop === 'configured') {
              if (!prependConfig || pkg[prop] === undefined) pkg[prop] = cfg[prop];
            } else if (prop === 'map') {
              (prependConfig ? prepend : extend)(pkg.map = pkg.map || {}, cfg.map);
            } else if (prop === 'meta') {
              (prependConfig ? prepend : extend)(pkg.meta = pkg.meta || {}, cfg.meta);
            } else if (Object.hasOwnProperty.call(cfg, prop)) {
              warn.call(config, '"' + prop + '" is not a valid package configuration option in package ' + pkgName);
            }
          }

          // default defaultExtension for packages only
          if (pkg.defaultExtension === undefined) pkg.defaultExtension = 'js';

          if (pkg.main === undefined && pkg.map && pkg.map['.']) {
            pkg.main = pkg.map['.'];
            delete pkg.map['.'];
          }
          // main object becomes main map
          else if (_typeof(pkg.main) === 'object') {
              pkg.map = pkg.map || {};
              pkg.map['./@main'] = pkg.main;
              pkg.main['default'] = pkg.main['default'] || './';
              pkg.main = '@main';
            }

          return pkg;
        }

        var hasBuffer = typeof Buffer !== 'undefined';
        try {
          if (hasBuffer && new Buffer('a').toString('base64') !== 'YQ==') hasBuffer = false;
        } catch (e) {
          hasBuffer = false;
        }

        var sourceMapPrefix = '\n//# sourceMapping' + 'URL=data:application/json;base64,';
        function inlineSourceMap(sourceMapString) {
          if (hasBuffer) return sourceMapPrefix + new Buffer(sourceMapString).toString('base64');else if (typeof btoa !== 'undefined') return sourceMapPrefix + btoa(unescape(encodeURIComponent(sourceMapString)));else return '';
        }

        function getSource(source, sourceMap, address, wrap) {
          var lastLineIndex = source.lastIndexOf('\n');

          if (sourceMap) {
            if ((typeof sourceMap === "undefined" ? "undefined" : _typeof(sourceMap)) != 'object') throw new TypeError('load.metadata.sourceMap must be set to an object.');

            sourceMap = JSON.stringify(sourceMap);
          }

          return (wrap ? '(function(System, SystemJS) {' : '') + source + (wrap ? '\n})(System, System);' : '')
          // adds the sourceURL comment if not already present
          + (source.substr(lastLineIndex, 15) != '\n//# sourceURL=' ? '\n//# sourceURL=' + address + (sourceMap ? '!transpiled' : '') : '')
          // add sourceMappingURL if load.metadata.sourceMap is set
          + (sourceMap && inlineSourceMap(sourceMap) || '');
        }

        // script execution via injecting a script tag into the page
        // this allows CSP nonce to be set for CSP environments
        var head;
        function scriptExec(loader, source, sourceMap, address, nonce) {
          if (!head) head = document.head || document.body || document.documentElement;

          var script = document.createElement('script');
          script.text = getSource(source, sourceMap, address, false);
          var onerror = window.onerror;
          var e;
          window.onerror = function (_e) {
            e = addToError(_e, 'Evaluating ' + address);
            if (onerror) onerror.apply(this, arguments);
          };
          preExec(loader);

          if (nonce) script.setAttribute('nonce', nonce);

          head.appendChild(script);
          head.removeChild(script);
          postExec();
          window.onerror = onerror;
          if (e) return e;
        }

        var vm;
        var useVm;

        var curSystem;

        var callCounter = 0;
        function preExec(loader) {
          if (callCounter++ == 0) curSystem = envGlobal.System;
          envGlobal.System = envGlobal.SystemJS = loader;
        }
        function postExec() {
          if (--callCounter == 0) envGlobal.System = envGlobal.SystemJS = curSystem;
        }

        var supportsScriptExec = false;
        if (isBrowser && typeof document != 'undefined' && document.getElementsByTagName) {
          if (!(window.chrome && window.chrome.extension || navigator.userAgent.match(/^Node\.js/))) supportsScriptExec = true;
        }

        function evaluate(loader, source, sourceMap, address, integrity, nonce, noWrap) {
          if (!source) return;
          if (nonce && supportsScriptExec) return scriptExec(loader, source, sourceMap, address, nonce);
          try {
            preExec(loader);
            // global scoped eval for node (avoids require scope leak)
            if (!vm && loader._nodeRequire) {
              vm = loader._nodeRequire('vm');
              useVm = vm.runInThisContext("typeof System !== 'undefined' && System") === loader;
            }
            if (useVm) vm.runInThisContext(getSource(source, sourceMap, address, !noWrap), { filename: address + (sourceMap ? '!transpiled' : '') });else (0, eval)(getSource(source, sourceMap, address, !noWrap));
            postExec();
          } catch (e) {
            postExec();
            return e;
          }
        }

        function setHelpers(loader) {
          loader.set('@@cjs-helpers', loader.newModule({
            requireResolve: requireResolve.bind(loader),
            getPathVars: getPathVars
          }));

          loader.set('@@global-helpers', loader.newModule({
            prepareGlobal: prepareGlobal
          }));
        }

        function setAmdHelper(loader) {

          /*
            AMD-compatible require
            To copy RequireJS, set window.require = window.requirejs = loader.amdRequire
          */
          function require(names, callback, errback, referer) {
            // in amd, first arg can be a config object... we just ignore
            if ((typeof names === "undefined" ? "undefined" : _typeof(names)) === 'object' && !(names instanceof Array)) return require.apply(null, Array.prototype.splice.call(arguments, 1, arguments.length - 1));

            // amd require
            if (typeof names === 'string' && typeof callback === 'function') names = [names];
            if (names instanceof Array) {
              var dynamicRequires = [];
              for (var i = 0; i < names.length; i++) {
                dynamicRequires.push(loader.import(names[i], referer));
              }Promise.all(dynamicRequires).then(function (modules) {
                if (callback) callback.apply(null, modules);
              }, errback);
            }

            // commonjs require
            else if (typeof names === 'string') {
                var normalized = loader.decanonicalize(names, referer);
                var module = loader.get(normalized);
                if (!module) throw new Error('Module not already loaded loading "' + names + '" as ' + normalized + (referer ? ' from "' + referer + '".' : '.'));
                return '__useDefault' in module ? module.__useDefault : module;
              } else throw new TypeError('Invalid require');
          }

          function define(name, deps, factory) {
            if (typeof name !== 'string') {
              factory = deps;
              deps = name;
              name = null;
            }

            if (!(deps instanceof Array)) {
              factory = deps;
              deps = ['require', 'exports', 'module'].splice(0, factory.length);
            }

            if (typeof factory !== 'function') factory = function (factory) {
              return function () {
                return factory;
              };
            }(factory);

            if (!name) {
              if (curMetaDeps) {
                deps = deps.concat(curMetaDeps);
                curMetaDeps = undefined;
              }
            }

            // remove system dependencies
            var requireIndex, exportsIndex, moduleIndex;

            if ((requireIndex = deps.indexOf('require')) !== -1) {

              deps.splice(requireIndex, 1);

              // only trace cjs requires for non-named
              // named defines assume the trace has already been done
              if (!name) deps = deps.concat(amdGetCJSDeps(factory.toString(), requireIndex));
            }

            if ((exportsIndex = deps.indexOf('exports')) !== -1) deps.splice(exportsIndex, 1);

            if ((moduleIndex = deps.indexOf('module')) !== -1) deps.splice(moduleIndex, 1);

            function execute(req, exports, module) {
              var depValues = [];
              for (var i = 0; i < deps.length; i++) {
                depValues.push(req(deps[i]));
              }module.uri = module.id;

              module.config = noop;

              // add back in system dependencies
              if (moduleIndex !== -1) depValues.splice(moduleIndex, 0, module);

              if (exportsIndex !== -1) depValues.splice(exportsIndex, 0, exports);

              if (requireIndex !== -1) {
                var contextualRequire = function contextualRequire(names, callback, errback) {
                  if (typeof names === 'string' && typeof callback !== 'function') return req(names);
                  return require.call(loader, names, callback, errback, module.id);
                };
                contextualRequire.toUrl = function (name) {
                  return loader.normalizeSync(name, module.id);
                };
                depValues.splice(requireIndex, 0, contextualRequire);
              }

              // set global require to AMD require
              var curRequire = envGlobal.require;
              envGlobal.require = require;

              var output = factory.apply(exportsIndex === -1 ? envGlobal : exports, depValues);

              envGlobal.require = curRequire;

              if (typeof output !== 'undefined') module.exports = output;
            }

            // anonymous define
            if (!name) {
              loader.registerDynamic(deps, false, curEsModule ? wrapEsModuleExecute(execute) : execute);
            } else {
              loader.registerDynamic(name, deps, false, execute);

              // if we don't have any other defines,
              // then let this be an anonymous define
              // this is just to support single modules of the form:
              // define('jquery')
              // still loading anonymously
              // because it is done widely enough to be useful
              // as soon as there is more than one define, this gets removed though
              if (lastNamedDefine) {
                lastNamedDefine = undefined;
                multipleNamedDefines = true;
              } else if (!multipleNamedDefines) {
                lastNamedDefine = [deps, execute];
              }
            }
          }
          define.amd = {};

          loader.amdDefine = define;
          loader.amdRequire = require;
        }

        // CJS
        var windowOrigin;
        if (typeof window !== 'undefined' && typeof document !== 'undefined' && window.location) windowOrigin = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

        function stripOrigin(path) {
          if (path.substr(0, 8) === 'file:///') return path.substr(7 + !!isWindows);

          if (windowOrigin && path.substr(0, windowOrigin.length) === windowOrigin) return path.substr(windowOrigin.length);

          return path;
        }

        function requireResolve(request, parentId) {
          return stripOrigin(this.normalizeSync(request, parentId));
        }

        function getPathVars(moduleId) {
          // remove any plugin syntax
          var pluginIndex = moduleId.lastIndexOf('!');
          var filename;
          if (pluginIndex !== -1) filename = moduleId.substr(0, pluginIndex);else filename = moduleId;

          var dirname = filename.split('/');
          dirname.pop();
          dirname = dirname.join('/');

          return {
            filename: stripOrigin(filename),
            dirname: stripOrigin(dirname)
          };
        }

        var commentRegEx = /(^|[^\\])(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
        var stringRegEx = /("[^"\\\n\r]*(\\.[^"\\\n\r]*)*"|'[^'\\\n\r]*(\\.[^'\\\n\r]*)*')/g;

        // extract CJS dependencies from source text via regex static analysis
        // read require('x') statements not in comments or strings
        function getCJSDeps(source) {
          cjsRequireRegEx.lastIndex = commentRegEx.lastIndex = stringRegEx.lastIndex = 0;

          var deps = [];

          var match;

          // track string and comment locations for unminified source
          var stringLocations = [],
              commentLocations = [];

          function inLocation(locations, match) {
            for (var i = 0; i < locations.length; i++) {
              if (locations[i][0] < match.index && locations[i][1] > match.index) return true;
            }return false;
          }

          if (source.length / source.split('\n').length < 200) {
            while (match = stringRegEx.exec(source)) {
              stringLocations.push([match.index, match.index + match[0].length]);
            } // TODO: track template literals here before comments

            while (match = commentRegEx.exec(source)) {
              // only track comments not starting in strings
              if (!inLocation(stringLocations, match)) commentLocations.push([match.index + match[1].length, match.index + match[0].length - 1]);
            }
          }

          while (match = cjsRequireRegEx.exec(source)) {
            // ensure we're not within a string or comment location
            if (!inLocation(stringLocations, match) && !inLocation(commentLocations, match)) {
              var dep = match[1].substr(1, match[1].length - 2);
              // skip cases like require('" + file + "')
              if (dep.match(/"|'/)) continue;
              deps.push(dep);
            }
          }

          return deps;
        }

        // Global
        // bare minimum ignores
        var ignoredGlobalProps = ['_g', 'sessionStorage', 'localStorage', 'clipboardData', 'frames', 'frameElement', 'external', 'mozAnimationStartTime', 'mozPaintCount', 'webkitStorageInfo', 'webkitIndexedDB', 'mozInnerScreenY', 'mozInnerScreenX'];

        var globalSnapshot;
        function globalIterator(globalName) {
          if (ignoredGlobalProps.indexOf(globalName) !== -1) return;
          try {
            var value = envGlobal[globalName];
          } catch (e) {
            ignoredGlobalProps.push(globalName);
          }
          this(globalName, value);
        }

        function getGlobalValue(exports) {
          if (typeof exports === 'string') return readMemberExpression(exports, envGlobal);

          if (!(exports instanceof Array)) throw new Error('Global exports must be a string or array.');

          var globalValue = {};
          for (var i = 0; i < exports.length; i++) {
            globalValue[exports[i].split('.').pop()] = readMemberExpression(exports[i], envGlobal);
          }return globalValue;
        }

        function prepareGlobal(moduleName, exports, globals, encapsulate) {
          // disable module detection
          var curDefine = envGlobal.define;

          envGlobal.define = undefined;

          // set globals
          var oldGlobals;
          if (globals) {
            oldGlobals = {};
            for (var g in globals) {
              oldGlobals[g] = envGlobal[g];
              envGlobal[g] = globals[g];
            }
          }

          // store a complete copy of the global object in order to detect changes
          if (!exports) {
            globalSnapshot = {};

            Object.keys(envGlobal).forEach(globalIterator, function (name, value) {
              globalSnapshot[name] = value;
            });
          }

          // return function to retrieve global
          return function () {
            var globalValue = exports ? getGlobalValue(exports) : {};

            var singleGlobal;
            var multipleExports = !!exports;

            if (!exports || encapsulate) Object.keys(envGlobal).forEach(globalIterator, function (name, value) {
              if (globalSnapshot[name] === value) return;
              if (value === undefined) return;

              // allow global encapsulation where globals are removed
              if (encapsulate) envGlobal[name] = undefined;

              if (!exports) {
                globalValue[name] = value;

                if (singleGlobal !== undefined) {
                  if (!multipleExports && singleGlobal !== value) multipleExports = true;
                } else {
                  singleGlobal = value;
                }
              }
            });

            globalValue = multipleExports ? globalValue : singleGlobal;

            // revert globals
            if (oldGlobals) {
              for (var g in oldGlobals) {
                envGlobal[g] = oldGlobals[g];
              }
            }
            envGlobal.define = curDefine;

            return globalValue;
          };
        }

        // AMD
        var cjsRequirePre = "(?:^|[^$_a-zA-Z\\xA0-\\uFFFF.])";
        var cjsRequirePost = "\\s*\\(\\s*(\"([^\"]+)\"|'([^']+)')\\s*\\)";
        var fnBracketRegEx = /\(([^\)]*)\)/;
        var wsRegEx = /^\s+|\s+$/g;

        var requireRegExs = {};

        function amdGetCJSDeps(source, requireIndex) {

          // remove comments
          source = source.replace(commentRegEx, '');

          // determine the require alias
          var params = source.match(fnBracketRegEx);
          var requireAlias = (params[1].split(',')[requireIndex] || 'require').replace(wsRegEx, '');

          // find or generate the regex for this requireAlias
          var requireRegEx = requireRegExs[requireAlias] || (requireRegExs[requireAlias] = new RegExp(cjsRequirePre + requireAlias + cjsRequirePost, 'g'));

          requireRegEx.lastIndex = 0;

          var deps = [];

          var match;
          while (match = requireRegEx.exec(source)) {
            deps.push(match[2] || match[3]);
          }return deps;
        }

        function wrapEsModuleExecute(execute) {
          return function (require, exports, module) {
            execute(require, exports, module);
            exports = module.exports;
            if (((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' || typeof exports === 'function') && !('__esModule' in exports)) Object.defineProperty(module.exports, '__esModule', {
              value: true
            });
          };
        }

        // generate anonymous define from singular named define
        var multipleNamedDefines = false;
        var lastNamedDefine;
        var curMetaDeps;
        var curEsModule = false;
        function clearLastDefine(metaDeps, esModule) {
          curMetaDeps = metaDeps;
          curEsModule = esModule;
          lastNamedDefine = undefined;
          multipleNamedDefines = false;
        }
        function registerLastDefine(loader) {
          if (lastNamedDefine) loader.registerDynamic(curMetaDeps ? lastNamedDefine[0].concat(curMetaDeps) : lastNamedDefine[0], false, curEsModule ? wrapEsModuleExecute(lastNamedDefine[1]) : lastNamedDefine[1]);

          // bundles are an empty module
          else if (multipleNamedDefines) loader.registerDynamic([], false, noop);
        }

        var supportsScriptLoad = (isBrowser || isWorker) && typeof navigator !== 'undefined' && navigator.userAgent && !navigator.userAgent.match(/MSIE (9|10).0/);

        // include the node require since we're overriding it
        var nodeRequire;
        if (typeof require !== 'undefined' && typeof process !== 'undefined' && !process.browser) nodeRequire = require;

        function setMetaEsModule(metadata, moduleValue) {
          if (metadata.load.esModule && ((typeof moduleValue === "undefined" ? "undefined" : _typeof(moduleValue)) === 'object' || typeof moduleValue === 'function') && !('__esModule' in moduleValue)) Object.defineProperty(moduleValue, '__esModule', {
            value: true
          });
        }

        function instantiate$1(key, processAnonRegister) {
          var loader = this;
          var config = this[CONFIG];
          // first do bundles and depCache
          return (loadBundlesAndDepCache(config, this, key) || resolvedPromise$2).then(function () {
            if (processAnonRegister()) return;

            var metadata = loader[METADATA][key];

            // node module loading
            if (key.substr(0, 6) === '@node/') {
              if (!loader._nodeRequire) throw new TypeError('Error loading ' + key + '. Can only load node core modules in Node.');
              loader.registerDynamic([], false, function () {
                return loadNodeModule.call(loader, key.substr(6), loader.baseURL);
              });
              processAnonRegister();
              return;
            }

            if (metadata.load.scriptLoad) {
              if (metadata.load.pluginKey || !supportsScriptLoad) {
                metadata.load.scriptLoad = false;
                warn.call(config, 'scriptLoad not supported for "' + key + '"');
              }
            } else if (metadata.load.scriptLoad !== false && !metadata.load.pluginKey && supportsScriptLoad) {
              // auto script load AMD, global without deps
              if (!metadata.load.deps && !metadata.load.globals && (metadata.load.format === 'system' || metadata.load.format === 'register' || metadata.load.format === 'global' && metadata.load.exports)) metadata.load.scriptLoad = true;
            }

            // fetch / translate / instantiate pipeline
            if (!metadata.load.scriptLoad) return initializePlugin(loader, key, metadata).then(function () {
              return runFetchPipeline(loader, key, metadata, processAnonRegister, config.wasm);
            });

            // just script loading
            return new Promise(function (resolve, reject) {
              if (metadata.load.format === 'amd' && envGlobal.define !== loader.amdDefine) throw new Error('Loading AMD with scriptLoad requires setting the global `' + globalName + '.define = SystemJS.amdDefine`');

              scriptLoad(key, metadata.load.crossOrigin, metadata.load.integrity, function () {
                if (!processAnonRegister()) {
                  metadata.load.format = 'global';
                  var globalValue = metadata.load.exports && getGlobalValue(metadata.load.exports);
                  loader.registerDynamic([], false, function () {
                    setMetaEsModule(metadata, globalValue);
                    return globalValue;
                  });
                  processAnonRegister();
                }

                resolve();
              }, reject);
            });
          }).then(function (instantiated) {
            delete loader[METADATA][key];
            return instantiated;
          });
        }
        function initializePlugin(loader, key, metadata) {
          if (!metadata.pluginKey) return resolvedPromise$2;

          return loader.import(metadata.pluginKey).then(function (plugin) {
            metadata.pluginModule = plugin;
            metadata.pluginLoad = {
              name: key,
              address: metadata.pluginArgument,
              source: undefined,
              metadata: metadata.load
            };
            metadata.load.deps = metadata.load.deps || [];
          });
        }

        function loadBundlesAndDepCache(config, loader, key) {
          // load direct deps, in turn will pick up their trace trees
          var deps;
          if (isBrowser && (deps = config.depCache[key])) {
            for (var i = 0; i < deps.length; i++) {
              loader.normalize(deps[i], key).then(preloadScript);
            }
          } else {
            var matched = false;
            for (var b in config.bundles) {
              for (var i = 0; i < config.bundles[b].length; i++) {
                var curModule = config.bundles[b][i];

                if (curModule === key) {
                  matched = true;
                  break;
                }

                // wildcard in bundles includes / boundaries
                if (curModule.indexOf('*') !== -1) {
                  var parts = curModule.split('*');
                  if (parts.length !== 2) {
                    config.bundles[b].splice(i--, 1);
                    continue;
                  }

                  if (key.substr(0, parts[0].length) === parts[0] && key.substr(key.length - parts[1].length, parts[1].length) === parts[1]) {
                    matched = true;
                    break;
                  }
                }
              }

              if (matched) return loader.import(b);
            }
          }
        }

        function runFetchPipeline(loader, key, metadata, processAnonRegister, wasm) {
          if (metadata.load.exports && !metadata.load.format) metadata.load.format = 'global';

          return resolvedPromise$2

          // locate
          .then(function () {
            if (!metadata.pluginModule || !metadata.pluginModule.locate) return;

            return Promise.resolve(metadata.pluginModule.locate.call(loader, metadata.pluginLoad)).then(function (address) {
              if (address) metadata.pluginLoad.address = address;
            });
          })

          // fetch
          .then(function () {
            if (!metadata.pluginModule) return fetch$1(key, metadata.load.authorization, metadata.load.integrity, wasm);

            wasm = false;

            if (!metadata.pluginModule.fetch) return fetch$1(metadata.pluginLoad.address, metadata.load.authorization, metadata.load.integrity, false);

            return metadata.pluginModule.fetch.call(loader, metadata.pluginLoad, function (load) {
              return fetch$1(load.address, metadata.load.authorization, metadata.load.integrity, false);
            });
          }).then(function (fetched) {
            // fetch is already a utf-8 string if not doing wasm detection
            if (!wasm || typeof fetched === 'string') return translateAndInstantiate(loader, key, fetched, metadata, processAnonRegister);

            return checkInstantiateWasm(loader, fetched, processAnonRegister).then(function (wasmInstantiated) {
              if (wasmInstantiated) return;

              // not wasm -> convert buffer into utf-8 string to execute as a module
              // TextDecoder compatibility matches WASM currently. Need to keep checking this.
              // The TextDecoder interface is documented at http://encoding.spec.whatwg.org/#interface-textdecoder
              var stringSource = isBrowser ? new TextDecoder('utf-8').decode(new Uint8Array(fetched)) : fetched.toString();
              return translateAndInstantiate(loader, key, stringSource, metadata, processAnonRegister);
            });
          });
        }

        function translateAndInstantiate(loader, key, source, metadata, processAnonRegister) {
          return Promise.resolve(source)
          // translate
          .then(function (source) {
            if (metadata.load.format === 'detect') metadata.load.format = undefined;

            readMetaSyntax(source, metadata);

            if (!metadata.pluginModule) return source;

            metadata.pluginLoad.source = source;

            if (!metadata.pluginModule.translate) return source;

            return Promise.resolve(metadata.pluginModule.translate.call(loader, metadata.pluginLoad, metadata.traceOpts)).then(function (translated) {
              if (metadata.load.sourceMap) {
                if (_typeof(metadata.load.sourceMap) !== 'object') throw new Error('metadata.load.sourceMap must be set to an object.');
                sanitizeSourceMap(metadata.pluginLoad.address, metadata.load.sourceMap);
              }

              if (typeof translated === 'string') return translated;else return metadata.pluginLoad.source;
            });
          }).then(function (source) {
            if (!metadata.load.format && source.substring(0, 8) === '"bundle"') {
              metadata.load.format = 'system';
              return source;
            }

            if (metadata.load.format === 'register' || !metadata.load.format && detectRegisterFormat(source)) {
              metadata.load.format = 'register';
              return source;
            }

            if (metadata.load.format !== 'esm' && (metadata.load.format || !source.match(esmRegEx))) {
              return source;
            }

            metadata.load.format = 'esm';
            return transpile(loader, source, key, metadata, processAnonRegister);
          })

          // instantiate
          .then(function (translated) {
            if (typeof translated !== 'string' || !metadata.pluginModule || !metadata.pluginModule.instantiate) return translated;

            var calledInstantiate = false;
            metadata.pluginLoad.source = translated;
            return Promise.resolve(metadata.pluginModule.instantiate.call(loader, metadata.pluginLoad, function (load) {
              translated = load.source;
              metadata.load = load.metadata;
              if (calledInstantiate) throw new Error('Instantiate must only be called once.');
              calledInstantiate = true;
            })).then(function (result) {
              if (calledInstantiate) return translated;
              return protectedCreateNamespace(result);
            });
          }).then(function (source) {
            // plugin instantiate result case
            if (typeof source !== 'string') return source;

            if (!metadata.load.format) metadata.load.format = detectLegacyFormat(source);

            var registered = false;

            switch (metadata.load.format) {
              case 'esm':
              case 'register':
              case 'system':
                var err = evaluate(loader, source, metadata.load.sourceMap, key, metadata.load.integrity, metadata.load.nonce, false);
                if (err) throw err;
                if (!processAnonRegister()) return emptyModule;
                return;
                break;

              case 'json':
                // warn.call(config, '"json" module format is deprecated.');
                var parsed = JSON.parse(source);
                return loader.newModule({ default: parsed, __useDefault: parsed });

              case 'amd':
                var curDefine = envGlobal.define;
                envGlobal.define = loader.amdDefine;

                clearLastDefine(metadata.load.deps, metadata.load.esModule);

                var err = evaluate(loader, source, metadata.load.sourceMap, key, metadata.load.integrity, metadata.load.nonce, false);

                // if didn't register anonymously, use the last named define if only one
                registered = processAnonRegister();
                if (!registered) {
                  registerLastDefine(loader);
                  registered = processAnonRegister();
                }

                envGlobal.define = curDefine;

                if (err) throw err;
                break;

              case 'cjs':
                var metaDeps = metadata.load.deps;
                var deps = (metadata.load.deps || []).concat(metadata.load.cjsRequireDetection ? getCJSDeps(source) : []);

                for (var g in metadata.load.globals) {
                  if (metadata.load.globals[g]) deps.push(metadata.load.globals[g]);
                }loader.registerDynamic(deps, true, function (require, exports, module) {
                  require.resolve = function (key) {
                    return requireResolve.call(loader, key, module.id);
                  };
                  // support module.paths ish
                  module.paths = [];
                  module.require = require;

                  // ensure meta deps execute first
                  if (!metadata.load.cjsDeferDepsExecute && metaDeps) for (var i = 0; i < metaDeps.length; i++) {
                    require(metaDeps[i]);
                  }var pathVars = getPathVars(module.id);
                  var __cjsWrapper = {
                    exports: exports,
                    args: [require, exports, module, pathVars.filename, pathVars.dirname, envGlobal, envGlobal]
                  };

                  var cjsWrapper = "(function (require, exports, module, __filename, __dirname, global, GLOBAL";

                  // add metadata.globals to the wrapper arguments
                  if (metadata.load.globals) for (var g in metadata.load.globals) {
                    __cjsWrapper.args.push(require(metadata.load.globals[g]));
                    cjsWrapper += ", " + g;
                  }

                  // disable AMD detection
                  var define = envGlobal.define;
                  envGlobal.define = undefined;
                  envGlobal.__cjsWrapper = __cjsWrapper;

                  source = cjsWrapper + ") {" + source.replace(hashBangRegEx$1, '') + "\n}).apply(__cjsWrapper.exports, __cjsWrapper.args);";

                  var err = evaluate(loader, source, metadata.load.sourceMap, key, metadata.load.integrity, metadata.load.nonce, false);
                  if (err) throw err;

                  setMetaEsModule(metadata, exports);

                  envGlobal.__cjsWrapper = undefined;
                  envGlobal.define = define;
                });
                registered = processAnonRegister();
                break;

              case 'global':
                var deps = metadata.load.deps || [];
                for (var g in metadata.load.globals) {
                  var gl = metadata.load.globals[g];
                  if (gl) deps.push(gl);
                }

                loader.registerDynamic(deps, false, function (require, exports, module) {
                  var globals;
                  if (metadata.load.globals) {
                    globals = {};
                    for (var g in metadata.load.globals) {
                      if (metadata.load.globals[g]) globals[g] = require(metadata.load.globals[g]);
                    }
                  }

                  var exportName = metadata.load.exports;

                  if (exportName) source += '\n' + globalName + '["' + exportName + '"] = ' + exportName + ';';

                  var retrieveGlobal = prepareGlobal(module.id, exportName, globals, metadata.load.encapsulateGlobal);
                  var err = evaluate(loader, source, metadata.load.sourceMap, key, metadata.load.integrity, metadata.load.nonce, true);

                  if (err) throw err;

                  var output = retrieveGlobal();
                  setMetaEsModule(metadata, output);
                  return output;
                });
                registered = processAnonRegister();
                break;

              default:
                throw new TypeError('Unknown module format "' + metadata.load.format + '" for "' + key + '".' + (metadata.load.format === 'es6' ? ' Use "esm" instead here.' : ''));
            }

            if (!registered) throw new Error('Module ' + key + ' detected as ' + metadata.load.format + ' but didn\'t execute correctly.');
          });
        }

        var globalName = typeof self != 'undefined' ? 'self' : 'global';

        // good enough ES6 module detection regex - format detections not designed to be accurate, but to handle the 99% use case
        var esmRegEx = /(^\s*|[}\);\n]\s*)(import\s*(['"]|(\*\s+as\s+)?(?!type)([^"'\(\)\n; ]+)\s*from\s*['"]|\{)|export\s+\*\s+from\s+["']|export\s*(\{|default|function|class|var|const|let|async\s+function))/;

        var leadingCommentAndMetaRegEx = /^(\s*\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)*\s*/;
        function detectRegisterFormat(source) {
          var leadingCommentAndMeta = source.match(leadingCommentAndMetaRegEx);
          if (!leadingCommentAndMeta) return false;
          var codeStart = leadingCommentAndMeta[0].length;
          return source.startsWith('System.register', codeStart) || source.startsWith('SystemJS.register', codeStart);
        }

        // AMD Module Format Detection RegEx
        // define([.., .., ..], ...)
        // define(varName); || define(function(require, exports) {}); || define({})
        var amdRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])define\s*\(\s*("[^"]+"\s*,\s*|'[^']+'\s*,\s*)?\s*(\[(\s*(("[^"]+"|'[^']+')\s*,|\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*(\s*("[^"]+"|'[^']+')\s*,?)?(\s*(\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*\s*\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/;

        /// require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
        var cjsExportsRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])(exports\s*(\[['"]|\.)|module(\.exports|\['exports'\]|\["exports"\])\s*(\[['"]|[=,\.]))/;

        // used to support leading #!/usr/bin/env in scripts as supported in Node
        var hashBangRegEx$1 = /^\#\!.*/;

        function detectLegacyFormat(source) {
          if (source.match(amdRegEx)) return 'amd';

          cjsExportsRegEx.lastIndex = 0;
          cjsRequireRegEx.lastIndex = 0;
          if (cjsRequireRegEx.exec(source) || cjsExportsRegEx.exec(source)) return 'cjs';

          // global is the fallback format
          return 'global';
        }

        function sanitizeSourceMap(address, sourceMap) {
          var originalName = address.split('!')[0];

          // force set the filename of the original file
          if (!sourceMap.file || sourceMap.file == address) sourceMap.file = originalName + '!transpiled';

          // force set the sources list if only one source
          if (!sourceMap.sources || sourceMap.sources.length <= 1 && (!sourceMap.sources[0] || sourceMap.sources[0] === address)) sourceMap.sources = [originalName];
        }

        function transpile(loader, source, key, metadata, processAnonRegister) {
          if (!loader.transpiler) throw new TypeError('Unable to dynamically transpile ES module\n   A loader plugin needs to be configured via `SystemJS.config({ transpiler: \'transpiler-module\' })`.');

          // deps support for es transpile
          if (metadata.load.deps) {
            var depsPrefix = '';
            for (var i = 0; i < metadata.load.deps.length; i++) {
              depsPrefix += 'import "' + metadata.load.deps[i] + '"; ';
            }source = depsPrefix + source;
          }

          // do transpilation
          return loader.import.call(loader, loader.transpiler).then(function (transpiler) {
            transpiler = transpiler.__useDefault || transpiler;

            // translate hooks means this is a transpiler plugin instead of a raw implementation
            if (!transpiler.translate) throw new Error(loader.transpiler + ' is not a valid transpiler plugin.');

            // if transpiler is the same as the plugin loader, then don't run twice
            if (transpiler === metadata.pluginModule) return source;

            // convert the source map into an object for transpilation chaining
            if (typeof metadata.load.sourceMap === 'string') metadata.load.sourceMap = JSON.parse(metadata.load.sourceMap);

            metadata.pluginLoad = metadata.pluginLoad || {
              name: key,
              address: key,
              source: source,
              metadata: metadata.load
            };
            metadata.load.deps = metadata.load.deps || [];

            return Promise.resolve(transpiler.translate.call(loader, metadata.pluginLoad, metadata.traceOpts)).then(function (source) {
              // sanitize sourceMap if an object not a JSON string
              var sourceMap = metadata.load.sourceMap;
              if (sourceMap && (typeof sourceMap === "undefined" ? "undefined" : _typeof(sourceMap)) === 'object') sanitizeSourceMap(key, sourceMap);

              if (metadata.load.format === 'esm' && detectRegisterFormat(source)) metadata.load.format = 'register';

              return source;
            });
          }, function (err) {
            throw LoaderError__Check_error_message_for_loader_stack(err, 'Unable to load transpiler to transpile ' + key);
          });
        }

        // detect any meta header syntax
        // only set if not already set
        var metaRegEx = /^(\s*\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)+/;
        var metaPartRegEx = /\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\/\/[^\n]*|"[^"]+"\s*;?|'[^']+'\s*;?/g;

        function setMetaProperty(target, p, value) {
          var pParts = p.split('.');
          var curPart;
          while (pParts.length > 1) {
            curPart = pParts.shift();
            target = target[curPart] = target[curPart] || {};
          }
          curPart = pParts.shift();
          if (target[curPart] === undefined) target[curPart] = value;
        }

        function readMetaSyntax(source, metadata) {
          var meta = source.match(metaRegEx);
          if (!meta) return;

          var metaParts = meta[0].match(metaPartRegEx);

          for (var i = 0; i < metaParts.length; i++) {
            var curPart = metaParts[i];
            var len = curPart.length;

            var firstChar = curPart.substr(0, 1);
            if (curPart.substr(len - 1, 1) == ';') len--;

            if (firstChar != '"' && firstChar != "'") continue;

            var metaString = curPart.substr(1, curPart.length - 3);
            var metaName = metaString.substr(0, metaString.indexOf(' '));

            if (metaName) {
              var metaValue = metaString.substr(metaName.length + 1, metaString.length - metaName.length - 1);

              if (metaName === 'deps') metaName = 'deps[]';

              if (metaName.substr(metaName.length - 2, 2) === '[]') {
                metaName = metaName.substr(0, metaName.length - 2);
                metadata.load[metaName] = metadata.load[metaName] || [];
                metadata.load[metaName].push(metaValue);
              }
              // "use strict" is not meta
              else if (metaName !== 'use') {
                  setMetaProperty(metadata.load, metaName, metaValue);
                }
            } else {
              metadata.load[metaString] = true;
            }
          }
        }

        var scriptSrc;

        // Promise detection and error message
        if (typeof Promise === 'undefined') throw new Error('SystemJS needs a Promise polyfill.');

        if (typeof document !== 'undefined') {
          var scripts = document.getElementsByTagName('script');
          var curScript = scripts[scripts.length - 1];
          if (document.currentScript && (curScript.defer || curScript.async)) curScript = document.currentScript;

          scriptSrc = curScript && curScript.src;
        }
        // worker
        else if (typeof importScripts !== 'undefined') {
            try {
              throw new Error('_');
            } catch (e) {
              e.stack.replace(/(?:at|@).*(http.+):[\d]+:[\d]+/, function (m, url) {
                scriptSrc = url;
              });
            }
          }
          // node
          else if (typeof __filename !== 'undefined') {
              scriptSrc = __filename;
            }

        function SystemJSLoader() {
          RegisterLoader.call(this);

          // NB deprecate
          this._loader = {};

          // internal metadata store
          this[METADATA] = {};

          // internal configuration
          this[CONFIG] = {
            baseURL: baseURI,
            paths: {},

            packageConfigPaths: [],
            packageConfigKeys: [],
            map: {},
            packages: {},
            depCache: {},
            meta: {},
            bundles: {},

            production: false,

            transpiler: undefined,
            loadedBundles: {},

            // global behaviour flags
            warnings: false,
            pluginFirst: false,

            // enable wasm loading and detection when supported
            wasm: false
          };

          // make the location of the system.js script accessible (if any)
          this.scriptSrc = scriptSrc;

          this._nodeRequire = nodeRequire;

          // support the empty module, as a concept
          this.registry.set('@empty', emptyModule);

          setProduction.call(this, false, false);

          // add module format helpers
          setHelpers(this);
          setAmdHelper(this);
        }

        var envModule;
        function setProduction(isProduction, isBuilder) {
          this[CONFIG].production = isProduction;
          this.registry.set('@system-env', envModule = this.newModule({
            browser: isBrowser,
            node: !!this._nodeRequire,
            production: !isBuilder && isProduction,
            dev: isBuilder || !isProduction,
            build: isBuilder,
            'default': true
          }));
        }

        SystemJSLoader.prototype = Object.create(RegisterLoader.prototype);

        SystemJSLoader.prototype.constructor = SystemJSLoader;

        // NB deprecate normalize
        SystemJSLoader.prototype[SystemJSLoader.resolve = RegisterLoader.resolve] = SystemJSLoader.prototype.normalize = normalize;

        SystemJSLoader.prototype.load = function (key, parentKey) {
          warn.call(this[CONFIG], 'System.load is deprecated.');
          return this.import(key, parentKey);
        };

        // NB deprecate decanonicalize, normalizeSync
        SystemJSLoader.prototype.decanonicalize = SystemJSLoader.prototype.normalizeSync = SystemJSLoader.prototype.resolveSync = normalizeSync;

        SystemJSLoader.prototype[SystemJSLoader.instantiate = RegisterLoader.instantiate] = instantiate$1;

        SystemJSLoader.prototype.config = setConfig;
        SystemJSLoader.prototype.getConfig = getConfig;

        SystemJSLoader.prototype.global = envGlobal;

        SystemJSLoader.prototype.import = function () {
          return RegisterLoader.prototype.import.apply(this, arguments).then(function (m) {
            return '__useDefault' in m ? m.__useDefault : m;
          });
        };

        var configNames = ['baseURL', 'map', 'paths', 'packages', 'packageConfigPaths', 'depCache', 'meta', 'bundles', 'transpiler', 'warnings', 'pluginFirst', 'production', 'wasm'];

        var hasProxy = typeof Proxy !== 'undefined';
        for (var i = 0; i < configNames.length; i++) {
          (function (configName) {
            Object.defineProperty(SystemJSLoader.prototype, configName, {
              get: function get() {
                var cfg = getConfigItem(this[CONFIG], configName);

                if (hasProxy && (typeof cfg === "undefined" ? "undefined" : _typeof(cfg)) === 'object') cfg = new Proxy(cfg, {
                  set: function set(target, option) {
                    throw new Error('Cannot set SystemJS.' + configName + '["' + option + '"] directly. Use SystemJS.config({ ' + configName + ': { "' + option + '": ... } }) rather.');
                  }
                });

                //if (typeof cfg === 'object')
                //  warn.call(this[CONFIG], 'Referencing `SystemJS.' + configName + '` is deprecated. Use the config getter `SystemJS.getConfig(\'' + configName + '\')`');
                return cfg;
              },
              set: function set(name) {
                throw new Error('Setting `SystemJS.' + configName + '` directly is no longer supported. Use `SystemJS.config({ ' + configName + ': ... })`.');
              }
            });
          })(configNames[i]);
        } /*
           * Backwards-compatible registry API, to be deprecated
           */
        function registryWarn(loader, method) {
          warn.call(loader[CONFIG], 'SystemJS.' + method + ' is deprecated for SystemJS.registry.' + method);
        }
        SystemJSLoader.prototype.delete = function (key) {
          registryWarn(this, 'delete');
          return this.registry.delete(key);
        };
        SystemJSLoader.prototype.get = function (key) {
          registryWarn(this, 'get');
          return this.registry.get(key);
        };
        SystemJSLoader.prototype.has = function (key) {
          registryWarn(this, 'has');
          return this.registry.has(key);
        };
        SystemJSLoader.prototype.set = function (key, module) {
          registryWarn(this, 'set');
          return this.registry.set(key, module);
        };
        SystemJSLoader.prototype.newModule = function (bindings) {
          return new ModuleNamespace(bindings);
        };
        SystemJSLoader.prototype.isModule = isModule;

        // ensure System.register and System.registerDynamic decanonicalize
        SystemJSLoader.prototype.register = function (key, deps, declare) {
          if (typeof key === 'string') key = decanonicalize.call(this, this[CONFIG], key);
          return RegisterLoader.prototype.register.call(this, key, deps, declare);
        };

        SystemJSLoader.prototype.registerDynamic = function (key, deps, executingRequire, execute) {
          if (typeof key === 'string') key = decanonicalize.call(this, this[CONFIG], key);
          return RegisterLoader.prototype.registerDynamic.call(this, key, deps, executingRequire, execute);
        };

        SystemJSLoader.prototype.version = "0.21.4 Dev";

        var System = new SystemJSLoader();

        // only set the global System on the global in browsers
        if (isBrowser || isWorker) envGlobal.SystemJS = envGlobal.System = System;

        if (typeof module !== 'undefined' && module.exports) module.exports = System;
      })();
    }).call(this, require('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/systemjs/dist/system.src.js");
  }, { "_process": 330, "buffer": 4, "fs": 3 }], 333: [function (require, module, exports) {
    require('babel-polyfill');
    require('systemjs');

    System.config({
      transpiler: "typescript",
      baseURL: "/",
      bundles: {
        "app.js": ["bootstrap"]
      },
      map: {
        text: '../../node_modules/systemjs-plugin-text/text.js'
      }
    });

    System.import("bootstrap");
  }, { "babel-polyfill": 1, "systemjs": 332 }] }, {}, [333]);