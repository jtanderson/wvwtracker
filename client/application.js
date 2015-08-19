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

		var minzoom = 3;

		map = L.map("map", {
			minZoom: minzoom,
			maxZoom: 7,
			crs: L.CRS.Simple,
			dragging: true,
			zoomControl: false,
			bounceAtZoomLimits: false
		}).setView([0, 0], 0);

		map.on("click", function(e){
		});

		var southWest = [-250, 75];
		var northEast = [-130,250];

		map.setMaxBounds(new L.LatLngBounds(southWest, northEast));

		L.tileLayer("https://tiles{s}.guildwars2.com/2/1/{z}/{x}/{y}.jpg", {
		  minZoom: minzoom,
		  maxZoom: 7,
		  continuousWorld: true,
		  subdomains: [1, 2, 3, 4 ],
		  bounds: new L.LatLngBounds(southWest, northEast)
		}).addTo(map);

		var fileUrl = "https://render.guildwars2.com/file/";
		var fmt = "png";

		var template = Template.instance();
		var selectedIcon = {};

		var areas = Areas.find().fetch();
		for (var i = areas.length - 1; i >= 0; i--) {
			var a = areas[i];

			if ( a.type != 'ruin' ){
				var iconMarker = L.marker(map.unproject(a.coords,6), {icon: L.icon({
					// iconUrl: fileUrl + fileSpecs['wvw_'+a.type]['signature'] +"/"+ fileSpecs['wvw_'+a.type]['file_id'] +"."+ fmt,
					iconUrl: '/img/'+a.type+"_"+a.owner+"."+fmt,
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
							iconUrl: '/img/'+thisArea.type+"_"+thisArea.owner+".png",
							iconSize: [32,32],
							className: blinkClass
						}));
					}
				}();

				Tracker.autorun(iconTrackerFn);

				var countMarker = L.marker(map.unproject(a.coords,6), {icon: L.divIcon({
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
			message: user.displayName + " has arrived at " + area.name.en + "."
		}

		MapEvents.insert(mapevent);
	},
	'click .remove-user': function(e){
		e.preventDefault();
		AreaUsers.remove(this._id);

		var area = Areas.findOne({_id: this.area_id});

		var mapevent = {
			area_id: this._id,
			message: this.displayName + " has left " + area.name.en + "."
		}

		MapEvents.insert(mapevent);
	},
});

Template.eventLog.helpers({
	mapevents: function(){
		return MapEvents.find({}, {sort: {time: -1}, limit: 50});
	}
});


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
