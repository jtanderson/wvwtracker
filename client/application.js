// Subscriptions, Meteor.startup

Template.allAreas.onRendered(
  function(){
    "use strict";

    if (!document.cookie.match("firstTime=")){
      $('#firstTimeModal').on('hidden.bs.modal', function(e){
        document.cookie = "firstTime=false;max-age=31536e3";
      });
      $('#firstTimeModal').modal();
    }

    var map, southWest, northEast;

    var unproject = function(coord) {
      return map.unproject(coord, map.getMaxZoom());
    }

    var minzoom = 4;
    var Leaflet = L;
    var maxZoom = 7;

    map = L.map("map", {
      minZoom: minzoom,
      maxZoom: maxZoom,
      crs: L.CRS.Simple,
      dragging: true,
      zoomControl: true,
      bounceAtZoomLimits: false,
      scrollWheelZoom: false
    }).setView([0, 0], 0);

    map["view"] = "world";

    map.on("click", function(e){
      //console.log("You clicked the map at point: " + e.latlng);
    });

    var southWest = [-250, 75];
    var northEast = [-130,250];
    //var southWest = [0, 4094];
    //var northEast = [16382, 16382];
    //console.log(project(southWest));
    //console.log(project(northEast));
    southWest = [-123, 40];
    northEast = [-66, 126];


    map.setMaxBounds(new L.LatLngBounds(southWest, northEast));

    L.tileLayer("https://tiles{s}.guildwars2.com/2/1/{z}/{x}/{y}.jpg", {
      minZoom: minzoom,
      maxZoom: maxZoom,
      continuousWorld: true,
      subdomains: [1, 2, 3, 4 ],
      bounds: new L.LatLngBounds(unproject([4000, 32768]), northEast)
    }).addTo(map);

    var fileUrl = "https://render.guildwars2.com/file/";
    var fmt = "png";

    var template = Template.instance();
    var selectedIcon = {};

    var areas = Areas.find({coord: {$exists: true}}).fetch();
    for (var i = areas.length - 1; i >= 0; i--) {
      var a = areas[i];
      a.coords = [a.coord[0],a.coord[1]];

      if ( ['keep', 'camp', 'tower', 'castle'].indexOf(a.type.toLowerCase()) > -1 ){
        //console.log("Adding: " + a.name);
        var iconMarker = L.marker(map.unproject(a.coords, maxZoom), {icon: L.icon({
          // iconUrl: fileUrl + fileSpecs['wvw_'+a.type]['signature'] +"/"+ fileSpecs['wvw_'+a.type]['file_id'] +"."+ fmt,
          iconUrl: '/img/'+a.type.toLowerCase()+"_"+a.owner+"."+fmt,
          iconSize: [32,32]
        })});
        iconMarker.addTo(map).bindPopup(
          template.find('#area_popup_'+a._id)
        );

        // For some reason reactivity with this doesn't play as nicely as the counter...
        var iconTrackerFn = function(){
          var tmpArea = areas[i];
          var tmpMarker = iconMarker;
          return function(c){
            var thisArea = Areas.findOne({_id: tmpArea._id});
            var blinkClass = "";
            if ( ! c.firstRun ){
              blinkClass = " just-changed";
            }
            var color = thisArea.getOwner();
            tmpMarker.setIcon(L.icon({
              iconUrl: '/img/'+thisArea.type.toLowerCase()+"_"+thisArea.owner+".png",
              iconSize: [32,32],
              className: blinkClass
            }));
          }
        }();

        Tracker.autorun(iconTrackerFn);

        var countMarker = L.marker(map.unproject(a.coords, maxZoom), {icon: L.divIcon({
          // html: template.find('#area_counter_'+a._id).innerHTML,
          html: a.userCount(),
          className: 'areaCounter',
          iconAnchor: [20,20]
        })});

        countMarker.addTo(map);

        // We need some closure magic...
        var countTrackerFn = function(){
          var tmpArea = areas[i];
          var tmpMarker = countMarker;
          return function(){
            // var count = Session.get('area_count_'+tmpArea._id);
            tmpMarker.setIcon(L.divIcon({
              html: tmpArea.userCount(),
              className: 'areaCounter',
              iconAnchor: [20,20]
            }));
          };
        }();

        Tracker.autorun(countTrackerFn);
      }
    };

    var ebBounds = [
      [-130,72],
      [-101,94]
    ];
    var greenHomeBounds = [
      [-113,44],
      [-91,64]
    ];
    var redHomeBounds = [
      [-97,72],
      [-71,92]
    ];
    var blueHomeBounds = [
      [-85,100],
      [-113,120]
    ];

    var ebMarkerLoc = [-101,82];
    var greenMarkerLoc = [-89,52];
    var redMarkerLoc = [-69,80];
    var blueMarkerLoc = [-84,108];

    var ebMarker = L.marker(ebMarkerLoc, {
      icon: new L.divIcon({
        html: '<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-plus"></span> EB</button>',
        iconSize: [32,32],
        className: "mapbutton"
      })
    }).on('click', function(event){
      if ( map.view == "world" ){
        map.fitBounds(ebBounds);
        this.setIcon(new L.divIcon({
          html: '<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-minus"></span> EB</button>',
          iconSize: [32,32],
          className: "mapbutton"
        }));
        map.view = "eb";
      } else {
        map.fitWorld();
        map.view = "world";
        this.setIcon(new L.divIcon({
          html: '<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-plus"></span> EB</button>',
          iconSize: [32,32],
          className: "mapbutton"
        }));
      }
    }).addTo(map);

    var greenHomeMarker = L.marker(greenMarkerLoc, {
      icon: new L.divIcon({
        html: '<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-plus"></span> Green Home</button>',
        iconSize: [32,32],
        className: "mapbutton"
      })
    }).on('click', function(event){
      if ( map.view == "world" ){
        map.fitBounds(greenHomeBounds);
        this.setIcon(new L.divIcon({
          html: '<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-minus"></span> Green Home</button>',
          iconSize: [32,32],
          className: "mapbutton"
        }));
        map.view = "green";
      } else {
        map.fitWorld();
        map.view = "world";
        this.setIcon(new L.divIcon({
          html: '<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-plus"></span> Green Home</button>',
          iconSize: [32,32],
          className: "mapbutton"
        }));
      }
    }).addTo(map);

    var redHomeMarker = L.marker(redMarkerLoc, {
      icon: new L.divIcon({
        html: '<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-plus"></span> Red Home</button>',
        iconSize: [32,32],
        className: "mapbutton"
      })
    }).on('click', function(event){
      if ( map.view == "world" ){
        map.fitBounds(redHomeBounds);
        this.setIcon(new L.divIcon({
          html: '<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-minus"></span> Red Home</button>',
          iconSize: [32,32],
          className: "mapbutton"
        }));
        map.view = "red";
      } else {
        map.fitWorld();
        map.view = "world";
        this.setIcon(new L.divIcon({
          html: '<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-plus"></span> Red Home</button>',
          iconSize: [32,32],
          className: "mapbutton"
        }));
      }
    }).addTo(map);

    var blueHomeMarker = L.marker(blueMarkerLoc, {
      icon: new L.divIcon({
        html: '<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-plus"></span> Blue Home</button>',
        iconSize: [32,32],
        className: "mapbutton"
      })
    }).on('click', function(event){
      if ( map.view == "world" ){
        map.fitBounds(blueHomeBounds);
        this.setIcon(new L.divIcon({
          html: '<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-minus"></span> Blue Home</button>',
          iconSize: [32,32],
          className: "mapbutton"
        }));
        map.view = "blue";
      } else {
        map.fitWorld();
        map.view = "world";
        this.setIcon(new L.divIcon({
          html: '<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-plus"></span> Blue Home</button>',
          iconSize: [32,32],
          className: "mapbutton"
        }));
      }
    }).addTo(map);
  }
);

