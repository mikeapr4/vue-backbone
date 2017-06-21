/*!
 * Vue-Backbone v0.1.0
 * https://github.com/mikeapr4/vue-backbone
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["VueBackbone"] = factory();
	else
		root["VueBackbone"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (collection, simple) {
	var proxy = collection.map(function (model) {
		return model._vuebackbone_proxy;
	});

	// Attach bound version of all the collection functions to the proxy
	// these functions are readonly on the proxy and any future changes
	// to the collection functions won't be reflected in the Vue proxy
	for (var key in collection) {
		if (typeof collection[key] === "function" && key !== "constructor" && (simple || arrayPriority.indexOf(key) === -1)) {
			var bndFunc = collection[key].bind(collection);
			if (!simple) {
				bndFunc = checkForReturnsModels(bndFunc, key);
			}
			Object.defineProperty(proxy, key, { value: bndFunc });
		}
	}

	// Attach link back to original model
	Object.defineProperty(proxy, "_vuebackbone_original", {
		value: collection
	});

	return proxy;
};

/**
 * Create a proxy of the Backbone Collection which maps direct access of underlying
 * array of Model proxies to the functional interface that Backbone normally provides. 
 * This allows for in-template looping/access to Backbone model proxies.
 *
 * In the case of ambiguity, say a function exists on both the Array.prototype and in
 * Backbone. In general Backbone functionality is favoured, but there is a list of Array
 * functions which will be kept.
 *
 * In addition, common Backbone collection functions which return an array of models, or a single
 * one, have the returned Model(s) mapped to their proxies. Just a convenience.
 *
 * To avoid interference, it's stored under the Model property `_vuebackbone_proxy`. This proxy
 * is only really intended to be used by Vue templates.
 */

var arrayPriority = ["slice", "forEach", "map", "reduce", "reduceRight", "find", "filter", "every", "some", "indexOf", "lastIndexOf", "findIndex"],
    returnsModels = ["pop", "shift", "remove", "get", "at", "where", "findWhere", "reject", "sortBy", "shuffle", "toArray", "detect", "select", "first", "head", "take", "rest", "tail", "drop", "initial", "last", "without"];

