/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab

// Add semicolon to prevent IIFE from being passed as argument to concatenated code.
;

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
    'use strict';

    /* global define, exports, module */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {
    /**
     * Brings an environment as close to ECMAScript 5 compliance
     * as is possible with the facilities of erstwhile engines.
     *
     * Annotated ES5: http://es5.github.com/ (specific links below)
     * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
     * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
     */

    // Shortcut to an often accessed properties, in order to avoid multiple
    // dereference that costs universally. This also holds a reference to known-good
    // functions.
    var $Array = Array;
    var ArrayPrototype = $Array.prototype;
    var $Object = Object;
    var ObjectPrototype = $Object.prototype;
    var $Function = Function;
    var FunctionPrototype = $Function.prototype;
    var $String = String;
    var StringPrototype = $String.prototype;
    var $Number = Number;
    var NumberPrototype = $Number.prototype;
    var array_slice = ArrayPrototype.slice;
    var array_splice = ArrayPrototype.splice;
    var array_push = ArrayPrototype.push;
    var array_unshift = ArrayPrototype.unshift;
    var array_concat = ArrayPrototype.concat;
    var array_join = ArrayPrototype.join;
    var call = FunctionPrototype.call;
    var apply = FunctionPrototype.apply;
    var max = Math.max;
    var min = Math.min;

    // Having a toString local variable name breaks in Opera so use to_string.
    var to_string = ObjectPrototype.toString;

    /* global Symbol */
    /* eslint-disable one-var-declaration-per-line, no-redeclare, max-statements-per-line */
    var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
    var isCallable; /* inlined from https://npmjs.com/is-callable */ var fnToStr = Function.prototype.toString, constructorRegex = /^\s*class /, isES6ClassFn = function isES6ClassFn(value) { try { var fnStr = fnToStr.call(value); var singleStripped = fnStr.replace(/\/\/.*\n/g, ''); var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, ''); var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' '); return constructorRegex.test(spaceStripped); } catch (e) { return false; /* not a function */ } }, tryFunctionObject = function tryFunctionObject(value) { try { if (isES6ClassFn(value)) { return false; } fnToStr.call(value); return true; } catch (e) { return false; } }, fnClass = '[object Function]', genClass = '[object GeneratorFunction]', isCallable = function isCallable(value) { if (!value) { return false; } if (typeof value !== 'function' && typeof value !== 'object') { return false; } if (hasToStringTag) { return tryFunctionObject(value); } if (isES6ClassFn(value)) { return false; } var strClass = to_string.call(value); return strClass === fnClass || strClass === genClass; };

    var isRegex; /* inlined from https://npmjs.com/is-regex */ var regexExec = RegExp.prototype.exec, tryRegexExec = function tryRegexExec(value) { try { regexExec.call(value); return true; } catch (e) { return false; } }, regexClass = '[object RegExp]'; isRegex = function isRegex(value) { if (typeof value !== 'object') { return false; } return hasToStringTag ? tryRegexExec(value) : to_string.call(value) === regexClass; };
    var isString; /* inlined from https://npmjs.com/is-string */ var strValue = String.prototype.valueOf, tryStringObject = function tryStringObject(value) { try { strValue.call(value); return true; } catch (e) { return false; } }, stringClass = '[object String]'; isString = function isString(value) { if (typeof value === 'string') { return true; } if (typeof value !== 'object') { return false; } return hasToStringTag ? tryStringObject(value) : to_string.call(value) === stringClass; };
    /* eslint-enable one-var-declaration-per-line, no-redeclare, max-statements-per-line */

    /* inlined from http://npmjs.com/define-properties */
    var supportsDescriptors = $Object.defineProperty && (function () {
        try {
            var obj = {};
            $Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
            for (var _ in obj) { // jscs:ignore disallowUnusedVariables
                return false;
            }
            return obj.x === obj;
        } catch (e) { /* this is ES3 */
            return false;
        }
    }());
    var defineProperties = (function (has) {
        // Define configurable, writable, and non-enumerable props
        // if they don't exist.
        var defineProperty;
        if (supportsDescriptors) {
            defineProperty = function (object, name, method, forceAssign) {
                if (!forceAssign && (name in object)) {
                    return;
                }
                $Object.defineProperty(object, name, {
                    configurable: true,
                    enumerable: false,
                    writable: true,
                    value: method
                });
            };
        } else {
            defineProperty = function (object, name, method, forceAssign) {
                if (!forceAssign && (name in object)) {
                    return;
                }
                object[name] = method;
            };
        }
        return function defineProperties(object, map, forceAssign) {
            for (var name in map) {
                if (has.call(map, name)) {
                    defineProperty(object, name, map[name], forceAssign);
                }
            }
        };
    }(ObjectPrototype.hasOwnProperty));

    //
    // Util
    // ======
    //

    /* replaceable with https://npmjs.com/package/es-abstract /helpers/isPrimitive */
    var isPrimitive = function isPrimitive(input) {
        var type = typeof input;
        return input === null || (type !== 'object' && type !== 'function');
    };

    var isActualNaN = $Number.isNaN || function isActualNaN(x) {
        return x !== x;
    };

    var ES = {
        // ES5 9.4
        // http://es5.github.com/#x9.4
        // http://jsperf.com/to-integer
        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToInteger */
        ToInteger: function ToInteger(num) {
            var n = +num;
            if (isActualNaN(n)) {
                n = 0;
            } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
            return n;
        },

        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToPrimitive */
        ToPrimitive: function ToPrimitive(input) {
            var val, valueOf, toStr;
            if (isPrimitive(input)) {
                return input;
            }
            valueOf = input.valueOf;
            if (isCallable(valueOf)) {
                val = valueOf.call(input);
                if (isPrimitive(val)) {
                    return val;
                }
            }
            toStr = input.toString;
            if (isCallable(toStr)) {
                val = toStr.call(input);
                if (isPrimitive(val)) {
                    return val;
                }
            }
            throw new TypeError();
        },

        // ES5 9.9
        // http://es5.github.com/#x9.9
        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToObject */
        ToObject: function (o) {
            if (o == null) { // this matches both null and undefined
                throw new TypeError("can't convert " + o + ' to object');
            }
            return $Object(o);
        },

        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToUint32 */
        ToUint32: function ToUint32(x) {
            return x >>> 0;
        }
    };

    //
    // Function
    // ========
    //

    // ES-5 15.3.4.5
    // http://es5.github.com/#x15.3.4.5

    var Empty = function Empty() {};

    defineProperties(FunctionPrototype, {
        bind: function bind(that) { // .length is 1
            // 1. Let Target be the this value.
            var target = this;
            // 2. If IsCallable(Target) is false, throw a TypeError exception.
            if (!isCallable(target)) {
                throw new TypeError('Function.prototype.bind called on incompatible ' + target);
            }
            // 3. Let A be a new (possibly empty) internal list of all of the
            //   argument values provided after thisArg (arg1, arg2 etc), in order.
            // XXX slicedArgs will stand in for "A" if used
            var args = array_slice.call(arguments, 1); // for normal call
            // 4. Let F be a new native ECMAScript object.
            // 11. Set the [[Prototype]] internal property of F to the standard
            //   built-in Function prototype object as specified in 15.3.3.1.
            // 12. Set the [[Call]] internal property of F as described in
            //   15.3.4.5.1.
            // 13. Set the [[Construct]] internal property of F as described in
            //   15.3.4.5.2.
            // 14. Set the [[HasInstance]] internal property of F as described in
            //   15.3.4.5.3.
            var bound;
            var binder = function () {

                if (this instanceof bound) {
                    // 15.3.4.5.2 [[Construct]]
                    // When the [[Construct]] internal method of a function object,
                    // F that was created using the bind function is called with a
                    // list of arguments ExtraArgs, the following steps are taken:
                    // 1. Let target be the value of F's [[TargetFunction]]
                    //   internal property.
                    // 2. If target has no [[Construct]] internal method, a
                    //   TypeError exception is thrown.
                    // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                    //   property.
                    // 4. Let args be a new list containing the same values as the
                    //   list boundArgs in the same order followed by the same
                    //   values as the list ExtraArgs in the same order.
                    // 5. Return the result of calling the [[Construct]] internal
                    //   method of target providing args as the arguments.

                    var result = apply.call(
                        target,
                        this,
                        array_concat.call(args, array_slice.call(arguments))
                    );
                    if ($Object(result) === result) {
                        return result;
                    }
                    return this;

                } else {
                    // 15.3.4.5.1 [[Call]]
                    // When the [[Call]] internal method of a function object, F,
                    // which was created using the bind function is called with a
                    // this value and a list of arguments ExtraArgs, the following
                    // steps are taken:
                    // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                    //   property.
                    // 2. Let boundThis be the value of F's [[BoundThis]] internal
                    //   property.
                    // 3. Let target be the value of F's [[TargetFunction]] internal
                    //   property.
                    // 4. Let args be a new list containing the same values as the
                    //   list boundArgs in the same order followed by the same
                    //   values as the list ExtraArgs in the same order.
                    // 5. Return the result of calling the [[Call]] internal method
                    //   of target providing boundThis as the this value and
                    //   providing args as the arguments.

                    // equiv: target.call(this, ...boundArgs, ...args)
                    return apply.call(
                        target,
                        that,
                        array_concat.call(args, array_slice.call(arguments))
                    );

                }

            };

            // 15. If the [[Class]] internal property of Target is "Function", then
            //     a. Let L be the length property of Target minus the length of A.
            //     b. Set the length own property of F to either 0 or L, whichever is
            //       larger.
            // 16. Else set the length own property of F to 0.

            var boundLength = max(0, target.length - args.length);

            // 17. Set the attributes of the length own property of F to the values
            //   specified in 15.3.5.1.
            var boundArgs = [];
            for (var i = 0; i < boundLength; i++) {
                array_push.call(boundArgs, '$' + i);
            }

            // XXX Build a dynamic function with desired amount of arguments is the only
            // way to set the length property of a function.
            // In environments where Content Security Policies enabled (Chrome extensions,
            // for ex.) all use of eval or Function costructor throws an exception.
            // However in all of these environments Function.prototype.bind exists
            // and so this code will never be executed.
            bound = $Function('binder', 'return function (' + array_join.call(boundArgs, ',') + '){ return binder.apply(this, arguments); }')(binder);

            if (target.prototype) {
                Empty.prototype = target.prototype;
                bound.prototype = new Empty();
                // Clean up dangling references.
                Empty.prototype = null;
            }

            // TODO
            // 18. Set the [[Extensible]] internal property of F to true.

            // TODO
            // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
            // 20. Call the [[DefineOwnProperty]] internal method of F with
            //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
            //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
            //   false.
            // 21. Call the [[DefineOwnProperty]] internal method of F with
            //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
            //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
            //   and false.

            // TODO
            // NOTE Function objects created using Function.prototype.bind do not
            // have a prototype property or the [[Code]], [[FormalParameters]], and
            // [[Scope]] internal properties.
            // XXX can't delete prototype in pure-js.

            // 22. Return F.
            return bound;
        }
    });

    // _Please note: Shortcuts are defined after `Function.prototype.bind` as we
    // use it in defining shortcuts.
    var owns = call.bind(ObjectPrototype.hasOwnProperty);
    var toStr = call.bind(ObjectPrototype.toString);
    var arraySlice = call.bind(array_slice);
    var arraySliceApply = apply.bind(array_slice);
    var strSlice = call.bind(StringPrototype.slice);
    var strSplit = call.bind(StringPrototype.split);
    var strIndexOf = call.bind(StringPrototype.indexOf);
    var pushCall = call.bind(array_push);
    var isEnum = call.bind(ObjectPrototype.propertyIsEnumerable);
    var arraySort = call.bind(ArrayPrototype.sort);

    //
    // Array
    // =====
    //

    var isArray = $Array.isArray || function isArray(obj) {
        return toStr(obj) === '[object Array]';
    };

    // ES5 15.4.4.12
    // http://es5.github.com/#x15.4.4.13
    // Return len+argCount.
    // [bugfix, ielt8]
    // IE < 8 bug: [].unshift(0) === undefined but should be "1"
    var hasUnshiftReturnValueBug = [].unshift(0) !== 1;
    defineProperties(ArrayPrototype, {
        unshift: function () {
            array_unshift.apply(this, arguments);
            return this.length;
        }
    }, hasUnshiftReturnValueBug);

    // ES5 15.4.3.2
    // http://es5.github.com/#x15.4.3.2
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
    defineProperties($Array, { isArray: isArray });

    // The IsCallable() check in the Array functions
    // has been replaced with a strict check on the
    // internal class of the object to trap cases where
    // the provided function was actually a regular
    // expression literal, which in V8 and
    // JavaScriptCore is a typeof "function".  Only in
    // V8 are regular expression literals permitted as
    // reduce parameters, so it is desirable in the
    // general case for the shim to match the more
    // strict and common behavior of rejecting regular
    // expressions.

    // ES5 15.4.4.18
    // http://es5.github.com/#x15.4.4.18
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach

    // Check failure of by-index access of string characters (IE < 9)
    // and failure of `0 in boxedString` (Rhino)
    var boxedString = $Object('a');
    var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

    var properlyBoxesContext = function properlyBoxed(method) {
        // Check node 0.6.21 bug where third parameter is not boxed
        var properlyBoxesNonStrict = true;
        var properlyBoxesStrict = true;
        var threwException = false;
        if (method) {
            try {
                method.call('foo', function (_, __, context) {
                    if (typeof context !== 'object') {
                        properlyBoxesNonStrict = false;
                    }
                });

                method.call([1], function () {
                    'use strict';

                    properlyBoxesStrict = typeof this === 'string';
                }, 'x');
            } catch (e) {
                threwException = true;
            }
        }
        return !!method && !threwException && properlyBoxesNonStrict && properlyBoxesStrict;
    };

    defineProperties(ArrayPrototype, {
        forEach: function forEach(callbackfn/*, thisArg*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var i = -1;
            var length = ES.ToUint32(self.length);
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.forEach callback must be a function');
            }

            while (++i < length) {
                if (i in self) {
                    // Invoke the callback function with call, passing arguments:
                    // context, property value, property key, thisArg object
                    if (typeof T === 'undefined') {
                        callbackfn(self[i], i, object);
                    } else {
                        callbackfn.call(T, self[i], i, object);
                    }
                }
            }
        }
    }, !properlyBoxesContext(ArrayPrototype.forEach));

    // ES5 15.4.4.19
    // http://es5.github.com/#x15.4.4.19
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
    defineProperties(ArrayPrototype, {
        map: function map(callbackfn/*, thisArg*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);
            var result = $Array(length);
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.map callback must be a function');
            }

            for (var i = 0; i < length; i++) {
                if (i in self) {
                    if (typeof T === 'undefined') {
                        result[i] = callbackfn(self[i], i, object);
                    } else {
                        result[i] = callbackfn.call(T, self[i], i, object);
                    }
                }
            }
            return result;
        }
    }, !properlyBoxesContext(ArrayPrototype.map));

    // ES5 15.4.4.20
    // http://es5.github.com/#x15.4.4.20
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
    defineProperties(ArrayPrototype, {
        filter: function filter(callbackfn/*, thisArg*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);
            var result = [];
            var value;
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.filter callback must be a function');
            }

            for (var i = 0; i < length; i++) {
                if (i in self) {
                    value = self[i];
                    if (typeof T === 'undefined' ? callbackfn(value, i, object) : callbackfn.call(T, value, i, object)) {
                        pushCall(result, value);
                    }
                }
            }
            return result;
        }
    }, !properlyBoxesContext(ArrayPrototype.filter));

    // ES5 15.4.4.16
    // http://es5.github.com/#x15.4.4.16
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
    defineProperties(ArrayPrototype, {
        every: function every(callbackfn/*, thisArg*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.every callback must be a function');
            }

            for (var i = 0; i < length; i++) {
                if (i in self && !(typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                    return false;
                }
            }
            return true;
        }
    }, !properlyBoxesContext(ArrayPrototype.every));

    // ES5 15.4.4.17
    // http://es5.github.com/#x15.4.4.17
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
    defineProperties(ArrayPrototype, {
        some: function some(callbackfn/*, thisArg */) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.some callback must be a function');
            }

            for (var i = 0; i < length; i++) {
                if (i in self && (typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                    return true;
                }
            }
            return false;
        }
    }, !properlyBoxesContext(ArrayPrototype.some));

    // ES5 15.4.4.21
    // http://es5.github.com/#x15.4.4.21
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
    var reduceCoercesToObject = false;
    if (ArrayPrototype.reduce) {
        reduceCoercesToObject = typeof ArrayPrototype.reduce.call('es5', function (_, __, ___, list) {
            return list;
        }) === 'object';
    }
    defineProperties(ArrayPrototype, {
        reduce: function reduce(callbackfn/*, initialValue*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.reduce callback must be a function');
            }

            // no value to return if no initial value and an empty array
            if (length === 0 && arguments.length === 1) {
                throw new TypeError('reduce of empty array with no initial value');
            }

            var i = 0;
            var result;
            if (arguments.length >= 2) {
                result = arguments[1];
            } else {
                do {
                    if (i in self) {
                        result = self[i++];
                        break;
                    }

                    // if array contains no values, no initial value to return
                    if (++i >= length) {
                        throw new TypeError('reduce of empty array with no initial value');
                    }
                } while (true);
            }

            for (; i < length; i++) {
                if (i in self) {
                    result = callbackfn(result, self[i], i, object);
                }
            }

            return result;
        }
    }, !reduceCoercesToObject);

    // ES5 15.4.4.22
    // http://es5.github.com/#x15.4.4.22
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
    var reduceRightCoercesToObject = false;
    if (ArrayPrototype.reduceRight) {
        reduceRightCoercesToObject = typeof ArrayPrototype.reduceRight.call('es5', function (_, __, ___, list) {
            return list;
        }) === 'object';
    }
    defineProperties(ArrayPrototype, {
        reduceRight: function reduceRight(callbackfn/*, initial*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.reduceRight callback must be a function');
            }

            // no value to return if no initial value, empty array
            if (length === 0 && arguments.length === 1) {
                throw new TypeError('reduceRight of empty array with no initial value');
            }

            var result;
            var i = length - 1;
            if (arguments.length >= 2) {
                result = arguments[1];
            } else {
                do {
                    if (i in self) {
                        result = self[i--];
                        break;
                    }

                    // if array contains no values, no initial value to return
                    if (--i < 0) {
                        throw new TypeError('reduceRight of empty array with no initial value');
                    }
                } while (true);
            }

            if (i < 0) {
                return result;
            }

            do {
                if (i in self) {
                    result = callbackfn(result, self[i], i, object);
                }
            } while (i--);

            return result;
        }
    }, !reduceRightCoercesToObject);

    // ES5 15.4.4.14
    // http://es5.github.com/#x15.4.4.14
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
    var hasFirefox2IndexOfBug = ArrayPrototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
    defineProperties(ArrayPrototype, {
        indexOf: function indexOf(searchElement/*, fromIndex */) {
            var self = splitString && isString(this) ? strSplit(this, '') : ES.ToObject(this);
            var length = ES.ToUint32(self.length);

            if (length === 0) {
                return -1;
            }

            var i = 0;
            if (arguments.length > 1) {
                i = ES.ToInteger(arguments[1]);
            }

            // handle negative indices
            i = i >= 0 ? i : max(0, length + i);
            for (; i < length; i++) {
                if (i in self && self[i] === searchElement) {
                    return i;
                }
            }
            return -1;
        }
    }, hasFirefox2IndexOfBug);

    // ES5 15.4.4.15
    // http://es5.github.com/#x15.4.4.15
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
    var hasFirefox2LastIndexOfBug = ArrayPrototype.lastIndexOf && [0, 1].lastIndexOf(0, -3) !== -1;
    defineProperties(ArrayPrototype, {
        lastIndexOf: function lastIndexOf(searchElement/*, fromIndex */) {
            var self = splitString && isString(this) ? strSplit(this, '') : ES.ToObject(this);
            var length = ES.ToUint32(self.length);

            if (length === 0) {
                return -1;
            }
            var i = length - 1;
            if (arguments.length > 1) {
                i = min(i, ES.ToInteger(arguments[1]));
            }
            // handle negative indices
            i = i >= 0 ? i : length - Math.abs(i);
            for (; i >= 0; i--) {
                if (i in self && searchElement === self[i]) {
                    return i;
                }
            }
            return -1;
        }
    }, hasFirefox2LastIndexOfBug);

    // ES5 15.4.4.12
    // http://es5.github.com/#x15.4.4.12
    var spliceNoopReturnsEmptyArray = (function () {
        var a = [1, 2];
        var result = a.splice();
        return a.length === 2 && isArray(result) && result.length === 0;
    }());
    defineProperties(ArrayPrototype, {
        // Safari 5.0 bug where .splice() returns undefined
        splice: function splice(start, deleteCount) {
            if (arguments.length === 0) {
                return [];
            } else {
                return array_splice.apply(this, arguments);
            }
        }
    }, !spliceNoopReturnsEmptyArray);

    var spliceWorksWithEmptyObject = (function () {
        var obj = {};
        ArrayPrototype.splice.call(obj, 0, 0, 1);
        return obj.length === 1;
    }());
    defineProperties(ArrayPrototype, {
        splice: function splice(start, deleteCount) {
            if (arguments.length === 0) {
                return [];
            }
            var args = arguments;
            this.length = max(ES.ToInteger(this.length), 0);
            if (arguments.length > 0 && typeof deleteCount !== 'number') {
                args = arraySlice(arguments);
                if (args.length < 2) {
                    pushCall(args, this.length - start);
                } else {
                    args[1] = ES.ToInteger(deleteCount);
                }
            }
            return array_splice.apply(this, args);
        }
    }, !spliceWorksWithEmptyObject);
    var spliceWorksWithLargeSparseArrays = (function () {
        // Per https://github.com/es-shims/es5-shim/issues/295
        // Safari 7/8 breaks with sparse arrays of size 1e5 or greater
        var arr = new $Array(1e5);
        // note: the index MUST be 8 or larger or the test will false pass
        arr[8] = 'x';
        arr.splice(1, 1);
        // note: this test must be defined *after* the indexOf shim
        // per https://github.com/es-shims/es5-shim/issues/313
        return arr.indexOf('x') === 7;
    }());
    var spliceWorksWithSmallSparseArrays = (function () {
        // Per https://github.com/es-shims/es5-shim/issues/295
        // Opera 12.15 breaks on this, no idea why.
        var n = 256;
        var arr = [];
        arr[n] = 'a';
        arr.splice(n + 1, 0, 'b');
        return arr[n] === 'a';
    }());
    defineProperties(ArrayPrototype, {
        splice: function splice(start, deleteCount) {
            var O = ES.ToObject(this);
            var A = [];
            var len = ES.ToUint32(O.length);
            var relativeStart = ES.ToInteger(start);
            var actualStart = relativeStart < 0 ? max((len + relativeStart), 0) : min(relativeStart, len);
            var actualDeleteCount = min(max(ES.ToInteger(deleteCount), 0), len - actualStart);

            var k = 0;
            var from;
            while (k < actualDeleteCount) {
                from = $String(actualStart + k);
                if (owns(O, from)) {
                    A[k] = O[from];
                }
                k += 1;
            }

            var items = arraySlice(arguments, 2);
            var itemCount = items.length;
            var to;
            if (itemCount < actualDeleteCount) {
                k = actualStart;
                var maxK = len - actualDeleteCount;
                while (k < maxK) {
                    from = $String(k + actualDeleteCount);
                    to = $String(k + itemCount);
                    if (owns(O, from)) {
                        O[to] = O[from];
                    } else {
                        delete O[to];
                    }
                    k += 1;
                }
                k = len;
                var minK = len - actualDeleteCount + itemCount;
                while (k > minK) {
                    delete O[k - 1];
                    k -= 1;
                }
            } else if (itemCount > actualDeleteCount) {
                k = len - actualDeleteCount;
                while (k > actualStart) {
                    from = $String(k + actualDeleteCount - 1);
                    to = $String(k + itemCount - 1);
                    if (owns(O, from)) {
                        O[to] = O[from];
                    } else {
                        delete O[to];
                    }
                    k -= 1;
                }
            }
            k = actualStart;
            for (var i = 0; i < items.length; ++i) {
                O[k] = items[i];
                k += 1;
            }
            O.length = len - actualDeleteCount + itemCount;

            return A;
        }
    }, !spliceWorksWithLargeSparseArrays || !spliceWorksWithSmallSparseArrays);

    var originalJoin = ArrayPrototype.join;
    var hasStringJoinBug;
    try {
        hasStringJoinBug = Array.prototype.join.call('123', ',') !== '1,2,3';
    } catch (e) {
        hasStringJoinBug = true;
    }
    if (hasStringJoinBug) {
        defineProperties(ArrayPrototype, {
            join: function join(separator) {
                var sep = typeof separator === 'undefined' ? ',' : separator;
                return originalJoin.call(isString(this) ? strSplit(this, '') : this, sep);
            }
        }, hasStringJoinBug);
    }

    var hasJoinUndefinedBug = [1, 2].join(undefined) !== '1,2';
    if (hasJoinUndefinedBug) {
        defineProperties(ArrayPrototype, {
            join: function join(separator) {
                var sep = typeof separator === 'undefined' ? ',' : separator;
                return originalJoin.call(this, sep);
            }
        }, hasJoinUndefinedBug);
    }

    var pushShim = function push(item) {
        var O = ES.ToObject(this);
        var n = ES.ToUint32(O.length);
        var i = 0;
        while (i < arguments.length) {
            O[n + i] = arguments[i];
            i += 1;
        }
        O.length = n + i;
        return n + i;
    };

    var pushIsNotGeneric = (function () {
        var obj = {};
        var result = Array.prototype.push.call(obj, undefined);
        return result !== 1 || obj.length !== 1 || typeof obj[0] !== 'undefined' || !owns(obj, 0);
    }());
    defineProperties(ArrayPrototype, {
        push: function push(item) {
            if (isArray(this)) {
                return array_push.apply(this, arguments);
            }
            return pushShim.apply(this, arguments);
        }
    }, pushIsNotGeneric);

    // This fixes a very weird bug in Opera 10.6 when pushing `undefined
    var pushUndefinedIsWeird = (function () {
        var arr = [];
        var result = arr.push(undefined);
        return result !== 1 || arr.length !== 1 || typeof arr[0] !== 'undefined' || !owns(arr, 0);
    }());
    defineProperties(ArrayPrototype, { push: pushShim }, pushUndefinedIsWeird);

    // ES5 15.2.3.14
    // http://es5.github.io/#x15.4.4.10
    // Fix boxed string bug
    defineProperties(ArrayPrototype, {
        slice: function (start, end) {
            var arr = isString(this) ? strSplit(this, '') : this;
            return arraySliceApply(arr, arguments);
        }
    }, splitString);

    var sortIgnoresNonFunctions = (function () {
        try {
            [1, 2].sort(null);
            [1, 2].sort({});
            return true;
        } catch (e) {}
        return false;
    }());
    var sortThrowsOnRegex = (function () {
        // this is a problem in Firefox 4, in which `typeof /a/ === 'function'`
        try {
            [1, 2].sort(/a/);
            return false;
        } catch (e) {}
        return true;
    }());
    var sortIgnoresUndefined = (function () {
        // applies in IE 8, for one.
        try {
            [1, 2].sort(undefined);
            return true;
        } catch (e) {}
        return false;
    }());
    defineProperties(ArrayPrototype, {
        sort: function sort(compareFn) {
            if (typeof compareFn === 'undefined') {
                return arraySort(this);
            }
            if (!isCallable(compareFn)) {
                throw new TypeError('Array.prototype.sort callback must be a function');
            }
            return arraySort(this, compareFn);
        }
    }, sortIgnoresNonFunctions || !sortIgnoresUndefined || !sortThrowsOnRegex);

    //
    // Object
    // ======
    //

    // ES5 15.2.3.14
    // http://es5.github.com/#x15.2.3.14

    // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
    var hasDontEnumBug = !isEnum({ 'toString': null }, 'toString');
    var hasProtoEnumBug = isEnum(function () {}, 'prototype');
    var hasStringEnumBug = !owns('x', '0');
    var equalsConstructorPrototype = function (o) {
        var ctor = o.constructor;
        return ctor && ctor.prototype === o;
    };
    var excludedKeys = {
        $window: true,
        $console: true,
        $parent: true,
        $self: true,
        $frame: true,
        $frames: true,
        $frameElement: true,
        $webkitIndexedDB: true,
        $webkitStorageInfo: true,
        $external: true,
        $width: true,
        $height: true
    };
    var hasAutomationEqualityBug = (function () {
        /* globals window */
        if (typeof window === 'undefined') {
            return false;
        }
        for (var k in window) {
            try {
                if (!excludedKeys['$' + k] && owns(window, k) && window[k] !== null && typeof window[k] === 'object') {
                    equalsConstructorPrototype(window[k]);
                }
            } catch (e) {
                return true;
            }
        }
        return false;
    }());
    var equalsConstructorPrototypeIfNotBuggy = function (object) {
        if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
            return equalsConstructorPrototype(object);
        }
        try {
            return equalsConstructorPrototype(object);
        } catch (e) {
            return false;
        }
    };
    var dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
    ];
    var dontEnumsLength = dontEnums.length;

    // taken directly from https://github.com/ljharb/is-arguments/blob/master/index.js
    // can be replaced with require('is-arguments') if we ever use a build process instead
    var isStandardArguments = function isArguments(value) {
        return toStr(value) === '[object Arguments]';
    };
    var isLegacyArguments = function isArguments(value) {
        return value !== null &&
            typeof value === 'object' &&
            typeof value.length === 'number' &&
            value.length >= 0 &&
            !isArray(value) &&
            isCallable(value.callee);
    };
    var isArguments = isStandardArguments(arguments) ? isStandardArguments : isLegacyArguments;

    defineProperties($Object, {
        keys: function keys(object) {
            var isFn = isCallable(object);
            var isArgs = isArguments(object);
            var isObject = object !== null && typeof object === 'object';
            var isStr = isObject && isString(object);

            if (!isObject && !isFn && !isArgs) {
                throw new TypeError('Object.keys called on a non-object');
            }

            var theKeys = [];
            var skipProto = hasProtoEnumBug && isFn;
            if ((isStr && hasStringEnumBug) || isArgs) {
                for (var i = 0; i < object.length; ++i) {
                    pushCall(theKeys, $String(i));
                }
            }

            if (!isArgs) {
                for (var name in object) {
                    if (!(skipProto && name === 'prototype') && owns(object, name)) {
                        pushCall(theKeys, $String(name));
                    }
                }
            }

            if (hasDontEnumBug) {
                var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
                for (var j = 0; j < dontEnumsLength; j++) {
                    var dontEnum = dontEnums[j];
                    if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {
                        pushCall(theKeys, dontEnum);
                    }
                }
            }
            return theKeys;
        }
    });

    var keysWorksWithArguments = $Object.keys && (function () {
        // Safari 5.0 bug
        return $Object.keys(arguments).length === 2;
    }(1, 2));
    var keysHasArgumentsLengthBug = $Object.keys && (function () {
        var argKeys = $Object.keys(arguments);
        return arguments.length !== 1 || argKeys.length !== 1 || argKeys[0] !== 1;
    }(1));
    var originalKeys = $Object.keys;
    defineProperties($Object, {
        keys: function keys(object) {
            if (isArguments(object)) {
                return originalKeys(arraySlice(object));
            } else {
                return originalKeys(object);
            }
        }
    }, !keysWorksWithArguments || keysHasArgumentsLengthBug);

    //
    // Date
    // ====
    //

    var hasNegativeMonthYearBug = new Date(-3509827329600292).getUTCMonth() !== 0;
    var aNegativeTestDate = new Date(-1509842289600292);
    var aPositiveTestDate = new Date(1449662400000);
    var hasToUTCStringFormatBug = aNegativeTestDate.toUTCString() !== 'Mon, 01 Jan -45875 11:59:59 GMT';
    var hasToDateStringFormatBug;
    var hasToStringFormatBug;
    var timeZoneOffset = aNegativeTestDate.getTimezoneOffset();
    if (timeZoneOffset < -720) {
        hasToDateStringFormatBug = aNegativeTestDate.toDateString() !== 'Tue Jan 02 -45875';
        hasToStringFormatBug = !(/^Thu Dec 10 2015 \d\d:\d\d:\d\d GMT[-+]\d\d\d\d(?: |$)/).test(String(aPositiveTestDate));
    } else {
        hasToDateStringFormatBug = aNegativeTestDate.toDateString() !== 'Mon Jan 01 -45875';
        hasToStringFormatBug = !(/^Wed Dec 09 2015 \d\d:\d\d:\d\d GMT[-+]\d\d\d\d(?: |$)/).test(String(aPositiveTestDate));
    }

    var originalGetFullYear = call.bind(Date.prototype.getFullYear);
    var originalGetMonth = call.bind(Date.prototype.getMonth);
    var originalGetDate = call.bind(Date.prototype.getDate);
    var originalGetUTCFullYear = call.bind(Date.prototype.getUTCFullYear);
    var originalGetUTCMonth = call.bind(Date.prototype.getUTCMonth);
    var originalGetUTCDate = call.bind(Date.prototype.getUTCDate);
    var originalGetUTCDay = call.bind(Date.prototype.getUTCDay);
    var originalGetUTCHours = call.bind(Date.prototype.getUTCHours);
    var originalGetUTCMinutes = call.bind(Date.prototype.getUTCMinutes);
    var originalGetUTCSeconds = call.bind(Date.prototype.getUTCSeconds);
    var originalGetUTCMilliseconds = call.bind(Date.prototype.getUTCMilliseconds);
    var dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var daysInMonth = function daysInMonth(month, year) {
        return originalGetDate(new Date(year, month, 0));
    };

    defineProperties(Date.prototype, {
        getFullYear: function getFullYear() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetFullYear(this);
            if (year < 0 && originalGetMonth(this) > 11) {
                return year + 1;
            }
            return year;
        },
        getMonth: function getMonth() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetFullYear(this);
            var month = originalGetMonth(this);
            if (year < 0 && month > 11) {
                return 0;
            }
            return month;
        },
        getDate: function getDate() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetFullYear(this);
            var month = originalGetMonth(this);
            var date = originalGetDate(this);
            if (year < 0 && month > 11) {
                if (month === 12) {
                    return date;
                }
                var days = daysInMonth(0, year + 1);
                return (days - date) + 1;
            }
            return date;
        },
        getUTCFullYear: function getUTCFullYear() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetUTCFullYear(this);
            if (year < 0 && originalGetUTCMonth(this) > 11) {
                return year + 1;
            }
            return year;
        },
        getUTCMonth: function getUTCMonth() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetUTCFullYear(this);
            var month = originalGetUTCMonth(this);
            if (year < 0 && month > 11) {
                return 0;
            }
            return month;
        },
        getUTCDate: function getUTCDate() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetUTCFullYear(this);
            var month = originalGetUTCMonth(this);
            var date = originalGetUTCDate(this);
            if (year < 0 && month > 11) {
                if (month === 12) {
                    return date;
                }
                var days = daysInMonth(0, year + 1);
                return (days - date) + 1;
            }
            return date;
        }
    }, hasNegativeMonthYearBug);

    defineProperties(Date.prototype, {
        toUTCString: function toUTCString() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var day = originalGetUTCDay(this);
            var date = originalGetUTCDate(this);
            var month = originalGetUTCMonth(this);
            var year = originalGetUTCFullYear(this);
            var hour = originalGetUTCHours(this);
            var minute = originalGetUTCMinutes(this);
            var second = originalGetUTCSeconds(this);
            return dayName[day] + ', ' +
                (date < 10 ? '0' + date : date) + ' ' +
                monthName[month] + ' ' +
                year + ' ' +
                (hour < 10 ? '0' + hour : hour) + ':' +
                (minute < 10 ? '0' + minute : minute) + ':' +
                (second < 10 ? '0' + second : second) + ' GMT';
        }
    }, hasNegativeMonthYearBug || hasToUTCStringFormatBug);

    // Opera 12 has `,`
    defineProperties(Date.prototype, {
        toDateString: function toDateString() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var day = this.getDay();
            var date = this.getDate();
            var month = this.getMonth();
            var year = this.getFullYear();
            return dayName[day] + ' ' +
                monthName[month] + ' ' +
                (date < 10 ? '0' + date : date) + ' ' +
                year;
        }
    }, hasNegativeMonthYearBug || hasToDateStringFormatBug);

    // can't use defineProperties here because of toString enumeration issue in IE <= 8
    if (hasNegativeMonthYearBug || hasToStringFormatBug) {
        Date.prototype.toString = function toString() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var day = this.getDay();
            var date = this.getDate();
            var month = this.getMonth();
            var year = this.getFullYear();
            var hour = this.getHours();
            var minute = this.getMinutes();
            var second = this.getSeconds();
            var timezoneOffset = this.getTimezoneOffset();
            var hoursOffset = Math.floor(Math.abs(timezoneOffset) / 60);
            var minutesOffset = Math.floor(Math.abs(timezoneOffset) % 60);
            return dayName[day] + ' ' +
                monthName[month] + ' ' +
                (date < 10 ? '0' + date : date) + ' ' +
                year + ' ' +
                (hour < 10 ? '0' + hour : hour) + ':' +
                (minute < 10 ? '0' + minute : minute) + ':' +
                (second < 10 ? '0' + second : second) + ' GMT' +
                (timezoneOffset > 0 ? '-' : '+') +
                (hoursOffset < 10 ? '0' + hoursOffset : hoursOffset) +
                (minutesOffset < 10 ? '0' + minutesOffset : minutesOffset);
        };
        if (supportsDescriptors) {
            $Object.defineProperty(Date.prototype, 'toString', {
                configurable: true,
                enumerable: false,
                writable: true
            });
        }
    }

    // ES5 15.9.5.43
    // http://es5.github.com/#x15.9.5.43
    // This function returns a String value represent the instance in time
    // represented by this Date object. The format of the String is the Date Time
    // string format defined in 15.9.1.15. All fields are present in the String.
    // The time zone is always UTC, denoted by the suffix Z. If the time value of
    // this object is not a finite Number a RangeError exception is thrown.
    var negativeDate = -62198755200000;
    var negativeYearString = '-000001';
    var hasNegativeDateBug = Date.prototype.toISOString && new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1; // eslint-disable-line max-len
    var hasSafari51DateBug = Date.prototype.toISOString && new Date(-1).toISOString() !== '1969-12-31T23:59:59.999Z';

    var getTime = call.bind(Date.prototype.getTime);

    defineProperties(Date.prototype, {
        toISOString: function toISOString() {
            if (!isFinite(this) || !isFinite(getTime(this))) {
                // Adope Photoshop requires the second check.
                throw new RangeError('Date.prototype.toISOString called on non-finite value.');
            }

            var year = originalGetUTCFullYear(this);

            var month = originalGetUTCMonth(this);
            // see https://github.com/es-shims/es5-shim/issues/111
            year += Math.floor(month / 12);
            month = ((month % 12) + 12) % 12;

            // the date time string format is specified in 15.9.1.15.
            var result = [
                month + 1,
                originalGetUTCDate(this),
                originalGetUTCHours(this),
                originalGetUTCMinutes(this),
                originalGetUTCSeconds(this)
            ];
            year = (
                (year < 0 ? '-' : (year > 9999 ? '+' : '')) +
                strSlice('00000' + Math.abs(year), (0 <= year && year <= 9999) ? -4 : -6)
            );

            for (var i = 0; i < result.length; ++i) {
                // pad months, days, hours, minutes, and seconds to have two digits.
                result[i] = strSlice('00' + result[i], -2);
            }
            // pad milliseconds to have three digits.
            return (
                year + '-' + arraySlice(result, 0, 2).join('-') +
                'T' + arraySlice(result, 2).join(':') + '.' +
                strSlice('000' + originalGetUTCMilliseconds(this), -3) + 'Z'
            );
        }
    }, hasNegativeDateBug || hasSafari51DateBug);

    // ES5 15.9.5.44
    // http://es5.github.com/#x15.9.5.44
    // This function provides a String representation of a Date object for use by
    // JSON.stringify (15.12.3).
    var dateToJSONIsSupported = (function () {
        try {
            return Date.prototype.toJSON &&
                new Date(NaN).toJSON() === null &&
                new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&
                Date.prototype.toJSON.call({ // generic
                    toISOString: function () { return true; }
                });
        } catch (e) {
            return false;
        }
    }());
    if (!dateToJSONIsSupported) {
        Date.prototype.toJSON = function toJSON(key) {
            // When the toJSON method is called with argument key, the following
            // steps are taken:

            // 1.  Let O be the result of calling ToObject, giving it the this
            // value as its argument.
            // 2. Let tv be ES.ToPrimitive(O, hint Number).
            var O = $Object(this);
            var tv = ES.ToPrimitive(O);
            // 3. If tv is a Number and is not finite, return null.
            if (typeof tv === 'number' && !isFinite(tv)) {
                return null;
            }
            // 4. Let toISO be the result of calling the [[Get]] internal method of
            // O with argument "toISOString".
            var toISO = O.toISOString;
            // 5. If IsCallable(toISO) is false, throw a TypeError exception.
            if (!isCallable(toISO)) {
                throw new TypeError('toISOString property is not callable');
            }
            // 6. Return the result of calling the [[Call]] internal method of
            //  toISO with O as the this value and an empty argument list.
            return toISO.call(O);

            // NOTE 1 The argument is ignored.

            // NOTE 2 The toJSON function is intentionally generic; it does not
            // require that its this value be a Date object. Therefore, it can be
            // transferred to other kinds of objects for use as a method. However,
            // it does require that any such object have a toISOString method. An
            // object is free to use the argument key to filter its
            // stringification.
        };
    }

    // ES5 15.9.4.2
    // http://es5.github.com/#x15.9.4.2
    // based on work shared by Daniel Friesen (dantman)
    // http://gist.github.com/303249
    var supportsExtendedYears = Date.parse('+033658-09-27T01:46:40.000Z') === 1e15;
    var acceptsInvalidDates = !isNaN(Date.parse('2012-04-04T24:00:00.500Z')) || !isNaN(Date.parse('2012-11-31T23:59:59.000Z')) || !isNaN(Date.parse('2012-12-31T23:59:60.000Z'));
    var doesNotParseY2KNewYear = isNaN(Date.parse('2000-01-01T00:00:00.000Z'));
    if (doesNotParseY2KNewYear || acceptsInvalidDates || !supportsExtendedYears) {
        // XXX global assignment won't work in embeddings that use
        // an alternate object for the context.
        /* global Date: true */
        var maxSafeUnsigned32Bit = Math.pow(2, 31) - 1;
        var hasSafariSignedIntBug = isActualNaN(new Date(1970, 0, 1, 0, 0, 0, maxSafeUnsigned32Bit + 1).getTime());
        // eslint-disable-next-line no-implicit-globals, no-global-assign
        Date = (function (NativeDate) {
            // Date.length === 7
            var DateShim = function Date(Y, M, D, h, m, s, ms) {
                var length = arguments.length;
                var date;
                if (this instanceof NativeDate) {
                    var seconds = s;
                    var millis = ms;
                    if (hasSafariSignedIntBug && length >= 7 && ms > maxSafeUnsigned32Bit) {
                        // work around a Safari 8/9 bug where it treats the seconds as signed
                        var msToShift = Math.floor(ms / maxSafeUnsigned32Bit) * maxSafeUnsigned32Bit;
                        var sToShift = Math.floor(msToShift / 1e3);
                        seconds += sToShift;
                        millis -= sToShift * 1e3;
                    }
                    date = length === 1 && $String(Y) === Y ? // isString(Y)
                        // We explicitly pass it through parse:
                        new NativeDate(DateShim.parse(Y)) :
                        // We have to manually make calls depending on argument
                        // length here
                        length >= 7 ? new NativeDate(Y, M, D, h, m, seconds, millis) :
                        length >= 6 ? new NativeDate(Y, M, D, h, m, seconds) :
                        length >= 5 ? new NativeDate(Y, M, D, h, m) :
                        length >= 4 ? new NativeDate(Y, M, D, h) :
                        length >= 3 ? new NativeDate(Y, M, D) :
                        length >= 2 ? new NativeDate(Y, M) :
                        length >= 1 ? new NativeDate(Y instanceof NativeDate ? +Y : Y) :
                                      new NativeDate();
                } else {
                    date = NativeDate.apply(this, arguments);
                }
                if (!isPrimitive(date)) {
                    // Prevent mixups with unfixed Date object
                    defineProperties(date, { constructor: DateShim }, true);
                }
                return date;
            };

            // 15.9.1.15 Date Time String Format.
            var isoDateExpression = new RegExp('^' +
                '(\\d{4}|[+-]\\d{6})' + // four-digit year capture or sign +
                                          // 6-digit extended year
                '(?:-(\\d{2})' + // optional month capture
                '(?:-(\\d{2})' + // optional day capture
                '(?:' + // capture hours:minutes:seconds.milliseconds
                    'T(\\d{2})' + // hours capture
                    ':(\\d{2})' + // minutes capture
                    '(?:' + // optional :seconds.milliseconds
                        ':(\\d{2})' + // seconds capture
                        '(?:(\\.\\d{1,}))?' + // milliseconds capture
                    ')?' +
                '(' + // capture UTC offset component
                    'Z|' + // UTC capture
                    '(?:' + // offset specifier +/-hours:minutes
                        '([-+])' + // sign capture
                        '(\\d{2})' + // hours offset capture
                        ':(\\d{2})' + // minutes offset capture
                    ')' +
                ')?)?)?)?' +
            '$');

            var months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

            var dayFromMonth = function dayFromMonth(year, month) {
                var t = month > 1 ? 1 : 0;
                return (
                    months[month] +
                    Math.floor((year - 1969 + t) / 4) -
                    Math.floor((year - 1901 + t) / 100) +
                    Math.floor((year - 1601 + t) / 400) +
                    (365 * (year - 1970))
                );
            };

            var toUTC = function toUTC(t) {
                var s = 0;
                var ms = t;
                if (hasSafariSignedIntBug && ms > maxSafeUnsigned32Bit) {
                    // work around a Safari 8/9 bug where it treats the seconds as signed
                    var msToShift = Math.floor(ms / maxSafeUnsigned32Bit) * maxSafeUnsigned32Bit;
                    var sToShift = Math.floor(msToShift / 1e3);
                    s += sToShift;
                    ms -= sToShift * 1e3;
                }
                return $Number(new NativeDate(1970, 0, 1, 0, 0, s, ms));
            };

            // Copy any custom methods a 3rd party library may have added
            for (var key in NativeDate) {
                if (owns(NativeDate, key)) {
                    DateShim[key] = NativeDate[key];
                }
            }

            // Copy "native" methods explicitly; they may be non-enumerable
            defineProperties(DateShim, {
                now: NativeDate.now,
                UTC: NativeDate.UTC
            }, true);
            DateShim.prototype = NativeDate.prototype;
            defineProperties(DateShim.prototype, { constructor: DateShim }, true);

            // Upgrade Date.parse to handle simplified ISO 8601 strings
            var parseShim = function parse(string) {
                var match = isoDateExpression.exec(string);
                if (match) {
                    // parse months, days, hours, minutes, seconds, and milliseconds
                    // provide default values if necessary
                    // parse the UTC offset component
                    var year = $Number(match[1]),
                        month = $Number(match[2] || 1) - 1,
                        day = $Number(match[3] || 1) - 1,
                        hour = $Number(match[4] || 0),
                        minute = $Number(match[5] || 0),
                        second = $Number(match[6] || 0),
                        millisecond = Math.floor($Number(match[7] || 0) * 1000),
                        // When time zone is missed, local offset should be used
                        // (ES 5.1 bug)
                        // see https://bugs.ecmascript.org/show_bug.cgi?id=112
                        isLocalTime = Boolean(match[4] && !match[8]),
                        signOffset = match[9] === '-' ? 1 : -1,
                        hourOffset = $Number(match[10] || 0),
                        minuteOffset = $Number(match[11] || 0),
                        result;
                    var hasMinutesOrSecondsOrMilliseconds = minute > 0 || second > 0 || millisecond > 0;
                    if (
                        hour < (hasMinutesOrSecondsOrMilliseconds ? 24 : 25) &&
                        minute < 60 && second < 60 && millisecond < 1000 &&
                        month > -1 && month < 12 && hourOffset < 24 &&
                        minuteOffset < 60 && // detect invalid offsets
                        day > -1 &&
                        day < (dayFromMonth(year, month + 1) - dayFromMonth(year, month))
                    ) {
                        result = (
                            ((dayFromMonth(year, month) + day) * 24) +
                            hour +
                            (hourOffset * signOffset)
                        ) * 60;
                        result = ((
                            ((result + minute + (minuteOffset * signOffset)) * 60) +
                            second
                        ) * 1000) + millisecond;
                        if (isLocalTime) {
                            result = toUTC(result);
                        }
                        if (-8.64e15 <= result && result <= 8.64e15) {
                            return result;
                        }
                    }
                    return NaN;
                }
                return NativeDate.parse.apply(this, arguments);
            };
            defineProperties(DateShim, { parse: parseShim });

            return DateShim;
        }(Date));
        /* global Date: false */
    }

    // ES5 15.9.4.4
    // http://es5.github.com/#x15.9.4.4
    if (!Date.now) {
        Date.now = function now() {
            return new Date().getTime();
        };
    }

    //
    // Number
    // ======
    //

    // ES5.1 15.7.4.5
    // http://es5.github.com/#x15.7.4.5
    var hasToFixedBugs = NumberPrototype.toFixed && (
      (0.00008).toFixed(3) !== '0.000' ||
      (0.9).toFixed(0) !== '1' ||
      (1.255).toFixed(2) !== '1.25' ||
      (1000000000000000128).toFixed(0) !== '1000000000000000128'
    );

    var toFixedHelpers = {
        base: 1e7,
        size: 6,
        data: [0, 0, 0, 0, 0, 0],
        multiply: function multiply(n, c) {
            var i = -1;
            var c2 = c;
            while (++i < toFixedHelpers.size) {
                c2 += n * toFixedHelpers.data[i];
                toFixedHelpers.data[i] = c2 % toFixedHelpers.base;
                c2 = Math.floor(c2 / toFixedHelpers.base);
            }
        },
        divide: function divide(n) {
            var i = toFixedHelpers.size;
            var c = 0;
            while (--i >= 0) {
                c += toFixedHelpers.data[i];
                toFixedHelpers.data[i] = Math.floor(c / n);
                c = (c % n) * toFixedHelpers.base;
            }
        },
        numToString: function numToString() {
            var i = toFixedHelpers.size;
            var s = '';
            while (--i >= 0) {
                if (s !== '' || i === 0 || toFixedHelpers.data[i] !== 0) {
                    var t = $String(toFixedHelpers.data[i]);
                    if (s === '') {
                        s = t;
                    } else {
                        s += strSlice('0000000', 0, 7 - t.length) + t;
                    }
                }
            }
            return s;
        },
        pow: function pow(x, n, acc) {
            return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));
        },
        log: function log(x) {
            var n = 0;
            var x2 = x;
            while (x2 >= 4096) {
                n += 12;
                x2 /= 4096;
            }
            while (x2 >= 2) {
                n += 1;
                x2 /= 2;
            }
            return n;
        }
    };

    var toFixedShim = function toFixed(fractionDigits) {
        var f, x, s, m, e, z, j, k;

        // Test for NaN and round fractionDigits down
        f = $Number(fractionDigits);
        f = isActualNaN(f) ? 0 : Math.floor(f);

        if (f < 0 || f > 20) {
            throw new RangeError('Number.toFixed called with invalid number of decimals');
        }

        x = $Number(this);

        if (isActualNaN(x)) {
            return 'NaN';
        }

        // If it is too big or small, return the string value of the number
        if (x <= -1e21 || x >= 1e21) {
            return $String(x);
        }

        s = '';

        if (x < 0) {
            s = '-';
            x = -x;
        }

        m = '0';

        if (x > 1e-21) {
            // 1e-21 < x < 1e21
            // -70 < log2(x) < 70
            e = toFixedHelpers.log(x * toFixedHelpers.pow(2, 69, 1)) - 69;
            z = (e < 0 ? x * toFixedHelpers.pow(2, -e, 1) : x / toFixedHelpers.pow(2, e, 1));
            z *= 0x10000000000000; // Math.pow(2, 52);
            e = 52 - e;

            // -18 < e < 122
            // x = z / 2 ^ e
            if (e > 0) {
                toFixedHelpers.multiply(0, z);
                j = f;

                while (j >= 7) {
                    toFixedHelpers.multiply(1e7, 0);
                    j -= 7;
                }

                toFixedHelpers.multiply(toFixedHelpers.pow(10, j, 1), 0);
                j = e - 1;

                while (j >= 23) {
                    toFixedHelpers.divide(1 << 23);
                    j -= 23;
                }

                toFixedHelpers.divide(1 << j);
                toFixedHelpers.multiply(1, 1);
                toFixedHelpers.divide(2);
                m = toFixedHelpers.numToString();
            } else {
                toFixedHelpers.multiply(0, z);
                toFixedHelpers.multiply(1 << (-e), 0);
                m = toFixedHelpers.numToString() + strSlice('0.00000000000000000000', 2, 2 + f);
            }
        }

        if (f > 0) {
            k = m.length;

            if (k <= f) {
                m = s + strSlice('0.0000000000000000000', 0, f - k + 2) + m;
            } else {
                m = s + strSlice(m, 0, k - f) + '.' + strSlice(m, k - f);
            }
        } else {
            m = s + m;
        }

        return m;
    };
    defineProperties(NumberPrototype, { toFixed: toFixedShim }, hasToFixedBugs);

    var hasToPrecisionUndefinedBug = (function () {
        try {
            return 1.0.toPrecision(undefined) === '1';
        } catch (e) {
            return true;
        }
    }());
    var originalToPrecision = NumberPrototype.toPrecision;
    defineProperties(NumberPrototype, {
        toPrecision: function toPrecision(precision) {
            return typeof precision === 'undefined' ? originalToPrecision.call(this) : originalToPrecision.call(this, precision);
        }
    }, hasToPrecisionUndefinedBug);

    //
    // String
    // ======
    //

    // ES5 15.5.4.14
    // http://es5.github.com/#x15.5.4.14

    // [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
    // Many browsers do not split properly with regular expressions or they
    // do not perform the split correctly under obscure conditions.
    // See http://blog.stevenlevithan.com/archives/cross-browser-split
    // I've tested in many browsers and this seems to cover the deviant ones:
    //    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
    //    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
    //    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
    //       [undefined, "t", undefined, "e", ...]
    //    ''.split(/.?/) should be [], not [""]
    //    '.'.split(/()()/) should be ["."], not ["", "", "."]

    if (
        'ab'.split(/(?:ab)*/).length !== 2 ||
        '.'.split(/(.?)(.?)/).length !== 4 ||
        'tesst'.split(/(s)*/)[1] === 't' ||
        'test'.split(/(?:)/, -1).length !== 4 ||
        ''.split(/.?/).length ||
        '.'.split(/()()/).length > 1
    ) {
        (function () {
            var compliantExecNpcg = typeof (/()??/).exec('')[1] === 'undefined'; // NPCG: nonparticipating capturing group
            var maxSafe32BitInt = Math.pow(2, 32) - 1;

            StringPrototype.split = function (separator, limit) {
                var string = String(this);
                if (typeof separator === 'undefined' && limit === 0) {
                    return [];
                }

                // If `separator` is not a regex, use native split
                if (!isRegex(separator)) {
                    return strSplit(this, separator, limit);
                }

                var output = [];
                var flags = (separator.ignoreCase ? 'i' : '') +
                            (separator.multiline ? 'm' : '') +
                            (separator.unicode ? 'u' : '') + // in ES6
                            (separator.sticky ? 'y' : ''), // Firefox 3+ and ES6
                    lastLastIndex = 0,
                    // Make `global` and avoid `lastIndex` issues by working with a copy
                    separator2, match, lastIndex, lastLength;
                var separatorCopy = new RegExp(separator.source, flags + 'g');
                if (!compliantExecNpcg) {
                    // Doesn't need flags gy, but they don't hurt
                    separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
                }
                /* Values for `limit`, per the spec:
                 * If undefined: 4294967295 // maxSafe32BitInt
                 * If 0, Infinity, or NaN: 0
                 * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
                 * If negative number: 4294967296 - Math.floor(Math.abs(limit))
                 * If other: Type-convert, then use the above rules
                 */
                var splitLimit = typeof limit === 'undefined' ? maxSafe32BitInt : ES.ToUint32(limit);
                match = separatorCopy.exec(string);
                while (match) {
                    // `separatorCopy.lastIndex` is not reliable cross-browser
                    lastIndex = match.index + match[0].length;
                    if (lastIndex > lastLastIndex) {
                        pushCall(output, strSlice(string, lastLastIndex, match.index));
                        // Fix browsers whose `exec` methods don't consistently return `undefined` for
                        // nonparticipating capturing groups
                        if (!compliantExecNpcg && match.length > 1) {
                            /* eslint-disable no-loop-func */
                            match[0].replace(separator2, function () {
                                for (var i = 1; i < arguments.length - 2; i++) {
                                    if (typeof arguments[i] === 'undefined') {
                                        match[i] = void 0;
                                    }
                                }
                            });
                            /* eslint-enable no-loop-func */
                        }
                        if (match.length > 1 && match.index < string.length) {
                            array_push.apply(output, arraySlice(match, 1));
                        }
                        lastLength = match[0].length;
                        lastLastIndex = lastIndex;
                        if (output.length >= splitLimit) {
                            break;
                        }
                    }
                    if (separatorCopy.lastIndex === match.index) {
                        separatorCopy.lastIndex++; // Avoid an infinite loop
                    }
                    match = separatorCopy.exec(string);
                }
                if (lastLastIndex === string.length) {
                    if (lastLength || !separatorCopy.test('')) {
                        pushCall(output, '');
                    }
                } else {
                    pushCall(output, strSlice(string, lastLastIndex));
                }
                return output.length > splitLimit ? arraySlice(output, 0, splitLimit) : output;
            };
        }());

    // [bugfix, chrome]
    // If separator is undefined, then the result array contains just one String,
    // which is the this value (converted to a String). If limit is not undefined,
    // then the output array is truncated so that it contains no more than limit
    // elements.
    // "0".split(undefined, 0) -> []
    } else if ('0'.split(void 0, 0).length) {
        StringPrototype.split = function split(separator, limit) {
            if (typeof separator === 'undefined' && limit === 0) {
                return [];
            }
            return strSplit(this, separator, limit);
        };
    }

    var str_replace = StringPrototype.replace;
    var replaceReportsGroupsCorrectly = (function () {
        var groups = [];
        'x'.replace(/x(.)?/g, function (match, group) {
            pushCall(groups, group);
        });
        return groups.length === 1 && typeof groups[0] === 'undefined';
    }());

    if (!replaceReportsGroupsCorrectly) {
        StringPrototype.replace = function replace(searchValue, replaceValue) {
            var isFn = isCallable(replaceValue);
            var hasCapturingGroups = isRegex(searchValue) && (/\)[*?]/).test(searchValue.source);
            if (!isFn || !hasCapturingGroups) {
                return str_replace.call(this, searchValue, replaceValue);
            } else {
                var wrappedReplaceValue = function (match) {
                    var length = arguments.length;
                    var originalLastIndex = searchValue.lastIndex;
                    searchValue.lastIndex = 0;
                    var args = searchValue.exec(match) || [];
                    searchValue.lastIndex = originalLastIndex;
                    pushCall(args, arguments[length - 2], arguments[length - 1]);
                    return replaceValue.apply(this, args);
                };
                return str_replace.call(this, searchValue, wrappedReplaceValue);
            }
        };
    }

    // ECMA-262, 3rd B.2.3
    // Not an ECMAScript standard, although ECMAScript 3rd Edition has a
    // non-normative section suggesting uniform semantics and it should be
    // normalized across all browsers
    // [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
    var string_substr = StringPrototype.substr;
    var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
    defineProperties(StringPrototype, {
        substr: function substr(start, length) {
            var normalizedStart = start;
            if (start < 0) {
                normalizedStart = max(this.length + start, 0);
            }
            return string_substr.call(this, normalizedStart, length);
        }
    }, hasNegativeSubstrBug);

    // ES5 15.5.4.20
    // whitespace from: http://es5.github.io/#x15.5.4.20
    var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
        '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
        '\u2029\uFEFF';
    var zeroWidth = '\u200b';
    var wsRegexChars = '[' + ws + ']';
    var trimBeginRegexp = new RegExp('^' + wsRegexChars + wsRegexChars + '*');
    var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + '*$');
    var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());
    defineProperties(StringPrototype, {
        // http://blog.stevenlevithan.com/archives/faster-trim-javascript
        // http://perfectionkills.com/whitespace-deviations/
        trim: function trim() {
            if (typeof this === 'undefined' || this === null) {
                throw new TypeError("can't convert " + this + ' to object');
            }
            return $String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
        }
    }, hasTrimWhitespaceBug);
    var trim = call.bind(String.prototype.trim);

    var hasLastIndexBug = StringPrototype.lastIndexOf && 'abcあい'.lastIndexOf('あい', 2) !== -1;
    defineProperties(StringPrototype, {
        lastIndexOf: function lastIndexOf(searchString) {
            if (typeof this === 'undefined' || this === null) {
                throw new TypeError("can't convert " + this + ' to object');
            }
            var S = $String(this);
            var searchStr = $String(searchString);
            var numPos = arguments.length > 1 ? $Number(arguments[1]) : NaN;
            var pos = isActualNaN(numPos) ? Infinity : ES.ToInteger(numPos);
            var start = min(max(pos, 0), S.length);
            var searchLen = searchStr.length;
            var k = start + searchLen;
            while (k > 0) {
                k = max(0, k - searchLen);
                var index = strIndexOf(strSlice(S, k, start + searchLen), searchStr);
                if (index !== -1) {
                    return k + index;
                }
            }
            return -1;
        }
    }, hasLastIndexBug);

    var originalLastIndexOf = StringPrototype.lastIndexOf;
    defineProperties(StringPrototype, {
        lastIndexOf: function lastIndexOf(searchString) {
            return originalLastIndexOf.apply(this, arguments);
        }
    }, StringPrototype.lastIndexOf.length !== 1);

    // ES-5 15.1.2.2
    // eslint-disable-next-line radix
    if (parseInt(ws + '08') !== 8 || parseInt(ws + '0x16') !== 22) {
        /* global parseInt: true */
        parseInt = (function (origParseInt) {
            var hexRegex = /^[-+]?0[xX]/;
            return function parseInt(str, radix) {
                var string = trim(String(str));
                var defaultedRadix = $Number(radix) || (hexRegex.test(string) ? 16 : 10);
                return origParseInt(string, defaultedRadix);
            };
        }(parseInt));
    }

    // https://es5.github.io/#x15.1.2.3
    if (1 / parseFloat('-0') !== -Infinity) {
        /* global parseFloat: true */
        parseFloat = (function (origParseFloat) {
            return function parseFloat(string) {
                var inputString = trim(String(string));
                var result = origParseFloat(inputString);
                return result === 0 && strSlice(inputString, 0, 1) === '-' ? -0 : result;
            };
        }(parseFloat));
    }

    if (String(new RangeError('test')) !== 'RangeError: test') {
        var errorToStringShim = function toString() {
            if (typeof this === 'undefined' || this === null) {
                throw new TypeError("can't convert " + this + ' to object');
            }
            var name = this.name;
            if (typeof name === 'undefined') {
                name = 'Error';
            } else if (typeof name !== 'string') {
                name = $String(name);
            }
            var msg = this.message;
            if (typeof msg === 'undefined') {
                msg = '';
            } else if (typeof msg !== 'string') {
                msg = $String(msg);
            }
            if (!name) {
                return msg;
            }
            if (!msg) {
                return name;
            }
            return name + ': ' + msg;
        };
        // can't use defineProperties here because of toString enumeration issue in IE <= 8
        Error.prototype.toString = errorToStringShim;
    }

    if (supportsDescriptors) {
        var ensureNonEnumerable = function (obj, prop) {
            if (isEnum(obj, prop)) {
                var desc = Object.getOwnPropertyDescriptor(obj, prop);
                if (desc.configurable) {
                    desc.enumerable = false;
                    Object.defineProperty(obj, prop, desc);
                }
            }
        };
        ensureNonEnumerable(Error.prototype, 'message');
        if (Error.prototype.message !== '') {
            Error.prototype.message = '';
        }
        ensureNonEnumerable(Error.prototype, 'name');
    }

    if (String(/a/mig) !== '/a/gim') {
        var regexToString = function toString() {
            var str = '/' + this.source + '/';
            if (this.global) {
                str += 'g';
            }
            if (this.ignoreCase) {
                str += 'i';
            }
            if (this.multiline) {
                str += 'm';
            }
            return str;
        };
        // can't use defineProperties here because of toString enumeration issue in IE <= 8
        RegExp.prototype.toString = regexToString;
    }
}));

