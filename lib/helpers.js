isAdmin = function(){
	return Meteor.user() && Roles.userIsInRole(Meteor.user()._id, 'admin');
}

sleep = function(millis){
	var date = new Date();
	var curDate = null;
	do { curDate = new Date(); }
	while(curDate-date < millis);
}
