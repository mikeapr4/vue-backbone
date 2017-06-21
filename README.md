# vue-backbone  

[![Build Status](https://travis-ci.org/mikeapr4/vue-backbone.png?branch=master)](https://travis-ci.org/mikeapr4/vue-backbone)
[![Coverage Status][https://coveralls.io/repos/github/mikeapr4/vue-backbone/badge.svg?branch=master]](https://coveralls.io/github/mikeapr4/vue-backbone)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Vue.js Plugin to facilitate gradual migration from Backbone. Backbone Collections and Models can be safely integrated with Vue instances and components, with focus on clean code and future adoption of a Flux library (e.g. Vuex/Redux/Flux).

## Features

* Reactive data ensures Vue correctly and efficiently updates.
* Safe direct data access (`model.prop` vs `model.get('prop')`).
* Backbone-encapsulated logic made available.
* No syncing required, single source of truth.
* Step-by-step incremental migration path.

## Documentation

Usage and guidelines documentation available [here](https://mikeapr4.gitbooks.io/vue-backbone) 

## Installation

Via NPM

    npm install vue-backbone

Via Yarn

    yarn add vue-backbone

Script include (see [dist](https://github.com/mikeapr4/vue-backbone/tree/master/dist) folder)

```html
<script src="vue-backbone.min.js"></script>
```

## Examples

Clone or download the repo to run the examples.

* [*GitHub Commits*](https://github.com/mikeapr4/vue-backbone/tree/master/examples/github-commits.htm) - Backbone version of Vue.js example
* [*TodoMVC*](https://github.com/mikeapr4/vue-backbone/tree/master/examples/todomvc) - combined Backbone and Vue TodoMVC examples
* [*TodoMVC with Component*](https://github.com/mikeapr4/vue-backbone/tree/master/examples/todomvc-with-component) - more complex version of above
* [*Comparison*](https://github.com/mikeapr4/vue-backbone/tree/master/examples/comparison) - in-browser performance test and comparison

## License

[MIT](http://opensource.org/licenses/MIT)
