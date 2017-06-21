import Backbone from "backbone";
import Vue from "vue/dist/vue";
import VueBackbone from "../src/vue-backbone.js";
import $ from "jquery";

Vue.use(VueBackbone);

describe("Model", () => {
	let $sandbox, el, template;

	beforeEach(() => {
		$sandbox = $("<div><span></span></div>");
		el = $sandbox.children()[0];
	});

	it("should provide access to Model Proxy via Vue computed hash", done => {
		const model = new Backbone.Model({ name: "itemA" });

		new Vue({
			el,
			bb: () => ({ item: model }),
			template:
				"<div>{{ JSON.stringify(item.toJSON()) }}|{{ item.name }}</div>",
			mounted() {
				expect($sandbox.html()).toBe(
					'<div>{"name":"itemA"}|itemA</div>'
				);
				done();
			}
		});
	});

	it("should provide access to conflicted properties with prefix", done => {
		const model = new Backbone.Model({ set: "itemA" });

		new Vue({
			el,
			bb: () => ({ item: model }),
			template: "<div>{{ item.$set }}</div>",
			mounted() {
				expect($sandbox.html()).toBe("<div>itemA</div>");
				done();
			}
		});
	});

	it("should proxy the Model ID for specified idAttribute", done => {
		const Model = Backbone.Model.extend({ idAttribute: "name" }),
			model = new Model({ name: "itemA" });

		new Vue({
			el,
			bb: () => ({ item: model }),
			template: "<div>{{ item.id }}</div>",
			mounted() {
				expect($sandbox.html()).toBe("<div>itemA</div>");
				done();
			}
		});
	});

	it("should proxy the Model ID for default idAttribute", done => {
		const model = new Backbone.Model({ id: "A", name: "itemA" });

		new Vue({
			el,
			bb: () => ({ item: model }),
			template: "<div>{{ item.id }}</div>",
			mounted() {
				expect($sandbox.html()).toBe("<div>A</div>");
				done();
			}
		});
	});

	describe("reactions for data access directly from template", () => {
		beforeEach(() => {
			template =
				"<div :class=\"{ hasValue: item.has('value') }\">{{ item.name }}</div>";
		});

		it("doesnt make new attributes reactive, therefore wont recognise them", done => {
			const model = new Backbone.Model();
			spyOn(console, "warn");

			new Vue({
				el,
				template,
				bb: () => ({ item: model }),
				mounted() {
					expect($sandbox.html()).toBe('<div class=""></div>');
					model.set({ name: "itemA", value: 1 });
					expect(console.warn).toHaveBeenCalledWith(
						"VueBackbone: Adding new Model attributes after binding is not supported, provide defaults for all properties"
					);
					setTimeout(done); // defer
				},
				updated() {
					fail("Vue should not have updated.");
				}
			});
		});

		it("accepts a model with defaults and reacts to changes", done => {
			const model = new (Backbone.Model.extend({
				defaults: {
					name: undefined,
					value: undefined
				}
			}))();

			new Vue({
				el,
				template,
				bb: () => ({ item: model }),
				mounted() {
					expect($sandbox.html()).toBe('<div class=""></div>');
					model.set({ name: "itemA", value: 1 });
				},
				updated() {
					expect($sandbox.html()).toBe(
						'<div class="hasValue">itemA</div>'
					);
					done();
				}
			});
		});

		it("will trigger Backbone events for Vue originating changes", done => {
			const model = new (Backbone.Model.extend({
				defaults: {
					name: undefined,
					value: undefined
				}
			}))();

			model.on("change:name", done);

			new Vue({
				el,
				template,
				bb: () => ({ item: model }),
				mounted() {
					expect($sandbox.html()).toBe('<div class=""></div>');
					this.item.name = "abc";
				}
			});

			// Test times out if it fails
		});

		it("reacts to model replacement", done => {
			const model = new Backbone.Model({
				name: "itemA",
				value: undefined
			});

			new Vue({
				el,
				template,
				bb: () => ({ item: model }),
				mounted() {
					expect($sandbox.html()).toBe('<div class="">itemA</div>');
					this.item = new Backbone.Model({
						name: "allNew",
						value: 1
					});
				},
				updated() {
					expect($sandbox.html()).toBe(
						'<div class="hasValue">allNew</div>'
					);
					done();
				}
			});
		});
	});

	describe("reactions for computed values derived from model logic", () => {
		let model, computed;

		beforeEach(() => {
			template =
				'<div :class="{ hasValue: computedHasValue }">{{ itemName }}</div>';
			model = new Backbone.Model({ name: "itemA", value: undefined });
			computed = {
				computedHasValue() {
					return this.item.has("value");
				},
				itemName() {
					return this.item.get("name");
				}
			};
		});

		it("accepts a model with defaults and reacts to changes", done => {
			model = new (Backbone.Model.extend({
				defaults: {
					name: undefined,
					value: undefined
				}
			}))();

			new Vue({
				el,
				template,
				bb: () => ({ item: model }),
				computed,
				mounted() {
					expect($sandbox.html()).toBe('<div class=""></div>');
					model.set({ name: "itemA", value: 1 });
				},
				updated() {
					expect($sandbox.html()).toBe(
						'<div class="hasValue">itemA</div>'
					);
					done();
				}
			});
		});

		it("reacts to model replacement", done => {
			new Vue({
				el,
				template,
				bb: () => ({ item: model }),
				computed,
				mounted() {
					expect($sandbox.html()).toBe('<div class="">itemA</div>');
					this.item = new Backbone.Model({
						name: "allNew",
						value: 1
					});
				},
				updated() {
					expect($sandbox.html()).toBe(
						'<div class="hasValue">allNew</div>'
					);
					done();
				}
			});
		});

		it("does not react to reset, when computed does not use model", function(
			done
		) {
			new Vue({
				el,
				template,
				bb: () => ({ item: model }),
				computed: {
					computedHasValue() {
						return true;
					},
					itemName() {
						return "itemA";
					}
				},
				mounted() {
					expect($sandbox.html()).toBe(
						'<div class="hasValue">itemA</div>'
					);
					this.item = new Backbone.Model({
						name: "allNew",
						value: 1
					});
					setTimeout(done); // defer
				},
				updated() {
					fail("Vue should not have updated.");
				}
			});
		});
	});

	describe("components and properties", () => {
		let model, component;

		beforeEach(() => {
			component = callback => ({
				props: ["model"],
				bb: () => ({ model: { prop: true } }),
				template:
					"<div :class=\"{ hasValue: model.has('value') }\">{{ model.name }}</div>",
				updated: callback
			});

			template = '<p><item :model="item"/></p>';
			model = new Backbone.Model({ name: "itemA", value: undefined });
		});

		it("reacts to changes", done => {
			Vue.component(
				"item",
				component(() => {
					expect($sandbox.html()).toBe(
						'<p><div class="hasValue">itemA</div></p>'
					);
					done();
				})
			);

			new Vue({
				el,
				template,
				bb: () => ({ item: model }),
				mounted() {
					expect($sandbox.html()).toBe(
						'<p><div class="">itemA</div></p>'
					);
					model.set({ name: "itemA", value: 1 });
				},
				updated() {
					fail("Parent vue shouldnt update");
				}
			});
		});
	});
});