/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab

// Add semicolon to prevent IIFE from being passed as argument to concatenated code.
;

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
    'use strict';

    /* global define, exports, module */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

    var call = Function.call;
    var prototypeOfObject = Object.prototype;
    var owns = call.bind(prototypeOfObject.hasOwnProperty);
    var isEnumerable = call.bind(prototypeOfObject.propertyIsEnumerable);
    var toStr = call.bind(prototypeOfObject.toString);

    // If JS engine supports accessors creating shortcuts.
    var defineGetter;
    var defineSetter;
    var lookupGetter;
    var lookupSetter;
    var supportsAccessors = owns(prototypeOfObject, '__defineGetter__');
    if (supportsAccessors) {
        /* eslint-disable no-underscore-dangle, no-restricted-properties */
        defineGetter = call.bind(prototypeOfObject.__defineGetter__);
        defineSetter = call.bind(prototypeOfObject.__defineSetter__);
        lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
        lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
        /* eslint-enable no-underscore-dangle, no-restricted-properties */
    }

    var isPrimitive = function isPrimitive(o) {
        return o == null || (typeof o !== 'object' && typeof o !== 'function');
    };

    // ES5 15.2.3.2
    // http://es5.github.com/#x15.2.3.2
    if (!Object.getPrototypeOf) {
        // https://github.com/es-shims/es5-shim/issues#issue/2
        // http://ejohn.org/blog/objectgetprototypeof/
        // recommended by fschaefer on github
        //
        // sure, and webreflection says ^_^
        // ... this will nerever possibly return null
        // ... Opera Mini breaks here with infinite loops
        Object.getPrototypeOf = function getPrototypeOf(object) {
            // eslint-disable-next-line no-proto
            var proto = object.__proto__;
            if (proto || proto === null) {
                return proto;
            } else if (toStr(object.constructor) === '[object Function]') {
                return object.constructor.prototype;
            } else if (object instanceof Object) {
                return prototypeOfObject;
            } else {
                // Correctly return null for Objects created with `Object.create(null)`
                // (shammed or native) or `{ __proto__: null}`.  Also returns null for
                // cross-realm objects on browsers that lack `__proto__` support (like
                // IE <11), but that's the best we can do.
                return null;
            }
        };
    }

    // ES5 15.2.3.3
    // http://es5.github.com/#x15.2.3.3

    var doesGetOwnPropertyDescriptorWork = function doesGetOwnPropertyDescriptorWork(object) {
        try {
            object.sentinel = 0;
            return Object.getOwnPropertyDescriptor(object, 'sentinel').value === 0;
        } catch (exception) {
            return false;
        }
    };

    // check whether getOwnPropertyDescriptor works if it's given. Otherwise, shim partially.
    if (Object.defineProperty) {
        var getOwnPropertyDescriptorWorksOnObject = doesGetOwnPropertyDescriptorWork({});
        var getOwnPropertyDescriptorWorksOnDom = typeof document === 'undefined' ||
        doesGetOwnPropertyDescriptorWork(document.createElement('div'));
        if (!getOwnPropertyDescriptorWorksOnDom || !getOwnPropertyDescriptorWorksOnObject) {
            var getOwnPropertyDescriptorFallback = Object.getOwnPropertyDescriptor;
        }
    }

    if (!Object.getOwnPropertyDescriptor || getOwnPropertyDescriptorFallback) {
        var ERR_NON_OBJECT = 'Object.getOwnPropertyDescriptor called on a non-object: ';

        /* eslint-disable no-proto */
        Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
            if (isPrimitive(object)) {
                throw new TypeError(ERR_NON_OBJECT + object);
            }

            // make a valiant attempt to use the real getOwnPropertyDescriptor
            // for I8's DOM elements.
            if (getOwnPropertyDescriptorFallback) {
                try {
                    return getOwnPropertyDescriptorFallback.call(Object, object, property);
                } catch (exception) {
                    // try the shim if the real one doesn't work
                }
            }

            var descriptor;

            // If object does not owns property return undefined immediately.
            if (!owns(object, property)) {
                return descriptor;
            }

            // If object has a property then it's for sure `configurable`, and
            // probably `enumerable`. Detect enumerability though.
            descriptor = {
                enumerable: isEnumerable(object, property),
                configurable: true
            };

            // If JS engine supports accessor properties then property may be a
            // getter or setter.
            if (supportsAccessors) {
                // Unfortunately `__lookupGetter__` will return a getter even
                // if object has own non getter property along with a same named
                // inherited getter. To avoid misbehavior we temporary remove
                // `__proto__` so that `__lookupGetter__` will return getter only
                // if it's owned by an object.
                var prototype = object.__proto__;
                var notPrototypeOfObject = object !== prototypeOfObject;
                // avoid recursion problem, breaking in Opera Mini when
                // Object.getOwnPropertyDescriptor(Object.prototype, 'toString')
                // or any other Object.prototype accessor
                if (notPrototypeOfObject) {
                    object.__proto__ = prototypeOfObject;
                }

                var getter = lookupGetter(object, property);
                var setter = lookupSetter(object, property);

                if (notPrototypeOfObject) {
                    // Once we have getter and setter we can put values back.
                    object.__proto__ = prototype;
                }

                if (getter || setter) {
                    if (getter) {
                        descriptor.get = getter;
                    }
                    if (setter) {
                        descriptor.set = setter;
                    }
                    // If it was accessor property we're done and return here
                    // in order to avoid adding `value` to the descriptor.
                    return descriptor;
                }
            }

            // If we got this far we know that object has an own property that is
            // not an accessor so we set it as a value and return descriptor.
            descriptor.value = object[property];
            descriptor.writable = true;
            return descriptor;
        };
        /* eslint-enable no-proto */
    }

    // ES5 15.2.3.4
    // http://es5.github.com/#x15.2.3.4
    if (!Object.getOwnPropertyNames) {
        Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
            return Object.keys(object);
        };
    }

    // ES5 15.2.3.5
    // http://es5.github.com/#x15.2.3.5
    if (!Object.create) {

        // Contributed by Brandon Benvie, October, 2012
        var createEmpty;
        var supportsProto = !({ __proto__: null } instanceof Object);
                            // the following produces false positives
                            // in Opera Mini => not a reliable check
                            // Object.prototype.__proto__ === null

        // Check for document.domain and active x support
        // No need to use active x approach when document.domain is not set
        // see https://github.com/es-shims/es5-shim/issues/150
        // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
        /* global ActiveXObject */
        var shouldUseActiveX = function shouldUseActiveX() {
            // return early if document.domain not set
            if (!document.domain) {
                return false;
            }

            try {
                return !!new ActiveXObject('htmlfile');
            } catch (exception) {
                return false;
            }
        };

        // This supports IE8 when document.domain is used
        // see https://github.com/es-shims/es5-shim/issues/150
        // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
        var getEmptyViaActiveX = function getEmptyViaActiveX() {
            var empty;
            var xDoc;

            xDoc = new ActiveXObject('htmlfile');

            var script = 'script';
            xDoc.write('<' + script + '></' + script + '>');
            xDoc.close();

            empty = xDoc.parentWindow.Object.prototype;
            xDoc = null;

            return empty;
        };

        // The original implementation using an iframe
        // before the activex approach was added
        // see https://github.com/es-shims/es5-shim/issues/150
        var getEmptyViaIFrame = function getEmptyViaIFrame() {
            var iframe = document.createElement('iframe');
            var parent = document.body || document.documentElement;
            var empty;

            iframe.style.display = 'none';
            parent.appendChild(iframe);
            // eslint-disable-next-line no-script-url
            iframe.src = 'javascript:';

            empty = iframe.contentWindow.Object.prototype;
            parent.removeChild(iframe);
            iframe = null;

            return empty;
        };

        /* global document */
        if (supportsProto || typeof document === 'undefined') {
            createEmpty = function () {
                return { __proto__: null };
            };
        } else {
            // In old IE __proto__ can't be used to manually set `null`, nor does
            // any other method exist to make an object that inherits from nothing,
            // aside from Object.prototype itself. Instead, create a new global
            // object and *steal* its Object.prototype and strip it bare. This is
            // used as the prototype to create nullary objects.
            createEmpty = function () {
                // Determine which approach to use
                // see https://github.com/es-shims/es5-shim/issues/150
                var empty = shouldUseActiveX() ? getEmptyViaActiveX() : getEmptyViaIFrame();

                delete empty.constructor;
                delete empty.hasOwnProperty;
                delete empty.propertyIsEnumerable;
                delete empty.isPrototypeOf;
                delete empty.toLocaleString;
                delete empty.toString;
                delete empty.valueOf;

                var Empty = function Empty() {};
                Empty.prototype = empty;
                // short-circuit future calls
                createEmpty = function () {
                    return new Empty();
                };
                return new Empty();
            };
        }

        Object.create = function create(prototype, properties) {

            var object;
            var Type = function Type() {}; // An empty constructor.

            if (prototype === null) {
                object = createEmpty();
            } else {
                if (prototype !== null && isPrimitive(prototype)) {
                    // In the native implementation `parent` can be `null`
                    // OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)
                    // Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`
                    // like they are in modern browsers. Using `Object.create` on DOM elements
                    // is...err...probably inappropriate, but the native version allows for it.
                    throw new TypeError('Object prototype may only be an Object or null'); // same msg as Chrome
                }
                Type.prototype = prototype;
                object = new Type();
                // IE has no built-in implementation of `Object.getPrototypeOf`
                // neither `__proto__`, but this manually setting `__proto__` will
                // guarantee that `Object.getPrototypeOf` will work as expected with
                // objects created using `Object.create`
                // eslint-disable-next-line no-proto
                object.__proto__ = prototype;
            }

            if (properties !== void 0) {
                Object.defineProperties(object, properties);
            }

            return object;
        };
    }

    // ES5 15.2.3.6
    // http://es5.github.com/#x15.2.3.6

    // Patch for WebKit and IE8 standard mode
    // Designed by hax <hax.github.com>
    // related issue: https://github.com/es-shims/es5-shim/issues#issue/5
    // IE8 Reference:
    //     http://msdn.microsoft.com/en-us/library/dd282900.aspx
    //     http://msdn.microsoft.com/en-us/library/dd229916.aspx
    // WebKit Bugs:
    //     https://bugs.webkit.org/show_bug.cgi?id=36423

    var doesDefinePropertyWork = function doesDefinePropertyWork(object) {
        try {
            Object.defineProperty(object, 'sentinel', {});
            return 'sentinel' in object;
        } catch (exception) {
            return false;
        }
    };

    // check whether defineProperty works if it's given. Otherwise,
    // shim partially.
    if (Object.defineProperty) {
        var definePropertyWorksOnObject = doesDefinePropertyWork({});
        var definePropertyWorksOnDom = typeof document === 'undefined' ||
            doesDefinePropertyWork(document.createElement('div'));
        if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
            var definePropertyFallback = Object.defineProperty,
                definePropertiesFallback = Object.defineProperties;
        }
    }

    if (!Object.defineProperty || definePropertyFallback) {
        var ERR_NON_OBJECT_DESCRIPTOR = 'Property description must be an object: ';
        var ERR_NON_OBJECT_TARGET = 'Object.defineProperty called on non-object: ';
        var ERR_ACCESSORS_NOT_SUPPORTED = 'getters & setters can not be defined on this javascript engine';

        Object.defineProperty = function defineProperty(object, property, descriptor) {
            if (isPrimitive(object)) {
                throw new TypeError(ERR_NON_OBJECT_TARGET + object);
            }
            if (isPrimitive(descriptor)) {
                throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
            }
            // make a valiant attempt to use the real defineProperty
            // for I8's DOM elements.
            if (definePropertyFallback) {
                try {
                    return definePropertyFallback.call(Object, object, property, descriptor);
                } catch (exception) {
                    // try the shim if the real one doesn't work
                }
            }

            // If it's a data property.
            if ('value' in descriptor) {
                // fail silently if 'writable', 'enumerable', or 'configurable'
                // are requested but not supported
                /*
                // alternate approach:
                if ( // can't implement these features; allow false but not true
                    ('writable' in descriptor && !descriptor.writable) ||
                    ('enumerable' in descriptor && !descriptor.enumerable) ||
                    ('configurable' in descriptor && !descriptor.configurable)
                ))
                    throw new RangeError(
                        'This implementation of Object.defineProperty does not support configurable, enumerable, or writable.'
                    );
                */

                if (supportsAccessors && (lookupGetter(object, property) || lookupSetter(object, property))) {
                    // As accessors are supported only on engines implementing
                    // `__proto__` we can safely override `__proto__` while defining
                    // a property to make sure that we don't hit an inherited
                    // accessor.
                    /* eslint-disable no-proto */
                    var prototype = object.__proto__;
                    object.__proto__ = prototypeOfObject;
                    // Deleting a property anyway since getter / setter may be
                    // defined on object itself.
                    delete object[property];
                    object[property] = descriptor.value;
                    // Setting original `__proto__` back now.
                    object.__proto__ = prototype;
                    /* eslint-enable no-proto */
                } else {
                    object[property] = descriptor.value;
                }
            } else {
                var hasGetter = 'get' in descriptor;
                var hasSetter = 'set' in descriptor;
                if (!supportsAccessors && (hasGetter || hasSetter)) {
                    throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
                }
                // If we got that far then getters and setters can be defined !!
                if (hasGetter) {
                    defineGetter(object, property, descriptor.get);
                }
                if (hasSetter) {
                    defineSetter(object, property, descriptor.set);
                }
            }
            return object;
        };
    }

    // ES5 15.2.3.7
    // http://es5.github.com/#x15.2.3.7
    if (!Object.defineProperties || definePropertiesFallback) {
        Object.defineProperties = function defineProperties(object, properties) {
            // make a valiant attempt to use the real defineProperties
            if (definePropertiesFallback) {
                try {
                    return definePropertiesFallback.call(Object, object, properties);
                } catch (exception) {
                    // try the shim if the real one doesn't work
                }
            }

            Object.keys(properties).forEach(function (property) {
                if (property !== '__proto__') {
                    Object.defineProperty(object, property, properties[property]);
                }
            });
            return object;
        };
    }

    // ES5 15.2.3.8
    // http://es5.github.com/#x15.2.3.8
    if (!Object.seal) {
        Object.seal = function seal(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.seal can only be called on Objects.');
            }
            // this is misleading and breaks feature-detection, but
            // allows "securable" code to "gracefully" degrade to working
            // but insecure code.
            return object;
        };
    }

    // ES5 15.2.3.9
    // http://es5.github.com/#x15.2.3.9
    if (!Object.freeze) {
        Object.freeze = function freeze(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.freeze can only be called on Objects.');
            }
            // this is misleading and breaks feature-detection, but
            // allows "securable" code to "gracefully" degrade to working
            // but insecure code.
            return object;
        };
    }

    // detect a Rhino bug and patch it
    try {
        Object.freeze(function () {});
    } catch (exception) {
        Object.freeze = (function (freezeObject) {
            return function freeze(object) {
                if (typeof object === 'function') {
                    return object;
                } else {
                    return freezeObject(object);
                }
            };
        }(Object.freeze));
    }

    // ES5 15.2.3.10
    // http://es5.github.com/#x15.2.3.10
    if (!Object.preventExtensions) {
        Object.preventExtensions = function preventExtensions(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.preventExtensions can only be called on Objects.');
            }
            // this is misleading and breaks feature-detection, but
            // allows "securable" code to "gracefully" degrade to working
            // but insecure code.
            return object;
        };
    }

    // ES5 15.2.3.11
    // http://es5.github.com/#x15.2.3.11
    if (!Object.isSealed) {
        Object.isSealed = function isSealed(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.isSealed can only be called on Objects.');
            }
            return false;
        };
    }

    // ES5 15.2.3.12
    // http://es5.github.com/#x15.2.3.12
    if (!Object.isFrozen) {
        Object.isFrozen = function isFrozen(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.isFrozen can only be called on Objects.');
            }
            return false;
        };
    }

    // ES5 15.2.3.13
    // http://es5.github.com/#x15.2.3.13
    if (!Object.isExtensible) {
        Object.isExtensible = function isExtensible(object) {
            // 1. If Type(O) is not Object throw a TypeError exception.
            if (Object(object) !== object) {
                throw new TypeError('Object.isExtensible can only be called on Objects.');
            }
            // 2. Return the Boolean value of the [[Extensible]] internal property of O.
            var name = '';
            while (owns(object, name)) {
                name += '?';
            }
            object[name] = true;
            var returnValue = owns(object, name);
            delete object[name];
            return returnValue;
        };
    }

}));

