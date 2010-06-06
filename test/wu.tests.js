module("Wu itself");

test("Maintains prototype chain",
     function () {
         ok(wu([1,2,3,4]) instanceof wu, "wu(arr) instanceof wu");
         ok(wu({}) instanceof wu, "wu(obj) instanceof wu");
     });

module("Iteration API");

test("Objects",
     function () {
         var next,
             iterator = wu({ foo: 1, bar: 2 });

         next = iterator.next();
         ok((next[0] === "foo" && next[1] === 1) ||
            (next[0] === "bar" && nexxt[1] === 2));

         next = iterator.next();
         ok((next[0] === "foo" && next[1] === 1) ||
            (next[0] === "bar" && next[1] === 2));

         try {
             ok(!!iterator.next(), "This should never happen");
         } catch (err) {
             ok(err instanceof wu.StopIteration);
         }

         ok(wu.eq(wu({ foo: 1 }).toArray(), [["foo", 1]]), "wu({foo:1}).toArray() -> [['foo', 1]]");
     });

test("Arrays",
     function () {
         var iterator = wu([1,2]);
         ok(iterator.next() === 1);
         ok(iterator.next() === 2);
         try {
             ok(!!iterator.next(), "This should never happen.");
         } catch (err) {
             ok(err instanceof wu.StopIteration);
         }

         ok(wu.eq(wu([1,2,3]).toArray(), [1,2,3]), "wu([1,2,3]).toArray() -> [1,2,3]");
     });

test("Strings",
     function () {
         var iterator = wu("Hi!");
         ok(iterator.next() === "H");
         ok(iterator.next() === "i");
         ok(iterator.next() === "!");
         try {
             ok(!!iterator.next(), "This should never happen.");
         } catch (err) {
             ok(err instanceof wu.StopIteration);
         }

         ok(wu.eq(wu("Hi!").toArray(), ["H", "i", "!"]), "wu('Hi!').toArray() -> ['H', 'i', '!']");
     });

test("Numbers",
     function () {
         var iterator = wu(3);
         ok(iterator.next() === 2);
         ok(iterator.next() === 1);
         ok(iterator.next() === 0);
         try {
             ok(!!iterator.next(), "This should never happen.");
         } catch (err) {
             ok(err instanceof wu.StopIteration);
         }
     });

module("Wu methods");

test("wu.eq",
     function () {
         // Objects
         ok(wu.eq({}, {}), "wu.eq w/ empty objects");
         ok(wu.eq({ foo: 1, bar: 2 }, { foo: 1, bar: 2 }), "wu.eq w/ non-empty objects");
         ok(wu.eq({ foo: { bar: 1 } }, { foo: { bar: 1 } }), "wu.eq w/ nested objects");
         ok( !wu.eq({}, { bar: 1}), "wu.eq recognizes non-equal objects");

         // Arrays
         ok(wu.eq([], []), "wu.eq w/ empty arrays");
         ok(wu.eq([1,2,3], [1,2,3]), "wu.eq w/ non-empty arrays");
         ok(wu.eq([1,2,[3,4]], [1,2,[3,4]]), "wu.eq w/ nested arrays");
         ok( !wu.eq([1,2], [1,2,3]), "wu.eq recognizes non-equal arrays");

         // RegExps
         ok(wu.eq(/a/, /a/), "Simple regexes are equal.");
         ok(wu.eq(/a/i, /a/i), "Case insensitive regexes are equal.");
         ok( !wu.eq(/a/i, /a/), "Case insensitive is not equal to non-case insensitive.");
         ok(wu.eq(/a/g, /a/g), "Global match regexes are equal.");
         ok( !wu.eq(/a/g, /a/), "Global match regexes aren't equal to non-global match regexes.");
         ok(wu.eq(/a/m, /a/m), "Multiline regexes are equal.");
         ok( !wu.eq(/a/m, /a/), "Multiline regexes aren't equal to non-multiline regexes.");

         // Dates
         ok(wu.eq(new Date(1), new Date(1)), "Identical dates are equal.");
         ok( !wu.eq(new Date(0), new Date(1)), "Non-identical dates aren't equal.");

         // Mix and match
         ok(wu.eq([{ foo: 1 }, { bar: 2 }], [{ foo: 1 }, { bar: 2 }]), "Objects inside arrays.");
         ok(wu.eq({ foo: [1,2] }, { foo: [1,2] }), "Arrays inside objects");

         // Non-equal
         ok( !wu.eq({}, []), "Arrays and objects are not equal.");
         ok( !wu.eq({}, new Date), "Dates and objects are not equal.");
         ok( !wu.eq({}, /regex/), "Regexps and objects are not equal.");
         ok( !wu.eq([], new Date), "Arrays and dates are not equal.");
         ok( !wu.eq([], /regex/), "Arrays and regexes are not equal.");
         ok( !wu.eq(/regex/, new Date), "Regexes and dates are not equal.");
     });

