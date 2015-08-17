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

		var fileSpecs = {
			"wvw_camp":{"file_id":102532,"signature":"015D365A08AAE105287A100AAE04529FDAE14155"},
			"wvw_tower":{"file_id":102531,"signature":"ABEC80C79576A103EA33EC66FCB99B77291A2F0D"},
			"wvw_keep":{"file_id":102535,"signature":"DB580419C8AD9449309A96C8E7C3D61631020EBB"},
			"wvw_castle":{"file_id":102608,"signature":"F0F1DA1C807444F4DF53090343F43BED02E50523"},
			"wvw_ruin": {"file_id":638725,"signature":""} //1502A342DF603C06910E0F0FFF0C010AC928B946
		};

		var fileUrl = "https://render.guildwars2.com/file/";
		var fmt = "png";

		var template = Template.instance();
		var selectedIcon = {};

		var areas = Areas.find().fetch();
		for (var i = areas.length - 1; i >= 0; i--) {
			var a = areas[i];

			if ( a.type != 'ruin' ){
				L.marker(map.unproject(a.coords,6), {icon: L.icon({
					iconUrl: fileUrl + fileSpecs['wvw_'+a.type]['signature'] +"/"+ fileSpecs['wvw_'+a.type]['file_id'] +"."+ fmt,
					iconSize: [32,32]
				})}).addTo(map).bindPopup(
					template.find('#area_popup_'+a._id)
				);

				var marker = L.marker(map.unproject(a.coords,6), {icon: L.divIcon({
					// html: template.find('#area_counter_'+a._id).innerHTML,
					html: a.userCount(),
					className: 'areaCounter',
					iconAnchor: [20,20]
				})});

				marker.addTo(map);

				// We need some closure magic...
				var trackerFn = function(){
					var tmpArea = areas[i];
					var tmpMarker = marker;
					return function(){
						var count = Session.get('area_count_'+tmpArea._id);
						tmpMarker.setIcon(L.divIcon({
							html: tmpArea.userCount(),
							className: 'areaCounter',
							iconAnchor: [20,20]
						}));
					};
				}();

				Tracker.autorun(trackerFn);
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
		Session.set('area_count_'+area._id, area.userCount());
		$(e.target).find('[name=name]').val('');

		var d = Date.now();
		var offsetMilliseconds = (new Date()).getTimezoneOffset()*60*1000;

		var mapevent = {
			area_id: this._id,
			time: d - offsetMilliseconds,
			message: user.displayName + " has arrived at " + area.name.en + "."
		}

		MapEvents.insert(mapevent);
	},
	'click .remove-user': function(e){
		e.preventDefault();
		AreaUsers.remove(this._id);

		var d = Date.now();
		var offsetMilliseconds = (new Date()).getTimezoneOffset()*60*1000;
		var area = Areas.findOne({_id: this.area_id});

		var mapevent = {
			area_id: this._id,
			time: d - offsetMilliseconds,
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