/*!
 Transformation Matrix v2.0
 (c) Epistemex 2014-2015
 www.epistemex.com
 By Ken Fyrstenberg
 Contributions by leeoniya.
 License: MIT, header required.
 */

/**
 * 2D transformation matrix object initialized with identity matrix.
 *
 * The matrix can synchronize a canvas context by supplying the context
 * as an argument, or later apply current absolute transform to an
 * existing context.
 *
 * All values are handled as floating point values.
 *
 * @param {CanvasRenderingContext2D} [context] - Optional context to sync with Matrix
 * @prop {number} a - scale x
 * @prop {number} b - shear y
 * @prop {number} c - shear x
 * @prop {number} d - scale y
 * @prop {number} e - translate x
 * @prop {number} f - translate y
 * @prop {CanvasRenderingContext2D|null} [context=null] - set or get current canvas context
 * @constructor
 */

var Matrix = (function(){

    function reset(){
        this.props[0] = 1;
        this.props[1] = 0;
        this.props[2] = 0;
        this.props[3] = 0;
        this.props[4] = 0;
        this.props[5] = 1;
        this.props[6] = 0;
        this.props[7] = 0;
        this.props[8] = 0;
        this.props[9] = 0;
        this.props[10] = 1;
        this.props[11] = 0;
        this.props[12] = 0;
        this.props[13] = 0;
        this.props[14] = 0;
        this.props[15] = 1;
        return this;
    }

    function rotate(angle) {
        if(angle === 0){
            return this;
        }
        var mCos = Math.cos(angle);
        var mSin = Math.sin(angle);
        return this._t(mCos, -mSin,  0, 0
            , mSin,  mCos, 0, 0
            , 0,  0,  1, 0
            , 0, 0, 0, 1);
    }

    function rotateX(angle){
        if(angle === 0){
            return this;
        }
        var mCos = Math.cos(angle);
        var mSin = Math.sin(angle);
        return this._t(1, 0, 0, 0
            , 0, mCos, -mSin, 0
            , 0, mSin,  mCos, 0
            , 0, 0, 0, 1);
    }

    function rotateY(angle){
        if(angle === 0){
            return this;
        }
        var mCos = Math.cos(angle);
        var mSin = Math.sin(angle);
        return this._t(mCos,  0,  mSin, 0
            , 0, 1, 0, 0
            , -mSin,  0,  mCos, 0
            , 0, 0, 0, 1);
    }

    function rotateZ(angle){
        if(angle === 0){
            return this;
        }
        var mCos = Math.cos(angle);
        var mSin = Math.sin(angle);
        return this._t(mCos, -mSin,  0, 0
            , mSin,  mCos, 0, 0
            , 0,  0,  1, 0
            , 0, 0, 0, 1);
    }

    function shear(sx,sy){
        return this._t(1, sy, sx, 1, 0, 0);
    }

    function skew(ax, ay){
        return this.shear(Math.tan(ax), Math.tan(ay));
    }

    function skewFromAxis(ax, angle){
        var mCos = Math.cos(angle);
        var mSin = Math.sin(angle);
        return this._t(mCos, mSin,  0, 0
            , -mSin,  mCos, 0, 0
            , 0,  0,  1, 0
            , 0, 0, 0, 1)
            ._t(1, 0,  0, 0
            , Math.tan(ax),  1, 0, 0
            , 0,  0,  1, 0
            , 0, 0, 0, 1)
            ._t(mCos, -mSin,  0, 0
            , mSin,  mCos, 0, 0
            , 0,  0,  1, 0
            , 0, 0, 0, 1);
        //return this._t(mCos, mSin, -mSin, mCos, 0, 0)._t(1, 0, Math.tan(ax), 1, 0, 0)._t(mCos, -mSin, mSin, mCos, 0, 0);
    }

    function scale(sx, sy, sz) {
        sz = isNaN(sz) ? 1 : sz;
        if(sx == 1 && sy == 1 && sz == 1){
            return this;
        }
        return this._t(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
    }

    function setTransform(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
        this.props[0] = a;
        this.props[1] = b;
        this.props[2] = c;
        this.props[3] = d;
        this.props[4] = e;
        this.props[5] = f;
        this.props[6] = g;
        this.props[7] = h;
        this.props[8] = i;
        this.props[9] = j;
        this.props[10] = k;
        this.props[11] = l;
        this.props[12] = m;
        this.props[13] = n;
        this.props[14] = o;
        this.props[15] = p;
        return this;
    }

    function translate(tx, ty, tz) {
        tz = isNaN(tz) ? 0 : tz;
        if(tx !== 0 || ty !== 0 || tz !== 0){
            return this._t(1,0,0,0,0,1,0,0,0,0,1,0,tx,ty,tz,1);
        }
        return this;
    }

    function transform(a2, b2, c2, d2, e2, f2, g2, h2, i2, j2, k2, l2, m2, n2, o2, p2) {

        if(a2 === 1 && b2 === 0 && c2 === 0 && d2 === 0 && e2 === 0 && f2 === 1 && g2 === 0 && h2 === 0 && i2 === 0 && j2 === 0 && k2 === 1 && l2 === 0){
            if(m2 !== 0 || n2 !== 0 || o2 !== 0){

                this.props[12] = this.props[12] * a2 + this.props[13] * e2 + this.props[14] * i2 + this.props[15] * m2 ;
                this.props[13] = this.props[12] * b2 + this.props[13] * f2 + this.props[14] * j2 + this.props[15] * n2 ;
                this.props[14] = this.props[12] * c2 + this.props[13] * g2 + this.props[14] * k2 + this.props[15] * o2 ;
                this.props[15] = this.props[12] * d2 + this.props[13] * h2 + this.props[14] * l2 + this.props[15] * p2 ;
            }
            return this;
        }

        var a1 = this.props[0];
        var b1 = this.props[1];
        var c1 = this.props[2];
        var d1 = this.props[3];
        var e1 = this.props[4];
        var f1 = this.props[5];
        var g1 = this.props[6];
        var h1 = this.props[7];
        var i1 = this.props[8];
        var j1 = this.props[9];
        var k1 = this.props[10];
        var l1 = this.props[11];
        var m1 = this.props[12];
        var n1 = this.props[13];
        var o1 = this.props[14];
        var p1 = this.props[15];

        /* matrix order (canvas compatible):
         * ace
         * bdf
         * 001
         */
        this.props[0] = a1 * a2 + b1 * e2 + c1 * i2 + d1 * m2;
        this.props[1] = a1 * b2 + b1 * f2 + c1 * j2 + d1 * n2 ;
        this.props[2] = a1 * c2 + b1 * g2 + c1 * k2 + d1 * o2 ;
        this.props[3] = a1 * d2 + b1 * h2 + c1 * l2 + d1 * p2 ;

        this.props[4] = e1 * a2 + f1 * e2 + g1 * i2 + h1 * m2 ;
        this.props[5] = e1 * b2 + f1 * f2 + g1 * j2 + h1 * n2 ;
        this.props[6] = e1 * c2 + f1 * g2 + g1 * k2 + h1 * o2 ;
        this.props[7] = e1 * d2 + f1 * h2 + g1 * l2 + h1 * p2 ;

        this.props[8] = i1 * a2 + j1 * e2 + k1 * i2 + l1 * m2 ;
        this.props[9] = i1 * b2 + j1 * f2 + k1 * j2 + l1 * n2 ;
        this.props[10] = i1 * c2 + j1 * g2 + k1 * k2 + l1 * o2 ;
        this.props[11] = i1 * d2 + j1 * h2 + k1 * l2 + l1 * p2 ;

        this.props[12] = m1 * a2 + n1 * e2 + o1 * i2 + p1 * m2 ;
        this.props[13] = m1 * b2 + n1 * f2 + o1 * j2 + p1 * n2 ;
        this.props[14] = m1 * c2 + n1 * g2 + o1 * k2 + p1 * o2 ;
        this.props[15] = m1 * d2 + n1 * h2 + o1 * l2 + p1 * p2 ;

        return this;
    }

    function clone(matr){
        var i;
        for(i=0;i<16;i+=1){
            matr.props[i] = this.props[i];
        }
    }

    function cloneFromProps(props){
        var i;
        for(i=0;i<16;i+=1){
            this.props[i] = props[i];
        }
    }

    function applyToPoint(x, y, z) {

        return {
            x: x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],
            y: x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],
            z: x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14]
        };
        /*return {
         x: x * me.a + y * me.c + me.e,
         y: x * me.b + y * me.d + me.f
         };*/
    }
    function applyToX(x, y, z) {
        return x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12];
    }
    function applyToY(x, y, z) {
        return x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13];
    }
    function applyToZ(x, y, z) {
        return x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14];
    }

    function applyToPointArray(x,y,z){
        return [x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14]];
    }
    function applyToPointStringified(x, y) {
        return (bm_rnd(x * this.props[0] + y * this.props[4] + this.props[12]))+','+(bm_rnd(x * this.props[1] + y * this.props[5] + this.props[13]));
    }

    function toArray() {
        return [this.props[0],this.props[1],this.props[2],this.props[3],this.props[4],this.props[5],this.props[6],this.props[7],this.props[8],this.props[9],this.props[10],this.props[11],this.props[12],this.props[13],this.props[14],this.props[15]];
    }

    function toCSS() {
        if(isSafari){
            return "matrix3d(" + roundTo2Decimals(this.props[0]) + ',' + roundTo2Decimals(this.props[1]) + ',' + roundTo2Decimals(this.props[2]) + ',' + roundTo2Decimals(this.props[3]) + ',' + roundTo2Decimals(this.props[4]) + ',' + roundTo2Decimals(this.props[5]) + ',' + roundTo2Decimals(this.props[6]) + ',' + roundTo2Decimals(this.props[7]) + ',' + roundTo2Decimals(this.props[8]) + ',' + roundTo2Decimals(this.props[9]) + ',' + roundTo2Decimals(this.props[10]) + ',' + roundTo2Decimals(this.props[11]) + ',' + roundTo2Decimals(this.props[12]) + ',' + roundTo2Decimals(this.props[13]) + ',' + roundTo2Decimals(this.props[14]) + ',' + roundTo2Decimals(this.props[15]) + ')';
        } else {
            this.cssParts[1] = this.props.join(',');
            return this.cssParts.join('');
        }
    }

    function to2dCSS() {
        return "matrix(" + this.props[0] + ',' + this.props[1] + ',' + this.props[4] + ',' + this.props[5] + ',' + this.props[12] + ',' + this.props[13] + ")";
    }

    function toString() {
        return "" + this.toArray();
    }

    return function(){
        this.reset = reset;
        this.rotate = rotate;
        this.rotateX = rotateX;
        this.rotateY = rotateY;
        this.rotateZ = rotateZ;
        this.skew = skew;
        this.skewFromAxis = skewFromAxis;
        this.shear = shear;
        this.scale = scale;
        this.setTransform = setTransform;
        this.translate = translate;
        this.transform = transform;
        this.applyToPoint = applyToPoint;
        this.applyToX = applyToX;
        this.applyToY = applyToY;
        this.applyToZ = applyToZ;
        this.applyToPointArray = applyToPointArray;
        this.applyToPointStringified = applyToPointStringified;
        this.toArray = toArray;
        this.toCSS = toCSS;
        this.to2dCSS = to2dCSS;
        this.toString = toString;
        this.clone = clone;
        this.cloneFromProps = cloneFromProps;
        this._t = this.transform;

        this.props = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];

        this.cssParts = ['matrix3d(','',')'];
    }
}());
//  json2.js
//  2016-05-01
//  Public Domain.
//  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
//  See http://www.JSON.org/js.html
//  This code should be minified before deployment.
//  See http://javascript.crockford.com/jsmin.html