function checkForReturnsModels(func, key) {
	if (returnsModels.indexOf(key) > -1) {
		return function () {
			var models = func.apply(this, arguments);
			return models && (models._vuebackbone_proxy || models.map(function (m) {
				return m._vuebackbone_proxy;
			})) || models;
		};
	}
	return func;
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (model, conflictPrefix) {
	var proxy = {};

	// Attach bound version of all the model functions to the proxy
	// these functions are readonly on the proxy and any future changes
	// to the model functions won't be reflected in the Vue proxy
	for (var key in model) {
		if (typeof model[key] === "function" && key !== "constructor") {
			var bndFunc = model[key].bind(model);
			Object.defineProperty(proxy, key, { value: bndFunc });
		}
	}

	// Attach getter/setters for the model attributes.
	Object.keys(model.attributes).forEach(function (attr) {
		proxyModelAttribute(proxy, model, attr, conflictPrefix);
	});
	if (!proxy.id) {
		// sometimes ID is a field in the model (in which case it'll be proxied already)
		Object.defineProperty(proxy, "id", {
			get: function get() {
				return model.id;
			}
		});
	}

	// Attach link back to original model
	Object.defineProperty(proxy, "_vuebackbone_original", { value: model });

	return proxy;
};

/**
 * Create a proxy of the Backbone Model which maps direct access of attributes
 * to the get/set interface that Backbone normally provides. This allows for
 * in-template binding to Backbone model attributes easily.
 *
 * In the case of ambiguity, say an attribute called "completed" and a method
 * called "completed". The method takes priority (so as not to break existing functionality),
 * however as a backup the attribute can be accessed with a prefix (conflictPrefix option),
 * e.g. model.$completed
 *
 * To avoid interference, it's stored under the Model property `_vuebackbone_proxy`. This proxy
 * is only really intended to be used by Vue templates.
 */

/**
 * Attach proxy getter/setter for a model attribute
 */
function proxyModelAttribute(proxy, model, attr, conflictPrefix) {
	var getter = model.get.bind(model, attr);
	var setter = model.set.bind(model, attr);

	// If there's a conflict with a function from the model, add the attribute with the prefix
	var safeAttr = proxy[attr] ? conflictPrefix + attr : attr;

	Object.defineProperty(proxy, safeAttr, {
		enumerable: true,
		get: getter,
		set: setter
	});
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.mapBBModels = mapBBModels;
exports.install = install;
exports.original = original;

var _modelProxy = __webpack_require__(1);

var _modelProxy2 = _interopRequireDefault(_modelProxy);

var _collectionProxy = __webpack_require__(0);

var _collectionProxy2 = _interopRequireDefault(_collectionProxy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Default values for the possible options passed in Vue.use
 */
var opts = {
	proxies: true,
	conflictPrefix: "$",
	addComputed: true,
	dataPrefix: "_",
	simpleCollectionProxy: false
};

/**
 * Created a VueBackbone Proxy object which can be 
 * accessed from the original Backbone Object
 */
function vueBackboneProxy(bb) {
	if (opts.proxies && !bb._vuebackbone_proxy) {
		if (bb.models) {
			bb.each(vueBackboneProxy);
			bb._vuebackbone_proxy = (0, _collectionProxy2.default)(bb, opts.simpleCollectionProxy);
		} else {
			bb._vuebackbone_proxy = (0, _modelProxy2.default)(bb, opts.conflictPrefix);
		}
	}
}

/**
 * Functions to retrieve the underlying POJO
 * beneath the Backbone objects
 */

function rawSrcModel(model) {
	return model.attributes;
}

function rawSrcCollection(collection) {
	return collection.map(rawSrcModel);
}

function rawSrc(bb) {
	return bb.models ? rawSrcCollection(bb) : rawSrcModel(bb);
}

/**
 * When Proxies are enabled, the computed value is the most
 * practical way to access the proxy (functionality and data together).
 * However without proxies, the raw data should be accessible
 * via the `bb` options key directly, and the instance (functionality)
 * will be accessible via the vm.$bb[key] property.
 */
function getDataKey(key) {
	return opts.addComputed && opts.proxies ? opts.dataPrefix + key : key;
}

/**
 * Setup handlers for Backbone events, so that Vue keeps sync.
 * Also ensure Models are mapped.
 */

function bindCollectionToVue(vm, key, ctx, bb) {
	// Handle mapping of models for Vue proxy
	if (opts.proxies) {
		bb.on("add", vueBackboneProxy); // map new models
		ctx.onreset = function () {
			return bb.each(vueBackboneProxy);
		};
		bb.on("reset", ctx.onreset); // map complete reset
	}

	// Changes to collection array will require a full reset (for reactivity)
	ctx.onchange = function () {
		vm.$data[getDataKey(key)] = rawSrcCollection(bb);
		// Proxy array isn't by reference, so it needs to be updated
		// (this is less costly than recreating it)
		if (opts.proxies) {
			var proxy = bb._vuebackbone_proxy;
			proxy.length = 0; // truncate first
			bb.forEach(function (entry, index) {
				return proxy[index] = entry._vuebackbone_proxy;
			});
		}
	};
	bb.on("reset sort remove add", ctx.onchange);
}

/**
 * As VueBackbone can't support reactivity on new attributes added to a Backbone
 * Model, there's a safety with warning for it.
 */
function bindModelToVue(ctx, bb) {
	ctx.onchange = function () {
		// Test for new attribute
		if (bb.keys().length > Object.keys(bb._previousAttributes).length) {
			// Not an error, as it may be the case this attribute is not needed for Vue at all
			console.warn("VueBackbone: Adding new Model attributes after binding is not supported, provide defaults for all properties");
		}
	};

	bb.on("change", ctx.onchange);
}

function bindBBToVue(vm, key) {
	var ctx = vm._vuebackbone[key],
	    bb = ctx.bb;

	bb.models ? bindCollectionToVue(vm, key, ctx, bb) : bindModelToVue(ctx, bb);
}

/**
 * Cleanup if the Backbone link is changed, or if the Vue is destroyed
 */
function unbindBBFromVue(vm, key) {
	var ctx = vm._vuebackbone[key];

	if (ctx) {
		ctx.bb.off(null, ctx.onchange);
		ctx.onreset && ctx.bb.off(null, ctx.onreset);

		// The VueBackbone Proxy could be deleted at this
		// point, and the handler to proxy new models, but
		// this would cause problems if multiple
		// Vue objects used the same Backbone model/collection

		//ctx.bb.off(null, vueBackboneProxy);
		//delete ctx.bb._vuebackbone_proxy;
	}
}

/**
 * Update Vue data object, at this point it will already be a function (not a hash)
 * This will make the underlying source of the collection/model reactive.
 */
function extendData(vm, key) {
	var origDataFn = vm.$options.data,
	    ctx = vm._vuebackbone[key],
	    value = rawSrc(ctx.bb),
	    dataKey = getDataKey(key);

	vm.$options.data = function () {
		var data = {},
		    origData = origDataFn ? origDataFn() : {};

		if (origData.hasOwnProperty(key)) {
			throw "VueBackbone: Property '" + key + "' mustn't exist within the Vue data already";
		}
		if (origData.hasOwnProperty(dataKey)) {
			throw "VueBackbone: Property '" + dataKey + "' mustn't exist within the Vue data already";
		}
		// shallow copy (just in case)
		Object.keys(origData).forEach(function (attr) {
			return data[attr] = origData[attr];
		});
		data[dataKey] = value;
		return data;
	};
}

/**
 * In the case proxies are disabled or computed accessor,
 * the Backbone instance is added to vm.$bb[key]
 *
 * Instance access will trigger, this._key (reactive) access, 
 * which means any computed values recompute.
 * In the case of Collections, the reason this is needed is that calculations in the
 * collection can work off the internal models arrays, which isn't the same as the rawSrc one
 * For Models, this access is important in the case the full model object is replaced,
 * it will ensure the computed value recomputes.
 */
function extendVm(vm, key) {
	var ctx = vm._vuebackbone[key],
	    dataKey = getDataKey(key);

	vm.$bb = vm.$bb || {};
	Object.defineProperty(vm.$bb, key, {
		get: function get() {
			var access = vm.$data[dataKey]; // eslint-disable-line no-unused-vars
			return ctx.bb;
		},
		set: function set(bb) {
			unbindBBFromVue(vm, key);
			ctx.bb = bb;
			vm.$data[dataKey] = rawSrc(bb);
			bindBBToVue(vm, key);
		}
	});
}

/**
 * Update Vue computed functions, this will provide a handy accessor (key)
 * for mapped models of a collection, or the mapped model directly.
 *
 * Computed (this.key) access will trigger, this._key (reactive) access, 
 * which means any computed values recompute.
 * In the case of Collections, the reason this is needed is that calculations in the
 * collection can work off the internal models arrays, which isn't the same as the rawSrc one
 * For Models, this access is important in the case the full model object is replaced,
 * it will ensure the computed value recomputes.
 */
function extendComputed(vm, key) {
	var ctx = vm._vuebackbone[key],
	    dataKey = getDataKey(key),
	    o = vm.$options;

	o.computed = o.computed || {};

	// In the case of conflict, don't add it
	if (!o.computed[key]) {
		o.computed[key] = {
			get: function get() {
				var access = vm.$data[dataKey]; // eslint-disable-line no-unused-vars
				return ctx.bb._vuebackbone_proxy;
			},
			set: function set(bb) {
				unbindBBFromVue(vm, key);
				vueBackboneProxy(bb);
				ctx.bb = bb;
				vm.$data[dataKey] = rawSrc(bb);
				bindBBToVue(vm, key);
			}
		};
	} else {
		console.warn("VueBackbone: Generated computed function '" + key + "' already exists within the Vue computed functions");
	}
}

/**
 * Setup Vue and BB instance during Vue creation.
 * At this point the validation/normalization has
 * occurred.
 */
function initBBAndVue(vm, key, bb, prop) {
	vm._vuebackbone[key] = { bb: bb };

	vueBackboneProxy(bb);
	if (!prop) {
		extendData(vm, key);
		if (opts.addComputed && opts.proxies) {
			extendComputed(vm, key);
		} else {
			extendVm(vm, key);
		}
	}
	bindBBToVue(vm, key);
}

/**
 * Vue Mixin with Global Handlers
 */
var vueBackboneMixin = {
	beforeCreate: function beforeCreate() {
		var vm = this,
		    bbopts = vm.$options.bb;
		if (bbopts) {
			if (typeof bbopts !== "function") {
				throw "VueBackbone: 'bb' initialization option must be a function";
			}
			bbopts = bbopts(); // remember, it's a function
			vm._vuebackbone = {};

			Object.keys(bbopts).forEach(function (key) {
				var bb = bbopts[key],
				    prop = false;

				// Detect Property
				if (bb.prop === true) {
					if (!vm.$options.propsData || !vm.$options.propsData[key]) {
						throw "VueBackbone: Missing Backbone object in Vue prop '" + key + "'";
					}
					bb = vm.$options.propsData[key];
					prop = true;
				}

				// If Proxy, retrieve original instance
				bb = bb._vuebackbone_original || bb;

				// Detect Model or Collection
				if (bb.on && (bb.attributes || bb.models)) {
					initBBAndVue(vm, key, bb, prop);
				} else {
					throw "VueBackbone: Unrecognized Backbone object in Vue instantiation (" + key + "), must be a Collection or Model";
				}
			});
		}
	},

	destroyed: function destroyed() {
		var vm = this,
		    ctx = vm._vuebackbone;
		if (ctx) {
			Object.keys(ctx).forEach(function (key) {
				return unbindBBFromVue(vm, key);
			});
		}
	}
};

/**
 * Maps an individual Backbone model, or an array of them, or an falsy value.
 * @returns either a hash of raw attributes, or the vue model proxy
 */
function mapBBModels(func) {
	if (opts.proxies) {
		return function () {
			var models = func.apply(this, arguments);
			return models && (models._vuebackbone_proxy || models.map(function (m) {
				return m._vuebackbone_proxy;
			})) || models;
		};
	} else {
		return function () {
			var models = func.apply(this, arguments);
			return models && (models.attributes || models.map(function (m) {
				return m.attributes;
			})) || models;
		};
	}
}

function install(Vue, options) {
	for (var key in options) {
		if (options.hasOwnProperty(key)) {
			opts[key] = options[key];
		}
	}
	Vue.mixin(vueBackboneMixin);
}

function original(bb) {
	return bb._vuebackbone_original || bb;
}

exports.default = {
	install: install,
	mapBBModels: mapBBModels,
	original: original
};

/***/ })
/******/ ]);
});