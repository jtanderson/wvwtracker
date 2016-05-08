Instances = new Mongo.Collection("instances",{
  transform: function(doc){ return new Instance(doc); }
});

Instance = function(doc){
  _.extend(this, doc);
};

_.extend(Instance.prototype, {
});