//  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
//  NOT CONTROL.

//  This file creates a global JSON object containing two methods: stringify
//  and parse. This file is provides the ES5 JSON capability to ES3 systems.
//  If a project might run on IE8 or earlier, then this file should be included.
//  This file does nothing on ES5 systems.

//      JSON.stringify(value, replacer, space)
//          value       any JavaScript value, usually an object or array.
//          replacer    an optional parameter that determines how object
//                      values are stringified for objects. It can be a
//                      function or an array of strings.
//          space       an optional parameter that specifies the indentation
//                      of nested structures. If it is omitted, the text will
//                      be packed without extra whitespace. If it is a number,
//                      it will specify the number of spaces to indent at each
//                      level. If it is a string (such as "\t" or "&nbsp;"),
//                      it contains the characters used to indent at each level.
//          This method produces a JSON text from a JavaScript value.
//          When an object value is found, if the object contains a toJSON
//          method, its toJSON method will be called and the result will be
//          stringified. A toJSON method does not serialize: it returns the
//          value represented by the name/value pair that should be serialized,
//          or undefined if nothing should be serialized. The toJSON method
//          will be passed the key associated with the value, and this will be
//          bound to the value.

//          For example, this would serialize Dates as ISO strings.

//              Date.prototype.toJSON = function (key) {
//                  function f(n) {
//                      // Format integers to have at least two digits.
//                      return (n < 10)
//                          ? "0" + n
//                          : n;
//                  }
//                  return this.getUTCFullYear()   + "-" +
//                       f(this.getUTCMonth() + 1) + "-" +
//                       f(this.getUTCDate())      + "T" +
//                       f(this.getUTCHours())     + ":" +
//                       f(this.getUTCMinutes())   + ":" +
//                       f(this.getUTCSeconds())   + "Z";
//              };

