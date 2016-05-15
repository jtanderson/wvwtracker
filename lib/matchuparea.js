MatchupAreas = new Mongo.Collection("matchupareas",{
  transform: function(doc){ return new MatchupArea(doc); }
});

MatchupArea = function(doc){
  _.extend(this, doc);
};

_.extend(MatchupArea.prototype, {
});
