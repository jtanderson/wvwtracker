Matchups = new Mongo.Collection("matchups",{
  transform: function(doc){ return new Matchup(doc); }
});

Matchup = function(doc){
  _.extend(this, doc);
};

_.extend(Matchup.prototype, {
});