//          You can provide an optional replacer method. It will be passed the
//          key and value of each member, with this bound to the containing
//          object. The value that is returned from your method will be
//          serialized. If your method returns undefined, then the member will
//          be excluded from the serialization.

//          If the replacer parameter is an array of strings, then it will be
//          used to select the members to be serialized. It filters the results
//          such that only members with keys listed in the replacer array are
//          stringified.

//          Values that do not have JSON representations, such as undefined or
//          functions, will not be serialized. Such values in objects will be
//          dropped; in arrays they will be replaced with null. You can use
//          a replacer function to replace those with JSON values.

//          JSON.stringify(undefined) returns undefined.

//          The optional space parameter produces a stringification of the
//          value that is filled with line breaks and indentation to make it
//          easier to read.

//          If the space parameter is a non-empty string, then that string will
//          be used for indentation. If the space parameter is a number, then
//          the indentation will be that many spaces.

//          Example:

//          text = JSON.stringify(["e", {pluribus: "unum"}]);
//          // text is '["e",{"pluribus":"unum"}]'

//          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
//          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

//          text = JSON.stringify([new Date()], function (key, value) {
//              return this[key] instanceof Date
//                  ? "Date(" + this[key] + ")"
//                  : value;
//          });
//          // text is '["Date(---current time---)"]'

//      JSON.parse(text, reviver)
//          This method parses a JSON text to produce an object or array.
//          It can throw a SyntaxError exception.

//          The optional reviver parameter is a function that can filter and
//          transform the results. It receives each of the keys and values,
//          and its return value is used instead of the original value.
//          If it returns what it received, then the structure is not modified.
//          If it returns undefined then the member is deleted.

//          Example:

//          // Parse the text. Values that look like ISO date strings will
//          // be converted to Date objects.

//          myData = JSON.parse(text, function (key, value) {
//              var a;
//              if (typeof value === "string") {
//                  a =
//   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
//                  if (a) {
//                      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
//                          +a[5], +a[6]));
//                  }
//              }
//              return value;
//          });

//          myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
//              var d;
//              if (typeof value === "string" &&
//                      value.slice(0, 5) === "Date(" &&
//                      value.slice(-1) === ")") {
//                  d = new Date(value.slice(5, -1));
//                  if (d) {
//                      return d;
//                  }
//              }
//              return value;
//          });

//  This is a reference implementation. You are free to copy, modify, or
//  redistribute.

