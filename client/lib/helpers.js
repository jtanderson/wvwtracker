Template.registerHelper("isAdmin", function(){
	// return Meteor.user() && Roles.userIsInRole(Meteor.user()._id, 'admin');
	return isAdmin();
});

Template.registerHelper("processMarkdown", function(){
	return marked(this);
});
