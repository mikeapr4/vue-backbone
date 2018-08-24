/**
 * Create a proxy of the Backbone Model which maps direct access of attributes
 * to the get/set interface that Backbone normally provides. This allows for
 * in-template binding to Backbone model attributes easily.
 *
 * In the case of ambiguity, say an attribute called "completed" and a method
 * called "completed". The method takes priority (so as not to break existing functionality),
 * however as a backup the attribute can be accessed with a prefix (conflictPrefix option),
 * e.g. model.$completed
 *
 * To avoid interference, it's stored under the Model property `_vuebackbone_proxy`. This proxy
 * is only really intended to be used by Vue templates.
 */

/**
 * Attach proxy getter/setter for a model attribute
 */
function proxyModelAttribute(proxy, model, attr, conflictPrefix) {
	let getter = model.get.bind(model, attr);
	let setter = model.set.bind(model, attr);

	// If there's a conflict with a function from the model, add the attribute with the prefix
	let safeAttr = proxy[attr] ? conflictPrefix + attr : attr;

	Object.defineProperty(proxy, safeAttr, {
		enumerable: true,
		get: getter,
		set: setter
	});
}

/**
 * Attach proxy getter/setter for a model relationship (one-to-one or one-to-many)
 *
 * Getter should attempt to map to the proxy, while setter should attempt
 * to switch back to original backbone object.
 */
function proxyModelRelation(proxy, model, attr, conflictPrefix) {
	let getter = function() {
		const val = model.get(attr);
		return val && val._vuebackbone_proxy || val;
  }
  let setter = function(val) {
		model.set(attr, val && val._vuebackbone_original || val);
  }

  // If there's a conflict with a function from the model, add the attribute with the prefix
  let safeAttr = proxy[attr] ? conflictPrefix + attr : attr;

  Object.defineProperty(proxy, safeAttr, {
    enumerable: true,
    get: getter,
    set: setter
  });
}

export default function modelProxy(model, conflictPrefix, associations) {
	let proxy = {};

	// Attach bound version of all the model functions to the proxy
	// these functions are readonly on the proxy and any future changes
	// to the model functions won't be reflected in the Vue proxy
	for (let key in model) {
		if (typeof model[key] === "function" && key !== "constructor") {
			var bndFunc = model[key].bind(model);
			Object.defineProperty(proxy, key, { value: bndFunc });
		}
	}

	// https://github.com/dhruvaray/backbone-associations
  if (associations && model.relations) {
    const relations = model.relations.map(r => r.key);
    relations.forEach(attr => {
      proxyModelRelation(proxy, model, attr, conflictPrefix);
		});
    // Attach getter/setters for the model attributes.
    Object.keys(model.attributes).filter(attr => !relations.includes(attr))
			.forEach(attr => {
				proxyModelAttribute(proxy, model, attr, conflictPrefix);
			});
	}
	else {
    // Attach getter/setters for the model attributes.
    Object.keys(model.attributes).forEach(attr => {
      proxyModelAttribute(proxy, model, attr, conflictPrefix);
    });
	}

	if (!proxy.id) {
		// sometimes ID is a field in the model (in which case it'll be proxied already)
		Object.defineProperty(proxy, "id", {
			get: function() {
				return model.id;
			}
		});
	}

	// Attach link back to original model
	Object.defineProperty(proxy, "_vuebackbone_original", { value: model });

	return proxy;
}