/*jslint
    eval, for, this
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + "-" +
                        f(this.getUTCMonth() + 1) + "-" +
                        f(this.getUTCDate()) + "T" +
                        f(this.getUTCHours()) + ":" +
                        f(this.getUTCMinutes()) + ":" +
                        f(this.getUTCSeconds()) + "Z"
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === "object" &&
                typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case "string":
            return quote(value);

        case "number":

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value)
                ? String(value)
                : "null";

        case "boolean":
        case "null":

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce "null". The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is "object", we might be dealing with an object or an array or
// null.

        case "object":

// Due to a specification blunder in ECMAScript, typeof null is "object",
// so watch out for that case.

            if (!value) {
                return "null";
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === "[object Array]") {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? "[]"
                    : gap
                        ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                        : "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? "{}"
                : gap
                    ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                    : "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== "function") {
        meta = {    // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = "";
            indent = "";

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === "string") {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== "function" &&
                    (typeof replacer !== "object" ||
                    typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }

// Make a fake root object containing our value under the key of "".
// Return the result of stringifying the value.

            return str("", {"": value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return "\\u" +
                            ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with "()" and "new"
// because they can cause invocation, and "=" because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
// replace all simple value tokens with "]" characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or "]" or
// "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The "{" operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval("(" + text + ")");

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return (typeof reviver === "function")
                    ? walk({"": j}, "")
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError("JSON.parse");
        };
    }
}());
var Bezier =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(1);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/**
	  A javascript Bezier curve library by Pomax.

	  Based on http://pomax.github.io/bezierinfo

	  This code is MIT licensed.
	**/
	(function () {
	  "use strict";

	  // math-inlining.

	  var abs = Math.abs,
	      min = Math.min,
	      max = Math.max,
	      acos = Math.acos,
	      sqrt = Math.sqrt,
	      pi = Math.PI,

	  // a zero coordinate, which is surprisingly useful
	  ZERO = { x: 0, y: 0, z: 0 };

	  // quite needed
	  var utils = __webpack_require__(2);

	  // not quite needed, but eventually this'll be useful...
	  var PolyBezier = __webpack_require__(3);

	  /**
	   * Bezier curve constructor. The constructor argument can be one of three things:
	   *
	   * 1. array/4 of {x:..., y:..., z:...}, z optional
	   * 2. numerical array/8 ordered x1,y1,x2,y2,x3,y3,x4,y4
	   * 3. numerical array/12 ordered x1,y1,z1,x2,y2,z2,x3,y3,z3,x4,y4,z4
	   *
	   */
	  var Bezier = function Bezier(coords) {
	    var args = coords && coords.forEach ? coords : [].slice.call(arguments);
	    var coordlen = false;
	    if (_typeof(args[0]) === "object") {
	      coordlen = args.length;
	      var newargs = [];
	      args.forEach(function (point) {
	        ['x', 'y', 'z'].forEach(function (d) {
	          if (typeof point[d] !== "undefined") {
	            newargs.push(point[d]);
	          }
	        });
	      });
	      args = newargs;
	    }
	    var higher = false;
	    var len = args.length;
	    if (coordlen) {
	      if (coordlen > 4) {
	        if (arguments.length !== 1) {
	          throw new Error("Only new Bezier(point[]) is accepted for 4th and higher order curves");
	        }
	        higher = true;
	      }
	    } else {
	      if (len !== 6 && len !== 8 && len !== 9 && len !== 12) {
	        if (arguments.length !== 1) {
	          throw new Error("Only new Bezier(point[]) is accepted for 4th and higher order curves");
	        }
	      }
	    }
	    var _3d = !higher && (len === 9 || len === 12) || coords && coords[0] && typeof coords[0].z !== "undefined";
	    this._3d = _3d;
	    var points = [];
	    for (var idx = 0, step = _3d ? 3 : 2; idx < len; idx += step) {
	      var point = {
	        x: args[idx],
	        y: args[idx + 1]
	      };
	      if (_3d) {
	        point.z = args[idx + 2];
	      };
	      points.push(point);
	    }
	    this.order = points.length - 1;
	    this.points = points;
	    var dims = ['x', 'y'];
	    if (_3d) dims.push('z');
	    this.dims = dims;
	    this.dimlen = dims.length;

	    (function (curve) {
	      var order = curve.order;
	      var points = curve.points;
	      var a = utils.align(points, { p1: points[0], p2: points[order] });
	      for (var i = 0; i < a.length; i++) {
	        if (abs(a[i].y) > 0.0001) {
	          curve._linear = false;
	          return;
	        }
	      }
	      curve._linear = true;
	    })(this);

	    this._t1 = 0;
	    this._t2 = 1;
	    this.update();
	  };

	  Bezier.fromSVG = function (svgString) {
	    var list = svgString.match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g).map(parseFloat);
	    var relative = /[cq]/.test(svgString);
	    if (!relative) return new Bezier(list);
	    list = list.map(function (v, i) {
	      return i < 2 ? v : v + list[i % 2];
	    });
	    return new Bezier(list);
	  };

	  function getABC(n, S, B, E, t) {
	    if (typeof t === "undefined") {
	      t = 0.5;
	    }
	    var u = utils.projectionratio(t, n),
	        um = 1 - u,
	        C = {
	      x: u * S.x + um * E.x,
	      y: u * S.y + um * E.y
	    },
	        s = utils.abcratio(t, n),
	        A = {
	      x: B.x + (B.x - C.x) / s,
	      y: B.y + (B.y - C.y) / s
	    };
	    return { A: A, B: B, C: C };
	  }

	  Bezier.quadraticFromPoints = function (p1, p2, p3, t) {
	    if (typeof t === "undefined") {
	      t = 0.5;
	    }
	    // shortcuts, although they're really dumb
	    if (t === 0) {
	      return new Bezier(p2, p2, p3);
	    }
	    if (t === 1) {
	      return new Bezier(p1, p2, p2);
	    }
	    // real fitting.
	    var abc = getABC(2, p1, p2, p3, t);
	    return new Bezier(p1, abc.A, p3);
	  };

	  Bezier.cubicFromPoints = function (S, B, E, t, d1) {
	    if (typeof t === "undefined") {
	      t = 0.5;
	    }
	    var abc = getABC(3, S, B, E, t);
	    if (typeof d1 === "undefined") {
	      d1 = utils.dist(B, abc.C);
	    }
	    var d2 = d1 * (1 - t) / t;

	    var selen = utils.dist(S, E),
	        lx = (E.x - S.x) / selen,
	        ly = (E.y - S.y) / selen,
	        bx1 = d1 * lx,
	        by1 = d1 * ly,
	        bx2 = d2 * lx,
	        by2 = d2 * ly;
	    // derivation of new hull coordinates
	    var e1 = { x: B.x - bx1, y: B.y - by1 },
	        e2 = { x: B.x + bx2, y: B.y + by2 },
	        A = abc.A,
	        v1 = { x: A.x + (e1.x - A.x) / (1 - t), y: A.y + (e1.y - A.y) / (1 - t) },
	        v2 = { x: A.x + (e2.x - A.x) / t, y: A.y + (e2.y - A.y) / t },
	        nc1 = { x: S.x + (v1.x - S.x) / t, y: S.y + (v1.y - S.y) / t },
	        nc2 = { x: E.x + (v2.x - E.x) / (1 - t), y: E.y + (v2.y - E.y) / (1 - t) };
	    // ...done
	    return new Bezier(S, nc1, nc2, E);
	  };

	  var getUtils = function getUtils() {
	    return utils;
	  };

	  Bezier.getUtils = getUtils;

	  Bezier.prototype = {
	    getUtils: getUtils,
	    valueOf: function valueOf() {
	      return this.toString();
	    },
	    toString: function toString() {
	      return utils.pointsToString(this.points);
	    },
	    toSVG: function toSVG(relative) {
	      if (this._3d) return false;
	      var p = this.points,
	          x = p[0].x,
	          y = p[0].y,
	          s = ["M", x, y, this.order === 2 ? "Q" : "C"];
	      for (var i = 1, last = p.length; i < last; i++) {
	        s.push(p[i].x);
	        s.push(p[i].y);
	      }
	      return s.join(" ");
	    },
	    update: function update() {
	      // one-time compute derivative coordinates
	      this.dpoints = [];
	      for (var p = this.points, d = p.length, c = d - 1; d > 1; d--, c--) {
	        var list = [];
	        for (var j = 0, dpt; j < c; j++) {
	          dpt = {
	            x: c * (p[j + 1].x - p[j].x),
	            y: c * (p[j + 1].y - p[j].y)
	          };
	          if (this._3d) {
	            dpt.z = c * (p[j + 1].z - p[j].z);
	          }
	          list.push(dpt);
	        }
	        this.dpoints.push(list);
	        p = list;
	      };
	      this.computedirection();
	    },
	    computedirection: function computedirection() {
	      var points = this.points;
	      var angle = utils.angle(points[0], points[this.order], points[1]);
	      this.clockwise = angle > 0;
	    },
	    length: function length() {
	      return utils.length(this.derivative.bind(this));
	    },
	    _lut: [],
	    getLUT: function getLUT(steps) {
	      steps = steps || 100;
	      if (this._lut.length === steps) {
	        return this._lut;
	      }
	      this._lut = [];
	      for (var t = 0; t <= steps; t++) {
	        this._lut.push(this.compute(t / steps));
	      }
	      return this._lut;
	    },
	    on: function on(point, error) {
	      error = error || 5;
	      var lut = this.getLUT(),
	          hits = [],
	          c,
	          t = 0;
	      for (var i = 0; i < lut.length; i++) {
	        c = lut[i];
	        if (utils.dist(c, point) < error) {
	          hits.push(c);
	          t += i / lut.length;
	        }
	      }
	      if (!hits.length) return false;
	      return t /= hits.length;
	    },
	    project: function project(point) {
	      // step 1: coarse check
	      var LUT = this.getLUT(),
	          l = LUT.length - 1,
	          closest = utils.closest(LUT, point),
	          mdist = closest.mdist,
	          mpos = closest.mpos;
	      if (mpos === 0 || mpos === l) {
	        var t = mpos / l,
	            pt = this.compute(t);
	        pt.t = t;
	        pt.d = mdist;
	        return pt;
	      }

	      // step 2: fine check
	      var ft,
	          t,
	          p,
	          d,
	          t1 = (mpos - 1) / l,
	          t2 = (mpos + 1) / l,
	          step = 0.1 / l;
	      mdist += 1;
	      for (t = t1, ft = t; t < t2 + step; t += step) {
	        p = this.compute(t);
	        d = utils.dist(point, p);
	        if (d < mdist) {
	          mdist = d;
	          ft = t;
	        }
	      }
	      p = this.compute(ft);
	      p.t = ft;
	      p.d = mdist;
	      return p;
	    },
	    get: function get(t) {
	      return this.compute(t);
	    },
	    point: function point(idx) {
	      return this.points[idx];
	    },
	    compute: function compute(t) {
	      // shortcuts
	      if (t === 0) {
	        return this.points[0];
	      }
	      if (t === 1) {
	        return this.points[this.order];
	      }

	      var p = this.points;
	      var mt = 1 - t;

	      // linear?
	      if (this.order === 1) {
	        ret = {
	          x: mt * p[0].x + t * p[1].x,
	          y: mt * p[0].y + t * p[1].y
	        };
	        if (this._3d) {
	          ret.z = mt * p[0].z + t * p[1].z;
	        }
	        return ret;
	      }

	      // quadratic/cubic curve?
	      if (this.order < 4) {
	        var mt2 = mt * mt,
	            t2 = t * t,
	            a,
	            b,
	            c,
	            d = 0;
	        if (this.order === 2) {
	          p = [p[0], p[1], p[2], ZERO];
	          a = mt2;
	          b = mt * t * 2;
	          c = t2;
	        } else if (this.order === 3) {
	          a = mt2 * mt;
	          b = mt2 * t * 3;
	          c = mt * t2 * 3;
	          d = t * t2;
	        }
	        var ret = {
	          x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
	          y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y
	        };
	        if (this._3d) {
	          ret.z = a * p[0].z + b * p[1].z + c * p[2].z + d * p[3].z;
	        }
	        return ret;
	      }

	      // higher order curves: use de Casteljau's computation
	      var dCpts = JSON.parse(JSON.stringify(this.points));
	      while (dCpts.length > 1) {
	        for (var i = 0; i < dCpts.length - 1; i++) {
	          dCpts[i] = {
	            x: dCpts[i].x + (dCpts[i + 1].x - dCpts[i].x) * t,
	            y: dCpts[i].y + (dCpts[i + 1].y - dCpts[i].y) * t
	          };
	          if (typeof dCpts[i].z !== "undefined") {
	            dCpts[i] = dCpts[i].z + (dCpts[i + 1].z - dCpts[i].z) * t;
	          }
	        }
	        dCpts.splice(dCpts.length - 1, 1);
	      }
	      return dCpts[0];
	    },
	    raise: function raise() {
	      var p = this.points,
	          np = [p[0]],
	          i,
	          k = p.length,
	          pi,
	          pim;
	      for (var i = 1; i < k; i++) {
	        pi = p[i];
	        pim = p[i - 1];
	        np[i] = {
	          x: (k - i) / k * pi.x + i / k * pim.x,
	          y: (k - i) / k * pi.y + i / k * pim.y
	        };
	      }
	      np[k] = p[k - 1];
	      return new Bezier(np);
	    },
	    derivative: function derivative(t) {
	      var mt = 1 - t,
	          a,
	          b,
	          c = 0,
	          p = this.dpoints[0];
	      if (this.order === 2) {
	        p = [p[0], p[1], ZERO];a = mt;b = t;
	      }
	      if (this.order === 3) {
	        a = mt * mt;b = mt * t * 2;c = t * t;
	      }
	      var ret = {
	        x: a * p[0].x + b * p[1].x + c * p[2].x,
	        y: a * p[0].y + b * p[1].y + c * p[2].y
	      };
	      if (this._3d) {
	        ret.z = a * p[0].z + b * p[1].z + c * p[2].z;
	      }
	      return ret;
	    },
	    inflections: function inflections() {
	      return utils.inflections(this.points);
	    },
	    normal: function normal(t) {
	      return this._3d ? this.__normal3(t) : this.__normal2(t);
	    },
	    __normal2: function __normal2(t) {
	      var d = this.derivative(t);
	      var q = sqrt(d.x * d.x + d.y * d.y);
	      return { x: -d.y / q, y: d.x / q };
	    },
	    __normal3: function __normal3(t) {
	      // see http://stackoverflow.com/questions/25453159
	      var r1 = this.derivative(t),
	          r2 = this.derivative(t + 0.01),
	          q1 = sqrt(r1.x * r1.x + r1.y * r1.y + r1.z * r1.z),
	          q2 = sqrt(r2.x * r2.x + r2.y * r2.y + r2.z * r2.z);
	      r1.x /= q1;r1.y /= q1;r1.z /= q1;
	      r2.x /= q2;r2.y /= q2;r2.z /= q2;
	      // cross product
	      var c = {
	        x: r2.y * r1.z - r2.z * r1.y,
	        y: r2.z * r1.x - r2.x * r1.z,
	        z: r2.x * r1.y - r2.y * r1.x
	      };
	      var m = sqrt(c.x * c.x + c.y * c.y + c.z * c.z);
	      c.x /= m;c.y /= m;c.z /= m;
	      // rotation matrix
	      var R = [c.x * c.x, c.x * c.y - c.z, c.x * c.z + c.y, c.x * c.y + c.z, c.y * c.y, c.y * c.z - c.x, c.x * c.z - c.y, c.y * c.z + c.x, c.z * c.z];
	      // normal vector:
	      var n = {
	        x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
	        y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
	        z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z
	      };
	      return n;
	    },
	    hull: function hull(t) {
	      var p = this.points,
	          _p = [],
	          pt,
	          q = [],
	          idx = 0,
	          i = 0,
	          l = 0;
	      q[idx++] = p[0];
	      q[idx++] = p[1];
	      q[idx++] = p[2];
	      if (this.order === 3) {
	        q[idx++] = p[3];
	      }
	      // we lerp between all points at each iteration, until we have 1 point left.
	      while (p.length > 1) {
	        _p = [];
	        for (i = 0, l = p.length - 1; i < l; i++) {
	          pt = utils.lerp(t, p[i], p[i + 1]);
	          q[idx++] = pt;
	          _p.push(pt);
	        }
	        p = _p;
	      }
	      return q;
	    },
	    split: function split(t1, t2) {
	      // shortcuts
	      if (t1 === 0 && !!t2) {
	        return this.split(t2).left;
	      }
	      if (t2 === 1) {
	        return this.split(t1).right;
	      }

	      // no shortcut: use "de Casteljau" iteration.
	      var q = this.hull(t1);
	      var result = {
	        left: this.order === 2 ? new Bezier([q[0], q[3], q[5]]) : new Bezier([q[0], q[4], q[7], q[9]]),
	        right: this.order === 2 ? new Bezier([q[5], q[4], q[2]]) : new Bezier([q[9], q[8], q[6], q[3]]),
	        span: q
	      };

	      // make sure we bind _t1/_t2 information!
	      result.left._t1 = utils.map(0, 0, 1, this._t1, this._t2);
	      result.left._t2 = utils.map(t1, 0, 1, this._t1, this._t2);
	      result.right._t1 = utils.map(t1, 0, 1, this._t1, this._t2);
	      result.right._t2 = utils.map(1, 0, 1, this._t1, this._t2);

	      // if we have no t2, we're done
	      if (!t2) {
	        return result;
	      }

	      // if we have a t2, split again:
	      t2 = utils.map(t2, t1, 1, 0, 1);
	      var subsplit = result.right.split(t2);
	      return subsplit.left;
	    },
	    extrema: function extrema() {
	      var dims = this.dims,
	          result = {},
	          roots = [],
	          p,
	          mfn;
	      dims.forEach(function (dim) {
	        mfn = function mfn(v) {
	          return v[dim];
	        };
	        p = this.dpoints[0].map(mfn);
	        result[dim] = utils.droots(p);
	        if (this.order === 3) {
	          p = this.dpoints[1].map(mfn);
	          result[dim] = result[dim].concat(utils.droots(p));
	        }
	        result[dim] = result[dim].filter(function (t) {
	          return t >= 0 && t <= 1;
	        });
	        roots = roots.concat(result[dim].sort());
	      }.bind(this));
	      roots = roots.sort().filter(function (v, idx) {
	        return roots.indexOf(v) === idx;
	      });
	      result.values = roots;
	      return result;
	    },
	    bbox: function bbox() {
	      var extrema = this.extrema(),
	          result = {};
	      this.dims.forEach(function (d) {
	        result[d] = utils.getminmax(this, d, extrema[d]);
	      }.bind(this));
	      return result;
	    },
	    overlaps: function overlaps(curve) {
	      var lbbox = this.bbox(),
	          tbbox = curve.bbox();
	      return utils.bboxoverlap(lbbox, tbbox);
	    },
	    offset: function offset(t, d) {
	      if (typeof d !== "undefined") {
	        var c = this.get(t);
	        var n = this.normal(t);
	        var ret = {
	          c: c,
	          n: n,
	          x: c.x + n.x * d,
	          y: c.y + n.y * d
	        };
	        if (this._3d) {
	          ret.z = c.z + n.z * d;
	        };
	        return ret;
	      }
	      if (this._linear) {
	        var nv = this.normal(0);
	        var coords = this.points.map(function (p) {
	          var ret = {
	            x: p.x + t * nv.x,
	            y: p.y + t * nv.y
	          };
	          if (p.z && n.z) {
	            ret.z = p.z + t * nv.z;
	          }
	          return ret;
	        });
	        return [new Bezier(coords)];
	      }
	      var reduced = this.reduce();
	      return reduced.map(function (s) {
	        return s.scale(t);
	      });
	    },
	    simple: function simple() {
	      if (this.order === 3) {
	        var a1 = utils.angle(this.points[0], this.points[3], this.points[1]);
	        var a2 = utils.angle(this.points[0], this.points[3], this.points[2]);
	        if (a1 > 0 && a2 < 0 || a1 < 0 && a2 > 0) return false;
	      }
	      var n1 = this.normal(0);
	      var n2 = this.normal(1);
	      var s = n1.x * n2.x + n1.y * n2.y;
	      if (this._3d) {
	        s += n1.z * n2.z;
	      }
	      var angle = abs(acos(s));
	      return angle < pi / 3;
	    },
	    reduce: function reduce() {
	      var i,
	          t1 = 0,
	          t2 = 0,
	          step = 0.01,
	          segment,
	          pass1 = [],
	          pass2 = [];
	      // first pass: split on extrema
	      var extrema = this.extrema().values;
	      if (extrema.indexOf(0) === -1) {
	        extrema = [0].concat(extrema);
	      }
	      if (extrema.indexOf(1) === -1) {
	        extrema.push(1);
	      }

	      for (t1 = extrema[0], i = 1; i < extrema.length; i++) {
	        t2 = extrema[i];
	        segment = this.split(t1, t2);
	        segment._t1 = t1;
	        segment._t2 = t2;
	        pass1.push(segment);
	        t1 = t2;
	      }

	      // second pass: further reduce these segments to simple segments
	      pass1.forEach(function (p1) {
	        t1 = 0;
	        t2 = 0;
	        while (t2 <= 1) {
	          for (t2 = t1 + step; t2 <= 1 + step; t2 += step) {
	            segment = p1.split(t1, t2);
	            if (!segment.simple()) {
	              t2 -= step;
	              if (abs(t1 - t2) < step) {
	                // we can never form a reduction
	                return [];
	              }
	              segment = p1.split(t1, t2);
	              segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
	              segment._t2 = utils.map(t2, 0, 1, p1._t1, p1._t2);
	              pass2.push(segment);
	              t1 = t2;
	              break;
	            }
	          }
	        }
	        if (t1 < 1) {
	          segment = p1.split(t1, 1);
	          segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
	          segment._t2 = p1._t2;
	          pass2.push(segment);
	        }
	      });
	      return pass2;
	    },
	    scale: function scale(d) {
	      var order = this.order;
	      var distanceFn = false;
	      if (typeof d === "function") {
	        distanceFn = d;
	      }
	      if (distanceFn && order === 2) {
	        return this.raise().scale(distanceFn);
	      }

	      // TODO: add special handling for degenerate (=linear) curves.
	      var clockwise = this.clockwise;
	      var r1 = distanceFn ? distanceFn(0) : d;
	      var r2 = distanceFn ? distanceFn(1) : d;
	      var v = [this.offset(0, 10), this.offset(1, 10)];
	      var o = utils.lli4(v[0], v[0].c, v[1], v[1].c);
	      if (!o) {
	        throw new Error("cannot scale this curve. Try reducing it first.");
	      }
	      // move all points by distance 'd' wrt the origin 'o'
	      var points = this.points,
	          np = [];

	      // move end points by fixed distance along normal.
	      [0, 1].forEach(function (t) {
	        var p = np[t * order] = utils.copy(points[t * order]);
	        p.x += (t ? r2 : r1) * v[t].n.x;
	        p.y += (t ? r2 : r1) * v[t].n.y;
	      }.bind(this));

	      if (!distanceFn) {
	        // move control points to lie on the intersection of the offset
	        // derivative vector, and the origin-through-control vector
	        [0, 1].forEach(function (t) {
	          if (this.order === 2 && !!t) return;
	          var p = np[t * order];
	          var d = this.derivative(t);
	          var p2 = { x: p.x + d.x, y: p.y + d.y };
	          np[t + 1] = utils.lli4(p, p2, o, points[t + 1]);
	        }.bind(this));
	        return new Bezier(np);
	      }

	      // move control points by "however much necessary to
	      // ensure the correct tangent to endpoint".
	      [0, 1].forEach(function (t) {
	        if (this.order === 2 && !!t) return;
	        var p = points[t + 1];
	        var ov = {
	          x: p.x - o.x,
	          y: p.y - o.y
	        };
	        var rc = distanceFn ? distanceFn((t + 1) / order) : d;
	        if (distanceFn && !clockwise) rc = -rc;
	        var m = sqrt(ov.x * ov.x + ov.y * ov.y);
	        ov.x /= m;
	        ov.y /= m;
	        np[t + 1] = {
	          x: p.x + rc * ov.x,
	          y: p.y + rc * ov.y
	        };
	      }.bind(this));
	      return new Bezier(np);
	    },
	    outline: function outline(d1, d2, d3, d4) {
	      d2 = typeof d2 === "undefined" ? d1 : d2;
	      var reduced = this.reduce(),
	          len = reduced.length,
	          fcurves = [],
	          bcurves = [],
	          p,
	          alen = 0,
	          tlen = this.length();

	      var graduated = typeof d3 !== "undefined" && typeof d4 !== "undefined";

	      function linearDistanceFunction(s, e, tlen, alen, slen) {
	        return function (v) {
	          var f1 = alen / tlen,
	              f2 = (alen + slen) / tlen,
	              d = e - s;
	          return utils.map(v, 0, 1, s + f1 * d, s + f2 * d);
	        };
	      };

	      // form curve oulines
	      reduced.forEach(function (segment) {
	        slen = segment.length();
	        if (graduated) {
	          fcurves.push(segment.scale(linearDistanceFunction(d1, d3, tlen, alen, slen)));
	          bcurves.push(segment.scale(linearDistanceFunction(-d2, -d4, tlen, alen, slen)));
	        } else {
	          fcurves.push(segment.scale(d1));
	          bcurves.push(segment.scale(-d2));
	        }
	        alen += slen;
	      });

	      // reverse the "return" outline
	      bcurves = bcurves.map(function (s) {
	        p = s.points;
	        if (p[3]) {
	          s.points = [p[3], p[2], p[1], p[0]];
	        } else {
	          s.points = [p[2], p[1], p[0]];
	        }
	        return s;
	      }).reverse();

	      // form the endcaps as lines
	      var fs = fcurves[0].points[0],
	          fe = fcurves[len - 1].points[fcurves[len - 1].points.length - 1],
	          bs = bcurves[len - 1].points[bcurves[len - 1].points.length - 1],
	          be = bcurves[0].points[0],
	          ls = utils.makeline(bs, fs),
	          le = utils.makeline(fe, be),
	          segments = [ls].concat(fcurves).concat([le]).concat(bcurves),
	          slen = segments.length;

	      return new PolyBezier(segments);
	    },
	    outlineshapes: function outlineshapes(d1, d2, curveIntersectionThreshold) {
	      d2 = d2 || d1;
	      var outline = this.outline(d1, d2).curves;
	      var shapes = [];
	      for (var i = 1, len = outline.length; i < len / 2; i++) {
	        var shape = utils.makeshape(outline[i], outline[len - i], curveIntersectionThreshold);
	        shape.startcap.virtual = i > 1;
	        shape.endcap.virtual = i < len / 2 - 1;
	        shapes.push(shape);
	      }
	      return shapes;
	    },
	    intersects: function intersects(curve, curveIntersectionThreshold) {
	      if (!curve) return this.selfintersects(curveIntersectionThreshold);
	      if (curve.p1 && curve.p2) {
	        return this.lineIntersects(curve);
	      }
	      if (curve instanceof Bezier) {
	        curve = curve.reduce();
	      }
	      return this.curveintersects(this.reduce(), curve, curveIntersectionThreshold);
	    },
	    lineIntersects: function lineIntersects(line) {
	      var mx = min(line.p1.x, line.p2.x),
	          my = min(line.p1.y, line.p2.y),
	          MX = max(line.p1.x, line.p2.x),
	          MY = max(line.p1.y, line.p2.y),
	          self = this;
	      return utils.roots(this.points, line).filter(function (t) {
	        var p = self.get(t);
	        return utils.between(p.x, mx, MX) && utils.between(p.y, my, MY);
	      });
	    },
	    selfintersects: function selfintersects(curveIntersectionThreshold) {
	      var reduced = this.reduce();
	      // "simple" curves cannot intersect with their direct
	      // neighbour, so for each segment X we check whether
	      // it intersects [0:x-2][x+2:last].
	      var i,
	          len = reduced.length - 2,
	          results = [],
	          result,
	          left,
	          right;
	      for (i = 0; i < len; i++) {
	        left = reduced.slice(i, i + 1);
	        right = reduced.slice(i + 2);
	        result = this.curveintersects(left, right, curveIntersectionThreshold);
	        results = results.concat(result);
	      }
	      return results;
	    },
	    curveintersects: function curveintersects(c1, c2, curveIntersectionThreshold) {
	      var pairs = [];
	      // step 1: pair off any overlapping segments
	      c1.forEach(function (l) {
	        c2.forEach(function (r) {
	          if (l.overlaps(r)) {
	            pairs.push({ left: l, right: r });
	          }
	        });
	      });
	      // step 2: for each pairing, run through the convergence algorithm.
	      var intersections = [];
	      pairs.forEach(function (pair) {
	        var result = utils.pairiteration(pair.left, pair.right, curveIntersectionThreshold);
	        if (result.length > 0) {
	          intersections = intersections.concat(result);
	        }
	      });
	      return intersections;
	    },
	    arcs: function arcs(errorThreshold) {
	      errorThreshold = errorThreshold || 0.5;
	      var circles = [];
	      return this._iterate(errorThreshold, circles);
	    },
	    _error: function _error(pc, np1, s, e) {
	      var q = (e - s) / 4,
	          c1 = this.get(s + q),
	          c2 = this.get(e - q),
	          ref = utils.dist(pc, np1),
	          d1 = utils.dist(pc, c1),
	          d2 = utils.dist(pc, c2);
	      return abs(d1 - ref) + abs(d2 - ref);
	    },
	    _iterate: function _iterate(errorThreshold, circles) {
	      var s = 0,
	          e = 1,
	          safety;
	      // we do a binary search to find the "good `t` closest to no-longer-good"
	      do {
	        safety = 0;

	        // step 1: start with the maximum possible arc
	        e = 1;

	        // points:
	        var np1 = this.get(s),
	            np2,
	            np3,
	            arc,
	            prev_arc;

	        // booleans:
	        var curr_good = false,
	            prev_good = false,
	            done;

	        // numbers:
	        var m = e,
	            prev_e = 1,
	            step = 0;

	        // step 2: find the best possible arc
	        do {
	          prev_good = curr_good;
	          prev_arc = arc;
	          m = (s + e) / 2;
	          step++;

	          np2 = this.get(m);
	          np3 = this.get(e);

	          arc = utils.getccenter(np1, np2, np3);

	          //also save the t values
	          arc.interval = {
	            start: s,
	            end: e
	          };

	          var error = this._error(arc, np1, s, e);
	          curr_good = error <= errorThreshold;

	          done = prev_good && !curr_good;
	          if (!done) prev_e = e;

	          // this arc is fine: we can move 'e' up to see if we can find a wider arc
	          if (curr_good) {
	            // if e is already at max, then we're done for this arc.
	            if (e >= 1) {
	              prev_e = 1;
	              prev_arc = arc;
	              break;
	            }
	            // if not, move it up by half the iteration distance
	            e = e + (e - s) / 2;
	          }

	          // this is a bad arc: we need to move 'e' down to find a good arc
	          else {
	              e = m;
	            }
	        } while (!done && safety++ < 100);

	        if (safety >= 100) {
	          console.error("arc abstraction somehow failed...");
	          break;
	        }

	        // console.log("[F] arc found", s, prev_e, prev_arc.x, prev_arc.y, prev_arc.s, prev_arc.e);

	        prev_arc = prev_arc ? prev_arc : arc;
	        circles.push(prev_arc);
	        s = prev_e;
	      } while (e < 1);
	      return circles;
	    }
	  };

	  module.exports = Bezier;
	})();

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	(function () {
	  "use strict";

	  // math-inlining.

	  var abs = Math.abs,
	      cos = Math.cos,
	      sin = Math.sin,
	      acos = Math.acos,
	      atan2 = Math.atan2,
	      sqrt = Math.sqrt,
	      pow = Math.pow,

	  // cube root function yielding real roots
	  crt = function crt(v) {
	    return v < 0 ? -pow(-v, 1 / 3) : pow(v, 1 / 3);
	  },

	  // trig constants
	  pi = Math.PI,
	      tau = 2 * pi,
	      quart = pi / 2,

	  // float precision significant decimal
	  epsilon = 0.000001,

	  // extremas used in bbox calculation and similar algorithms
	  nMax = Number.MAX_SAFE_INTEGER,
	      nMin = Number.MIN_SAFE_INTEGER;

	  // Bezier utility functions
	  var utils = {
	    // Legendre-Gauss abscissae with n=24 (x_i values, defined at i=n as the roots of the nth order Legendre polynomial Pn(x))
	    Tvalues: [-0.0640568928626056260850430826247450385909, 0.0640568928626056260850430826247450385909, -0.1911188674736163091586398207570696318404, 0.1911188674736163091586398207570696318404, -0.3150426796961633743867932913198102407864, 0.3150426796961633743867932913198102407864, -0.4337935076260451384870842319133497124524, 0.4337935076260451384870842319133497124524, -0.5454214713888395356583756172183723700107, 0.5454214713888395356583756172183723700107, -0.6480936519369755692524957869107476266696, 0.6480936519369755692524957869107476266696, -0.7401241915785543642438281030999784255232, 0.7401241915785543642438281030999784255232, -0.8200019859739029219539498726697452080761, 0.8200019859739029219539498726697452080761, -0.8864155270044010342131543419821967550873, 0.8864155270044010342131543419821967550873, -0.9382745520027327585236490017087214496548, 0.9382745520027327585236490017087214496548, -0.9747285559713094981983919930081690617411, 0.9747285559713094981983919930081690617411, -0.9951872199970213601799974097007368118745, 0.9951872199970213601799974097007368118745],

	    // Legendre-Gauss weights with n=24 (w_i values, defined by a function linked to in the Bezier primer article)
	    Cvalues: [0.1279381953467521569740561652246953718517, 0.1279381953467521569740561652246953718517, 0.1258374563468282961213753825111836887264, 0.1258374563468282961213753825111836887264, 0.1216704729278033912044631534762624256070, 0.1216704729278033912044631534762624256070, 0.1155056680537256013533444839067835598622, 0.1155056680537256013533444839067835598622, 0.1074442701159656347825773424466062227946, 0.1074442701159656347825773424466062227946, 0.0976186521041138882698806644642471544279, 0.0976186521041138882698806644642471544279, 0.0861901615319532759171852029837426671850, 0.0861901615319532759171852029837426671850, 0.0733464814110803057340336152531165181193, 0.0733464814110803057340336152531165181193, 0.0592985849154367807463677585001085845412, 0.0592985849154367807463677585001085845412, 0.0442774388174198061686027482113382288593, 0.0442774388174198061686027482113382288593, 0.0285313886289336631813078159518782864491, 0.0285313886289336631813078159518782864491, 0.0123412297999871995468056670700372915759, 0.0123412297999871995468056670700372915759],

	    arcfn: function arcfn(t, derivativeFn) {
	      var d = derivativeFn(t);
	      var l = d.x * d.x + d.y * d.y;
	      if (typeof d.z !== "undefined") {
	        l += d.z * d.z;
	      }
	      return sqrt(l);
	    },

	    between: function between(v, m, M) {
	      return m <= v && v <= M || utils.approximately(v, m) || utils.approximately(v, M);
	    },

	    approximately: function approximately(a, b, precision) {
	      return abs(a - b) <= (precision || epsilon);
	    },

	    length: function length(derivativeFn) {
	      var z = 0.5,
	          sum = 0,
	          len = utils.Tvalues.length,
	          i,
	          t;
	      for (i = 0; i < len; i++) {
	        t = z * utils.Tvalues[i] + z;
	        sum += utils.Cvalues[i] * utils.arcfn(t, derivativeFn);
	      }
	      return z * sum;
	    },

	    map: function map(v, ds, de, ts, te) {
	      var d1 = de - ds,
	          d2 = te - ts,
	          v2 = v - ds,
	          r = v2 / d1;
	      return ts + d2 * r;
	    },

	    lerp: function lerp(r, v1, v2) {
	      var ret = {
	        x: v1.x + r * (v2.x - v1.x),
	        y: v1.y + r * (v2.y - v1.y)
	      };
	      if (!!v1.z && !!v2.z) {
	        ret.z = v1.z + r * (v2.z - v1.z);
	      }
	      return ret;
	    },

	    pointToString: function pointToString(p) {
	      var s = p.x + "/" + p.y;
	      if (typeof p.z !== "undefined") {
	        s += "/" + p.z;
	      }
	      return s;
	    },

	    pointsToString: function pointsToString(points) {
	      return "[" + points.map(utils.pointToString).join(", ") + "]";
	    },

	    copy: function copy(obj) {
	      return JSON.parse(JSON.stringify(obj));
	    },

	    angle: function angle(o, v1, v2) {
	      var dx1 = v1.x - o.x,
	          dy1 = v1.y - o.y,
	          dx2 = v2.x - o.x,
	          dy2 = v2.y - o.y,
	          cross = dx1 * dy2 - dy1 * dx2,
	          dot = dx1 * dx2 + dy1 * dy2;
	      return atan2(cross, dot);
	    },

	    // round as string, to avoid rounding errors
	    round: function round(v, d) {
	      var s = '' + v;
	      var pos = s.indexOf(".");
	      return parseFloat(s.substring(0, pos + 1 + d));
	    },

	    dist: function dist(p1, p2) {
	      var dx = p1.x - p2.x,
	          dy = p1.y - p2.y;
	      return sqrt(dx * dx + dy * dy);
	    },

	    closest: function closest(LUT, point) {
	      var mdist = pow(2, 63),
	          mpos,
	          d;
	      LUT.forEach(function (p, idx) {
	        d = utils.dist(point, p);
	        if (d < mdist) {
	          mdist = d;
	          mpos = idx;
	        }
	      });
	      return { mdist: mdist, mpos: mpos };
	    },

	    abcratio: function abcratio(t, n) {
	      // see ratio(t) note on http://pomax.github.io/bezierinfo/#abc
	      if (n !== 2 && n !== 3) {
	        return false;
	      }
	      if (typeof t === "undefined") {
	        t = 0.5;
	      } else if (t === 0 || t === 1) {
	        return t;
	      }
	      var bottom = pow(t, n) + pow(1 - t, n),
	          top = bottom - 1;
	      return abs(top / bottom);
	    },

	    projectionratio: function projectionratio(t, n) {
	      // see u(t) note on http://pomax.github.io/bezierinfo/#abc
	      if (n !== 2 && n !== 3) {
	        return false;
	      }
	      if (typeof t === "undefined") {
	        t = 0.5;
	      } else if (t === 0 || t === 1) {
	        return t;
	      }
	      var top = pow(1 - t, n),
	          bottom = pow(t, n) + top;
	      return top / bottom;
	    },

	    lli8: function lli8(x1, y1, x2, y2, x3, y3, x4, y4) {
	      var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
	          ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
	          d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
	      if (d == 0) {
	        return false;
	      }
	      return { x: nx / d, y: ny / d };
	    },

	    lli4: function lli4(p1, p2, p3, p4) {
	      var x1 = p1.x,
	          y1 = p1.y,
	          x2 = p2.x,
	          y2 = p2.y,
	          x3 = p3.x,
	          y3 = p3.y,
	          x4 = p4.x,
	          y4 = p4.y;
	      return utils.lli8(x1, y1, x2, y2, x3, y3, x4, y4);
	    },

	    lli: function lli(v1, v2) {
	      return utils.lli4(v1, v1.c, v2, v2.c);
	    },

	    makeline: function makeline(p1, p2) {
	      var Bezier = __webpack_require__(1);
	      var x1 = p1.x,
	          y1 = p1.y,
	          x2 = p2.x,
	          y2 = p2.y,
	          dx = (x2 - x1) / 3,
	          dy = (y2 - y1) / 3;
	      return new Bezier(x1, y1, x1 + dx, y1 + dy, x1 + 2 * dx, y1 + 2 * dy, x2, y2);
	    },

	    findbbox: function findbbox(sections) {
	      var mx = nMax,
	          my = nMax,
	          MX = nMin,
	          MY = nMin;
	      sections.forEach(function (s) {
	        var bbox = s.bbox();
	        if (mx > bbox.x.min) mx = bbox.x.min;
	        if (my > bbox.y.min) my = bbox.y.min;
	        if (MX < bbox.x.max) MX = bbox.x.max;
	        if (MY < bbox.y.max) MY = bbox.y.max;
	      });
	      return {
	        x: { min: mx, mid: (mx + MX) / 2, max: MX, size: MX - mx },
	        y: { min: my, mid: (my + MY) / 2, max: MY, size: MY - my }
	      };
	    },

	    shapeintersections: function shapeintersections(s1, bbox1, s2, bbox2, curveIntersectionThreshold) {
	      if (!utils.bboxoverlap(bbox1, bbox2)) return [];
	      var intersections = [];
	      var a1 = [s1.startcap, s1.forward, s1.back, s1.endcap];
	      var a2 = [s2.startcap, s2.forward, s2.back, s2.endcap];
	      a1.forEach(function (l1) {
	        if (l1.virtual) return;
	        a2.forEach(function (l2) {
	          if (l2.virtual) return;
	          var iss = l1.intersects(l2, curveIntersectionThreshold);
	          if (iss.length > 0) {
	            iss.c1 = l1;
	            iss.c2 = l2;
	            iss.s1 = s1;
	            iss.s2 = s2;
	            intersections.push(iss);
	          }
	        });
	      });
	      return intersections;
	    },

	    makeshape: function makeshape(forward, back, curveIntersectionThreshold) {
	      var bpl = back.points.length;
	      var fpl = forward.points.length;
	      var start = utils.makeline(back.points[bpl - 1], forward.points[0]);
	      var end = utils.makeline(forward.points[fpl - 1], back.points[0]);
	      var shape = {
	        startcap: start,
	        forward: forward,
	        back: back,
	        endcap: end,
	        bbox: utils.findbbox([start, forward, back, end])
	      };
	      var self = utils;
	      shape.intersections = function (s2) {
	        return self.shapeintersections(shape, shape.bbox, s2, s2.bbox, curveIntersectionThreshold);
	      };
	      return shape;
	    },

	    getminmax: function getminmax(curve, d, list) {
	      if (!list) return { min: 0, max: 0 };
	      var min = nMax,
	          max = nMin,
	          t,
	          c;
	      if (list.indexOf(0) === -1) {
	        list = [0].concat(list);
	      }
	      if (list.indexOf(1) === -1) {
	        list.push(1);
	      }
	      for (var i = 0, len = list.length; i < len; i++) {
	        t = list[i];
	        c = curve.get(t);
	        if (c[d] < min) {
	          min = c[d];
	        }
	        if (c[d] > max) {
	          max = c[d];
	        }
	      }
	      return { min: min, mid: (min + max) / 2, max: max, size: max - min };
	    },

	    align: function align(points, line) {
	      var tx = line.p1.x,
	          ty = line.p1.y,
	          a = -atan2(line.p2.y - ty, line.p2.x - tx),
	          d = function d(v) {
	        return {
	          x: (v.x - tx) * cos(a) - (v.y - ty) * sin(a),
	          y: (v.x - tx) * sin(a) + (v.y - ty) * cos(a)
	        };
	      };
	      return points.map(d);
	    },

	    roots: function roots(points, line) {
	      line = line || { p1: { x: 0, y: 0 }, p2: { x: 1, y: 0 } };
	      var order = points.length - 1;
	      var p = utils.align(points, line);
	      var reduce = function reduce(t) {
	        return 0 <= t && t <= 1;
	      };

	      if (order === 2) {
	        var a = p[0].y,
	            b = p[1].y,
	            c = p[2].y,
	            d = a - 2 * b + c;
	        if (d !== 0) {
	          var m1 = -sqrt(b * b - a * c),
	              m2 = -a + b,
	              v1 = -(m1 + m2) / d,
	              v2 = -(-m1 + m2) / d;
	          return [v1, v2].filter(reduce);
	        } else if (b !== c && d === 0) {
	          return [(2 * b - c) / 2 * (b - c)].filter(reduce);
	        }
	        return [];
	      }

	      // see http://www.trans4mind.com/personal_development/mathematics/polynomials/cubicAlgebra.htm
	      var pa = p[0].y,
	          pb = p[1].y,
	          pc = p[2].y,
	          pd = p[3].y,
	          d = -pa + 3 * pb - 3 * pc + pd,
	          a = (3 * pa - 6 * pb + 3 * pc) / d,
	          b = (-3 * pa + 3 * pb) / d,
	          c = pa / d,
	          p = (3 * b - a * a) / 3,
	          p3 = p / 3,
	          q = (2 * a * a * a - 9 * a * b + 27 * c) / 27,
	          q2 = q / 2,
	          discriminant = q2 * q2 + p3 * p3 * p3,
	          u1,
	          v1,
	          x1,
	          x2,
	          x3;
	      if (discriminant < 0) {
	        var mp3 = -p / 3,
	            mp33 = mp3 * mp3 * mp3,
	            r = sqrt(mp33),
	            t = -q / (2 * r),
	            cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
	            phi = acos(cosphi),
	            crtr = crt(r),
	            t1 = 2 * crtr;
	        x1 = t1 * cos(phi / 3) - a / 3;
	        x2 = t1 * cos((phi + tau) / 3) - a / 3;
	        x3 = t1 * cos((phi + 2 * tau) / 3) - a / 3;
	        return [x1, x2, x3].filter(reduce);
	      } else if (discriminant === 0) {
	        u1 = q2 < 0 ? crt(-q2) : -crt(q2);
	        x1 = 2 * u1 - a / 3;
	        x2 = -u1 - a / 3;
	        return [x1, x2].filter(reduce);
	      } else {
	        var sd = sqrt(discriminant);
	        u1 = crt(-q2 + sd);
	        v1 = crt(q2 + sd);
	        return [u1 - v1 - a / 3].filter(reduce);;
	      }
	    },

	    droots: function droots(p) {
	      // quadratic roots are easy
	      if (p.length === 3) {
	        var a = p[0],
	            b = p[1],
	            c = p[2],
	            d = a - 2 * b + c;
	        if (d !== 0) {
	          var m1 = -sqrt(b * b - a * c),
	              m2 = -a + b,
	              v1 = -(m1 + m2) / d,
	              v2 = -(-m1 + m2) / d;
	          return [v1, v2];
	        } else if (b !== c && d === 0) {
	          return [(2 * b - c) / (2 * (b - c))];
	        }
	        return [];
	      }

	      // linear roots are even easier
	      if (p.length === 2) {
	        var a = p[0],
	            b = p[1];
	        if (a !== b) {
	          return [a / (a - b)];
	        }
	        return [];
	      }
	    },

	    inflections: function inflections(points) {
	      if (points.length < 4) return [];

	      // FIXME: TODO: add in inflection abstraction for quartic+ curves?

	      var p = utils.align(points, { p1: points[0], p2: points.slice(-1)[0] }),
	          a = p[2].x * p[1].y,
	          b = p[3].x * p[1].y,
	          c = p[1].x * p[2].y,
	          d = p[3].x * p[2].y,
	          v1 = 18 * (-3 * a + 2 * b + 3 * c - d),
	          v2 = 18 * (3 * a - b - 3 * c),
	          v3 = 18 * (c - a);

	      if (utils.approximately(v1, 0)) {
	        if (!utils.approximately(v2, 0)) {
	          var t = -v3 / v2;
	          if (0 <= t && t <= 1) return [t];
	        }
	        return [];
	      }

	      var trm = v2 * v2 - 4 * v1 * v3,
	          sq = Math.sqrt(trm),
	          d = 2 * v1;

	      if (utils.approximately(d, 0)) return [];

	      return [(sq - v2) / d, -(v2 + sq) / d].filter(function (r) {
	        return 0 <= r && r <= 1;
	      });
	    },

	    bboxoverlap: function bboxoverlap(b1, b2) {
	      var dims = ['x', 'y'],
	          len = dims.length,
	          i,
	          dim,
	          l,
	          t,
	          d;
	      for (i = 0; i < len; i++) {
	        dim = dims[i];
	        l = b1[dim].mid;
	        t = b2[dim].mid;
	        d = (b1[dim].size + b2[dim].size) / 2;
	        if (abs(l - t) >= d) return false;
	      }
	      return true;
	    },

	    expandbox: function expandbox(bbox, _bbox) {
	      if (_bbox.x.min < bbox.x.min) {
	        bbox.x.min = _bbox.x.min;
	      }
	      if (_bbox.y.min < bbox.y.min) {
	        bbox.y.min = _bbox.y.min;
	      }
	      if (_bbox.z && _bbox.z.min < bbox.z.min) {
	        bbox.z.min = _bbox.z.min;
	      }
	      if (_bbox.x.max > bbox.x.max) {
	        bbox.x.max = _bbox.x.max;
	      }
	      if (_bbox.y.max > bbox.y.max) {
	        bbox.y.max = _bbox.y.max;
	      }
	      if (_bbox.z && _bbox.z.max > bbox.z.max) {
	        bbox.z.max = _bbox.z.max;
	      }
	      bbox.x.mid = (bbox.x.min + bbox.x.max) / 2;
	      bbox.y.mid = (bbox.y.min + bbox.y.max) / 2;
	      if (bbox.z) {
	        bbox.z.mid = (bbox.z.min + bbox.z.max) / 2;
	      }
	      bbox.x.size = bbox.x.max - bbox.x.min;
	      bbox.y.size = bbox.y.max - bbox.y.min;
	      if (bbox.z) {
	        bbox.z.size = bbox.z.max - bbox.z.min;
	      }
	    },

	    pairiteration: function pairiteration(c1, c2, curveIntersectionThreshold) {
	      var c1b = c1.bbox(),
	          c2b = c2.bbox(),
	          r = 100000,
	          threshold = curveIntersectionThreshold || 0.5;
	      if (c1b.x.size + c1b.y.size < threshold && c2b.x.size + c2b.y.size < threshold) {
	        return [(r * (c1._t1 + c1._t2) / 2 | 0) / r + "/" + (r * (c2._t1 + c2._t2) / 2 | 0) / r];
	      }
	      var cc1 = c1.split(0.5),
	          cc2 = c2.split(0.5),
	          pairs = [{ left: cc1.left, right: cc2.left }, { left: cc1.left, right: cc2.right }, { left: cc1.right, right: cc2.right }, { left: cc1.right, right: cc2.left }];
	      pairs = pairs.filter(function (pair) {
	        return utils.bboxoverlap(pair.left.bbox(), pair.right.bbox());
	      });
	      var results = [];
	      if (pairs.length === 0) return results;
	      pairs.forEach(function (pair) {
	        results = results.concat(utils.pairiteration(pair.left, pair.right, threshold));
	      });
	      results = results.filter(function (v, i) {
	        return results.indexOf(v) === i;
	      });
	      return results;
	    },

	    getccenter: function getccenter(p1, p2, p3) {
	      var dx1 = p2.x - p1.x,
	          dy1 = p2.y - p1.y,
	          dx2 = p3.x - p2.x,
	          dy2 = p3.y - p2.y;
	      var dx1p = dx1 * cos(quart) - dy1 * sin(quart),
	          dy1p = dx1 * sin(quart) + dy1 * cos(quart),
	          dx2p = dx2 * cos(quart) - dy2 * sin(quart),
	          dy2p = dx2 * sin(quart) + dy2 * cos(quart);
	      // chord midpoints
	      var mx1 = (p1.x + p2.x) / 2,
	          my1 = (p1.y + p2.y) / 2,
	          mx2 = (p2.x + p3.x) / 2,
	          my2 = (p2.y + p3.y) / 2;
	      // midpoint offsets
	      var mx1n = mx1 + dx1p,
	          my1n = my1 + dy1p,
	          mx2n = mx2 + dx2p,
	          my2n = my2 + dy2p;
	      // intersection of these lines:
	      var arc = utils.lli8(mx1, my1, mx1n, my1n, mx2, my2, mx2n, my2n),
	          r = utils.dist(arc, p1),

	      // arc start/end values, over mid point:
	      s = atan2(p1.y - arc.y, p1.x - arc.x),
	          m = atan2(p2.y - arc.y, p2.x - arc.x),
	          e = atan2(p3.y - arc.y, p3.x - arc.x),
	          _;
	      // determine arc direction (cw/ccw correction)
	      if (s < e) {
	        // if s<m<e, arc(s, e)
	        // if m<s<e, arc(e, s + tau)
	        // if s<e<m, arc(e, s + tau)
	        if (s > m || m > e) {
	          s += tau;
	        }
	        if (s > e) {
	          _ = e;e = s;s = _;
	        }
	      } else {
	        // if e<m<s, arc(e, s)
	        // if m<e<s, arc(s, e + tau)
	        // if e<s<m, arc(s, e + tau)
	        if (e < m && m < s) {
	          _ = e;e = s;s = _;
	        } else {
	          e += tau;
	        }
	      }
	      // assign and done.
	      arc.s = s;
	      arc.e = e;
	      arc.r = r;
	      return arc;
	    }
	  };

	  module.exports = utils;
	})();

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	(function () {
	  "use strict";

	  var utils = __webpack_require__(2);

	  /**
	   * Poly Bezier
	   * @param {[type]} curves [description]
	   */
	  var PolyBezier = function PolyBezier(curves) {
	    this.curves = [];
	    this._3d = false;
	    if (!!curves) {
	      this.curves = curves;
	      this._3d = this.curves[0]._3d;
	    }
	  };

	  PolyBezier.prototype = {
	    valueOf: function valueOf() {
	      return this.toString();
	    },
	    toString: function toString() {
	      return "[" + this.curves.map(function (curve) {
	        return utils.pointsToString(curve.points);
	      }).join(", ") + "]";
	    },
	    addCurve: function addCurve(curve) {
	      this.curves.push(curve);
	      this._3d = this._3d || curve._3d;
	    },
	    length: function length() {
	      return this.curves.map(function (v) {
	        return v.length();
	      }).reduce(function (a, b) {
	        return a + b;
	      });
	    },
	    curve: function curve(idx) {
	      return this.curves[idx];
	    },
	    bbox: function bbox() {
	      var c = this.curves;
	      var bbox = c[0].bbox();
	      for (var i = 1; i < c.length; i++) {
	        utils.expandbox(bbox, c[i].bbox());
	      }
	      return bbox;
	    },
	    offset: function offset(d) {
	      var offset = [];
	      this.curves.forEach(function (v) {
	        offset = offset.concat(v.offset(d));
	      });
	      return new PolyBezier(offset);
	    }
	  };

	  module.exports = PolyBezier;
	})();

