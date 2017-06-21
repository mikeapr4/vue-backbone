# Vue Backbone

Vue.js Plugin to facilitate gradual migration from Backbone. Backbone Collections and Models can be safely integrated with Vue instances and components, with focus on clean code and future adoption of a Flux library (e.g. Vuex/Redux/Flux).

## Features

* Reactive data ensures Vue correctly and efficiently updates.
* Safe direct data access (`model.prop` vs `model.get('prop')`).
* Backbone-encapsulated logic made available.
* No syncing required, single source of truth.
* Step-by-step incremental migration path.

## Objective

Vue `data` (or Vuex `state`) works with simple objects (POJOs), with data processing defined in any of the following ways:

* Template expressions
* Computed properties
* Methods
* Filters
* Watchers
* Getters (Vuex)
* Mutations (Vuex)

Ultimately when the Backbone migration is finished, all the encapsulated logic within Backbone should have been transferred to the above patterns. Backbone's in-built REST API binding could still be leveraged, or replaced with an alternative (e.g. Axios).

### First steps

Considering migration from Backbone to Vue, but don't know where to start? Want to understand what a gradual migration might look like? See [Gradual Migration](/migration.md).

### Concept

Some understanding of how Vue Backbone works under the hood is preferable before using it, see [Concept](/concept.md).

## Usage

Before looking at the examples in the project, the [Usage Guidelines](/guidelines.md) will clarify how the library works.

## Alternatives

### Backbone Objects as Data

A perfectly functional demonstration of directly using Backbone objects as data (without Vue Backbone) can be seen [here](https://codepen.io/niexin/pen/XmYdVa). This is a viable approach to integrating Backbone objects with Vue, however it relies completely on the Backbone interface, migrating from Backbone to Vuex will require a complete rewrite.

### 2-way Sync

Another approach detailed in a Vue [ticket](https://github.com/vuejs/vue/issues/316), defines a basic pattern for a 2-way sync between Vue data and a Backbone model. This approach does offer a big improvement over the previous alternative, in that it does allow for easier decoupling in future from Backbone. Obviously the example shown is just a starting point (see the [Comparison](https://github.com/mikeapr4/vue-backbone/tree/master/examples/comparison) example for a more detailed implementation). However one obstacle does remain, any Backbone-encapsulated logic is not reactive, meaning direct access to Backbone Model/Collection functions in, say a Vue template, may cause refresh glitches when the underlying data changes.