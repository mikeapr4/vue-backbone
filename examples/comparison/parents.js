/**********************************************************************************
* Vue Classes
**********************************************************************************/

var vueTemplates = [
	'<div><test-comp-a v-for="model in list" :model="model" :key="model.id"/>' +
		"<b>{{ collection.totalValue() }}, {{ evenModels.length }}, {{ oddModels.length }}</b></div>",

	'<div><test-comp-b v-for="model in list" :model="model" :key="model.id"/>' +
		"<b>{{ collection.totalValue() }}, {{ evenModels.length }}, {{ oddModels.length }}</b></div>",

	'<div><test-comp-c v-for="model in list" :model="model" :key="model.id"/>' +
		"<b>{{ collectionObj.totalValue() }}, {{ evenModels.length }}, {{ oddModels.length }}</b></div>",

	'<div><test-comp-d v-for="model in collection" :model="model" :key="model.id"/>' +
		"<b>{{ collection.totalValue() }}, {{ evenModels.length }}, {{ oddModels.length }}</b></div>"
];

var computed = [
	{
		collection: function() {
			return this.$options.collection;
		},
		evenModels: function() {
			return this.$options.collection.filter(function(model) {
				return !(model.get("value") % 2);
			});
		},
		oddModels: function() {
			return this.$options.collection.oddModels().map(function(m) {
				return m.attributes;
			});
		}
	},
	{
		list: function() {
			return this.collection.models;
		},
		evenModels: function() {
			return this.collection.filter(function(model) {
				return !(model.get("value") % 2);
			});
		},
		oddModels: function() {
			return this.collection.oddModels();
		}
	},
	{
		list: function() {
			return this.$bb.collection.models;
		},
		collectionObj: function() {
			return this.$bb.collection;
		},
		evenModels: VueBackbone.mapBBModels(function() {
			// explicit mapping to attributes
			return this.$bb.collection.filter(function(model) {
				return !(model.get("value") % 2);
			});
		}),
		oddModels: VueBackbone.mapBBModels(function() {
			// explicit mapping to attributes
			return this.$bb.collection.oddModels();
		})
	},
	{
		evenModels: function() {
			return this.collection.filter(function(model) {
				return !(model.get("value") % 2);
			}); // native array (no proxy mapping necessary)
		},
		oddModels: VueBackbone.mapBBModels(function() {
			// explicit proxy mapping needed
			return this.collection.oddModels();
		})
	}
];

var TestVueA = Vue.extend({
	template: vueTemplates[0],
	data: function() {
		return { list: [] };
	},
	computed: computed[0],
	methods: {
		changeCollection: function(coll) {			
			var vm = this;

			vm.unsync && vm.unsync();

			vm.$options.collection = coll;
			vm.list = coll.toArray();
			var onadd = function(model) {
				vm.list.push(model);
			};
			var onremove = function(model) {
				var pos = vm.list.indexOf(model);
				vm.list.splice(pos, 1);
			};
			var onreset = function() {
				vm.list = coll.toArray();
			};
			coll.on("add", onadd);
			coll.on("remove", onremove);
			coll.on("reset sort", onreset);

			vm.unsync = function() {
				coll.off("add", onadd);
				coll.off("remove", onremove);
				coll.off("reset sort", onreset);
			};
		}
	},
	created: function() {
		this.changeCollection(this.$options.collection);
	}
});

var TestVueB = Vue.extend({
	template: vueTemplates[1],
	computed: computed[1],
	methods: {
		changeCollection: function(coll) {
			this.collection = coll;
		}
	}
});

var TestVueC = Vue.extend({
	template: vueTemplates[2],
	computed: computed[2],
	methods: {
		changeCollection: function(coll) {
			this.$bb.collection = coll;
		}
	}
});

var TestVueD = Vue.extend({
	template: vueTemplates[3],
	computed: computed[3],
	methods: {
		changeCollection: function(coll) {
			this.collection = coll;
		}
	}
});
