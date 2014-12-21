var Model = Backbone.Model.extend();
var OtherModel = Backbone.Model.extend();

var BMC = Backbone.ModelComposite.extend({
  childModels: {
    nested: Model,
    nested1: OtherModel
  }
});

// 
var attrs0 = {
  a: 1,
  b: "2",
  c: false
};
var attrs1 = {
  x: 3,
  y: "Boom!",
  nested: _.clone(attrs0)
};
var attrs2 = {
  nested: _.clone(attrs0),
  nested1: _.clone(attrs1)
};


QUnit.test('Backbone.ModelComposite constructor returns an object', function(assert) {
  assert.ok(new BMC());
});

QUnit.test('Backbone.ModelComposite child models are attached to the instance', function(assert) {
  var model = new BMC(attrs2);

  var attached = (model.nested instanceof Model) && (model.nested1 instanceof OtherModel);
  assert.ok(attached);
});

QUnit.test('Backbone.ModelComposite child models may be defined with a factory function', function(assert) {
  var myBMC = Backbone.ModelComposite.extend({
    childModels: function() {
      return {
        nested: OtherModel
      }
    }
  });

  var model = new myBMC(attrs1);
  assert.ok((model.nested instanceof OtherModel));
});

QUnit.test('Backbone.ModelComposite child attributes', function(assert) {
  var key = 'nested';
  if (!attrs1.hasOwnProperty(key)) {
    throw new Error('invalid test criteria');
  }

  var model = new BMC(attrs1);
  assert.ok(!model.has(key), 'are removed from the parent attributes when options.preserveChildAttributes === undefined');

  model = new BMC(attrs1, {
    preserveChildAttributes: true
  });
  assert.ok(model.has(key), 'are preserved when options.preserveChildAttributes == true');

  assert.propEqual(attrs1, model.toJSON(), 'are used to instantiate the child')
});

QUnit.test('Backbone.ModelComposite child model event propagation', function(assert) {
  var model = new BMC(attrs2);
  var nested = model.nested;
  var done = assert.async();

  model.once('nested:change:a', function(changedModel, value) {
    assert.equal(changedModel, nested, 'succeeds')
    done();
  });

  nested.set('a', 123);
});
