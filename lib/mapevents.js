MapEvents = new Mongo.Collection("mapevents", {
	transform: function(doc){
		return new MapEvent(doc);
	}
});

MapEvent = function(doc){
	_.extend(this, doc);
};

_.extend(MapEvent.prototype, {
	humanTime: function(){
		var tmpDate = new Date(this.time + (new Date()).getTimezoneOffset()*60*1000);
		return tmpDate.toString();
	}
});
