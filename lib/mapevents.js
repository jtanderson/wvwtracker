MapEvents = new Mongo.Collection("mapevents", {
	transform: function(doc){
		return new MapEvent(doc);
	}
});

MapEvents.before.insert(function(userId, doc){
	doc.time = (new Date).getTime();
});

MapEvent = function(doc){
	_.extend(this, doc);
};

_.extend(MapEvent.prototype, {
	humanTime: function(){
		// var tmpDate = new Date(this.time + (new Date()).getTimezoneOffset()*60*1000);
		var tmpDate = new Date(this.time);
		return tmpDate.toString();
	}
});
