/*! (C) Andrea Giammarchi, @WebReflection
 * @license (C) Andrea Giammarchi, @WebReflection
 */
"use strict";
!("has" in {} || function(Object){

  function Descriptors(object) {
    var
      descriptors = Object_create(null),
      key
    ;
    for (key in object) {
      hasOwnProperty.call(object, key) &&
      (descriptors[key] = Descriptor(object[key]));
    }
    return descriptors;
  }

  function Descriptor(config) {
    for (var
      descriptor = Object_create(null),
      i = 0, key; i < descriptorProperties.length;
      hasOwnProperty.call(
        config, key = descriptorProperties[i++]
      ) &&
      (descriptor[key] = config[key])
    );
    return descriptor;
  }

  function Null() {}
  Null.prototype.__proto__ = null;

  function clearDescriptors(self) {
    for(var
      i = objectDescriptorsKeys.length;
      i--;
      delete self[objectDescriptorsKeys[i]]
    );
  }

  function create(proto, descriptors) {
    return Object_create(proto, Descriptors(descriptors));
  }

  function defineProperty(object, key, descriptor) {
    return Object_defineProperty(object, key, Descriptor(descriptor));
  }

  function defineProperties(object, descriptors) {
    return Object_defineProperties(object, Descriptors(descriptors));
  }

  function doStuff(wm, object, handler, descriptors) {
    var handlers = wm.get(object), hadnt = !handlers;
    if (hadnt) {
      wm.set(
        defineProperties(object, descriptors),
        handlers = []
      );
    }
    indexOf.call(handlers, handler) < 0 &&
      handlers.push(handler);
    return hadnt && handlers;
  }

  function filterPrototypeKeys(key) {
    return indexOf.call(objectDescriptorsKeys, key) < 0;
  }

  function get(key) {
    return this[key];
  }

  function invoke(key) {
    return invokeArgs.call(
      this, shift.call(arguments), arguments
    );
  }

  function invokeArgs(key, args) {
    return ObjectPrototypeGet.call(this, key).apply(this, args || []);
  }

  function keysThroughLoop(object) {
    var keys = [];
    for (key in object)
      object.has(key) && keys.push(key)
    ;
    return keys;
  }

  function notify(object, observers, type, name, newValue) {
    for (var
      record = Object_freeze({
        object: object,
        type: type,
        name: "" + name,
        value: newValue
      }),
      i = 0, length = observers.length,
      result, current, u;
      i < length; i++
    ) {
      current = observers[i].call(object, record);
      if (result === u && current !== u) result = current;
    }
    return result === u ? newValue : result;
  }

  function notifyInvoke(self, key, args) {
    var returnedValue = notify(
      self,
      im.get(self),
      "invoke",
      key,
      args
    );
    return returnedValue === args ?
      invokeArgs.call(self, key, args) :
      returnedValue
    ;
  }

  function schedule(object, observers, type, name, oldValue) {
    for (var
      record = Object_freeze({
        object: object,
        type: type,
        name: "" + name,
        oldValue: oldValue
      }),
      i = 0, length = observers.length,
      j, tmp;
      i < length; i++
    ) {
      j = indexOf.call(observersToInvoke, tmp = observers[i]);
      if (j < 0) {
        sharedRecords[
          j = observersToInvoke.push(tmp) - 1
        ] = [];
      }
      sharedRecords[j].push(record);
    }
  }

  function set(key, value) {
    if (key in ObjectPrototype)
      throw "unable to set " + key
    ;
    return this[key] = value;
  }

  var
    // quick and dirty test of internal shims
    __FORCE_SHIM__ = false,
    timeout = typeof setImmediate === typeof timeout ?
      setTimeout : setImmediate
    ,
    sharedRecords = [],
    observersToInvoke = [],
    shift = sharedRecords.shift,
    concat = sharedRecords.concat,
    indexOf = sharedRecords.indexOf || function indexOf(value) {
      for (var i = this.length; i-- && this[i] !== value;);
      return i;
    },
    bind = Object.bind || function bind(self, key) {
      var callback = this, args = [key];
      return function () {
        return callback.apply(self, concat.apply(args, arguments));
      };
    },
    Object_create = (!__FORCE_SHIM__ && Object.create) || function create(proto, descriptors) {
      return proto ?
        (this instanceof create ?
          (create.prototype = create) && Object_defineProperties(this, descriptors) :
          new create(create.prototype = proto, descriptors)
        ) :
        Object_defineProperties(new Null, descriptors)
      ;
    },
    Object_freeze = Object.freeze || Object,
    Object_keys = (!__FORCE_SHIM__ && Object.keys) || keysThroughLoop,
    Object_observe = Object.observe,
    Object_unobserve = Object.unobserve,
    ObjectPrototype = Object.prototype,
    ObjectPrototypeGet = get,
    ObjectPrototypeSet = set,
    Object_defineProperty,
    Object_defineProperties = function($defineProperties){
      try {
        if (__FORCE_SHIM__ || !$defineProperties({},{_:{value:1}})._) throw "";
        Object_defineProperty = Object.defineProperty;
      } catch(o_O) {
        $defineProperties = function defineProperties(
          object, descriptor
        ) {
          for (var key in descriptor)
            hasOwnProperty.call(descriptor, key) &&
            (object[key] = descriptor[key].value)
          ;
          return object;
        };
        Object_defineProperty = function defineProperty(object, key, descriptor) {
          var d = {};
          d[key] = descriptor;
          return defineProperties(object, d);
        };
      }
      return $defineProperties;
    }(Object.defineProperties),
    __ES5__ = !__FORCE_SHIM__ && Object_defineProperty === Object.defineProperty,
    hasOwnProperty = ObjectPrototype.hasOwnProperty,
    descriptorProperties = [
      "configurable",
      "enumerable",
      "get",
      "set",
      "value",
      "writable"
    ],
    objectDescriptorsKeys = [
      "contains",
      "del",
      "get",
      "has",
      "invoke",
      "invokeArgs",
      "invokeBound",
      "keys",
      "set",
      "values"
    ],
    interceptedDescriptors = Descriptors({
      get: {
        configurable: true,
        value: function get(key) {
          return notify(
            this,
            im.get(this),
            "get",
            key,
            ObjectPrototypeGet.call(this, key)
          );
        }
      },
      invoke: {
        configurable: true,
        value: function invoke(key) {
          return notifyInvoke(
            this, shift.call(arguments), arguments
          );
        }
      },
      invokeArgs: {
        configurable: true,
        value: function invokeArgs(key, args) {
          return notifyInvoke(
            this, key, args
          );
        }
      },
      set: {
        configurable: true,
        value: function set(key, value) {
          var newValue = notify(
            this,
            im.get(this),
            "set",
            key,
            value
          );
          return om.has(this) ?
            observedDescriptors.set.value.call(this, key, newValue) :
            ObjectPrototypeSet.call(this, key, newValue)
          ;
        }
      }
    }),
    observedDescriptors = Object_observe || Descriptors({
      del: {
        configurable: true,
        value: function del(key) {
          var
            observers = om.get(this),
            notify = observers.length,
            oldValue = notify && ObjectPrototypeGet.call(this, key),
            deleted = ObjectPrototype.del.call(this, key)
          ;
          notify && deleted && schedule(
            this,
            observers,
            "deleted",
            key,
            oldValue
          );
          return deleted;
        }
      },
      has: {
        configurable: true,
        value: function has(key) {
          return  hasOwnProperty.call(this, key) &&
                    this.propertyIsEnumerable(key) &&
                    filterPrototypeKeys(key)
          ;
        }
      },
      keys: {
        configurable: true,
        value: function keys() {
          return keysThroughLoop(this);
        }
      },
      set: {
        configurable: true,
        value: function set(key, value) {
          var
            observers = om.get(this),
            notify = observers.length,
            has = notify && this.has(key),
            currentValue
          ;
          if (notify) {
            currentValue = ObjectPrototypeGet.call(this, key);
            !(has && currentValue === value) && schedule(
              this,
              observers,
              has ? "updated" : "new",
              key,
              currentValue
            );
          }
          return ObjectPrototypeSet.call(this, key, value);
        }
      }
    }),
    objectDescriptors = {
      contains: function contains(value) {
        return -1 < indexOf.call(this.values(), value);
      },
      del: function del(key) {
        return this.has(key) && delete this[key];
      },
      get: get,
      has: function has(key) {
        return hasOwnProperty.call(this, key);
      },
      invoke: invoke,
      invokeArgs: invokeArgs,
      invokeBound: function invokeBound(key) {
        var secret = "__@" + key;
        return  ObjectPrototypeGet.call(this, secret) ||
                ObjectPrototypeGet.call(defineProperty(
                  this, secret, Descriptor({
                    configurable: true,
                    value: bind.call(invoke, this, key)
                  })
                ), secret)
        ;
      },
      keys: __ES5__?
        function keys() {
          return Object_keys(this);
        } :
        function keys() {
          return Object_keys(this).filter(filterPrototypeKeys);
        },
      set: set,
      values: function values() {
        for (var keys = this.keys(), values = [], i = 0; i < keys.length; i++)
          values[i] = ObjectPrototypeGet.call(this, keys[i])
        ;
        return values;
      }
    },
    WM = Object_observe || typeof WeakMap == typeof WM ?
      function HybridMap() {
        var
          keys = [],
          values = [],
          //indexOf = HybridMap._ || (HybridMap._ = keys.indexOf || function(v){for(i=this.length;i--&&this[i]!==v;);return i})
          i, m, u
        ;
        return m = {
          "delete": function del(key) {
            if (m.has(key)) {
              keys.splice(i, 1);
              values.splice(i, 1);
            }
          },
          get: function get(key) {
            return m.has(key) ? values[i] : u;
          },
          has: function has(key) {
            i = indexOf.call(keys, key);
            return -1 < i;
          },
          set: function set(key, value) {
            values[
              m.has(key) ? i : keys.push(key) - 1
            ] = value;
          }
        };
      } :
      WeakMap
    ,
    om = Object_observe || new WM,
    im = new WM,
    key
  ;

  for (key in objectDescriptors)
    if (hasOwnProperty.call(objectDescriptors, key))
      objectDescriptors[key] = {
        value: objectDescriptors[key]
      }
    ;
  ;

  defineProperties(Object, {
    defineProperty: {
      value: Object_defineProperty === Object.defineProperty ?
        defineProperty : Object_defineProperty
    },
    defineProperties: {
      value: Object_defineProperties === Object.defineProperties ?
        defineProperties : Object_defineProperties
    },
    create: {
      value: create
    }
  });

  defineProperties(Object, {
    intercept: {
      value: function intercept(object, interceptor) {
        doStuff(im, object, interceptor, interceptedDescriptors);
        return object;
      }
    },
    unintercept: {
      value: function unintercept(object, interceptor) {
        var i, interceptors = im.get(object);
        if (interceptors) {
          (i = indexOf.call(interceptors, interceptor)) < 0 ||
            interceptors.splice(i, 1);
          if (!interceptors.length) {
            im["delete"](object);
            clearDescriptors(object);
            om.has(object) &&
              defineProperties(object, observedDescriptors)
            ;
          }
        }
        return object;
      }
    }
  });

  // TODO:  avoid Object.prototype keys notifications
  //        for native Object.observe()
  Object_observe || defineProperties(Object, {
    observe: {
      value: function observe(object, observer) {
        var observers = doStuff(om, object, observer, observedDescriptors);
        if (observers) {
          observers.r = [];
          im.has(object) &&
            defineProperties(object, interceptedDescriptors)
          ;
        }
        return object;
      }
    },
    unobserve: {
      value: function unobserve(object, observer) {
        var i, observers = om.get(object);
        if (observers) {
          (i = indexOf.call(observers, observer)) < 0 ||
            observers.splice(i, 1);
          if (!observers.length) {
            om["delete"](object);
            clearDescriptors(object);
            im.has(object) &&
              defineProperties(object, interceptedDescriptors)
            ;
          }
        }
        return object;
      }
    }
  });

  (Object_observe || function notify() {
    for (var
      records = sharedRecords.splice(0, sharedRecords.length),
      observers = observersToInvoke.splice(0, observersToInvoke.length),
      i = 0, length = observers.length;
      i < length; i++
    )
      observers[i](records[i])
    ;
    timeout(notify, 1000 / 60);
  }());

  defineProperties(ObjectPrototype, Descriptors(objectDescriptors));

}(Object));