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
  var gom_id = 1007;

  Meteor.setInterval(function(){
    HTTP.call("GET", "https://api.guildwars2.com/v1/wvw/matches.json", {},
      function(statusCode, content, data, headers) {
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
                  console.log(db_objective);
                  MapEvents.insert({
                    area_id: db_objective._id,
                    message: db_objective.name + " changed to " + json_objective["owner"] + " from " + db_objective.owner
                  });
                  Areas.update(db_objective, {$set: {owner: json_objective["owner"].toLowerCase()}});
                }
              }
            };
          };
        }
      }  
    );
  }, 10*1000); // Run every 60 seconds
});
