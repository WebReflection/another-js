Another JS
==========
Have you ever dreamed about a **cross platform**, **consistent**, **copy and paste ready**, **JavaScript code style** that gives you **control** on basically everything that is going on runtime?

###What Is This About
Well, considering `Proxy` is one of those features nobody can't wait to use since ever, together with [Harmony](http://wiki.ecmascript.org/doku.php?id=harmony:observe) `Object.observe(obj, observer)`, I would bet you did!

This is what this project is about, the concept there since ECMAScript 3rd Edition nobody thought/used/embraced/promoted before.

... we learned all single chars of the specs and never used them to make things right for us, right for every dev, isn't it?

  * we've been asking for getters and setters without promoting a simple `obj.set(key, value)` and `obj.get(key)` approach
  * we've be whining about missing private properties, being forced by *someone* to use `obj.hasOwnProperty()` per each `for/in` iteration, without even considering that `hasOwnProperty()` could be actually the *key* to understand if a property is private or public using inheritance as *that wasn't me, is not my thing* approach
  * we've been looking for notifications on what's going on, a better way to debug everything that is happening in our code ... with current status: a nightmare of stack-traces with *anonymous* callbacks or *undefined is not defined* pointless messages
  * we've been hoping for some mechanism able to act like, as example, `__get` and `__set` in *php* programming language
  * we've been hoping for something even more evil as the good old `__noSuchMethod__` was
  * we've been writing `for/in` loops in the same, repeated, boring, error prone way, we all know
  * we've been using previous point to retrieve also objects values
  * we've never understood if `delete obj.key;` returning `true` meant we actually deleted something
  * we've been stuck in the middle of all possible *browser version to bowser version* updates and quirks and I'm not talking about IE only
  * we've been afraid of extending `Object.prototype` because the language never provided non enumerable properties, without enforcing patterns similar to `Object.keys()` which together with `forEach` is the new `for/in(if hasownproperty)` boring loop
  * ... etc ... etc ...

###Basically Our Fault
The problem is simple, we never agreed on anything except for few methods everyone re-implemented in this or that native `prototype` and with this or that inconsistency ... well done us!
We had a better solution 10 years ago but we have still the same problems today: the write once and run everywhere myth we, in first place, didn't make it possible.

###A Different Approach That Will Fail
You read correctly, instead of deciding what's good and work now and what doesn't together, we all complain about this and that without getting things done and this project won't be different.
Unfortunately, this happens also too often in ES mailing list and this is one of the reasons things change sometimes way too slow.

###Even Thought...
I will try in any case for those brave developers that would like to contribute or improve the idea, for those developers without many external dependencies, or able to make those external dependencies work with `AnotherJS` as well in order to have all advantages, without compromising performances that much for real world use cases (you have to consider benefits VS raw performance).

So, here you can see how this environment in pure JS is different ... I swear, this is not a joke, you can find [100% code coverage with tests here](https://github.com/WebReflection/another-js/blob/master/test/Object.js)

###AnotherJS API
This is the `Object.prototype` in alphabetic order:

  * `Object#contains(value:any):boolean` returns `true` only if the `object` has that `value` in its own properties
  * `Object#del(key:string):boolean` returns `true` if the `object` had own property `key` and it was removed (`delete` is not usable in ES3 while the operation might return `true` regardless what happened to the object status)
  * `Object#get(key:string):any` returns the value associated to `object[key]` or `undefined` if none
  * `Object#has(key:string):boolean` returns `true` if `object.hasOwnProperty(key)` and key is not a reserved word (explained later on)
  * `Object#invoke(key:string[,arg0[,arg1[,argN]]]):any` returns the equivalent of `object[key].call(object[,arg0[,arg1[,argN]]])`
  * `Object#invokeArgs(key:string[,[arg0,arg1,argN]]):any` returns the equivalent of `object[key].apply(object[,[arg0,arg1,argN]])`
  * `Object#invokeBound(key:string)` returns the equivalent of `object[key].bind(object)` except this is created only once per `key` name rather than *N* times. This makes common usage of bound methods memory and CPU safer.
  * `Object#keys():Array` returns an array of object own enumerable keys
  * `Object#set(key:string, value:any)` returns `value` after setting the `key` as `object[key] = value`
  * `Object#values():Array` returns an array of object own enumerable values

And this is the `Object` static API in alphabetic order:

  * `Object.intercept(o:Object, f:Function):o` registers the function as *interceptor* and returns the original, first argument, object.
  * `Object.observe(o:Object, f:Function):o` registers the function as observer and returns the original, first argument, object. Works like native proposal available in *Chrome Canary*
  * `Object.unintercept(o:Object, f:Function):o` removes the function from notifications and returns the original, first argument, object.
  * `Object.unobserve(o:Object, f:Function)` removes the function from notifications and returns the original, first argument, object.

###Don't Be Afraid
The fact I'm extending `Object.prototype` in 2012 does not mean I am mental or noob ... I am coding JS since *IE4* and I've seen every bloody piece of code interacting over `for/in` loops through the `obj.hasOwnProperty(key)` pattern so ... really, don't be worried about this.
Said that, the aim of this project is actually to promote a different paradigm such:

    function doSomething(key) {
      var value = this.get(key);
      if (value.needsUpdates) {
        this.set(key, update(value))
      }
    }
    obj.keys().forEach(doSomething, obj);

So once again, if you use this project for what it provides, you know your own objects and your own way to interact with them in an optimal way.
Libraries unaware of this library, will still be safe using the boring `for/in` loop all over the place, without using ES5 non enumerable possibility, etc etc ...

###Reserved Words
These are the only "*problematic*" keys an object could have able to potentially cause problems to external libraries and only if `Object.observe()` or `Object.intercept()` have been used with the specific object, otherwise there's nothing to worry about.
Since libraries not aware of *AnotherJS* will never use those `Object` methods, again nothing to really worry about but you are surely welcome to update those libraries and promote *AnotherJS* version in your own repository, these will be linked here too!

###On Object.intercept(o,f)
Any time we `o.get(key)`, `o.set(key, value)`, or `o.invoke(key, arg0, arg1)`, together with `invokeArgs(key, [arg0,arg1])` and `(invokeBound(key))(arg0, arg1)` each function registered with `Object.intercept(o,f)` will be called synchronously.
**First come, first serve** is also the pattern used to overwrite the result of the operation since of course, the first one that can observe or intercept an object, is usually considered the owner of the object.

    var o = {hello: function (name) {
      alert(
        "Hi " + name + ", my name is " + this.get("name")
      );
    }};

    Object.intercept(o, function (record) {
      record.object === o;
      record.type; // "get", "set"  or "invoke"
      record.name; // "name"        or "hello"
      record.value;// "Andrea"      or arguments
    });

    o.set("name", "Andrea");
    o.invoke("hello", "everybody"); // or ... o.hello("everybody");
    // Hi everybody, my name is Andrea

###More Documentation Coming Soon
It's not easy at all to write all examples and explain everything here so more is coming but you can already [try in console the whole API with any browser you want](http://www.3site.eu/another-js/).
Right now we are talking about `Object` only but others native constructor are coming into *AnotherJS* pretty soon.

###Tests
For the web, open `test.html` and you are ready to go. Use [polpetta](https://github.com/WebReflection/polpetta) if your browser does not load file protocol. For **node.js**, simply `node test/Object.js` from this folder.