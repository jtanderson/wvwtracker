Meteor.startup(function(){
  Migrations.migrateTo('latest');

  Areas.allow({
    insert: function(){
      // return isAdmin();
      return true;
    },
    update: function(){
      // return isAdmin();
      return true;
    },
    remove: function(){
      // return isAdmin();
      return true;
    }
  });

  AreaUsers.allow({
    insert: function(){
      // return isAdmin();
      return true;
    },
    update: function(){
      // return isAdmin();
      return true;
    },
    remove: function(){
      // return isAdmin();
      return true;
    }
  });

  Meteor.users.allow({
    insert: function(){
      // return isAdmin();
      return true;
    },
    update: function(){
      // return isAdmin();
      return true;
    },
    remove: function(){
      // return isAdmin();
      return true;
    }
  });

  var match_id = "";
  var gom_id = 1016;

  var oldUpdate = function(statusCode, content, data, headers) {
    if (!statusCode){
      var matches = content["data"]["wvw_matches"];
      for (var i = matches.length - 1; i >= 0; i--) {
        if ( matches[i]["red_world_id"] == gom_id ||
           matches[i]["green_world_id"] == gom_id ||
           matches[i]["blue_world_id"] == gom_id ){
          match_id = matches[i]["wvw_match_id"];
          break;
        }
      };
      console.log("found match id: " + match_id);
      var match_details_call = HTTP.call("GET", "https://api.guildwars2.com/v2/wvw/matches/"+match_id);
      //console.log(match_details_call);
      var match_details = match_details_call["data"];
      for (var i = match_details["maps"].length - 1; i >= 0; i--) {
        for (var j = match_details["maps"][i]["objectives"].length - 1; j >= 0; j--) {
          var json_objective = match_details["maps"][i]["objectives"][j];
          var db_objective = Areas.findOne({"api_id": json_objective["id"].toString()});
          if ( db_objective && db_objective.coord != undefined ){
            if ( db_objective && ['keep','tower','castle','camp'].indexOf(db_objective.type.toLowerCase()) > -1 && db_objective.owner !==  json_objective["owner"].toLowerCase() ){
              MapEvents.insert({
                area_id: db_objective._id,
                message: db_objective.name + " changed to " + json_objective["owner"] + " from " + db_objective.owner,
                tags: ['owner-change']
              });
              Areas.update(db_objective, {$set: {owner: json_objective["owner"].toLowerCase()}});
            }
          }
        };
      };
    }
  }

  var newUpdate = function(statusCode, content, data, headers) {
    console.log('======= START UPDATE LOOP =======');
    if (!statusCode){
      var matches = content['data']['wvw_matches'];
      for (var i = matches.length-1; i >= 0; i--) {
        updateCall = HTTP.call('GET', 'https://api.guildwars2.com/v2/wvw/matches/'+matches[i]['wvw_match_id']);
        updateObj = updateCall['data'];

        //console.log("Looking for matchup "+updateObj['id']+" with start time: "+updateObj["start_time"]);

        matchObj = Matchups.findOne({"id": updateObj['id'], "start_time": updateObj["start_time"]});
        maps = updateObj.maps;
        
        delete updateObj['maps'];

        if (matchObj){
          //console.log("Matchup found, updating matchup "+matchObj["id"]);
          updateObj["current"] = true;
          Matchups.update({_id: matchObj._id}, updateObj);
        } else {
          //console.log("Matchup not found, inserting...");
          updateObj["api_id"] = matches[i]['wvw_match_id'];
          updateObj["current"] = true;
          Matchups.insert(updateObj);
          newId = Matchups.update({"start_time": {$ne: updateObj.start_time}}, {$set: {"current": false}});
          matchObj = Matchups.find({_id: newId});
        }

        for( var j = maps.length - 1; j >= 0; j-- ){
          for( var k = maps[j].objectives.length - 1; k >= 0; k-- ){
            newArea = maps[j].objectives[k];
            dbArea = Areas.findOne({api_id: newArea['id']});
            
            if (dbArea) {
              oldMatchupArea = MatchupAreas.findOne({area_id: dbArea.api_id, matchup_id: updateObj.id});
              if (oldMatchupArea){
                if ( oldMatchupArea.owner !== newArea.owner ){
                  console.log("Updating "+dbArea.name+" to have owner "+newArea.owner+" in matchup "+matchObj.id);
                  if ( ['keep', 'camp', 'tower', 'castle'].indexOf(dbArea.type.toLowerCase()) > -1 ){
                    MapEvents.insert({
                      area_id: dbArea._id,
                      message: dbArea.name + " changed from " + oldMatchupArea.owner + " to " + newArea.owner,
                      matchup_id: updateObj.id,
                      tags: ['owner-change']
                    });
                  }
                  MatchupAreas.update({_id: oldMatchupArea._id}, {$set: {owner: newArea.owner}});
                }
              } else {
                console.log('Inserting new matchuparea');
                MatchupAreas.insert({
                  area_id: newArea.id,
                  matchup_id: matchObj.id,
                  owner: newArea.owner
                });
              }
            }
          }
        }
      }
    }
    console.log('======= END UPDATE LOOP =======');
  }

  Meteor.setInterval(function(){
    HTTP.call("GET", "https://api.guildwars2.com/v1/wvw/matches.json", {}, newUpdate);
  }, 10*1000); // Run every 60 seconds
});
