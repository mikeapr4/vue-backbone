/**********************************************************************************
* Backbone Classes
**********************************************************************************/

function genVal() {
	return Math.floor(Math.random() * 100000);
}

var TestModel = Backbone.Model.extend({
	defaults: { value: undefined },
	getPrecision: function() {
		return this.has("value") ? String(this.get("value")).length : 0;
	}
});

var TestCollection = Backbone.Collection.extend({
	model: TestModel,
	totalValue: function() {
		return this.reduce(function(memo, model) {
			return memo + model.get("value");
		}, 0);
	},
	oddModels: function() {
		return this.filter(function(model) {
			return model.get("value") % 2;
		}); // within the collection this won't be proxy mapped
	},
	comparator: 'value' // necessary for Reactive Backbone
});

var collectionJson, collection2Json;

function populateCollections() {
	return new Promise(function(resolve) {
		var testCollection = new TestCollection();
		for (var i = 0; i < 1000; i++) {
			testCollection.add({ value: genVal() });
		}
		collectionJson = JSON.stringify(testCollection.toJSON());

		testCollection = new TestCollection();
		for (var i = 0; i < 1000; i++) {
			testCollection.add({ value: genVal() });
		}
		collection2Json = JSON.stringify(testCollection.toJSON());

		completeTask(resolve);
	});
}

