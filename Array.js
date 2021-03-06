([].has == {}.has && function(Array){
  function d(value) {
    return {value: value};
  }
  function mValues(value, i, arr) {
    return value;
  }
  function mKeys(value, i, arr) {
    return i;
  }
  var
    M = Math,
    floor = M.floor,
    abs = M.abs,
    max = M.max,
    ArrayPrototype = Array.prototype,
    Array_indexOf_original = ArrayPrototype.indexOf,
    Array_indexOf = Array_indexOf_original ||
      // replace this with the MDN one if you want
      // or simply shim Array.prototype as you want before
      // including this library
      function indexOf(value, i) {
        for(var
          length = this.length,
          n = i || 0,
          j = (0 < n || -1) * abs(n),
          k = (
            -1 < j ? j : max(length - abs(j), 0)
          );
          k < length; k++
        )
          if (k in this && this[k] === value) return k
        ;
        return -1;
      }
    ,
    Array_every_original = ArrayPrototype.every,
    Array_every_helper = Array_every_original ||
      function everyHelper(value, i, arr) {
        this[2] && (this[2] = this[0].call(this[1], value, i, arr));
      },
    Array_every = Array_every_original ||
      function every(callback, self) {
        var out = [callback, self, true];
        Array_forEach.call(this, everyHelper, out);
        return !!out[2];
      }
    ,
    Array_filter_original = ArrayPrototype.filter,
    Array_filter_helper = Array_filter_original ||
      function filterHelper(value, i, arr) {
        this[0].call(this[1], value, i, arr) && this.push(value);
      },
    Array_filter = Array_filter_original ||
      function filter(callback, self) {
        var out = [callback, self];
        Array_forEach.call(this, filterHelper, out);
        return out.slice(2);
      }
    ,
    Array_forEach_original = ArrayPrototype.forEach,
    Array_forEach = Array_forEach_original ||
      function forEach(callback, self) {
        for(var i = 0; i < this.length; i++)
          i in this && callback.call(self, this[i], i, this)
        ;
      }
    ,
    Array_map_original = ArrayPrototype.map,
    Array_map_helper = Array_map_original ||
      function mapHelper(value, i, arr) {
        this.push(
          this[0].call(this[1], value, i, arr)
        );
      },
    Array_map = Array_map_original ||
      function map(callback, self) {
        var out = [callback, self];
        Array_forEach.call(this, mapHelper, out);
        return out.slice(2);
      }
    ,
    Array_reduce_original = ArrayPrototype.reduce,
    Array_reduce = Array_reduce_original ||
      function (callback, initialValue) {
        for (var
          i = arguments.length < 2 ? 0 : 1,
          previousValue = i ? this[0] : initialValue;
          i < this.length; i++
        )
          previousValue = callback.call(null, previousValue, this[i], i, this)
        ;
        return previousValue;
      }
    ,
    Array_some_original = ArrayPrototype.some,
    Array_some_helper = Array_some_original ||
      function someHelper(value, i, arr) {
        this[2] || (this[2] = this[0].call(this[1], value, i, arr));
      },
    Array_some = Array_some_original ||
      function some(callback, self) {
        var out = [callback, self, false];
        Array_forEach.call(this, someHelper, out);
        return !!out[2];
      }
    ,
    descriptors = {
      contains: d(function contains(value) {
        return -1 < Array_indexOf.call(this, value);
      }),
      has: d(function has(i) {
        return i in this;
      }),
      keys: d(function keys() {
        return Array_map.call(this, mKeys);
      }),
      values: d(function values() {
        return Array_map.call(this, mValues);
      })
    },
    k
  ;

  // lastIndexOf, reduceRight missing
  Array_every_original || (descriptors.every = d(Array_every));
  Array_filter_original || (descriptors.filter = d(Array_filter));
  Array_forEach_original || (descriptors.forEach = d(Array_forEach));
  Array_indexOf_original || (descriptors.indexOf = d(Array_indexOf));
  Array_map_original || (descriptors.map = d(Array_map));
  Array_reduce_original || (descriptors.reduce = d(Array_reduce));
  Array_some_original || (descriptors.some = d(Array_some));

  Object.defineProperties(ArrayPrototype, descriptors);

}(Array));