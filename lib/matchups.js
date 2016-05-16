Matchups = new Mongo.Collection("matchups",{
  transform: function(doc){ return new Matchup(doc); }
});

Matchup = function(doc){
  _.extend(this, doc);
};

_.extend(Matchup.prototype, {
  getTeam: function(color){
    return Worlds.find({world_id: {$in: this.all_worlds[color]}}).map(function(d,i,c){return d.name;}).join(' & ');
  }
});
