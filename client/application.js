// Subscriptions, Meteor.startup

Template.allAreas.onRendered(
	function(){
		"use strict";

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
			console.log("You clicked the map at " + map.project(e.latlng));
			console.log(e.latlng);
			console.log(e.layerPoint);
			console.log(e.containerPoint);
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
				}) }).addTo(map).bindPopup(
					template.find('#area_popup_'+a._id)
				);
			}
		};
	}
);

Template.allAreas.events({
	'submit form': function(e){
		e.preventDefault();

		var user = {
			area_id: this._id,
			displayName: $(e.target).find('[name=name]').val()
		};

		AreaUsers.insert(user);
		$(e.target).find('[name=name]').val('');
	},
	'click .remove-user': function(e){
		e.preventDefault();
		AreaUsers.remove(this._id);
	},
});


Template.admin.events({
});

Template.admin.helpers({
	users: function(){
		return Meteor.users.find().fetch();
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
