/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/* scripts for all pages

This should run in ADDON SCOPE in a worker

assume:

jquery, underscore, backbone.js
*/

// This is useful for degbugging outside of the add-on, directly in a browser
if (typeof self !== 'object') {
  self = {};
}
if (typeof self.port !== 'object') {
  self.port = { on : function(signal, callback) { return; console.log("on", signal); },
                emit : function(signal, objects) { return; console.log("emit", signal, objects); }
              };
}

var Survey = Backbone.Model,
    Experiment = Backbone.Model;

var SurveyList = Backbone.Collection.extend({
  model : Survey,
  initialize : function(models, options) {
    self.port.on('populatestudies', this.populate.bind(this), this);
  },
  populate : function(studies) {
    if (studies) {
      var ourstudies = _.filter(studies, function(study) { return study.config.studytype == "simplesurvey"; });
      this.reset(ourstudies.map(function(study) { return new Survey(study); }));
    }
  }
});

var ExperimentList = Backbone.Collection.extend({
  model : Experiment,
  initialize : function(models, options) {
    self.port.on('populatestudies', this.populate.bind(this), this);
  },
  populate : function(studies) {
    if (studies) {
      var ourstudies = _.filter(studies, function(study) { return study.config.studytype == "experiment"; });
      this.reset(ourstudies.map(function(study) { return new Experiment(study); }));
    }
  }
});

var ExperimentView = Backbone.View.extend({
  tagName: 'li',
  className: 'experiment-view clearfix',
  template: _.template($('#experiment-template').html()),
  initialize: function() {
    this.model.bind('all', this.render, this);
  },
  render: function() {
    $(this.el).html(this.template(this.model.get("config")));
    return this;
  }
});

var SurveyView = Backbone.View.extend({
  tagName: 'li',
  className: 'survey-view  clearfix',
  template: _.template($('#survey-template').html()),
  initialize: function() {
    this.model.bind('all', this.render, this);
  },
  render: function() {
    $(this.el).html(this.template(this.model.get("config")));
    return this;
  }
});

var ExperimentListView = Backbone.View.extend({
  id : "experiments",
  el : "#experiments",
  initialize: function() {
    this.collection.bind('all', this.render, this);
  },
  render: function() {
    this.$el.children().remove();
    this.collection.each(function(model) {
      this.$el.append(new ExperimentView({model: model, id : this.id + "-" + model.get("config").id }).render().el);
    }, this);
    return this;
  }
});

var SurveryListView = Backbone.View.extend({
  id : "surveys",
  el : "#simplesurveys",
  initialize: function() {
    this.collection.bind('all', this.render, this);
  },
  render: function() {
    this.$el.children().remove();
    this.collection.each(function(model) {
      this.$el.append(new SurveyView({model: model, id : this.id + "-" + model.get("config").id}).render().el);
    }, this);
    return this;
  }
});

var surverys = new SurveyList();
var experiments = new ExperimentList();

$(document).ready(function() {
  // start up the experiment and survey views
   var ev = new ExperimentListView({collection:experiments});
   var sv = new SurveryListView({collection:surverys});

  // I use this for local debugging a file
  if (window.location.protocol != "file:") {
    return;
  }
  var test_data = {"heartbeat":{"config":{"image":"resource://testpilot2-at-ux-dot-mozilla-dot-org/testpilot2/data/img/testPilot_200x200.png","info":"https://testpilot.mozillalabs.com/","phonehome":"http://some.example.com/url/heartbeat","studytype":"experiment","id":"heartbeat","addons":[{"url":"+example/heartbeat.xpi"}],"duration":10,"summary":"this is the heartbeat study","observe":["heartbeat"],"status":"ASKINSTALL","askinstall":{}},"activetimers":{"length":0},"activeui":{"length":1},"activedownloads":{"length":0}},"foursearches":{"config":{"image":"resource://testpilot2-at-ux-dot-mozilla-dot-org/testpilot2/data/img/testPilot_200x200.png","info":"https://testpilot.mozillalabs.com/","phonehome":"http://some.example.com/url/foursearches","studytype":"experiment","id":"foursearches","addons":[{"url":"+example/foursearches.xpi"}],"duration":100,"summary":"four kinds of searches","observe":["foursearches"],"status":"ASKINSTALL","askinstall":{}},"activetimers":{"length":0},"activeui":{"length":1},"activedownloads":{"length":0}},"newtab and home":{"config":{"image":"resource://testpilot2-at-ux-dot-mozilla-dot-org/testpilot2/data/img/testPilot_200x200.png","info":"https://testpilot.mozillalabs.com/","phonehome":"","studytype":"experiment","id":"newtab and home","duration":86400,"summary":"understand the newtab and home pages","eventselectors":[{"pages":["about:home"],"selectors":["#searchbox"],"events":["*"]},{"pages":["about:newtab"],"selectors":["*"],"events":[]}],"status":"ASKINSTALL","askinstall":{}},"activetimers":{"length":0},"activeui":{"length":1},"activedownloads":{"length":0}},"everything":{"config":{"image":"resource://testpilot2-at-ux-dot-mozilla-dot-org/testpilot2/data/img/testPilot_200x200.png","info":"https://testpilot.mozillalabs.com/","phonehome":"","studytype":"experiment","id":"everything","duration":3600,"summary":"everything!","eventselectors":[{"pages":["*"],"selectors":["*"],"events":["*"],"live":false}],"status":"ASKINSTALL","askinstall":{}},"activetimers":{"length":0},"activeui":{"length":1},"activedownloads":{"length":0}},"newtestpilotsurvey":{"config":{"image":"resource://testpilot2-at-ux-dot-mozilla-dot-org/testpilot2/data/img/home_comments.png","info":"https://testpilot.mozillalabs.com/","phonehome":"http://some.evil.com/persontooksurvey","studytype":"simplesurvey","id":"newtestpilotsurvey","headline":"Tell Us About Test Pilot 2","summary":"Trying to figure out what people think of TP2","url":"https://gist.github.com/2467628","status":"ASKINSTALL","askinstall":{}},"activetimers":{"length":0},"activeui":{"length":1},"activedownloads":{"length":0}}};
   ev.collection.populate(test_data);
   sv.collection.populate(test_data);

});

$(function() {
    self.port.on('datafromstudy', function(studyid,data){
        var that = $("#recordeddata");
        that.empty();
        that.append('<p>data for study: ' + studyid + '</p>');
        that.append('<p>here is the data...</p>');
    });
});


$(function(){
    // build info
    self.port.on('buildversion',function(buildinfostring){
        $('#buildversion').text(buildinfostring);
    })
});

