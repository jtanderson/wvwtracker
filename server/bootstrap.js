Meteor.startup(function(){
	Migrations.migrateTo('latest');

	Areas.allow({
		insert: function(){
			// return isAdmin();
			return true;
		},
		update: function(){
			// return isAdmin();
			return true;
		},
		remove: function(){
			// return isAdmin();
			return true;
		}
	});

	AreaUsers.allow({
		insert: function(){
			// return isAdmin();
			return true;
		},
		update: function(){
			// return isAdmin();
			return true;
		},
		remove: function(){
			// return isAdmin();
			return true;
		}
	});

	Meteor.users.allow({
		insert: function(){
			// return isAdmin();
			return true;
		},
		update: function(){
			// return isAdmin();
			return true;
		},
		remove: function(){
			// return isAdmin();
			return true;
		}
	});
});
