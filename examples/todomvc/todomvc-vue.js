// Install Plugin
Vue.use(VueBackbone);

window.onload = function() {
	/**
	 * Vue instance basic logic taken from the Vue.js TodoMVC example
	 * https://github.com/tastejs/todomvc/tree/master/examples/vue
	 */

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
			editedTodo: null,
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

			removeTodo: function(todo) {
				todo.destroy();
			},

			editTodo: function(todo) {
				this.beforeEditCache = todo.title;
				this.editedTodo = todo;
			},

			doneEdit: function(todo) {
				if (!this.editedTodo) {
					return;
				}
				this.editedTodo = null;
				todo.title = todo.title.trim();
				if (!todo.title) {
					this.removeTodo(todo);
				}
			},

			cancelEdit: function(todo) {
				this.editedTodo = null;
				todo.title = this.beforeEditCache;
			},

			removeCompleted: function() {
				_.invoke(this.todos.completed(), "destroy");
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
