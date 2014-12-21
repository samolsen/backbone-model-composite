((function(root, factory) {

  // Set up Backbone.ModelComposite appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'backbone'], function(_, Backbone) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      Backbone.ModelComposite = factory(root, _, Backbone);

      return Backbone.ModelComposite;
    });

    // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    var Backbone = require('backbone');

    exports = Backbone.ModelComposite = factory(root, _, Backbone);

    // Finally, as a browser global.
  } else {
    root.Backbone.ModelComposite = factory(root, root._, root.Backbone);
  }

})(this, function(root, _, Backbone) {

  var slice = Array.prototype.slice;

  var BackboneModelComposite = Backbone.Model.extend({

    // Subclasses define child models using a `childModels` hash.
    // 
    // This may be either an object or function returning an object,
    // which has keys defining the how the child model is referenced on
    // the parent instance, and values which are the child instance constructors.
    //
    // At a minimum, child instances should implement the Backbone.Events API.
    //
    // e.g.
    // 
    // var ParentModel = Backbone.ModelComposite.extend({
    //   childModels: {
    //     firstChild: Backbone.Model,
    //     secondChild: OtherConstructor
    //   }
    //   
    //   //...
    // });
    //
    // var model = new ParentModel({
    //   firstChild: {
    //     a: 'abc',
    //     b: 2
    //   },
    //   secondChild: {}
    //   x: 3 //, ...
    // });
    //
    // model.firstChild.get('a'); // <-- 'abc'
    // model.secondChild.set('hello', 'world');
    // model.toJSON(); // <-- {firstChild: {a: 'abc', b: 2}, secondChild: {hello: 'world'}, x: 3, ...}
    //
    childModels: {},

    // Override the constructor, creating child models
    constructor: function(attrs, options) {
      Backbone.Model.apply(this, arguments);
      this._createChildren(options);
    },

    // Include child models in this model's JSON representation. 
    // Child models may be omitted by passing a truthy value to 
    // `excludeChildModels` in the options argument
    toJSON: function(options) {
      options = options || {};
      var json = Backbone.Model.prototype.toJSON.apply(this, arguments);

      if (!options.excludeChildModels) {
        var childModelsHash = _.result(this, 'childModels');
        var keys = _.keys(childModelsHash);

        _.each(keys, function(key) {
          json[key] = this[key].toJSON(options);
        }, this);
      }

      return json;
    },

    // Create child models, attaching the child to this[key], using 
    // the key from the childModels hash. That key is also used pass 
    // attributes from the parent attributes to the child's constructor.
    // 
    // By default, the child attributes are removed from the parent's
    // attributes hash. This behavior can be prevented by passing 
    // a truthy value for `preserveChildAttributes` to the parent's 
    // options argument.
    _createChildren: function(options) {
      options = options || {};
      var childModelsHash = _.result(this, 'childModels');

      _.each(childModelsHash, function(ModelClass, key) {
        var childModel = new ModelClass(this.get(key));
        this._propagateChildEvents(childModel, key);
        this[key] = childModel;

        if (!options.preserveChildAttributes) {
          this.unset(key);
        }
      }, this);
    },

    // All child events are also broadcast by the parent object. 
    // Listeners may be attached to the parent, prefixing 
    // the event with the child's key from the childModels result
    // hash.
    //    
    // var ParentModel = Backbone.ModelComposite.extend({
    //   childModels: {
    //     firstChild: Backbone.Model
    //   }
    // });
    //
    // var model = new ParentModel();
    // var handler = function (){};
    // model.on('firstChild:change', handler);
    // model.firstChild.set('a', 123); // handler called
    //
    _propagateChildEvents: function(childModel, key) {
      this.listenTo(childModel, 'all', function() {
        var model = this;
        var args = slice.apply(arguments);
        var event = args[0];
        args[0] = key + ":" + event;

        this.trigger.apply(this, args);
      });
    }

  });

  BackboneModelComposite.VERSION = "1.0.0";

  return BackboneModelComposite;

}));
