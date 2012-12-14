//remove:
require("../Object.js");
var wru = require('../wru');
//:remove

wru.test([{
  name: "contains",
  test: function () {
    wru.assert("contains", {"456":123}.contains(123));
    wru.assert("!contains", !{"456":123}.contains("456"));
  }
},{
  name: "del",
  test: function () {
    var o = {"a": "a"};
    wru.assert("deletes", o.del("a"));
    wru.assert("no 'a' property anymore", ("a" in o) === false);
    wru.assert("!deletes", !o.del("del"));
    o.set("b", "b");
    wru.assert("has b", o.has("b"));
    wru.assert("deletes", o.del("b"));
    wru.assert("hasn't b", !o.has("b"));
  }
},{
  name: "get",
  test: function () {
    var o = {"a": "a"};
    wru.assert("get", o.get("a") === o.a);
    wru.assert("!get", o.get("b") === undefined);
    o.b = "b";
    wru.assert("get", o.get("b") === "b");
  }
},{
  name: "has",
  test: function () {
    wru.assert("has", {"456":123}.has(456)); // as key, implicit cast
    wru.assert("!has", !{"456":123}.has(123));
  }
},{
  name: "invoke",
  test: function () {
    var
      args,
      o = {
        test: function () {
          this.args = args = arguments;
          return arguments.length;
        }
      }
    ;
    wru.assert("no arguments", o.invoke("test", 1, 2) === 2);
    wru.assert("args was set as 'o' property", o.args === args);
    wru.assert("args was correct", args[0] === 1 && args[1] === 2);
  }
},{
  name: "invokeArgs",
  test: function () {
    var
      args,
      o = {
        test: function () {
          this.args = args = arguments;
          return arguments.length;
        }
      }
    ;
    wru.assert("no arguments", o.invokeArgs("test", [1, 2]) === 2);
    wru.assert("args was set as 'o' property", o.args === args);
    wru.assert("args was correct", args[0] === 1 && args[1] === 2);
  }
},{
  name: "invokeBound",
  test: function () {
    var
      o = {
        test: function(a, b){
          wru.assert("correct bound", this === o);
          return a + b;
        }
      },
      bound = o.invokeBound("test")
    ;
    wru.assert("correct value", bound(123, 456) === 579);
    wru.assert("bound once and never again", bound === o.invokeBound("test"));
    // this is a smelly test but I'd like to really be sure
    // objects can be cleared
    for (var key in o) {
      if (key.charAt(0) === "_") delete o[key];
    }
    Object.getOwnPropertyNames && Object.getOwnPropertyNames(o).forEach(function(key){
      if (key.charAt(0) === "_") delete o[key];
    });
    wru.assert("once deleted, ", bound != o.invokeBound("test"));
  }
},{
  name: "keys",
  test: function () {
    wru.assert("no keys", {}.keys().length === 0);
    wru.assert("one key", {a:1}.keys().join("") === "a");
    wru.assert("more keys", {a:1,b:2,"3":"c"}.keys().sort().join() === ["a","b",3].sort().join());
  }
},{
  name: "set",
  test: function () {
    var o = {};
    wru.assert("set", o.set("a", "b") === "b");
    wru.assert("has", "a" in o && o.has("a"));
    wru.assert("get", o.get("a") === "b");
  }
},{
  name: "values",
  test: function () {
    wru.assert("no values", {}.keys().length === 0);
    wru.assert("one value", {a:1}.values().join("") === "1");
    wru.assert("more values", {a:1,b:2,"3":"c"}.values().sort().join() === [1,2,"c"].sort().join());
  }
},{
  name: "Object.observe(object, new)",
  test: function () {
    function observer(r) {
      wru.assert("list of records", r instanceof Array);
      wru.assert("record length is correct", r.length === 1);
      wru.assert("record is new", r[0].type === "new");
      wru.assert("record key is correct", r[0].name === "" + key);
      wru.assert("record value is correct", r[0].object.get(key) === value);
      wru.assert("record has no oldValue is correct", r[0].oldValue === undefined);
      Object.isFrozen && wru.assert("record is frozen", Object.isFrozen(r[0]));
    }
    var o = {}, key, value;
    Object.observe(o, wru.async(observer));
    o.set(
      key = Math.random(),
      value = Math.random()
    );
  }
},{
  name: "Object.observe(object, update)",
  test: function () {
    function observer(r) {
      wru.assert("list of records", r instanceof Array);
      wru.assert("record length is correct", r.length === 2);
      wru.assert("record is new", r[1].type === "updated");
      wru.assert("record key is correct", r[1].name === "" + key);
      wru.assert("record value is correct", r[1].object.get(key) === 123);
      wru.assert("record has no oldValue is correct", r[1].oldValue === value);
    }
    var o = {}, key, value;
    Object.observe(o, wru.async(observer));
    o.set(
      key = Math.random(),
      value = Math.random()
    );
    o.set(
      key,  // should not notify
      value // should not notify
    );
    o.set(key, 123);
  }
},{
  name: "Object.observe(object, delete)",
  test: function () {
    function observer(r) {
      wru.assert("list of records", r instanceof Array);
      wru.assert("record length is correct", r.length === 2);
      wru.assert("record is new", r[1].type === "deleted");
      wru.assert("record key is correct", r[1].name === "" + key);
      wru.assert("record value is correct", !r[1].object.has(key));
      wru.assert("record has no oldValue is correct", r[1].oldValue === value);
    }
    var o = {}, key = Math.random(), value, deleted = [];
    Object.observe(o, wru.async(observer));
    deleted.push(o.del(key)); // should not notify
    o.set(
      key,
      value = Math.random()
    );
    deleted.push(o.del(key));
  }
},{
  name: "Object.observe(object, sharedObservers)",
  test: function () {
    function observer(r) {
      R = r;
      ++called;
    }
    var a, b, called = 0, R;
    Object.observe(a = {}, observer).set("a", "a");
    Object.observe(b = {}, observer).set("b", "b");
    setTimeout(wru.async(function () {
      wru.assert("same function shared with multiple objects called once", called === 1);
      wru.assert("right order of records", R[0].object === a && R[1].object === b);
    }), 100);
  }
},{
  name: "Object.observe(object, sharedRecords)",
  test: function () {
    var o = {}, called = 0, R = [];
    Object.observe(o, function (r) {
      called++;
      R.push(r);
    });
    Object.observe(o, function (r) {
      called++;
      R.push(r);
    });
    o.set("a", "a");
    setTimeout(wru.async(function () {
      wru.assert("different functions, called separately", called === 2);
      wru.assert("list are different", R[0] !== R[1]);
      wru.assert("records are reused rather than created per each invoke", R[0][0] === R[1][0]);
    }), 100);
  }
},{
  name: "Object.observe does not affetc keys, values, has",
  test: function () {
    var o = Object.observe({}, function(){});
    wru.assert("keys", o.keys().join("") === "");
    wru.assert("values", o.values().join("") === "");
    wru.assert("has", !o.has("set"));
  }
},{
  name: "Object.unobserve(object, simple)",
  test: function () {
    function observer() {
      called++;
    }
    var called = 0, o = {};
    Object.observe(o, observer);
    o.set(1, 2);
    Object.unobserve(o, observer);
    o.set(3, 4);
    setTimeout(wru.async(function () {
      wru.assert("called only once", called === 1);
    }), 100);
  }
},{
  name: "Object.intercept(object, set)",
  test: function () {
    var R = [], called = 0, o = Object.intercept({}, function (r) {
      called++;
      R.push(r);
      return 123;
    });
    Object.intercept(o, function (r) {
      called++;
      R.push(r);
      return 456;
    }).set("k", "v");
    wru.assert("called twice", called === 2);
    wru.assert("same record", R[0] === R[1]);
    wru.assert("overwritten value", o.k === 123);
    wru.assert("record had correct properties",
      R[0].object === o &&
      R[0].type === "set" &&
      R[0].name === "k" &&
      R[0].value === "v"
    );
  }
},{
  name: "Object.intercept(object, get)",
  test: function () {
    var R = [], called = 0, o = Object.intercept({}, function (r) {
      called++;
      R.push(r);
      return 123;
    });
    wru.assert("assigned first returned value",
      123 === Object.intercept(o, function (r) {
        called++;
        R.push(r);
        return 456;
      }).get("k")
    );
    wru.assert("called twice in any case", called === 2);
    wru.assert("same record", R[0] === R[1]);
    wru.assert("record had correct properties",
      R[0].object === o &&
      R[0].type === "get" &&
      R[0].name === "k" &&
      R[0].value === undefined
    );
  }
},{
  name: "observe and intercept",
  test: function () {
    function handler(r) {
      R.push(r);
    }
    var R = [], o = {};
    Object.observe(o, handler);
    Object.intercept(o, handler);
    o.set("k", 123);
    wru.assert("only one key", o.keys().join("") === "k");
    wru.assert("only one value", o.values().join("") === "123");
    setTimeout(wru.async(function(){
      wru.assert("called in both cases", 2 == R.length);
      wru.assert("intercept was first", R[0].type === "set");
      wru.assert("observe was correct too", R[1][0].type === "new");
      Object.unobserve(o, handler);
      o.set("k", 456);
      setTimeout(wru.async(function(){
        wru.assert("called just another time", 3 == R.length);
        wru.assert("intercept was correct", R[2].type === "set");
        Object.observe(o, handler);
        o.set("k", 789);
        setTimeout(wru.async(function(){
          wru.assert("called two more times", 5 == R.length);
          wru.assert("intercept was first", R[3].type === "set");
          Object.unintercept(o, handler);
          o.set("k", 0);
          setTimeout(wru.async(function(){
            wru.assert("called one more times", 6 == R.length);
            wru.assert("observe was correct too", R[5].pop().type === "updated");
            Object.unobserve(o, handler);
            wru.assert("get and set are original one",
              Object.prototype.get === o.get &&
              Object.prototype.set === o.set
            );
            o.del("k");
          }), 70);
        }), 70);
      }), 70);
    }), 70);
  }
},{
  name: "Object.intercept(object, invoke)",
  test: function () {
    var
      f1 = function () {
        called++;
      },
      f2 = function () {
        called++;
        return "f2";
      },
      f3 = function () {
        called++;
        return "f3";
      },
      o = {
        test: function () {
          called++;
          return "o";
        }
      },
      called = 0,
      i
    ;
    Object.intercept(o, f1);
    Object.intercept(o, f2);
    Object.intercept(o, f3);
    wru.assert("intercepted f2 return", o.invoke("test") === "f2");
    wru.assert("right amount of calls", called === 3);
    Object.unintercept(o, f2);
    wru.assert("intercepted f3 return", o.invoke("test") === "f3");
    Object.unintercept(o, f3);
    wru.assert("intercepted with no return", o.invoke("test") === "o");
    Object.unintercept(o, f1);
    i = called;
    o.invoke("test");
    wru.assert("all interceptors removed", called === (i + 1));
  }
}
]);