/***/ }
/******/ ]);
/// <reference path="../app/svga.ts" />
/**
 * Author: Pony Cui
 * Date: 2016.08.01
 * Dev: TypeScript 1.8
 * Env: After Effects CC 2015
 * Build: npm install & npm start
 */
var Converter = (function () {
    function Converter(app) {
        this.app = undefined;
        this.proj = undefined;
        this.res = [];
        this.layers = [];
        this.app = app;
        this.loadProj();
        this.loadRes(app.project.activeItem.layers, app.project.activeItem.layers.length);
        this.loadLayer(app.project.activeItem.layers, app.project.activeItem.layers.length, undefined, undefined, []);
        this.mergeLayers();
    }
    Converter.prototype.loadProj = function () {
        this.proj = {
            name: this.app.project.activeItem.name,
            width: this.app.project.activeItem.width,
            height: this.app.project.activeItem.height,
            frameRate: this.app.project.activeItem.frameRate,
            frameCount: this.app.project.activeItem.frameRate * this.app.project.activeItem.duration,
        };
    };
    Converter.prototype.loadRes = function (layers, numLayers) {
        var m = {};
        for (var i = 1; i <= layers.length; i++) {
            var element = layers[i];
            if (element.enabled === false || element.source === null || element.source === undefined) {
                continue;
            }
            if (element.source instanceof Object && element.source.file) {
                if (m[element.source.id] === true) {
                    continue;
                }
                m[element.source.id] = true;
                if (element.source.file.fsName.indexOf(".psd") > 0) {
                    this.res.push({
                        name: "psd_" + element.source.id + ".png",
                        path: element.source.file.fsName,
                        source: element.source,
                        psdID: element.source.id.toString(),
                    });
                }
                else {
                    var eName = element.source.name;
                    if (element.source.name.match(/[^a-zA-Z0-9\.\_\-]/)) {
                        eName = "img_" + element.source.id + ".png";
                    }
                    else {
                        eName = element.source.name;
                    }
                    this.res.push({
                        name: eName,
                        path: element.source.file.fsName,
                        source: element.source,
                        psdID: undefined,
                    });
                }
            }
            else if (element.source instanceof Object && element.source.numLayers > 0) {
                this.loadRes(element.source.layers, element.source.numLayers);
            }
        }
    };
    Converter.prototype.loadLayer = function (layers, numLayers, parentValues, startTime, parents) {
        for (var i = 1; i <= numLayers; i++) {
            var element = layers[i];
            if (element.enabled === false) {
                continue;
            }
            if (element.matchName === "ADBE Vector Layer") {
                if (parentValues) {
                    this.layers.push({
                        name: element.name + ".vector",
                        values: this.concatValues(parentValues, {
                            alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(element.width, element.height),
                            matrix: this.requestMatrix(element.transform, element.width, element.height, element),
                            mask: this.requestMask(element, parents),
                            shapes: this.requestShapes(element),
                        }, element.width, element.height, startTime),
                    });
                }
                else {
                    this.layers.push({
                        name: element.name + ".vector",
                        values: {
                            alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(element.width, element.height),
                            matrix: this.requestMatrix(element.transform, element.width, element.height, element),
                            mask: this.requestMask(element, parents),
                            shapes: this.requestShapes(element),
                        }
                    });
                }
            }
            else if (element.source instanceof Object && element.source.file) {
                var eName = element.source.name;
                if (eName.indexOf('.psd') > 0) {
                    eName = "psd_" + element.source.id + ".png";
                }
                else {
                    if (element.source.name.match(/[^a-zA-Z0-9\.\_\-]/)) {
                        eName = "img_" + element.source.id + ".png";
                    }
                    else {
                        eName = element.source.name;
                    }
                }
                if (parentValues) {
                    this.layers.push({
                        name: eName,
                        values: this.concatValues(parentValues, {
                            alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(element.width, element.height),
                            matrix: this.requestMatrix(element.transform, element.width, element.height, element),
                            mask: this.requestMask(element, parents),
                            shapes: [],
                        }, element.width, element.height, startTime),
                    });
                }
                else {
                    this.layers.push({
                        name: eName,
                        values: {
                            alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(element.width, element.height),
                            matrix: this.requestMatrix(element.transform, element.width, element.height, element),
                            mask: this.requestMask(element, parents),
                            shapes: [],
                        }
                    });
                }
            }
            else if (element.source instanceof Object && element.source.numLayers > 0) {
                var nextParents = [];
                if (parents !== undefined) {
                    for (var index = 0; index < parents.length; index++) {
                        nextParents.push(parents[index]);
                    }
                }
                nextParents.push(element);
                if (parentValues) {
                    this.loadLayer(element.source.layers, element.source.numLayers, this.concatValues(parentValues, {
                        alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                        layout: this.requestLayout(element.width, element.height),
                        matrix: this.requestMatrix(element.transform, element.width, element.height, element),
                        mask: [],
                        shapes: [],
                    }, element.width, element.height, startTime), element.startTime, nextParents);
                }
                else {
                    this.loadLayer(element.source.layers, element.source.numLayers, {
                        alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                        layout: this.requestLayout(element.width, element.height),
                        matrix: this.requestMatrix(element.transform, element.width, element.height, element),
                        mask: [],
                        shapes: [],
                    }, element.startTime, nextParents);
                }
            }
        }
    };
    Converter.prototype.concatValues = function (a, b, width, height, startTime) {
        var c = JSON.parse(JSON.stringify(a));
        var startIndex = startTime / (1.0 / Math.round(this.proj.frameRate));
        for (var aIndex = startIndex, bIndex = 0; bIndex < b.alpha.length; aIndex++, bIndex++) {
            if (aIndex < 0) {
                continue;
            }
            c.alpha[aIndex] = b.alpha[bIndex] * a.alpha[aIndex];
        }
        for (var aIndex = startIndex, bIndex = 0; bIndex < b.layout.length; aIndex++, bIndex++) {
            if (aIndex < 0) {
                continue;
            }
            c.layout[aIndex] = b.layout[bIndex];
        }
        for (var aIndex = startIndex, bIndex = 0; bIndex < b.mask.length; aIndex++, bIndex++) {
            if (aIndex < 0) {
                continue;
            }
            c.mask[aIndex] = b.mask[bIndex];
        }
        for (var aIndex = startIndex, bIndex = 0; bIndex < b.matrix.length && aIndex < a.matrix.length; aIndex++, bIndex++) {
            if (aIndex < 0) {
                continue;
            }
            var matrix = new Matrix();
            matrix.reset();
            if (b.matrix[bIndex] !== undefined && b.matrix[bIndex] !== null) {
                matrix.transform(b.matrix[bIndex].a, b.matrix[bIndex].b, 0, 0, b.matrix[bIndex].c, b.matrix[bIndex].d, 0, 0, 0, 0, 0, 0, b.matrix[bIndex].tx, b.matrix[bIndex].ty, 0, 0);
                c.matrix[aIndex] = {
                    a: matrix.props[0],
                    b: matrix.props[1],
                    c: matrix.props[4],
                    d: matrix.props[5],
                    tx: matrix.props[12],
                    ty: matrix.props[13],
                };
            }
            if (a.matrix[aIndex] !== undefined && a.matrix[aIndex] !== null) {
                matrix.transform(a.matrix[aIndex].a, a.matrix[aIndex].b, 0, 0, a.matrix[aIndex].c, a.matrix[aIndex].d, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                c.matrix[aIndex] = {
                    a: matrix.props[0],
                    b: matrix.props[1],
                    c: matrix.props[4],
                    d: matrix.props[5],
                    tx: matrix.props[12] + a.matrix[aIndex].tx,
                    ty: matrix.props[13] + a.matrix[aIndex].ty,
                };
            }
        }
        for (var aIndex = startIndex, bIndex = 0; bIndex < b.mask.length; aIndex++, bIndex++) {
            if (aIndex < 0) {
                continue;
            }
            if (c.shapes != undefined && b.shapes != undefined) {
                c.shapes[aIndex] = b.shapes[bIndex];
            }
        }
        for (var index = 0; index < startIndex; index++) {
            delete c.alpha[index];
            delete c.layout[index];
            delete c.matrix[index];
            delete c.mask[index];
            if (c.shapes != undefined) {
                delete c.shapes[index];
            }
        }
        return c;
    };
    Converter.prototype.requestAlpha = function (prop, inPoint, outPoint) {
        var value = [];
        var step = 1.0 / this.proj.frameRate;
        for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
            if (inPoint > outPoint) {
                if (cTime > inPoint || cTime < outPoint) {
                    value.push(0.0);
                    continue;
                }
            }
            else if (inPoint < outPoint) {
                if (cTime < inPoint || cTime > outPoint) {
                    value.push(0.0);
                    continue;
                }
            }
            value.push(prop.valueAtTime(cTime, true) / 100.0);
        }
        return value;
    };
    Converter.prototype.requestMatrix = function (transform, width, height, object) {
        var value = [];
        var step = 1.0 / this.proj.frameRate;
        for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
            var rotation = transform["Rotation"].valueAtTime(cTime, true);
            var ax = transform["Anchor Point"].valueAtTime(cTime, true)[0];
            var ay = transform["Anchor Point"].valueAtTime(cTime, true)[1];
            var sx = transform["Scale"].valueAtTime(cTime, true)[0] / 100.0;
            var sy = transform["Scale"].valueAtTime(cTime, true)[1] / 100.0;
            var tx = transform["Position"].valueAtTime(cTime, true)[0];
            var ty = transform["Position"].valueAtTime(cTime, true)[1];
            var matrix = new Matrix();
            matrix.translate(-ax, -ay).scale(sx, sy).rotate(-rotation * Math.PI / 180);
            matrix.translate(tx, ty);
            var currentParent = object.parent;
            while (currentParent != null && currentParent != undefined) {
                matrix.translate(-currentParent.transform["Anchor Point"].valueAtTime(cTime, true)[0], -currentParent.transform["Anchor Point"].valueAtTime(cTime, true)[1])
                    .scale(currentParent.transform["Scale"].valueAtTime(cTime, true)[0] / 100.0, currentParent.transform["Scale"].valueAtTime(cTime, true)[1] / 100.0)
                    .rotate(-(currentParent.transform["Rotation"].valueAtTime(cTime, true)) * Math.PI / 180);
                matrix.translate(currentParent.transform["Position"].valueAtTime(cTime, true)[0], currentParent.transform["Position"].valueAtTime(cTime, true)[1]);
                currentParent = currentParent.parent;
            }
            value.push({
                a: matrix.props[0],
                b: matrix.props[1],
                c: matrix.props[4],
                d: matrix.props[5],
                tx: matrix.props[12],
                ty: matrix.props[13],
            });
        }
        return value;
    };
    Converter.prototype.requestLayout = function (width, height) {
        var value = [];
        var step = 1.0 / this.proj.frameRate;
        for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
            value.push({ x: 0, y: 0, width: width, height: height });
        }
        return value;
    };
    Converter.prototype.requestMask = function (layer, parents) {
        var hasMask = false;
        var masks = [];
        var step = 1.0 / this.proj.frameRate;
        for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
            var d = "";
            if (layer.mask.numProperties > 0) {
                var maskElement = layer.mask(1);
                d += this.requestPath(maskElement.property('maskShape').valueAtTime(cTime, true), { x: 0.0, y: 0.0 });
                hasMask = true;
            }
            var offsetX = layer.transform["Position"].valueAtTime(cTime, true)[0] - layer.transform["Anchor Point"].valueAtTime(cTime, true)[0];
            var offsetY = layer.transform["Position"].valueAtTime(cTime, true)[1] - layer.transform["Anchor Point"].valueAtTime(cTime, true)[1];
            for (var index = parents.length - 1; index >= 0; index--) {
                var element = parents[index];
                if (element.mask.numProperties > 0) {
                    var maskElement = element.mask(1);
                    d += this.requestPath(maskElement.property('maskShape').valueAtTime(cTime, true), { x: -offsetX, y: -offsetY });
                    offsetX += element.transform["Position"].valueAtTime(cTime, true)[0] - element.transform["Anchor Point"].valueAtTime(cTime, true)[0];
                    offsetY += element.transform["Position"].valueAtTime(cTime, true)[1] - element.transform["Anchor Point"].valueAtTime(cTime, true)[1];
                    hasMask = true;
                }
            }
            masks.push(d);
        }
        if (!hasMask) {
            return [];
        }
        return masks;
    };
    Converter.prototype.trimmedPath = function (path, reverse, trim) {
        if (reverse === void 0) { reverse = false; }
        var inTangents = path.inTangents;
        var outTangents = path.outTangents;
        var vertices = path.vertices;
        if (!reverse) {
            inTangents = inTangents.reverse();
            outTangents = outTangents.reverse();
            vertices = vertices.reverse();
        }
        var length = 0.0;
        for (var index = 0; index <= vertices.length; index++) {
            var vertex = vertices[index];
            var it = inTangents[index];
            var ot = outTangents[index];
            if (index == 0) { }
            else if (index == vertices.length) {
                if (!path.closed) {
                    continue;
                }
                var curve = new Bezier(vertices[0][0], vertices[0][1], vertices[index - 1][0] + outTangents[index - 1][0], vertices[index - 1][1] + outTangents[index - 1][1], vertices[0][0] + inTangents[0][0], vertices[0][1] + inTangents[0][1]);
                length += curve.length();
            }
            else {
                var curve = new Bezier(vertex[0], vertex[1], vertices[index - 1][0] + outTangents[index - 1][0], vertices[index - 1][1] + outTangents[index - 1][1], vertex[0] + inTangents[index][0], vertex[1] + inTangents[index][1]);
                length += curve.length();
            }
        }
        var curvePoints = [];
        var currentProgress = 0.0;
        for (var index = 0; index <= vertices.length; index++) {
            var vertex = vertices[index];
            var it = inTangents[index];
            var ot = outTangents[index];
            if (index == 0) { }
            else if (index == vertices.length) {
                if (!path.closed) {
                    continue;
                }
                var curve = new Bezier(vertices[0][0], vertices[0][1], vertices[index - 1][0] + outTangents[index - 1][0], vertices[index - 1][1] + outTangents[index - 1][1], vertices[0][0] + inTangents[0][0], vertices[0][1] + inTangents[0][1]);
                var segmentProgress = curve.length() / length;
                if (currentProgress >= trim.start && currentProgress + segmentProgress <= trim.end) {
                    curvePoints.push([vertex[0], vertex[1], vertices[index - 1][0] + outTangents[index - 1][0], vertices[index - 1][1] + outTangents[index - 1][1], vertex[0] + inTangents[index][0], vertex[1] + inTangents[index][1]]);
                }
                else {
                    var trimmedLength = (trim.end > (currentProgress + segmentProgress) ? (currentProgress + segmentProgress) : trim.end) * length - (trim.start > currentProgress ? trim.start : currentProgress) * length;
                    var trimmedLeftLength = Math.max(0.0, (trim.start - currentProgress) * length);
                    var trimmedRightLength = Math.max(0.0, ((currentProgress + segmentProgress) - trim.end) * length);
                    var t = {
                        s: trimmedLeftLength / curve.length(),
                        e: 1.0 - trimmedRightLength / curve.length()
                    };
                    var nc = curve.split(t.s, t.e);
                    curvePoints.push([nc.points[0].x, nc.points[0].y, nc.points[1].x, nc.points[1].y, nc.points[2].x, nc.points[2].y]);
                }
                currentProgress += segmentProgress;
            }
            else {
                var curve = new Bezier(vertex[0], vertex[1], vertices[index - 1][0] + outTangents[index - 1][0], vertices[index - 1][1] + outTangents[index - 1][1], vertex[0] + inTangents[index][0], vertex[1] + inTangents[index][1]);
                var segmentProgress = curve.length() / length;
                if (currentProgress >= trim.start && currentProgress + segmentProgress <= trim.end) {
                    curvePoints.push([vertex[0], vertex[1], vertices[index - 1][0] + outTangents[index - 1][0], vertices[index - 1][1] + outTangents[index - 1][1], vertex[0] + inTangents[index][0], vertex[1] + inTangents[index][1]]);
                }
                else {
                    var trimmedLeftLength = Math.max(0.0, (trim.start - currentProgress) * length);
                    var trimmedRightLength = Math.max(0.0, ((currentProgress + segmentProgress) - trim.end) * length);
                    var t = {
                        s: trimmedLeftLength / curve.length(),
                        e: 1.0 - trimmedRightLength / curve.length()
                    };
                    var nc = curve.split(t.s, t.e);
                    curvePoints.push([nc.points[0].x, nc.points[0].y, nc.points[1].x, nc.points[1].y, nc.points[2].x, nc.points[2].y]);
                }
                currentProgress += segmentProgress;
            }
        }
        var d = "";
        for (var index = 0; index < curvePoints.length; index++) {
            var element = curvePoints[index];
            if (index == 0) {
                d += "M " + element[4] + " " + element[5];
            }
            d += " C " + element[2] + " " + element[3] + " " + element[4] + " " + element[5] + " " + element[0] + " " + element[1];
        }
        if (path.closed) {
            d += " Z";
        }
        return d;
    };
    Converter.prototype.requestPath = function (path, offset, reverse, trim) {
        if (reverse === void 0) { reverse = false; }
        if (trim === void 0) { trim = { start: 0.0, end: 1.0 }; }
        var inTangents = path.inTangents;
        var outTangents = path.outTangents;
        var vertices = path.vertices;
        if (trim.start != 0.0 || trim.end != 1.0) {
            return this.trimmedPath(path, reverse, trim);
        }
        for (var index = 0; index < vertices.length; index++) {
            var element = vertices[index];
            element[0] += offset.x;
            element[1] += offset.y;
            vertices[index] = element;
        }
        var d = "";
        for (var index = 0; index <= vertices.length; index++) {
            var vertex = vertices[index];
            var it = inTangents[index];
            var ot = outTangents[index];
            if (index == 0) {
                d += "M" + vertex[0].toFixed(3) + " " + vertex[1].toFixed(3) + " ";
            }
            else if (index == vertices.length) {
                if (!path.closed) {
                    continue;
                }
                d += "C" + (vertices[index - 1][0] + outTangents[index - 1][0]).toFixed(3) +
                    " " + (vertices[index - 1][1] + outTangents[index - 1][1]).toFixed(3) +
                    " " + (vertices[0][0] + inTangents[0][0]).toFixed(3) +
                    " " + (vertices[0][1] + inTangents[0][1]).toFixed(3) +
                    " " + (vertices[0][0]).toFixed(3) +
                    " " + (vertices[0][1]).toFixed(3) +
                    " ";
            }
            else {
                d += "C" + (vertices[index - 1][0] + outTangents[index - 1][0]).toFixed(3) +
                    " " + (vertices[index - 1][1] + outTangents[index - 1][1]).toFixed(3) +
                    " " + (vertex[0] + inTangents[index][0]).toFixed(3) +
                    " " + (vertex[1] + inTangents[index][1]).toFixed(3) +
                    " " + (vertex[0]).toFixed(3) +
                    " " + (vertex[1]).toFixed(3) +
                    " ";
            }
        }
        if (path.closed) {
            d += "Z";
        }
        // if (inverted) {
        //     let solidPath = '';
        //     solidPath = 'M0 0';
        //     solidPath += ' h' + layer.width;
        //     solidPath += ' v' + layer.height;
        //     solidPath += ' h-' + layer.width;
        //     solidPath += ' v-' + layer.height + ' ';
        //     d = solidPath + d;
        // }
        return d;
    };
    Converter.prototype.requestShapes = function (layer) {
        var values = [];
        var step = 1.0 / this.proj.frameRate;
        for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
            var value = this.requestShapesAtTime(layer, cTime);
            values.push(value);
        }
        return values;
    };
    Converter.prototype.requestShapesAtTime = function (layer, cTime, parent) {
        var shapes = [];
        if (!layer.enabled) {
            return shapes;
        }
        if (layer.matchName == "ADBE Vector Shape - Group") {
            var pathContents = layer.property('Path');
            var path = pathContents.valueAtTime(cTime, true);
            var style = this.requestShapeStyles(layer, parent, cTime);
            var trim = { start: 0.0, end: 1.0 };
            if (style.trim != null) {
                trim = style.trim;
            }
            var d = this.requestPath(path, { x: 0.0, y: 0.0 }, layer.property("Shape Direction").valueAtTime(cTime, true) === 3, trim);
            var shape = {
                type: "shape",
                args: {
                    d: d,
                },
                styles: this.requestShapeStyles(layer, parent, cTime),
                transform: this.requestShapeTransform(parent, cTime),
            };
            delete shape.styles["trim"];
            shapes.unshift(shape);
        }
        else if (layer.matchName == "ADBE Vector Shape - Ellipse") {
            var sizeContents = layer.property('Size');
            var size = sizeContents.valueAtTime(cTime, true);
            var positionContents = layer.property('Position');
            var position = positionContents.valueAtTime(cTime, true);
            var shape = {
                type: "ellipse",
                args: {
                    x: position[0],
                    y: position[1],
                    radiusX: size[0] / 2.0,
                    radiusY: size[1] / 2.0,
                },
                styles: this.requestShapeStyles(layer, parent, cTime),
                transform: this.requestShapeTransform(parent, cTime),
            };
            shapes.unshift(shape);
        }
        else if (layer.matchName == "ADBE Vector Shape - Rect") {
            var sizeContents = layer.property('Size');
            var size = sizeContents.valueAtTime(cTime, true);
            var positionContents = layer.property('Position');
            var position = positionContents.valueAtTime(cTime, true);
            var shape = {
                type: "rect",
                args: {
                    x: position[0] - size[0] / 2.0,
                    y: position[1] - size[1] / 2.0,
                    width: size[0],
                    height: size[1],
                    cornerRadius: layer.property('Roundness').valueAtTime(cTime, true),
                },
                styles: this.requestShapeStyles(layer, parent, cTime),
                transform: this.requestShapeTransform(parent, cTime),
            };
            shapes.unshift(shape);
        }
        else {
            var contents = layer.property('Contents');
            if (contents != null && contents != undefined) {
                var numProperties = contents.numProperties;
                for (var index = 0; index < numProperties; index += 1) {
                    var sublayer = contents.property(index + 1);
                    var results = this.requestShapesAtTime(sublayer, cTime, layer);
                    for (var i = 0; i < results.length; i++) {
                        var element = results[i];
                        shapes.unshift(element);
                    }
                }
            }
        }
        return shapes;
    };
    Converter.prototype.requestShapeStyles = function (layer, parent, cTime) {
        var styles = {};
        var contents = parent.property('Contents');
        var numProperties = contents.numProperties;
        for (var index = numProperties - 1; index >= 0; index -= 1) {
            var sublayer = contents.property(index + 1);
            if (!sublayer.enabled) {
                continue;
            }
            if (sublayer.matchName == "ADBE Vector Graphic - Fill") {
                styles.fill = sublayer.property('Color').valueAtTime(cTime, true);
            }
            else if (sublayer.matchName == "ADBE Vector Filter - Trim" || sublayer.matchName == "ADBE Vector Graphic - Trim") {
                styles.trim = {
                    start: sublayer.property('Start').valueAtTime(cTime, true) / 100.0,
                    end: sublayer.property('End').valueAtTime(cTime, true) / 100.0,
                };
            }
            else if (sublayer.matchName == "ADBE Vector Graphic - Stroke") {
                styles.stroke = sublayer.property('Color').valueAtTime(cTime, true);
                styles.strokeWidth = sublayer.property('Stroke Width').valueAtTime(cTime, true);
                var lineCap = sublayer.property('Line Cap').valueAtTime(cTime, true);
                switch (lineCap) {
                    case 1:
                        styles.lineCap = "butt";
                        break;
                    case 2:
                        styles.lineCap = "round";
                        break;
                    case 3:
                        styles.lineCap = "square";
                        break;
                }
                var lineJoin = sublayer.property('Line Join').valueAtTime(cTime, true);
                switch (lineJoin) {
                    case 1:
                        styles.lineJoin = "miter";
                        styles.miterLimit = sublayer.property('Miter Limit').valueAtTime(cTime, true);
                        break;
                    case 2:
                        styles.lineJoin = "round";
                        break;
                    case 3:
                        styles.lineJoin = "bevel";
                        break;
                }
                var dashObject = sublayer.property('Dashes');
                if (dashObject != null && dashObject != undefined) {
                    var j = void 0, jLen = dashObject.numProperties;
                    if (jLen > 0) {
                        var dashesData = [];
                        var dash = 0;
                        var gap = 0;
                        var offset = 0;
                        for (j = 0; j < jLen; j += 1) {
                            if (dashObject.property(j + 1).canSetExpression) {
                                var dashData = {};
                                var name = '';
                                if (dashObject.property(j + 1).matchName.indexOf('ADBE Vector Stroke Dash') !== -1) {
                                    dash = dashObject.property(j + 1).valueAtTime(cTime, true);
                                }
                                else if (dashObject.property(j + 1).matchName.indexOf('ADBE Vector Stroke Gap') !== -1) {
                                    gap = dashObject.property(j + 1).valueAtTime(cTime, true);
                                }
                                else if (dashObject.property(j + 1).matchName === 'ADBE Vector Stroke Offset') {
                                    offset = dashObject.property(j + 1).valueAtTime(cTime, true);
                                }
                            }
                        }
                        if (dash != 0 || gap != 0 || offset != 0) {
                            styles.lineDash = [dash, gap, offset];
                        }
                    }
                }
            }
        }
        return styles;
    };
    Converter.prototype.requestShapeTransform = function (parent, cTime) {
        var transform = parent.property('Transform');
        var rotation = transform["Rotation"].valueAtTime(cTime, true);
        var ax = transform["Anchor Point"].valueAtTime(cTime, true)[0];
        var ay = transform["Anchor Point"].valueAtTime(cTime, true)[1];
        var sx = transform["Scale"].valueAtTime(cTime, true)[0] / 100.0;
        var sy = transform["Scale"].valueAtTime(cTime, true)[1] / 100.0;
        var tx = transform["Position"].valueAtTime(cTime, true)[0];
        var ty = transform["Position"].valueAtTime(cTime, true)[1];
        var matrix = new Matrix();
        matrix.translate(-ax, -ay).scale(sx, sy).rotate(-rotation * Math.PI / 180);
        matrix.translate(tx, ty);
        return {
            a: matrix.props[0],
            b: matrix.props[1],
            c: matrix.props[4],
            d: matrix.props[5],
            tx: matrix.props[12],
            ty: matrix.props[13],
        };
    };
    Converter.prototype.mergeLayers = function () {
        var rangeLength = 1;
        for (var index = 0; index < this.layers.length; index += rangeLength) {
            var layer = this.layers[index];
            rangeLength = 1;
            for (var nIndex = index + 1; nIndex < this.layers.length; nIndex++) {
                if (this.layers[nIndex].name === layer.name) {
                    rangeLength++;
                }
                else {
                    break;
                }
            }
            if (rangeLength > 1) {
                var maxInterSets = 1;
                for (var frameNum = 0; frameNum < this.proj.frameCount; frameNum++) {
                    var thisMax = 0;
                    for (var checkIndex = index; checkIndex < index + rangeLength; checkIndex++) {
                        if (this.layers[checkIndex].values.alpha[frameNum] > 0.0) {
                            thisMax++;
                        }
                    }
                    maxInterSets = Math.max(maxInterSets, thisMax);
                }
                if (maxInterSets === 1 || maxInterSets === rangeLength) {
                    continue;
                }
                var mergedLayers = [];
                for (var _ = 0; _ < maxInterSets; _++) {
                    mergedLayers.push({
                        name: layer.name,
                        values: {
                            alpha: [],
                            layout: [],
                            matrix: [],
                            mask: [],
                            shapes: [],
                        }
                    });
                }
                for (var frameNum = 0; frameNum < this.proj.frameCount; frameNum++) {
                    var currentLayer = 0;
                    for (var checkIndex = index; checkIndex < index + rangeLength; checkIndex++) {
                        if (this.layers[checkIndex].values.alpha[frameNum] > 0.0) {
                            mergedLayers[currentLayer].values.alpha.push(this.layers[checkIndex].values.alpha[frameNum]);
                            mergedLayers[currentLayer].values.layout.push(this.layers[checkIndex].values.layout[frameNum]);
                            mergedLayers[currentLayer].values.matrix.push(this.layers[checkIndex].values.matrix[frameNum]);
                            mergedLayers[currentLayer].values.mask.push(this.layers[checkIndex].values.mask[frameNum]);
                            mergedLayers[currentLayer].values.shapes.push(this.layers[checkIndex].values.shapes[frameNum]);
                            currentLayer++;
                        }
                    }
                    for (var leftIndex = currentLayer; leftIndex < maxInterSets; leftIndex++) {
                        mergedLayers[leftIndex].values.alpha.push(0.0);
                        mergedLayers[leftIndex].values.layout.push(undefined);
                        mergedLayers[leftIndex].values.matrix.push(undefined);
                        mergedLayers[leftIndex].values.mask.push(undefined);
                        mergedLayers[leftIndex].values.shapes.push(undefined);
                    }
                }
                var replaceLayers = [];
                var startInsertion = false;
                for (var fIndex = 0; fIndex < this.layers.length; fIndex++) {
                    var element = this.layers[fIndex];
                    if (!startInsertion) {
                        if (fIndex < index) {
                            replaceLayers.push(element);
                        }
                        else {
                            startInsertion = true;
                            for (var mIndex = 0; mIndex < mergedLayers.length; mIndex++) {
                                replaceLayers.push(mergedLayers[mIndex]);
                            }
                        }
                    }
                    else {
                        if (fIndex >= index + rangeLength) {
                            replaceLayers.push(element);
                        }
                        else {
                            continue;
                        }
                    }
                }
                this.layers = replaceLayers;
                this.mergeLayers();
                return;
            }
        }
    };
    return Converter;
}());

