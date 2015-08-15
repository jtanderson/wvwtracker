Areas = new Mongo.Collection("areas",{
	transform: function(doc){ return new Area(doc); }
});

Area = function(doc){
	_.extend(this, doc);
};

_.extend(Area.prototype, {
	users: function(){
		return AreaUsers.find({area_id: this._id}).fetch();
	},
	addUser: function(username){
		AreaUsers.insert({
			area_id: this._id,
			name: username
		});
	},
	removeUser: function(uid){
		AreaUsers.remove(uid);
	}
});
