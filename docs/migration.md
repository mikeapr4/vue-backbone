# Gradual Migration

Vue (as the name suggests), is focused firstly on the _V_ in an MV* framework. So the first step in any migration would be to replace Backbone Views with Vue instances, while maintaining Backbone Models and Collections.

In order to make this gradual, both Vue and Backbone would need to run side-by-side and interface with each other. In a project with 100 Backbone View classes (normally arranged hierarchically), the most obvious process is to replace one view at a time.

## Vue Interface vs Backbone View Interface

If a Backbone developer has decided to move forward with Vue, it may well be due to the similarities in the interfaces of the 2 frameworks.

[Backbone Interface](https://jsfiddle.net/gaes86xq/)

Becomes:

[Vue Interface](https://jsfiddle.net/2o8x0aas/)

Even the `render` operation can be separated in Vue, if the instance doesn't have an `el` defined, then [`$mount`](https://vuejs.org/v2/api/#vm-mount) can act as a render operation.

### Interacting with a Rendered Instance

Backbone Views have at their core, a DOM `el` (also accessible via `$el`). Vue also provides its root element via `$el`.

> Important Note: In Backbone a `$` prefix indicates a jQuery element, however Vue uses `$` to distinguish internal Vue methods and properties from User-defined properties or functions.

Backbone Views fire events (`trigger`) and provides listener registration (`on`). Vue provides the same (`$emit` and `$on`).

## Hybrid Hierarchy

Take the following example of a hierarchy of Backbone Views:

[Backbone Hierarchy](https://jsfiddle.net/1qea2kdb/)

There are 3 views here, `AppView` which renders `HeaderView` which renders `LinkView`. To demonstrate a hybrid hierarchy, `HeaderView` can be converted to a Vue instance, this will demonstrate a Backbone View with a Vue descendant, and Vue instance with a Backbone descendant.

[Hybrid Hierarchy](https://jsfiddle.net/aavj5he1/)

A successful hybrid where the lifecycle hook `mounted` is used to instantiate a child Backbone view within Vue, and in the case of a Vue child, `render()` isn't called.

Other points to note are that Vue doesn't use jQuery by default, so the `el` passed to Vue needs to be a DOM element, and the `$el` property on the Vue needs to be cast to jQuery for any jQuery functionality. Lastly, note that a Vue instance will replace the `el` it is mounted on, so the template for the HeaderView needed the surrounding element included in it.

### SubViews and Composition Management

Vanilla Backbone doesn't provide **SubView** functionality, but many projects employ Composition Lifecycle management using extensions (e.g. Marionette). If this is the case, it might be worth considering a generic Backbone-wrapper for Vue instances.

Alternatively Vue children could simply be managed (manually) outside of the SubView mechanism. Equally, a Vue-wrapper could be created for Backbone instances to allow them be instantiated via component tags inside a Vue template.

## Next Step

Now that Backbone Views can be gradually converted to Vue instances, the next step is to allow those new Vue instances to use Backbone Collections/Models in a way which in future can be easily swapped for a Flux implementation...

...this is where Vue Backbone can help.