test("wu.autoCurry",
     function () {
         var add = function (a, b) {
             return a + b;
         };
         var explicit = wu.autoCurry(add, 1);
         var implicit = wu.autoCurry(add);
         ok(explicit(1)(1) === 2, "explicit(1)(1) === 2");
         ok(implicit(1)(1) === 2, "implicit(1)(1) === 2");
         ok(explicit(1, 1) === 2, "explicit(1, 1) === 2");
         ok(implicit(1, 1) === 2, "implicit(1, 1) === 2");
     });

test("wu.bind",
     function () {
         var obj = {};
         ok(wu.bind(obj, function () { return this === obj; })(),
            "this === obj");
         ok(wu.bind(obj,
                    function (uno) {
                        return this === obj && uno === 1;
                    },
                    1)(),
            "this === obj && uno === 1");
     });

test("wu.chain",
     function () {
         ok(wu.eq(wu.chain([1], [2], [3], [4]).toArray(), [1,2,3,4]),
            "wu.chain([1],[2],[3],[4]).toArray() -> [1,2,3,4]");
     });

test("wu.compose",
     function () {
         var plusOne = function (x) {
             return x + 1;
         },
         timesTwo = function (x) {
             return x * 2;
         };

         ok(wu.compose(timesTwo, plusOne)(3) === 8, "timesTwo(plusOne(3)) === 8");
     });

test("wu.curry",
     function () {
         var add = function (a, b) {
             return a + b;
         };
         ok(wu.curry(add, 5)(2) === 7, "wu.curry(add, 5)(2) === 7");
     });

test("wu.match",
     function () {
         // Constructor matching
         ok(wu.match([Object], true)({}), "Objects matches {}");
         ok(wu.match([Array], true)([]), "Array matches []");
         ok(wu.match([RegExp], true)(/regex/), "RegExp matches /regex/");
         ok(wu.match([wu.Iterator], true)(wu([1,2])), "wu.Iterator matches wu([1,2])");
         ok(wu.match([Number], true)(1), "Number matches 1");
         ok(wu.match([String], true)("hello"), "String matches 'hello'");

         // Nested constructor matching
         ok(wu.match([{ foo: Object }], true)({ foo: { bar: 1 } }), "wu.match w/ nested Object constructor");
         ok(wu.match([{ foo: Array }], true)({ foo: [1,2] }), "wu.match w/ nested Array constructor");
         ok(wu.match([{ foo: RegExp }], true)({ foo: /foo/ }), "wu.match w/ nested RegExp constructor");
         ok(wu.match([{ foo: Number }], true)({ foo: 2 }), "wu.match w/ nested Number constructor");
         ok(wu.match([{ foo: String }], true)({ foo: "foo" }), "wu.match w/ nested String constructor");
         ok(wu.match([[Object]], true)([{ bar: 1 }]), "wu.match w/ Object constructor in array");
         ok(wu.match([[Array]], true)([[1,2]]), "wu.match w/ Array constructor in array");
         ok(wu.match([[RegExp]], true)([/foo/]), "wu.match w/ RegExp constructor in array");
         ok(wu.match([[Number]], true)([2]), "wu.match w/ Number constructor in array");
         ok(wu.match([[String]], true)(["string"]), "wu.match w/ String constructor in array");

         // Objects
         ok(wu.match([{}], true)({}), "wu.match w/ empty objects");
         ok(wu.match([{ foo: 1, bar: 2 }], true)({ foo: 1, bar: 2 }), "wu.match w/ non-empty objects");
         ok(wu.match([{ foo: { bar: 1 } }], true)({ foo: { bar: 1 } }), "wu.match w/ nested objects");
         try {
             ok(wu.match([{ bar: 1 }], false)({}), "This should never happen");
         } catch (e) {
             ok(e.message === "wu.match: The form did not match any given pattern.",
                "wu.match recognizes non-equal objects and throws error.");
         }

         // Arrays
         ok(wu.match([[]], true)([]), "wu.match w/ empty arrays");
         ok(wu.match([[1,2,3]], true)([1,2,3]), "wu.match w/ non-empty arrays");
         ok(wu.match([[1,2,[3,4]]], true)([1,2,[3,4]]), "wu.match w/ nested arrays");
         try {
             ok(wu.match([[1,2]], true)([1,2,3]), "This should never happen");
         } catch (e) {
             ok(e.message === "wu.match: The form did not match any given pattern.",
                "wu.match recognizes non-equal arrays and throws error.");
         }

         // Regex -> string matching
         ok(wu.match([ /hey/ ], true)("hey there"), "When all else fails, regex matching strings works");

         // wu.___
         ok(wu.match(wu.___, true)({}), "wu.___ matches objects.");
         ok(wu.match(wu.___, true)([]), "wu.___ matches arrays.");
         ok(wu.match(wu.___, true)(new Date), "wu.___ matches dates.");
         ok(wu.match(wu.___, true)(/regex/), "wu.___ matches regexes.");
         ok(wu.match(wu.___, true)(1), "wu.___ matches numbers.");
         ok(wu.match(wu.___, true)("foobar"), "wu.___ matches strings.");
         ok(wu.match(wu.___, true)(true), "wu.___ matches true.");
         ok(wu.match(wu.___, true)(false), "wu.___ matches false.");
         ok(wu.match(wu.___, true)(null), "wu.___ matches null.");
         ok(wu.match(wu.___, true)(undefined), "wu.___ matches undefined.");
     });