/// <reference path="../app/svga.ts" />
/**
 * Author: Pony Cui
 * Date: 2016.08.01
 * Dev: TypeScript 1.8
 * Env: After Effects CC 2015
 * Build: npm install & npm start
 */
var Writer = (function () {
    function Writer(converter) {
        this.outPath = app.project.file.path + "/svga_works";
        this.converter = converter;
    }
    Writer.prototype.write = function () {
        this.createOutputDirectories();
        this.copyImages();
        this.writeSpec();
    };
    Writer.prototype.createOutputDirectories = function () {
        var files = new Folder(this.outPath).getFiles();
        for (var index = 0; index < files.length; index++) {
            var element = files[index];
            element.remove();
        }
        new Folder(this.outPath).create();
    };
    Writer.prototype.copyImages = function () {
        var _File = File;
        for (var index = 0; index < this.converter.res.length; index++) {
            var element = this.converter.res[index];
            if (element.psdID !== undefined) {
                this.saveSource(element);
            }
            else {
                (new _File(element.path)).copy(new _File(this.outPath + "/" + element.name.replace(/\.png/ig, "").replace(/ /ig, "") + ".png"));
            }
        }
    };
    Writer.prototype.saveSource = function (element) {
        var _File = File;
        function storeRenderQueue() {
            var checkeds = [];
            for (var p = 1; p <= app.project.renderQueue.numItems; p++) {
                if (app.project.renderQueue.item(p).status == RQItemStatus.RENDERING) {
                    checkeds.push("rendering");
                    break;
                }
                else if (app.project.renderQueue.item(p).status == RQItemStatus.QUEUED) {
                    checkeds.push(p);
                    app.project.renderQueue.item(p).render = false;
                }
            }
            return checkeds;
        }
        function restoreRenderQueue(checkedItems) {
            for (var q = 0; q < checkedItems.length; q++) {
                app.project.renderQueue.item(checkedItems[q]).render = true;
            }
        }
        var currentSource = element.source;
        var helperComp = app.project.items.addComp('tempConverterComp', Math.max(4, currentSource.width), Math.max(4, currentSource.height), 1, 1, 1);
        helperComp.layers.add(currentSource, 0);
        helperComp.layers.add(currentSource, 1);
        helperComp.layers[2].remove();
        var RQbackup = storeRenderQueue();
        app.project.renderQueue.items.add(helperComp);
        app.project.renderQueue.item(app.project.renderQueue.numItems).render = true;
        var templateTemp = app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).templates;
        var setPNG = app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).templates[templateTemp.length - 1];
        app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).applyTemplate(setPNG);
        app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).file = new _File(this.outPath + "/psd_" + element.psdID + ".png");
        app.project.renderQueue.render();
        app.project.renderQueue.item(app.project.renderQueue.numItems).remove();
        if (RQbackup != null) {
            restoreRenderQueue(RQbackup);
        }
        helperComp.remove();
        (new _File(this.outPath + "/psd_" + element.psdID + ".png00000")).rename("psd_" + element.psdID + ".png");
    };
    Writer.prototype.writeSpec = function () {
        var _File = File;
        var spec = {
            ver: "1.1.0",
            movie: {
                viewBox: {
                    width: this.converter.proj.width,
                    height: this.converter.proj.height,
                },
                fps: this.converter.proj.frameRate,
                frames: this.converter.proj.frameCount,
            },
            images: {},
            sprites: [],
        };
        for (var index = 0; index < this.converter.res.length; index++) {
            var element = this.converter.res[index];
            spec.images[element.name.replace(/\.png/ig, "").replace(/ /ig, "")] = element.name.replace(/\.png/ig, "").replace(/ /ig, "");
        }
        for (var index = this.converter.layers.length - 1; index >= 0; index--) {
            var element = this.converter.layers[index];
            var frames_1 = [];
            var lastShapeHash = "";
            for (var index_1 = 0; index_1 < this.converter.proj.frameCount; index_1++) {
                var obj = {
                    alpha: element.values.alpha[index_1],
                    layout: element.values.layout[index_1],
                    transform: element.values.matrix[index_1],
                    clipPath: element.values.mask[index_1],
                    shapes: element.values.shapes[index_1],
                };
                if (obj.alpha === undefined || obj.alpha <= 0.0) {
                    delete obj.alpha;
                    delete obj.layout;
                    delete obj.transform;
                    delete obj.clipPath;
                    delete obj.shapes;
                }
                if (obj.layout === undefined || (obj.layout.x == 0.0 && obj.layout.y == 0.0 && obj.layout.width == 0.0 && obj.layout.height == 0.0)) {
                    delete obj.layout;
                }
                if (obj.transform === undefined || (obj.transform.a == 1.0 && obj.transform.b == 0.0 && obj.transform.c == 0.0 && obj.transform.d == 1.0 && obj.transform.tx == 0.0 && obj.transform.ty == 0.0)) {
                    delete obj.transform;
                }
                else {
                    obj.transform.a = parseFloat(obj.transform.a.toFixed(3));
                    obj.transform.b = parseFloat(obj.transform.b.toFixed(3));
                    obj.transform.c = parseFloat(obj.transform.c.toFixed(3));
                    obj.transform.d = parseFloat(obj.transform.d.toFixed(3));
                    obj.transform.tx = parseFloat(obj.transform.tx.toFixed(3));
                    obj.transform.ty = parseFloat(obj.transform.ty.toFixed(3));
                }
                if (obj.clipPath === undefined || typeof obj.clipPath !== "string" || obj.clipPath === "") {
                    delete obj.clipPath;
                }
                if (obj.shapes != undefined && obj.shapes != null) {
                    for (var index_2 = 0; index_2 < obj.shapes.length; index_2++) {
                        var element_1 = obj.shapes[index_2];
                        if (element_1.transform === undefined || (element_1.transform.a == 1.0 && element_1.transform.b == 0.0 && element_1.transform.c == 0.0 && element_1.transform.d == 1.0 && element_1.transform.tx == 0.0 && element_1.transform.ty == 0.0)) {
                            delete element_1.transform;
                        }
                        else {
                            element_1.transform.a = parseFloat(element_1.transform.a.toFixed(3));
                            element_1.transform.b = parseFloat(element_1.transform.b.toFixed(3));
                            element_1.transform.c = parseFloat(element_1.transform.c.toFixed(3));
                            element_1.transform.d = parseFloat(element_1.transform.d.toFixed(3));
                            element_1.transform.tx = parseFloat(element_1.transform.tx.toFixed(3));
                            element_1.transform.ty = parseFloat(element_1.transform.ty.toFixed(3));
                        }
                    }
                    if (lastShapeHash === JSON.stringify(obj.shapes)) {
                        obj.shapes = [
                            {
                                type: "keep",
                            }
                        ];
                    }
                    else {
                        lastShapeHash = JSON.stringify(obj.shapes);
                    }
                }
                else {
                    lastShapeHash = "";
                }
                frames_1.push(obj);
            }
            spec.sprites.push({
                imageKey: element.name.replace(/\.png/ig, "").replace(/ /ig, ""),
                frames: frames_1,
            });
        }
        var movieFile = new _File(this.outPath + "/movie.spec");
        if (movieFile.exists) {
            movieFile.remove();
        }
        movieFile.encoding = "UTF-8";
        movieFile.open('e', "TEXT", "????");
        movieFile.write(JSON.stringify(spec));
        movieFile.close();
    };
    return Writer;
}());

/// <reference path="../declear/ae.declare.ts" />
/// <reference path="../declear/svga.declare.ts" />
/// <reference path="../converter/converter.ts" />
/// <reference path="../writer/writer.ts" />
/**
 * Author: Pony Cui
 * Date: 2016.08.01
 * Dev: TypeScript 1.8
 * Env: After Effects CC 2015
 * Build: npm install & npm start
 */
var thisConverter = new Converter(app);
var thisWriter = new Writer(thisConverter);
thisWriter.write();
