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

  var BMC = Backbone.Model.extend({

    constructor: function(attrs, options) {
      Backbone.Model.apply(this, arguments);
      options = options || {};
      this._createChildren(options);
    },

    childModels: {},

    _createChildren: function(options) {
      var childModels = _.result(this, 'childModels');
      
      _.each(childModels, function(ModelClass, key) {
        var childModel = new ModelClass(this.attributes[key]);
        this._propagateChildEvents(childModel, key);
        this[key] = childModel;

        if (!options.preserveChildAttributes) {
          this.unset(key);
        }
      }, this);
    },

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

  BMC.VERSION = "0.1.0";

  return BMC;

}));
