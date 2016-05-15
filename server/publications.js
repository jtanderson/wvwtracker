// Meteor.publish definitions

Meteor.publish("areas", function(){
  return [
    Areas.find(),
    AreaUsers.find()
  ];
});

Meteor.publish("area", function(areaId){
  return [
    Areas.find({_id: areaId}),
    AreaUsers.find({area_id: areaId})
  ];
});

Meteor.publish("users", function(){
  return Meteor.users.find();
});

Meteor.publish("roles", function(){
  return Meteor.roles.find();
});

Meteor.publish("mapevents", function(){
  return MapEvents.find();
});

Meteor.publish("matchups", function(){
  return [
    Matchups.find(),
    MatchupAreas.find()
  ]
});

Meteor.publish("worlds", function(){
  return Worlds.find();
});
