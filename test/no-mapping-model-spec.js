import Backbone from 'backbone'
import Vue from 'vue/dist/vue'
import VueBackbone from '../src/vue-backbone.js'
import $ from 'jquery'

Vue.use(VueBackbone);

describe('Unmapped Model', () => {

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

		let model = new Backbone.Model({name: 'itemA'});

		new Vue({
			el,
			bb: () => ({item: model}),
			template: '<div>{{ JSON.stringify(item) }}</div>',
			mounted() {
				expect($sandbox.html()).toBe('<div>{"name":"itemA"}</div>');
				done();
			}				
		});
	});

	it('should not provide access to Model Proxy via Vue computed hash', (done) => {

		let model = new Backbone.Model({name: 'itemA'});
		spyOn(console, 'error');
		console.error.calls.reset();

		new Vue({
			el,
			bb: () => ({item: model}),
			template: '<div>{{ JSON.stringify(item.has(\'name\')) }}</div>',
			mounted() {
				var errmsg = console.error.calls.mostRecent().args[0].message
					, expectation1 = 'item.has is not a function' // Chrome
					, expectation2 = 'undefined is not a function (evaluating \'item.has(\'name\')\')'; // PhantomJS

				expect(errmsg === expectation1 || errmsg === expectation2).toBeTruthy();
				done();
			}				
		});
	});

	describe('reactions for data access directly from template', () => {

		beforeEach(() => {
			template = '<div>{{ item.name }}</div>';
		});

		it('doesnt make new attributes reactive, therefore wont recognise them', (done) => {

			let model = new Backbone.Model();
			spyOn(console, 'warn');

			new Vue({
				el,
				template,
				bb: () => ({item: model}),
				mounted() {
					expect($sandbox.html()).toBe('<div></div>');
					model.set({name: 'itemA', value: 1});
					expect(console.warn).toHaveBeenCalledWith('VueBackbone: Adding new Model attributes after binding is not supported, provide defaults for all properties');
					setTimeout(done); // defer
				},
				updated() {
					fail('Vue should not have updated.');
				}
			});
		});

		it('accepts a model with defaults and reacts to changes', (done) => {

			let model = new (Backbone.Model.extend({
				defaults: {
					name: undefined,
					value: undefined
				}
			}))();

			new Vue({
				el,
				template,
				bb: () => ({item: model}),
				mounted() {
					expect($sandbox.html()).toBe('<div></div>');
					model.set({name: 'itemA', value: 1});
				},
				updated() {
					expect($sandbox.html()).toBe('<div>itemA</div>');
					done();					
				}
			});
		});

		it('reacts to model replacement', (done) => {

			let model = new Backbone.Model({name: 'itemA', value: undefined});

				new Vue({
					el,
					template,
					bb: () => ({item: model}),
					mounted() {
						expect($sandbox.html()).toBe('<div>itemA</div>');
						this.$bb.item = new Backbone.Model({name: 'allNew', value: 1});
					},
					updated() {
						expect($sandbox.html()).toBe('<div>allNew</div>');
						done();					
					}
				});
		});

	});

	
	it('components and properties wont work with unmapped models', (done) => {

		spyOn(console, 'error');

		let model = new Backbone.Model({name: 'itemA', value: undefined});

		Vue.component('item', {
			props: ['model'],
			bb: () => ({model: {prop: true}}),
			template: '<div>{{ model.name }}</div>'
		});

		new Vue({
			el,
			template: '<p><item :model="item"/></p>',
			bb: () => ({item: model}),
			mounted() {
				expect(console.error).toHaveBeenCalledWith('VueBackbone: Unrecognized Backbone object in Vue instantiation (model), must be a Collection or Model');
				done();
			}
		});

	});

});