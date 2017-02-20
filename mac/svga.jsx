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
/**
 * Author: Pony Cui
 * Date: 2016.08.01
 * Dev: TypeScript 1.8
 * Env: After Effects CC 2015
 * Build: npm install & npm start
 */
var SVGA;
(function (SVGA) {
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
                if (element.source && element.source.file) {
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
                else if (element.source.numLayers > 0) {
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
                    var shapes = this.requestShapes(element);
                    this.layers.push({
                        name: ".vector",
                        values: {
                            alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(element.width, element.height),
                            matrix: this.requestMatrix(element.transform, element.width, element.height),
                            mask: this.requestMask(element),
                            shapes: this.requestShapes(element),
                        }
                    });
                }
                else if (element.source && element.source.file) {
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
                                matrix: this.requestMatrix(element.transform, element.width, element.height),
                                mask: this.requestMask(element),
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
                                matrix: this.requestMatrix(element.transform, element.width, element.height),
                                mask: this.requestMask(element),
                                shapes: [],
                            }
                        });
                    }
                }
                else if (element.source.numLayers > 0) {
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
                            matrix: this.requestMatrix(element.transform, element.width, element.height),
                            mask: [this.requestMask(element)],
                        }, element.width, element.height, startTime), element.startTime, nextParents);
                    }
                    else {
                        this.loadLayer(element.source.layers, element.source.numLayers, {
                            alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(element.width, element.height),
                            matrix: this.requestMatrix(element.transform, element.width, element.height),
                            mask: [this.requestMask(element)],
                        }, element.startTime, nextParents);
                    }
                }
            }
        };
        Converter.prototype.concatValues = function (a, b, width, height, startTime) {
            var c = JSON.parse(JSON.stringify(a));
            var startIndex = Math.round(startTime / (1.0 / this.proj.frameRate));
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
                c.shapes[aIndex] = b.shapes[bIndex];
            }
            for (var index = 0; index < startIndex; index++) {
                delete c.alpha[index];
                delete c.layout[index];
                delete c.matrix[index];
                delete c.mask[index];
                delete c.shapes[index];
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
                value.push(prop.valueAtTime(cTime, false) / 100.0);
            }
            return value;
        };
        Converter.prototype.requestMatrix = function (transform, width, height) {
            var value = [];
            var step = 1.0 / this.proj.frameRate;
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                var rotation = transform["Rotation"].valueAtTime(cTime, false);
                var ax = transform["Anchor Point"].valueAtTime(cTime, false)[0];
                var ay = transform["Anchor Point"].valueAtTime(cTime, false)[1];
                var sx = transform["Scale"].valueAtTime(cTime, false)[0] / 100.0;
                var sy = transform["Scale"].valueAtTime(cTime, false)[1] / 100.0;
                var tx = transform["Position"].valueAtTime(cTime, false)[0];
                var ty = transform["Position"].valueAtTime(cTime, false)[1];
                var matrix = new Matrix();
                matrix.translate(-ax, -ay).scale(sx, sy).rotate(-rotation * Math.PI / 180);
                matrix.translate(tx, ty);
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
        Converter.prototype.requestMask = function (layer) {
            if (layer.mask.numProperties > 0) {
                for (var index = 0; index < layer.mask.numProperties; index++) {
                    var masks = [];
                    var maskElement = layer.mask(index + 1);
                    var maskShape = maskElement.property('maskShape').value;
                    var closed_1 = maskShape.closed;
                    var inverted = maskElement.inverted;
                    var mode = maskElement.maskMode;
                    var values = [];
                    var step = 1.0 / this.proj.frameRate;
                    for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                        var vertices = maskElement.property('maskShape').valueAtTime(cTime, true).vertices;
                        var solidPath = '';
                        var drawPath = '';
                        var finalPath = '';
                        if (inverted) {
                            solidPath = 'M0,0 ';
                            solidPath += ' h' + layer.width;
                            solidPath += ' v' + layer.height;
                            solidPath += ' h-' + layer.width;
                            solidPath += ' v-' + layer.height + ' ';
                        }
                        var lastPoint = undefined;
                        for (var index = 0; index < vertices.length; index++) {
                            var currentPoint = vertices[index];
                            if (lastPoint === undefined) {
                                drawPath += " M" + Math.round(currentPoint[0]) + "," + Math.round(currentPoint[1]);
                                lastPoint = currentPoint;
                            }
                            else {
                                drawPath += " C" + Math.round(lastPoint[0]) + "," + Math.round(lastPoint[1]) + " " + Math.round(currentPoint[0]) + "," + Math.round(currentPoint[1]) + " " + Math.round(currentPoint[0]) + "," + Math.round(currentPoint[1]);
                                lastPoint = currentPoint;
                            }
                        }
                        if (closed_1) {
                            drawPath += " C" + Math.round(lastPoint[0]) + "," + Math.round(lastPoint[1]) + " " + Math.round(vertices[0][0]) + "," + Math.round(vertices[0][1]) + " " + Math.round(vertices[0][0]) + "," + Math.round(vertices[0][1]);
                        }
                        if (inverted) {
                            finalPath = solidPath + drawPath;
                        }
                        else {
                            finalPath = drawPath;
                        }
                        masks.push(finalPath);
                    }
                    return masks;
                }
            }
            return [];
        };
        Converter.prototype.requestShapes = function (layer) {
            var values = [];
            var step = 1.0 / this.proj.frameRate;
            var lastValue = "";
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                var value = this.requestShapesAtTime(layer, cTime);
                if (lastValue === JSON.stringify(value)) {
                    var keep = {
                        type: "keep"
                    };
                    values.push([keep]);
                }
                else {
                    lastValue = JSON.stringify(value);
                    values.push(value);
                }
            }
            return values;
        };
        Converter.prototype.requestShapesAtTime = function (layer, cTime, parent) {
            var shapes = [];
            if (layer.matchName == "ADBE Vector Shape - Group") {
                var pathContents = layer.property('Path');
                var path = pathContents.valueAtTime(cTime, false);
                var inTangents = path.inTangents;
                var vertices = path.vertices;
                var d = "";
                for (var index = 0; index <= vertices.length; index++) {
                    var vertex = vertices[index];
                    var it = inTangents[index];
                    if (index == 0) {
                        d += "M " + vertex[0] + " " + vertex[1] + " ";
                    }
                    else if (index == vertices.length) {
                        d += "C " + (vertices[index - 1][0] - inTangents[index - 1][0]) + " " + (vertices[index - 1][1] - inTangents[index - 1][1]) + " " +
                            (vertices[0][0] + inTangents[0][0]) + " " + (vertices[0][1] + inTangents[0][1]) + " " +
                            (vertices[0][0]) + " " + (vertices[0][1]) + " ";
                    }
                    else {
                        d += "C " + (vertices[index - 1][0] - inTangents[index - 1][0]) + " " + (vertices[index - 1][1] - inTangents[index - 1][1]) + " " +
                            (vertex[0] + inTangents[index][0]) + " " + (vertex[1] + inTangents[index][1]) + " " +
                            (vertex[0]) + " " + (vertex[1]) + " ";
                    }
                }
                if (path.closed) {
                    d += "Z";
                }
                var shape = {
                    type: "shape",
                    args: {
                        d: d,
                    },
                    styles: this.requestShapeStyles(layer, parent, cTime)
                };
                shapes.push(shape);
            }
            else {
                var contents = layer.property('Contents');
                if (contents != null && contents != undefined) {
                    var numProperties = contents.numProperties;
                    for (var index_1 = 0; index_1 < numProperties; index_1 += 1) {
                        var sublayer = contents.property(index_1 + 1);
                        var results = this.requestShapesAtTime(sublayer, cTime, layer);
                        for (var i = 0; i < results.length; i++) {
                            var element = results[i];
                            shapes.push(element);
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
            for (var index = 0; index < numProperties; index += 1) {
                var sublayer = contents.property(index + 1);
                if (sublayer.matchName == "ADBE Vector Graphic - Fill") {
                    styles.fill = sublayer.property('Color').valueAtTime(cTime, true);
                }
                else if (sublayer.matchName == "ADBE Vector Graphic - Stroke") {
                    styles.stroke = sublayer.property('Color').valueAtTime(cTime, true);
                    styles.strokeWidth = sublayer.property('Stroke Width').valueAtTime(cTime, true);
                }
            }
            return styles;
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
    SVGA.Converter = Converter;
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
                for (var index_2 = 0; index_2 < this.converter.proj.frameCount; index_2++) {
                    var obj = {
                        alpha: element.values.alpha[index_2],
                        layout: element.values.layout[index_2],
                        transform: element.values.matrix[index_2],
                        clipPath: element.values.mask[index_2],
                        shapes: element.values.shapes[index_2],
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
                    if (obj.clipPath === undefined || typeof obj.clipPath !== "string" || obj.clipPath === "") {
                        delete obj.clipPath;
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
    SVGA.Writer = Writer;
})(SVGA || (SVGA = {}));
var converter = new SVGA.Converter(app);
var writer = new SVGA.Writer(converter);
writer.write();
