/**********************************************************************************
* Vue Components
**********************************************************************************/

var componentTemplates = [
	"<span>{{ value }}, {{ model.getPrecision() }}, </span>",
	"<span>{{ model.get('value') }}, {{ model.getPrecision() }}, </span>",
	"<span>{{ model.get('value') }}, {{ getPrecision }}, </span>",
	"<span>{{ model.value }}, {{ model.getPrecision() }}, </span>"
];

var changeValueMethods = [
	function() {
		this.value = genVal();
	},
	function() {
		this.model.set("value", genVal());
	},
	function() {
		this.model.set("value", genVal());
	},
	function() {
		this.model.value = genVal();
	}
];

Vue.component("test-comp-a", {
	props: ["model"],

	// Model data mirrored in Vue data
	data: function() {
		return { value: undefined };
	},

	template: componentTemplates[0],
	methods: { changeValue: changeValueMethods[0] },
	created: function() {
		var vm = this;

		function sync() {
			vm.unsync && vm.unsync();
			vm.unsync = function() {};

			Object.keys(vm.$data).forEach(function(key) {
				vm[key] = vm.model.get(key);
				// setup two-way sync between
				// the vm and the Backbone model
				var unwatch = vm.$watch(key, function(val) {
					vm.model.set(key, val);
				});
				var syncedModel = vm.model, onchange = function(model, value) {
					vm[key] = value;
				}
				syncedModel.on("change:" + key, onchange);

				// Unfortunate unsync complexity :(
				vm.unsync = _.compose(vm.unsync, function() {
					unwatch();
					syncedModel.off("change:" + key, onchange);
				});
			});
		}

		sync();
		vm.$watch('model', sync); // resync if the model changes
	},
	updated: function() {
		this.$emit('updated');
	}
});

Vue.component("test-comp-b", {
	props: ["model"],

	template: componentTemplates[1],
	methods: { changeValue: changeValueMethods[1] },
	updated: function() {
		this.$emit('updated');
	}
});

Vue.component("test-comp-c", {
	props: ["model"],
	bb: function() {
		return { model: { prop: true } };
	},
	template: componentTemplates[2],
	methods: { changeValue: changeValueMethods[2] },
	computed: {
		getPrecision: function() {
			return this.model.getPrecision();
		}
	},
	updated: function() {
		this.$emit('updated');
	}
});

Vue.component("test-comp-d", {
	props: ["model"],
	bb: function() {
		return { model: { prop: true } };
	},
	template: componentTemplates[3],
	methods: { changeValue: changeValueMethods[3] },
	updated: function() {
		this.$emit('updated');
	}
});
