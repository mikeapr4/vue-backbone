window.addEventListener("load", function() {
	/**********************************************************************************
	* Functionality under Test
	**********************************************************************************/

	initTimings(
		[
			"Creation",
			"Mount",
			"New Row",
			"Remove Row",
			"Replace Collection",
			"Reset Collection",
			"Model Change"
		],
		["A", "B", "C", "D"]
	);

	function genericSingleRun(
		beforeOp,
		vueInstance,
		instanceOpts,
		addOp,
		removeOp,
		changeCollectionOp,
		replaceCollectionOp,
		changeValueOp,
		resolve
	) {
		var collection = new TestCollection(JSON.parse(collectionJson)),
			collection2 = new TestCollection(JSON.parse(collection2Json)),
			child;

		// Run any setup
		beforeOp && beforeOp();

		mark();

		var step5 = function() {
			var vm = this;
			// var row = $(vm.$el).text();
			// var model = vm.model.get('value') + ', ' + vm.model.getPrecision() + ', ';
			// console.assert(row === model);
			mark("Model Change");
			vm.$parent.$destroy();
			setTimeout(resolve);
		},
			step4 = function() {
				var vm = this;
				// var firstRow = $(vm.$el).find('span').first().text();
				// var firstModel = collection2.first().get('value') + ', ' + collection2.first().getPrecision() + ', ';
				// console.assert(firstRow === firstModel);
				mark("Reset Collection");
				nextUpdate = function() {};
				child = vm.$children[0];
				child.$on("updated", step5);
				changeValueOp(child);
			},
			step3 = function() {
				var vm = this;
				// var firstRow = vm.$children[0].$el.innerText;
				// var firstModel = collection2.first().get('value') + ', ' + collection2.first().getPrecision() + ', ';
				// console.assert(firstRow === firstModel);
				mark("Replace Collection");
				nextUpdate = step4;
				replaceCollectionOp(vm, JSON.parse(collectionJson));
			},
			step2 = function() {
				var vm = this,
					rows = $(vm.$el).find("span").length;
				// Update (may) fires twice during this operation (2-way sync)
				if (rows === 1001) {
					return;
				}
				mark("Remove Row");
				nextUpdate = step3;
				changeCollectionOp(vm, collection2);
			},
			step1 = function() {
				var vm = this;
				// console.assert($(vm.$el).find('span').length == 1001);
				mark("New Row");
				nextUpdate = step2;
				removeOp(vm);
			},
			nextUpdate = step1;

		new vueInstance(
			_.extend(
				{
					el: $("<div><span></span></div>").children()[0],

					beforeMount: function() {
						mark("Creation");
					},
					mounted: function() {
						var vm = this;
						// console.assert($(vm.$el).find('span').length == 1000);
						mark("Mount");
						addOp(vm);
					},
					updated: function() {
						nextUpdate.apply(this);
					}
				},
				instanceOpts(collection)
			)
		);
	}

	var singleRunA = genericSingleRun.bind(
		null,
		null,
		TestVueA,
		function(collection) {
			return { collection: collection };
		},
		function(vm) {
			vm.$options.collection.add({ value: genVal() });
		},
		function(vm) {
			vm.$options.collection.remove(vm.$options.collection.first());
		},
		function(vm, coll) {
			vm.changeCollection(coll);
		},
		function(vm, data) {
			vm.$options.collection.reset(data);
		},
		function(child) {
			child.changeValue();
		}
	);

	var singleRunB = genericSingleRun.bind(
		null,
		null,
		TestVueB,
		function(collection) {
			return { data: { collection: collection } };
		},
		function(vm) {
			vm.collection.add({ value: genVal() });
		},
		function(vm) {
			vm.collection.remove(vm.collection.first());
		},
		function(vm, coll) {
			vm.changeCollection(coll);
		},
		function(vm, data) {
			vm.collection.reset(data);
		},
		function(child) {
			child.changeValue();
		}
	);

	var singleRunC = genericSingleRun.bind(
		null,
		function() {
			toggleProxies(false);
		},
		TestVueC,
		function(collection) {
			return {
				bb: function() {
					return { collection: collection };
				}
			};
		},
		function(vm) {
			vm.$bb.collection.add({ value: genVal() });
		},
		function(vm) {
			vm.$bb.collection.remove(vm.$bb.collection.first());
		},
		function(vm, coll) {
			vm.changeCollection(coll);
		},
		function(vm, data) {
			vm.$bb.collection.reset(data);
		},
		function(child) {
			child.changeValue();
		}
	);

	var singleRunD = genericSingleRun.bind(
		null,
		function() {
			toggleProxies(true);
		},
		TestVueD,
		function(collection) {
			return {
				bb: function() {
					return { collection: collection };
				}
			};
		},
		function(vm) {
			vm.collection.add({ value: genVal() });
		},
		function(vm) {
			vm.collection.remove(VueBackbone.original(vm.collection.first()));
		},
		function(vm, coll) {
			vm.changeCollection(coll);
		},
		function(vm, data) {
			vm.collection.reset(data);
		},
		function(child) {
			child.changeValue();
		}
	);

	$('<div><a href="#">Start</a></div>')
		.click(function(e) {
			e.preventDefault();
			$(e.target).remove();

			addTask("Populating Collections")()
				.then(populateCollections)
				.then(addTask("Cycle A"))
				.then(cycle(singleRunA, "A"))
				.then(addTask("Cycle B"))
				.then(cycle(singleRunB, "B"))
				.then(addTask("Cycle C"))
				.then(cycle(singleRunC, "C"))
				.then(addTask("Cycle D"))
				.then(cycle(singleRunD, "D"))
				.then(populateResults);
		})
		.appendTo($msgs);
});
