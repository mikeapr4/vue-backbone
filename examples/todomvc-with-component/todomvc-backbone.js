/**
 * Model and Collection taken from the Backbone TodoMVC example
 * https://github.com/tastejs/todomvc/tree/master/examples/backbone
 */

var Todo = Backbone.Model.extend({
	// Default attributes for the todo
	// and ensure that each todo created has `title` and `completed` keys.
	defaults: {
		title: "",
		completed: false
	},

	initialize: function() {
		this.on("change", function() {
			this.save();
		});
	},

	// Toggle the `completed` state of this todo item.
	toggle: function() {
		this.save({
			completed: !this.get("completed")
		});
	}
});

var Todos = Backbone.Collection.extend({
	// Reference to this collection's model.
	model: Todo,

	// Save all of the todo items under this example's namespace.
	localStorage: new Backbone.LocalStorage("todos-backbone"),

	// Filter down the list of all todo items that are finished.
	completed: function() {
		return this.where({ completed: true });
	},

	// Filter down the list to only todo items that are still not finished.
	active: function() {
		return this.where({ completed: false });
	},

	all: function() {
		return this.models;
	},

	// We keep the Todos in sequential order, despite being saved by unordered
	// GUID in the database. This generates the next order number for new items.
	nextOrder: function() {
		return this.length ? this.last().get("order") + 1 : 1;
	},

	// Todos are sorted by their original insertion order.
	comparator: "order"
});

// Create our global collection of **Todos**.
var todos = new Todos();
todos.fetch();