Template.allAreas.events({
  'submit form': function(e){
    e.preventDefault();

    var nameInput = $(e.target).find('[name=name]').val();

    if ( nameInput.length == 0 ){
      return false;
    }

    var user = {
      area_id: this._id,
      displayName: nameInput
    };

    var area = Areas.findOne({_id: this._id});

    AreaUsers.insert(user);
    // Session.set('area_count_'+area._id, area.userCount());
    $(e.target).find('[name=name]').val('');

    var mapevent = {
      area_id: this._id,
      tags: ["user-arrive"],
      message: user.displayName + " has arrived at " + area.name + "."
    }

    MapEvents.insert(mapevent);
  },
  'click .remove-user': function(e){
    e.preventDefault();
    AreaUsers.remove(this._id);

    var area = Areas.findOne({_id: this.area_id});

    var mapevent = {
      area_id: this._id,
      tags: ["user-leave"],
      message: this.displayName + " has left " + area.name + "."
    }

    MapEvents.insert(mapevent);
  },
});

Template.eventLog.onRendered(function(){
  Session.setDefault('owner-event-toggle', true);
  Session.setDefault('user-event-toggle', true);

  $('#owner-event-toggle').prop('checked', Session.get('owner-event-toggle'));
  $('#user-event-toggle').prop('checked', Session.get('user-event-toggle'));
});

Template.eventLog.helpers({
  mapevents: function(){
    var query = {};
    var inArray = [];
    if ( Session.get('user-event-toggle') ){
      inArray = inArray.concat(["user-leave", "user-arrive"]);
    }
    if ( Session.get('owner-event-toggle') ){
      inArray = inArray.concat(["owner-change"]);
    }
    return MapEvents.find({tags: {$in: inArray}}, {sort: {time: -1}, limit: 50});
  }
});

Template.eventLog.events({
  'change #user-event-toggle, change #owner-event-toggle': function(e){
    Session.set($(e.target).attr('id'), $(e.target).is(':checked'));
  }
})

Template.admin.events({
});

Template.admin.helpers({
  users: function(){
    return Meteor.users.find();
  },
  userEmail: function(user){
    return this.emails[0].address;
  }
});

Template.adminToggle.helpers({
  userIsAdmin: function(){
    return Roles.userIsInRole(this._id, 'admin');
  }
});
