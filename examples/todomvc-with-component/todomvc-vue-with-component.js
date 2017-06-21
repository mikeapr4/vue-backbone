// Install Plugin
Vue.use(VueBackbone);

window.onload = function() {
	/**
	 * Vue instance based on the Vue.js TodoMVC example
	 * https://github.com/tastejs/todomvc/tree/master/examples/vue
	 */

	Vue.component("todo", {
		template: "#todo-template",

		props: ["model"],

		bb: function() {
			return {
				model: { prop: true }
			};
		},

		data: function() {
			return {
				editing: false
			};
		},

		methods: {
			removeTodo: function() {
				this.model.destroy();
			},

			editTodo: function() {
				this.beforeEditCache = this.model.title;
				this.editing = true;
			},

			doneEdit: function() {
				if (!this.editing) {
					return;
				}
				this.editing = false;
				this.model.title = this.model.title.trim();
				if (!this.model.title) {
					this.removeTodo();
				}
			},

			cancelEdit: function() {
				this.editing = false;
				this.model.title = this.beforeEditCache;
			}
		},

		// a custom directive to wait for the DOM to be updated
		// before focusing on the input field.
		// http://vuejs.org/guide/custom-directive.html
		directives: {
			"todo-focus": function(el, binding) {
				if (binding.value) {
					el.focus();
				}
			}
		}
	});

	var app = new Vue({
		// Vue-Backbone initial options
		bb: function() {
			return {
				todos: todos
			};
		},

		// app initial state
		data: {
			newTodo: "",
			visibility: "all"
		},

		// computed properties
		// http://vuejs.org/guide/computed.html
		computed: {
			// Runs a function on the collection based on
			// visibility, as this function returns an array
			// of models, mapBBModels is used to provide
			// enhanced model objects
			filteredTodos: VueBackbone.mapBBModels(function() {
				return this.todos[this.visibility]();
			}),

			remaining: function() {
				return this.todos.active().length;
			},

			allDone: {
				get: function() {
					return this.remaining === 0;
				},
				set: function(value) {
					// Making use of built-in Backbone Collection/Model functionality
					this.todos.each(function(todo) {
						todo.set("completed", value);
					});
				}
			}
		},

		filters: {
			pluralize: function(n) {
				return n === 1 ? "item" : "items";
			}
		},

		methods: {
			addTodo: function() {
				var value = this.newTodo && this.newTodo.trim();
				if (!value) {
					return;
				}
				this.todos.create({
					title: value,
					completed: false,
					order: this.todos.nextOrder()
				});
				this.newTodo = "";
			},

			removeCompleted: function() {
				_.invoke(this.todos.completed(), "destroy");
			}
		}
	});

	// handle routing
	function onHashChange() {
		var visibility = window.location.hash.replace(/#\/?/, "");
		if (todos[visibility]) {
			app.visibility = visibility;
		} else {
			window.location.hash = "";
			app.visibility = "all";
		}
	}

	window.addEventListener("hashchange", onHashChange);
	onHashChange();

	// mount
	app.$mount(".todoapp");
};
