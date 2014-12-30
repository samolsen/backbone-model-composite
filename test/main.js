var _ = require('underscore');
var Backbone = require('backbone');
var expect = require('chai').expect;


require('../backbone-model-composite');

var Model = Backbone.Model.extend();
var OtherModel = Backbone.Model.extend();

var BMC = Backbone.ModelComposite.extend({
  childModels: {
    nested: Model,
    nested1: OtherModel
  }
});


var attrs0, attrs1, attrs2;

before(function() {
  attrs0 = {
    a: 1,
    b: "2",
    c: false
  };
  attrs1 = {
    x: 3,
    y: "Boom!",
    nested: _.clone(attrs0)
  };
  attrs2 = {
    nested: _.clone(attrs0),
    nested1: _.clone(attrs1)
  };  
});

describe('Backbone.ModelComposite', function () {
  
  describe('constructor', function() {
    it('returns an object', function() {
      expect(new BMC()).not.to.be.null;
    });
  });
  
  describe('child models', function () {
    it('are attached to the instance', function () {
      var model = new BMC(attrs2);

      var attached = (model.nested instanceof Model) && (model.nested1 instanceof OtherModel);
      expect(attached).to.be.true;
    });
    
    it('may be defined with a factory function', function() {
      var myBMC = Backbone.ModelComposite.extend({
        childModels: function() {
          return {
            nested: OtherModel
          }
        }
      });

      var model = new myBMC(attrs1);
      expect(model.nested).to.be.an.instanceof(OtherModel);
    });
    
    it('event propagation', function (done) {
      var model = new BMC(attrs2);
      var nested = model.nested;

      model.once('nested:change:a', function(changedModel, value) {
        expect(changedModel).to.equal(nested);
        done();
      });

      nested.set('a', 123);
    });
    
    it('are included in the toJSON representation', function () {
      var model = new BMC(attrs2);

      var json = model.toJSON();
      expect(json.nested).to.eql(model.nested.toJSON());

      json = model.toJSON({
        excludeChildModels: true
      });
      expect(json.nested).to.be.undefined;
    });
    
  });
  
  describe('child attributes', function () {

    var key;
    before(function () {
      key = 'nested';
      if (!attrs1.hasOwnProperty(key)) {
        throw new Error('invalid test criteria');
      }
    });
    
    beforeEach(function () {
      model = new BMC(attrs1, {
        preserveChildAttributes: true
      });
    });
    
    it('are removed from the parent attributes when options.preserveChildAttributes === undefined', function () {
      model = new BMC(attrs1);
      expect(model.has(key)).to.be.false;
    });
    
    it('are preserved when options.preserveChildAttributes == true', function () {  
      expect(model.has(key)).to.be.true;
    });
    
    it('are used to instantiate the child', function () {
      expect(attrs1).eql(model.attributes);
    });

  });
  
});
