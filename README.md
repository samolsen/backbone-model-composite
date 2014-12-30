[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

# Backbone Model Composite


This library is a small extension to the basic [Backbone](http://backbonejs.org/) Model class, which supports nested models.

## Install

As a Node package
```
npm install backbone-model-composite
```

With Bower
```
bower install backbone-model-composite
```

## Use

Define child models using a `childModels` hash.

```javascript
var ParentModel = Backbone.ModelComposite.extend({
  childModels: {
    firstChild: Backbone.Model,
    secondChild: OtherConstructor
  }
  
  //...
});
```

Attributes passed to the parent model's constructor, with keys from `childModels` are used to instantiate its child models.

```javascript
var model = new ParentModel({
  firstChild: {
    a: 'abc',
    b: 2
  },
  secondChild: {},
  x: 3
});

model.firstChild.get('a'); // <-- 'abc'
model.secondChild.set('hello', 'world');
```

By default, attributes used to create child models are removed from the parent object. Pass `preserveChildAttributes` in the constructor's options hash to keep these attributes on the parent.

`Backbone.Model`'s `toJSON()` method is overriden to include the nested models. Pass `excludeChildModels` in an options hash to prevent this behavior.

```javascript
model.toJSON(); // <-- {firstChild: {a: 'abc', b: 2}, secondChild: {hello: 'world'}, x: 3}    
model.toJSON({excludeChildModels: true}); // <-- {x: 3}    
```

Multiple levels of nesting are supported:

```javascript
var SecondaryModel = Backbone.ModelComposite.extend({
  childModels: {
    tertiary: Backbone.Model
  }
});

var TopModel = Backbone.ModelComposite.extend({
  childModels: {
    secondary: SecondaryModel 
  }
});

var model = new TopModel({first: 1});
model.secondary.set("second", 2);
model.secondary.tertiary.set("third", 3);

model.toJSON(); // <-- {first: 1, secondary: {second: 2, tertiary: {third :3}}}
```

The parent object also emits its children's events, prefixed with the key from the `childModels` hash.

```javascript
var model = new ParentModel();
var handler = function (){};
model.on('firstChild:change', handler);
model.firstChild.set('a', 123); // handler called
```


[npm-url]: https://npmjs.org/package/backbone-model-composite
[npm-image]: https://badge.fury.io/js/backbone-model-composite.png

[travis-url]: http://travis-ci.org/samolsen/backbone-model-composite
[travis-image]: https://secure.travis-ci.org/samolsen/backbone-model-composite.png?branch=master