import Backbone from 'backbone'
import Vue from 'vue/dist/vue'
import VueBackbone, { mapBBModels } from '../src/vue-backbone.js'
import $ from 'jquery'

Vue.use(VueBackbone);

describe('Collection', () => {

	let $sandbox, el, template;

	beforeEach(() => {
		$sandbox = $('<div><span></span></div>');
		el = $sandbox.children()[0];
	});

	it('should provide access to array of Model Proxies via Vue computed hash', (done) => {

			let collection = new Backbone.Collection([{name: 'itemA'}]);

			new Vue({
				el,
				bb: () => ({list: collection}),
				template: '<div>{{ JSON.stringify(list[0].toJSON()) }}|{{ list[0].name }}</div>',
				mounted() {
					expect($sandbox.html()).toBe('<div>{"name":"itemA"}|itemA</div>');
					done();
				}				
			});
	});

	describe('reactions for data access directly from template', () => {

		beforeEach(() => {
			template = '<div :class="{ hasItems: list.length }">{{ list.length ? list[list.length - 1].name : "empty!" }}</div>';
		});

		it('accepts empty collection, and reacts to additional row', (done) => {

				let collection = new Backbone.Collection();

				new Vue({
					el,
					template,
					bb: () => ({list: collection}),
					mounted() {
						expect($sandbox.html()).toBe('<div class="">empty!</div>');
						collection.add({name: 'itemA'});
					},
					updated() {
						expect($sandbox.html()).toBe('<div class="hasItems">itemA</div>');
						done();					
					}
				});
		});

		it('accepts a collection with row, and reacts to removed row', (done) => {

				let collection = new Backbone.Collection([{name: 'itemA'}]);

				new Vue({
					el,
					data: {a: 1},
					template,
					bb: () => ({list: collection}),
					mounted() {
						expect($sandbox.html()).toBe('<div class="hasItems">itemA</div>');
						collection.remove(collection.first());
					},
					updated() {
						expect($sandbox.html()).toBe('<div class="">empty!</div>');
						done();					
					}
				});
		});

		it('reacts to collection replacement', (done) => {

				let collection = new Backbone.Collection([{name: 'itemA'}]);

				new Vue({
					el,
					data: {a: 1},
					template,
					bb: () => ({list: collection}),
					mounted() {
						expect($sandbox.html()).toBe('<div class="hasItems">itemA</div>');
						this.list = new Backbone.Collection([{name: 'allNew'}]);
					},
					updated() {
						expect($sandbox.html()).toBe('<div class="hasItems">allNew</div>');
						done();					
					}
				});
		});

	});

	
	describe('reactions for computed values derived from collection logic', () => {

			let collection, computed;

			beforeEach(() => {
				// Also testing the auto-generated computed function $$list
				template = '<div :class="{ hasItems: computedHasItems }">{{ firstName }}, {{ list.length }}</div>';
				collection = new Backbone.Collection([{name: 'itemA'}]);
				computed = {
					computedHasItems() {
						return !this.list.isEmpty();
					},
					firstName() {
						return this.computedHasItems ? this.list.first().get('name') : 'empty!';
					}
				}
			});

			it('reacts to removal', function(done) {
				new Vue({
					el,
					template,
					bb: () => ({list: collection}),
					computed,
					mounted() {
						expect($sandbox.html()).toBe('<div class="hasItems">itemA, 1</div>');
						collection.remove(collection.first());
					},
					updated() {
						expect($sandbox.html()).toBe('<div class="">empty!, 0</div>');
						done();					
					}
				});				
			});

			it('reacts to reset', function(done) {
				new Vue({
					el,
					template,
					bb: () => ({list: collection}),
					computed,
					mounted() {
						expect($sandbox.html()).toBe('<div class="hasItems">itemA, 1</div>');
						collection.reset([{name: 'itemB'}]);
					},
					updated() {
						expect($sandbox.html()).toBe('<div class="hasItems">itemB, 1</div>');
						done();					
					}
				});				
			});

			it('reacts to sort', function(done) {
				collection.reset([{name: 'itemB'}, {name: 'itemA'}]);
				collection.comparator = 'name';

				new Vue({
					el,
					template,
					bb: () => ({list: collection}),
					computed,
					mounted() {
						expect($sandbox.html()).toBe('<div class="hasItems">itemB, 2</div>');
						collection.sort();
					},
					updated() {
						expect($sandbox.html()).toBe('<div class="hasItems">itemA, 2</div>');
						done();					
					}
				});				
			});

			it('reacts to replace', function(done) {
				new Vue({
					el,
					template,
					bb: () => ({list: collection}),
					computed,
					mounted() {
						expect($sandbox.html()).toBe('<div class="hasItems">itemA, 1</div>');
						this.list = new Backbone.Collection([{name: 'allNew'}]);
					},
					updated() {
						expect($sandbox.html()).toBe('<div class="hasItems">allNew, 1</div>');
						done();					
					}
				});				
			});

			it('does not react to reset, when computed does not use collection', function(done) {
				
				spyOn(console, 'warn');

				new Vue({
					el,
					template,
					bb: () => ({list: collection}),
					computed: {
						computedHasItems() { return true; },
						firstName() { return 'itemA'; },
						list() { return [{}]; }
					},
					mounted() {

						// Computed value exists prior to VueBackbone integration, so we assert
						// the warning too.
						expect(console.warn).toHaveBeenCalledWith('VueBackbone: Generated computed function \'list\' already exists within the Vue computed functions');

						expect($sandbox.html()).toBe('<div class="hasItems">itemA, 1</div>');
						collection.reset([{name: 'itemB'}]);
						setTimeout(done); // defer
					},
					updated() {
						fail('Vue should not have updated.');
					}
				});				
			});

	});

	it('mapped responses in computed values with auto mapped', (done) => {

		let collection = new Backbone.Collection([{name: 'itemA'}]);

		new Vue({
			el,
			template: '<div>{{ firstItem && firstItem.has(\'name\') && firstItem.name }}, {{ validItems[0] && validItems[0].isEmpty() }}</div>',
			bb: () => ({list: collection}),
			computed: {
				firstItem() {
					return this.list.first(); // proxy automatically maps the models for this
				},
				validItems() {
					return this.list.reject(model => !model.has('name')); // proxy automatically maps the models for this
				}
			},
			mounted() {
				expect($sandbox.html()).toBe('<div>itemA, false</div>');
				collection.remove(collection.first());
			},
			updated() {
				expect($sandbox.html()).toBe('<div>, </div>');
				done();					
			}
		});				

	});

	it('mapped responses in computed values with explicit mapped', (done) => {

		let collection = new Backbone.Collection([{name: 'itemA'}]);

		new Vue({
			el,
			template: '<div>{{ firstItem && firstItem.has(\'name\') && firstItem.name }}, {{ validItems[0] && validItems[0].isEmpty() }}</div>',
			bb: () => ({list: collection}),
			computed: {
				firstItem: mapBBModels(function() {
					return VueBackbone.original(this.list).first(); // use original object to access function without auto mapping
				}),
				validItems: mapBBModels(function() {
					return VueBackbone.original(this.list).reject(model => !model.has('name'));
				})
			},
			mounted() {
				expect($sandbox.html()).toBe('<div>itemA, false</div>');
				collection.remove(collection.first());
			},
			updated() {
				expect($sandbox.html()).toBe('<div>, </div>');
				done();					
			}
		});				

	});

	describe('proxied collection functions', function() {

		afterAll(() => {
			// Hack to reset the options inside VueBackbone after installation
			VueBackbone.install(
				{mixin: () => {}},
				{simpleCollectionProxy: false}
			);		
		});		

		it('with auto-mapping of functions returning models', (done) => {

			let collection = new Backbone.Collection([{name: 'itemA'}]);

			new Vue({
				el,
				template: '<div>{{ list[0].itemA }}</div>',
				bb: () => ({list: collection}),
				mounted() {

					// Test array prototype functions (they accept proxy models parameters, and return proxy models)
					expect(this.list.indexOf(this.list[0])).toBe(0);
					expect(this.list.filter(function() { return true })[0]).toBe(this.list[0]);

					// Test Collection auto-mapped functions
					expect(this.list.at(0)).toBe(this.list[0]);
					expect(this.list.first()).toBe(this.list[0]);
					expect(this.list.toArray()[0]).toBe(this.list[0]);

					done();
				}
			});				

		});

		it('with no auto-mapping of functions returning models', (done) => {

			VueBackbone.install(
				{mixin: () => {}},
				{simpleCollectionProxy: true}
			);	

			let collection = new Backbone.Collection([{name: 'itemA'}]);

			new Vue({
				el,
				template: '<div>{{ list[0].itemA }}</div>',
				bb: () => ({list: collection}),
				mounted() {

					// Test Collection functions (unaltered)
					const originalModel = VueBackbone.original(this.list[0]);

					expect(this.list.indexOf(this.list[0])).toBe(-1);
					expect(this.list.filter(function() { return true })[0]).toBe(originalModel);

					expect(this.list.at(0)).toBe(originalModel);
					expect(this.list.first()).toBe(originalModel);
					expect(this.list.toArray()[0]).toBe(originalModel);

					done();
				}
			});				

		});

	});




});