test("wu.not",
     function () {
         ok(wu.not(wu.curry(wu.eq, 1))(2), "wu.not(wu.curry(wu.eq, 1))(2)");
         ok(!wu.not(wu.curry(wu.eq, 1))(1), "!wu.not(wu.curry(wu.eq, 1))(1)");
     });

test("wu.partial",
     function () {
         var square = wu.partial(Math.pow, wu.___, 2),
         twoToThe = wu.partial(Math.pow, 2);

         ok(square(3) === 9, "wu.partial works with wu.___ placeholder");
         ok(twoToThe(3) === 8, "wu.partial works like wu.curry when there is no wu.___");
     });

test("wu.range",
     function () {
         ok(wu.eq(wu.range(3).toArray(), [0,1,2]),
            "wu.range(3).toArray() -> [0,1,2]");
         ok(wu.eq(wu.range(3, 6).toArray(), [3,4,5]),
            "wu.range(3, 6).toArray() -> [3,4,5]");
         ok(wu.eq(wu.range(0, 10, 2).toArray(), [0,2,4,6,8]),
            "wu.range(0, 10, 2).toArray() -> [0,2,4,6,8]");
     });

test("wu.zip",
     function () {
         ok(wu.eq(wu.zip([1,2,3], [4,5,6]).toArray(),
                  [[1,4], [2,5], [3,6]]),
            "wu.zip([1,2,3], [4,5,6]).toArray() -> [[1,4], [2,5], [3,6]]");
     });

module("Augmented function methods");

test("wu(fn).bind",
     function () {
         var obj = {};
         ok(wu(function () { return this === obj; }).bind(obj)(),
            "this === obj");
         ok(wu(function (uno) {
                   return this === obj && uno === 1;
               }).bind(obj, 1)(),
            "this === obj && uno === 1");
     });

test("wu(fn).compose",
     function () {
         var plusOne = function (x) {
             return x + 1;
         },
         timesTwo = function (x) {
             return x * 2;
         };

         ok(wu(timesTwo).compose(plusOne)(3) === 8, "timesTwo(plusOne(3)) === 8");
     });

test("wu(fn).curry",
     function () {
         ok(wu(function (a, b) { return a + b; }).curry(5)(2) === 7,
            "wu.curry(add, 5)(2) === 7");
     });

test("wu(fn).partial",
     function () {
         var square = wu(Math.pow).partial(wu.___, 2),
         twoToThe = wu(Math.pow).partial(2);

         ok(square(3) === 9, "wu(fn).partial works with wu.___ placeholder");
         ok(twoToThe(3) === 8, "wu(fn).partial works like wu.curry when there is no wu.___");
     });

module("Iterator methods");

test("wu.Iterator.all",
     function () {
         ok(wu([0,2,4]).all(function (x) { return x % 2 === 0; }),
            "wu([0,2,4]).all(even?)");
         ok( !wu([0,2,4,5]).all(function (x) { return x % 2 === 0; }),
            "wu([0,2,4,5]).all(even?) is false");
     });

