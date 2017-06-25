# Usage Guidelines

## Initialization

Vue Backbone is a Vue.js plugin, and as such it needs to be registered with Vue as follows:

```js
// Install Plugin
Vue.use(VueBackbone);
```

When creating/extending Vue instances or components, normally data is specified something like this:

```js
new Vue({
  template: '{{ message }}',
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})
```

To use a Backbone Collection/Model within a Vue, instantiate as follows:

```js
new Vue({
  template: '{{ item.cost }}',
  el: '#app',
  bb: function() {
    return {
        item: model
    };
  }
})
```

* The `bb` option is used
* It must _always_ be a function that returns an object.
* There can be multiple Backbone objects, each one given a unique key which will become accessible on the Vue instance.
* `data` can be used independently also, it is not interfered with.
* Backbone references on a Vue instances are mutable 
  * e.g. `vm.item = collection[collection.indexOf(vm.item) + 1]`
* See below for the interface these Backbone objects use once attached to the Vue instance.

### Components

Vue Components are not constructed in Javascript, but rather from HTML tags and properties. When defining the component with `props`, the `bb` option should be included as above, but instead of a reference to a concrete Backbone object, it is flagged as a property, this way when the component is instantiated, it will find the Backbone object in the `props`.

```js
Vue.component('item-view', {
  props: ['item'],
  template: '{{ item.cost }}',
  el: '#app',
  bb: function() {
    return {
        item: {prop: true}
    };
  }
})
```

## `Backbone.Model` Interface

When a model is attached to a Vue, any access from the Vue goes through an enhanced interface \(the original model is not modified\). This interface is a **superset** of the `Backbone.Model` itself, all the standard Backbone methods \(including `get`/`set`\) along with any custom ones for this Model class, and the attributes of the model are exposed as read/write properties directly.

```js
new Vue({
  template: '{{ item.cost }}',
  el: '#app',
  bb: function() {
    return {
        item: new Backbone.Model({cost: 5})
    };
  }
})
```

## `Backbone.Collection` Interface

When a collection is attached to a Vue, any access from the Vue goes through an enhanced interface \(the original collection is not modified\).

This interface behaves primarily like an array of Models \(with the enhanced interface above\). It can be used inside a `for...in` loop, and it supports direct entry access \(i.e. `collection[0]`\), and common array functions like `slice`, `forEach` and `map`.

Added to this are the `Backbone.Collection` functions, e.g. `on`, `sortBy` or `first`. And any custom ones coming from this particular Collection class.

> **Warning!** this interface allows mutation for internal use, however only use Backbone Collection functions for mutation of the array \(e.g. `add`, `push`, `pop`, `remove`\). Also ensure events fire for these mutations as otherwise Vue Backbone may not detect the change.

Below is a full table of the supported functions, where by default they come from the `Array` prototype, but **\*** indicates a `Backbone.Collection` function, and **\*\*** indicates a `Backbone.Collection` function modified to return model\(s\) with the enhanced interface.

| add\* | every | indexBy\* | modelId\* | set\* |
| :--- | :--- | :--- | :--- | :--- |
| all\* | fetch\* | indexOf | off\* | shift\*\* |
| any\* | fill | initial\*\* | on\* | shuffle\*\* |  
| at\*\* | filter | initialize\* | once\* | size\* |  
| bind\* | find | inject\* | parse\* | slice |  
| chain\* | findIndex | invoke\* | partition\* | some |  
| clone\* | findLastIndex\* | isEmpty\* | pluck\* | sort\* |  
| collect\* | findWhere\*\* | join | pop\*\* | sortBy\*\* |  
| concat | first\*\* | keys | push\* | splice |  
| contains\* | foldl\* | last\*\* | reduce | stopListening\* |  
| copyWithin | foldr\* | lastIndexOf | reduceRight | sync\* |  
| countBy\* | forEach | length | reject\*\* | tail\*\* |  
| create\* | get\*\* | listenTo\* | remove\*\* | take\*\* |  
| detect\*\* | groupBy\* | listenToOnce\* | reset\* | toArray\*\* |  
| difference\* | has\* | map | rest\*\* | toJSON\* |  
| drop\*\* | head\*\* | max\* | reverse | toLocaleString |  
| each\* | include\* | min\* | sample\* | toString |  
| entries | includes\* | model\* | select\*\* | trigger\* |

## Converting to/from Enhanced Interfaces

Sometimes it is convenient to convert the return of a `Backbone.Collection` function, from an array of models or a single model, into an array of _Vue Backbone_ models or a single one. Although this is automatically done for the in-built `Backbone.Collection` functions, a custom one may still return plain Backbone model\(s\). Here's an example:

```js
new Vue({
  bb: function() {
    return {
        items: collection
    };
  },
  computed: {
      validItems: function() {
          return this.items.getValidModels();
      }
  }
})
```

the solution is `VueBackbone.mapBBModels()` which can be used as follows:

```js
new Vue({
  bb: function() {
    return {
        items: collection
    };
  },
  computed: {
      validItems: VueBackbone.mapBBModels(function() {
          return this.items.getValidModels();
      })
  }
})
```

Alternatively, it may be necessary to map a _Vue Backbone_ model/collection back to the original object. A good example of this is where the model is used as a parameter into a Backbone Collection function.

```js
collection.remove(collection.first())
```

The above code will not work with a _Vue Backbone_ collection, as the `first` function will return an enhanced interface, which is not strictly equivalent to any model in the collection. The `VueBackbone.original` function must be used:

```js
collection.remove(VueBackbone.original(collection.first()))
```



