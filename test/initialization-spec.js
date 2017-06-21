import Backbone from 'backbone'
import Vue from 'vue/dist/vue'
import VueBackbone from '../src/vue-backbone.js'
import $ from 'jquery'

Vue.use(VueBackbone);

describe('Initialization', () => {

	let $sandbox, el;

	beforeEach(() => {
		$sandbox = $('<div><span></span></div>');
		el = $sandbox.children()[0];
	});

	it('should allow Vue renders without any VueBackbone integration', (done) => {
			new Vue({
				el,
				data: {list: 1},
				template: '<div>{{ list }}</div>',
				mounted() {
					expect($sandbox.html()).toBe('<div>1</div>');
					done();
				}				
			});
	});

	it('should fail fatally where Vue data object contains attribute already for VueBackbone collection', (done) => {

			let collection = new Backbone.Collection();
			spyOn(console, 'error');

			new Vue({
				el,
				data: {list: 1},
				bb: () => ({list: collection}),
				template: '<div>{{ list }}</div>',
				mounted() {
					expect(console.error).toHaveBeenCalledWith('VueBackbone: Property \'list\' mustn\'t exist within the Vue data already');
					done();
				}				
			});
	});

	it('should fail fatally where Vue data object contains secret attribute already for VueBackbone collection', (done) => {

			let collection = new Backbone.Collection();
			spyOn(console, 'error');

			new Vue({
				el,
				data: {_list: 1},
				bb: () => ({list: collection}),
				template: '<div>{{ list }}</div>',
				mounted() {
					expect(console.error).toHaveBeenCalledWith('VueBackbone: Property \'_list\' mustn\'t exist within the Vue data already');
					done();
				}				
			});
	});

	it('should fail fatally where the bb options are not a function', (done) => {

			let collection = new Backbone.Collection();
			spyOn(console, 'error');

			new Vue({
				el,
				bb: {list: collection},
				template: '<div>{{ list }}</div>',
				mounted() {
					expect(console.error).toHaveBeenCalledWith('VueBackbone: \'bb\' initialization option must be a function');
					done();
				}				
			});
	});

	it('should fail fatally where a non-Backbone object is passed in the bb options', (done) => {

			spyOn(console, 'error');

			new Vue({
				el,
				bb: () => ({list: []}),
				template: '<div>{{ list }}</div>',
				mounted() {
					expect(console.error).toHaveBeenCalledWith('VueBackbone: Unrecognized Backbone object in Vue instantiation (list), must be a Collection or Model');
					done();
				}				
			});
	});

	it('should fail fatally where there is no Property for a bb option set to prop', (done) => {

			spyOn(console, 'error');

			new Vue({
				el,
				bb: () => ({list: {prop: true}}),
				template: '<div>{{ list }}</div>',
				mounted() {
					expect(console.error).toHaveBeenCalledWith('VueBackbone: Missing Backbone object in Vue prop \'list\'');
					done();
				}				
			});
	});

	it('should work when no Vue data object was specified', (done) => {

			let collection = new Backbone.Collection();

			new Vue({
				el,
				bb: () => ({list: collection}),
				template: '<div>{{ list }}</div>',
				mounted() {
					expect($sandbox.html()).toBe('<div>[]</div>');
					done();
				}				
			});
	});

	it('should correctly merge data and bb options', (done) => {

			let collection = new Backbone.Collection();

			new Vue({
				el,
				data: {a: 1},
				bb: () => ({list: collection}),
				template: '<div>{{ list }}{{ a }}</div>',
				mounted() {
					expect($sandbox.html()).toBe('<div>[]1</div>');
					done();
				}				
			});
	});


	it('should trigger unbind when destroyed', (done) => {

			let collection = new Backbone.Collection();

			new Vue({
				el,
				data: {a: 1},
				bb: () => ({list: collection}),
				template: '<div>{{ list }}{{ a }}</div>',
				mounted() {
					expect($sandbox.html()).toBe('<div>[]1</div>');
					this.$destroy();
				},
				destroyed() {
					collection.add({a: 1});
					expect(this.$data._list).toEqual([]);
					done();
				}				
			});
	});

	it('should accept original Backbone objects in VueBackbone.original', () => {
		const model = new Backbone.Model({id: 'A'});
		expect(VueBackbone.original(model)).toBe(model);
	});

});