test("wu.Iterator.any",
     function () {
         ok(wu([0,2,4,5]).any(function (x) { return x % 2 === 1; }),
            "wu([0,2,4,5]).any(odd?)");
         ok( !wu([0,2,4]).any(function (x) { return x % 2 === 1; }),
            "wu([0,2,4]).any(odd?) is false");
     });

asyncTest("wu.Iterator.asyncEach",
          2,
          function () {
              var items = [];
              wu([1,2,3]).asyncEach(function each(n) {
                  items.push(n);
                  if (items.length === 3) {
                      ok(wu.eq(items, [1,2,3]), "asyncEach runs through each item in the iterator in correct order.");
                  }
              },
              function then() {
                  ok(items.length === 3, "And the 'then' callback is called after");
                  start();
              });
          });

test("wu.Iterator.dot",
     function () {
         ok(wu.eq(wu([{foo:1},{foo:2},{foo:3}]).dot("foo").toArray(), [1,2,3]),
            "wu([{foo:1},{foo:2},{foo:3}]).dot('foo').toArray() -> [1,2,3]");
         ok(wu.eq(wu([[1], [2,3], [4,5,6]]).dot('slice', 1).toArray(), [[], [3], [5,6]]),
            "wu([[1], [2,3], [4,5,6]]).dot('slice', 1).toArray() -> [[], [3], [5,6]]");
     });

test("wu.Iterator.dropWhile",
     function () {
         ok(wu.eq(wu([1,2,3,4,5]).dropWhile(function (n) { return n < 3; }).toArray(),
                  [3,4,5]),
            "wu.eq(wu([1,2,3,4,5]).dropWhile(n < 3).toArray() -> [3,4,5]");
     });

test("wu.Iterator.each",
     function () {
         ok(wu.eq([1,2,3], wu([1,2,3]).each(Math.log)),
            "Each returns the values from the original iterator, despite what the each function is.");
         var items = [];
         wu([1,2,3]).each(wu.bind(items, items.push));
         ok(wu.eq([1,2,3], items), "wu(...).each() reuns for every item in the iterator in order.");
     });

test("wu.Iterator.eachply",
     function () {
         ok(wu.eq([["foo",1]], wu({ foo: 1 }).eachply(function (k, v) {
                                                          ok(k === "foo" && v === 1, "eachply applies keys and values correctly.");
                                                      })),
            "eachply returns the values from the original iterator.");
     });

test("wu.Iterator.filter",
     function () {
         ok(wu.eq(wu([1,2,3,4]).filter(function (x) { return x % 2 === 0; }).toArray(),
                  [2,4]),
            "wu([1,2,3,4]).filter(even?).toArray() -> [2,4]");
     });

test("wu.Iterator.has",
     function () {
         ok(wu([0,1,2]).has(2), "wu([0,1,2]).has(2)");
         ok( !wu([0,1,2]).has(3), "wu([0,1,2]).has(3) is false");
     });

test("wu.Iterator.map",
     function () {
         ok(wu.eq(wu(4).map(function (x) { return x + 1; }).toArray(),
                  [4,3,2,1]),
           "wu(4).map(function (x) { return x + 1; }).toArray() -> [4,3,2,1]");
     });

test("wu.Iterator.mapply",
     function () {
         ok(wu.eq(wu([[1,2], [2,2], [3,2]]).mapply(Math.pow).toArray(),
                  [1,4,9]),
            "wu([[1,2], [2,2], [3,2]]).mapply(Math.pow).toArray() -> [1,4,9]");
     });

test("wu.Iterator.reduce",
     function () {
         ok(wu([1,2,3,4]).reduce(function (n, m) { return n + m; }) == 10,
            "wu([1,2,3,4]).reduce(n + m) == 10");
     });

test("wu.Iterator.reduceRight",
     function () {
         ok(wu.eq(wu([[1,2,3], [4,5], [6,7,8]]).reduceRight(function (a, b) { return a.concat(b); }),
                  [1,2,3,4,5,6,7,8]),
            "wu([[1,2,3], [4,5], [6,7,8]]).reduceRight(a.concat(b)) -> [1,2,3,4,5,6,7,8]");
     });

test("wu.Iterator.takeWhile",
     function () {
         ok(wu.eq(wu([1,2,3,4,5,6]).takeWhile(function (n) { return n < 4; }).toArray(),
                  [1,2,3]),
            "wu([1,2,3,4,5,6]).takeWhile(function (n) { return n < 4; }).toArray() -> [1,2,3]");
     });
