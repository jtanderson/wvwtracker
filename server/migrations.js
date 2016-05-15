Migrations.add({
  version: 1,
  name: "Set jtanderson31@gmail.com to be an admin user.",
  up: function(){
    var user = Meteor.users.findOne({"emails.address": "jtanderson31@gmail.com"});
    if ( user && ! Roles.userIsInRole(user, 'admin') ){
      Roles.addUsersToRoles(user._id, "admin");
    }
  }
});

Migrations.add({
  version: 2,
  name: "Add WvW Objective IDs for the API.",
  up: function (){
    var typeScores = {
      "Camp":  5,
      "Tower": 10,
      "Keep":  25,
      "Castle":35
    }
    areaObjectsCall = HTTP.call('GET','https://api.guildwars2.com/v2/wvw/objectives?ids=all');
    areaObjects = areaObjectsCall["data"];
    for (var i = areaObjects.length - 1; i >= 0; i--) {
      areaObjects[i].api_id = areaObjects[i]["id"];
      areaObjects[i].score = typeScores[areaObjects[i].type];
      areaObjects[i].type = areaObjects[i].type.toLowerCase();
      Areas.insert(areaObjects[i]);
    }
  }
});

Migrations.add({
  version: 3,
  name: "Add owner field to objectives.",
  up: function(){
    areaObjects = Areas.find().fetch();
    for (var i = areaObjects.length - 1; i >= 0; i--) {
      Areas.update(areaObjects[i], {$set: {owner: "neutral"}});
    };
  }
})

Migrations.add({
  version: 4,
  name: "Add worlds.",
  up: function(){
    worldObjectsCall = HTTP.call('GET', 'https://api.guildwars2.com/v2/worlds?ids=all');
    worldObjects = worldObjectsCall["data"];
    for(var i = worldObjects.length - 1; i>= 0; i--){
      worldObjects[i]["world_id"] = worldObjects[i]["id"];
      delete worldObjects[i]["id"];
      Worlds.insert(worldObjects[i]);
    }
  }
});

Migrations.add({
  version: 5,
  name: "Set up current matchups, if none are current.",
  up: function(){
    matches = Matchups.find({current: true}).fetch();
    if ( matches.length == 0 ){
      matchIdsCall = HTTP.call('GET', 'https://api.guildwars2.com/v2/wvw/matches');
      matchIds = matchesCall["data"];
      for(var i = matchIds.length - 1; i >= 0; i--){
        matchCall = HTTP.call('GET', 'https://api.guildwars2.com/v2/wvw/matches/'+matchIds[i]);
        matchObj = matchCall["data"];
        matchObj["api_id"] = matchIds[i];
        matchObj["current"] = true;
        Matchups.insert(matchObj);
      }
    }
  }
});
