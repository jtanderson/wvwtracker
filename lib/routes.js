Router.configure({
  layoutTemplate: 'base',
  loadingTemplate: 'loading',
  notFoundTemplate: '404'
});

Router.map(function(){
  this.route('home', {
    path: '/',
    template: 'allAreas',
    layoutTemplate: 'blank',
    waitOn: function(){
      Tracker.autorun(function() {
        Meteor.subscribe("matchupmapdata", Session.get('matchup-id'))
        Meteor.subscribe("worlds")
      });
    },
    data: function(){
      return {
        areas: Areas.find().fetch()
      };
    }
  });

  this.route('admin', {
    path: '/admin',
    layoutTemplate: 'base',
    template: 'admin',
    waitOn: function(){
      return [
        Meteor.subscribe("users"),
        Meteor.subscribe("roles")
      ];
    },
    onBeforeAction: function(){
      if ( ! isAdmin() ){
        Router.go('/');
      } else{
        this.next();
      }
    }
  });

  this.route('/about', {
    path: '/about',
    template: 'about'
  });
});

// Router.onBeforeAction('dataNotFound', {only: 'allAreas'});

var requireLogin = function() {
  if (! Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('accessDenied');
    }
  } else {
    this.next();
  }
};

var requireAdmin = function() {
  requireLogin();
  if (! Roles.userIsInRole(Meteor.user, 'admin') ) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('accessDenied');
    }
  } else {
    this.next();
  }
};
