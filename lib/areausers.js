AreaUsers = new Mongo.Collection("areausers", {
	transform: function(doc){
		return new AreaUser(doc);
	}
});

AreaUser = function(doc){
	_.extend(this, doc);
};

_.extend(AreaUser.prototype, {

});
