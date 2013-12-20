// Never include this script directly. You should use the prebuild version.
(function () {
    var global = this;
    global.unexpected.shim = {

        bind: function (fn, scope) {
            return function () {
                return fn.apply(scope, arguments);
            };
        },

        every: function (arr, fn, thisObj) {
            var scope = thisObj || global;
            for (var i = 0, j = arr.length; i < j; ++i) {
                if (!fn.call(scope, arr[i], i, arr)) {
                    return false;
                }
            }
            return true;
        },

        indexOf: function (arr, o, i) {
            if (Array.prototype.indexOf) {
                return Array.prototype.indexOf.call(arr, o, i);
            }

            if (arr.length === undefined) {
                return -1;
            }

            for (var j = arr.length, k = k < 0 ? k + j < 0 ? 0 : k + j : k || 0;
                 k < j && arr[k] !== o; k++);

            return j <= i ? -1 : i;
        },

        getKeys: function (obj) {
            if (Object.keys) {
                return Object.keys(obj);
            }

            var result = [];

            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    result.push(i);
                }
            }

            return result;
        },

        forEach: function (arr, callback, that) {
            if (Array.prototype.forEach) {
                return Array.prototype.forEach.call(arr, callback, that);
            }

            for (var i= 0, n = arr.length; i<n; i++)
                if (i in arr)
                    callback.call(that, arr[i], i, arr);
        },

        map: function (arr, mapper, that) {
            if (Array.prototype.map) {
                return Array.prototype.map.call(arr, mapper, that);
            }

            var other = new Array(arr.length);

            for (var i= 0, n = arr.length; i<n; i++)
                if (i in arr)
                    other[i] = mapper.call(that, arr[i], i, arr);

            return other;
        },

        filter: function (arr, predicate) {
            if (Array.prototype.filter) {
                return Array.prototype.filter.apply(
                    arr, Array.prototype.slice.call(arguments, 1)
                );
            }

            var length = +arr.length;

            var result = [];

            if (typeof predicate !== "function")
                throw new TypeError();

            for (var i = 0; i < length; i += 1) {
                var value = arr[i];
                if (predicate(value)) {
                    result.push(value);
                }
            }

            return result;
        },

        trim: function (text) {
            if (String.prototype.trim) {
                return text.trim();
            }
            return text.replace(/^\s+|\s+$/g, '');
        },

        reduce: function (arr, fun) {
            if (Array.prototype.reduce) {
                return Array.prototype.reduce.apply(
                    arr, Array.prototype.slice.call(arguments, 1)
                );
            }

            var len = +arr.length;

            if (typeof fun !== "function")
                throw new TypeError();

            // no value to return if no initial value and an empty array
            if (len === 0 && arguments.length === 1)
                throw new TypeError();

            var i = 0;
            var rv;
            if (arguments.length >= 2) {
                rv = arguments[2];
            } else {
                do {
                    if (i in arr) {
                        rv = arr[i++];
                        break;
                    }

                    // if array contains no values, no initial value to return
                    if (++i >= len)
                        throw new TypeError();
                } while (true);
            }

            for (; i < len; i++) {
                if (i in arr)
                    rv = fun.call(null, rv, arr[i], i, this);
            }

            return rv;
        },

        JSON: (function () {
            "use strict";

            if ('object' == typeof JSON && JSON.parse && JSON.stringify) {
                return JSON;
            }

            var jsonShim = {};

            function f(n) {
                // Format integers to have at least two digits.
                return n < 10 ? '0' + n : n;
            }

            function date(d, key) {
                return isFinite(d.valueOf()) ?
                    d.getUTCFullYear()     + '-' +
                    f(d.getUTCMonth() + 1) + '-' +
                    f(d.getUTCDate())      + 'T' +
                    f(d.getUTCHours())     + ':' +
                    f(d.getUTCMinutes())   + ':' +
                    f(d.getUTCSeconds())   + 'Z' : null;
            }

            var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                gap,
                indent,
                meta = {    // table of character substitutions
                    '\b': '\\b',
                    '\t': '\\t',
                    '\n': '\\n',
                    '\f': '\\f',
                    '\r': '\\r',
                    '"' : '\\"',
                    '\\': '\\\\'
                },
                rep;


            function quote(string) {

                // If the string contains no control characters, no quote characters, and no
                // backslash characters, then we can safely slap some quotes around it.
                // Otherwise we must also replace the offending characters with safe escape
                // sequences.

                escapable.lastIndex = 0;
                return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                    var c = meta[a];
                    return typeof c === 'string' ? c :
                        '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                }) + '"' : '"' + string + '"';
            }


            function str(key, holder) {

                // Produce a string from holder[key].

                var i,          // The loop counter.
                    k,          // The member key.
                    v,          // The member value.
                    length,
                    mind = gap,
                    partial,
                    value = holder[key];

                // If the value has a toJSON method, call it to obtain a replacement value.

                if (value instanceof Date) {
                    value = date(key);
                }

                // If we were called with a replacer function, then call the replacer to
                // obtain a replacement value.

                if (typeof rep === 'function') {
                    value = rep.call(holder, key, value);
                }

                // What happens next depends on the value's type.

                switch (typeof value) {
                case 'string':
                    return quote(value);

                case 'number':

                    // JSON numbers must be finite. Encode non-finite numbers as null.

                    return isFinite(value) ? String(value) : 'null';

                case 'boolean':
                case 'null':

                    // If the value is a boolean or null, convert it to a string. Note:
                    // typeof null does not produce 'null'. The case is included here in
                    // the remote chance that this gets fixed someday.

                    return String(value);

                    // If the type is 'object', we might be dealing with an object or an array or
                    // null.

                case 'object':

                    // Due to a specification blunder in ECMAScript, typeof null is 'object',
                    // so watch out for that case.

                    if (!value) {
                        return 'null';
                    }

                    // Make an array to hold the partial results of stringifying this object value.

                    gap += indent;
                    partial = [];

                    // Is the value an array?

                    if (Object.prototype.toString.apply(value) === '[object Array]') {

                        // The value is an array. Stringify every element. Use null as a placeholder
                        // for non-JSON values.

                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }

                        // Join all of the elements together, separated with commas, and wrap them in
                        // brackets.

                        v = partial.length === 0 ? '[]' : gap ?
                            '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                            '[' + partial.join(',') + ']';
                        gap = mind;
                        return v;
                    }

                    // If the replacer is an array, use it to select the members to be stringified.

                    if (rep && typeof rep === 'object') {
                        length = rep.length;
                        for (i = 0; i < length; i += 1) {
                            if (typeof rep[i] === 'string') {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    } else {

                        // Otherwise, iterate through all of the keys in the object.

                        for (k in value) {
                            if (value.hasOwnProperty(k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    }

                    // Join all of the member texts together, separated with commas,
                    // and wrap them in braces.

                    v = partial.length === 0 ? '{}' : gap ?
                        '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                        '{' + partial.join(',') + '}';
                    gap = mind;
                    return v;
                }
            }

            // If the JSON object does not yet have a stringify method, give it one.

            jsonShim.stringify = function (value, replacer, space) {

                // The stringify method takes a value and an optional replacer, and an optional
                // space parameter, and returns a JSON text. The replacer can be a function
                // that can replace values, or an array of strings that will select the keys.
                // A default replacer method can be provided. Use of the space parameter can
                // produce text that is more easily readable.

                var i;
                gap = '';
                indent = '';

                // If the space parameter is a number, make an indent string containing that
                // many spaces.

                if (typeof space === 'number') {
                    for (i = 0; i < space; i += 1) {
                        indent += ' ';
                    }

                    // If the space parameter is a string, it will be used as the indent string.

                } else if (typeof space === 'string') {
                    indent = space;
                }

                // If there is a replacer, it must be a function or an array.
                // Otherwise, throw an error.

                rep = replacer;
                if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                    throw new Error('JSON.stringify');
                }

                // Make a fake root object containing our value under the key of ''.
                // Return the result of stringifying the value.

                return str('', {'': value});
            };

            // If the JSON object does not yet have a parse method, give it one.

            jsonShim.parse = function (text, reviver) {
                // The parse method takes a text and an optional reviver function, and returns
                // a JavaScript value if the text is a valid JSON text.

                var j;

                function walk(holder, key) {

                    // The walk method is used to recursively walk the resulting structure so
                    // that modifications can be made.

                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (value.hasOwnProperty(k)) {
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
                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function (a) {
                        return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                    });
                }

                // In the second stage, we run the text against regular expressions that look
                // for non-JSON patterns. We are especially concerned with '()' and 'new'
                // because they can cause invocation, and '=' because it can cause mutation.
                // But just to be safe, we want to reject all unexpected forms.

                // We split the second stage into 4 regexp operations in order to work around
                // crippling inefficiencies in IE's and Safari's regexp engines. First we
                // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
                // replace all simple value tokens with ']' characters. Third, we delete all
                // open brackets that follow a colon or comma or that begin the text. Finally,
                // we look to see that the remaining characters are only whitespace or ']' or
                // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

                if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                          .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                          .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                    // In the third stage we use the eval function to compile the text into a
                    // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                    // in JavaScript: it can begin a block or an object literal. We wrap the text
                    // in parens to eliminate the ambiguity.

                    j = eval('(' + text + ')');

                    // In the optional fourth stage, we recursively walk the new structure, passing
                    // each name/value pair to a reviver function for possible transformation.

                    return typeof reviver === 'function' ?
                        walk({'': j}, '') : j;
                }

                // If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError('JSON.parse');
            };

            return jsonShim;
        })()
    };
}());
