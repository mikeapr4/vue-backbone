import Backbone from 'backbone'
import Vue from 'vue/dist/vue'
import VueBackbone, { mapBBModels } from '../src/vue-backbone.js'
import $ from 'jquery'

Vue.use(VueBackbone);

describe('No Model-mapping Collection', () => {

	let $sandbox, el, template;

	beforeAll(() => {
		// Hack to reset the options inside VueBackbone after installation
		VueBackbone.install(
			{mixin: () => {}},
			{proxies: false}
		);		
	});

	afterAll(() => {
		VueBackbone.install(
			{mixin: () => {}},
			{proxies: true}
		);		
	});

	beforeEach(() => {
		$sandbox = $('<div><span></span></div>');
		el = $sandbox.children()[0];
	});

	it('should provide raw Backbone data access in Vue data object', (done) => {

			let collection = new Backbone.Collection([{name: 'itemA'}]);

			new Vue({
				el,
				bb: () => ({list: collection}),
				template: '<div>{{ JSON.stringify(list) }}</div>',
				mounted() {
					expect($sandbox.html()).toBe('<div>[{"name":"itemA"}]</div>');
					done();
				}				
			});
	});

	it('should not provide access to array of Model Proxies via Vue computed hash', (done) => {

		let collection = new Backbone.Collection([{name: 'itemA'}]);
		spyOn(console, 'error');
		console.error.calls.reset();

		new Vue({
			el,
			bb: () => ({list: collection}),
			template: '<div>{{ list[0].has(\'name\') }}</div>',
			mounted() {
				var errmsg = console.error.calls.mostRecent().args[0].message
					, expectation1 = 'list[0].has is not a function' // Chrome
					, expectation2 = 'undefined is not a function (evaluating \'list[0].has(\'name\')\')'; // PhantomJS

				expect(errmsg === expectation1 || errmsg === expectation2).toBeTruthy();
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
						this.$bb.list = new Backbone.Collection([{name: 'allNew'}]);
					},
					updated() {
						expect($sandbox.html()).toBe('<div class="hasItems">allNew</div>');
						done();					
					}
				});
		});

	});

	
	it('mapped responses in computed values', (done) => {

		let collection = new Backbone.Collection([{name: 'itemA'}]);

		new Vue({
			el,
			template: '<div>{{ firstItem && firstItem.name }}, {{ validItems[0] && validItems[0].name }}</div>',
			bb: () => ({list: collection}),
			computed: {
				firstItem: mapBBModels(function() {  // manual mapping required still (model instances converted to model data)
					return this.$bb.list.first();
				}),
				validItems: mapBBModels(function() {
					return this.$bb.list.reject(model => !model.has('name'));
				})
			},
			mounted() {
				expect($sandbox.html()).toBe('<div>itemA, itemA</div>');
				collection.remove(collection.first());
			},
			updated() {
				expect($sandbox.html()).toBe('<div>, </div>');
				done();					
			}
		});				

	});


});