Worlds = new Mongo.Collection("worlds",{
  transform: function(doc){ return new World(doc); }
});

World = function(doc){
  _.extend(this, doc);
};

_.extend(World.prototype, {
});
