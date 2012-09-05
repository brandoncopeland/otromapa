define('views/locationsearchview', ['jquery', 'underscore', 'backbone', 'text!templates/locationsearchtemplate.html'], function ($, _, Backbone, locationSearchTemplate) {
	'use strict';

	var searchingClass = 'searching';

	var LocationSearchView = Backbone.View.extend({
		initialize: function () {
			this.model.bind('change:isWorking', this.updateSearching, this);
			this.render();
		},
		template: _.template(locationSearchTemplate),
		render: function () {
			this.$el.html(this.template({}));
			this.input = this.$('input[type=text]');
			return this;
		},
		events: {
			'submit form': 'search'
		},
		updateSearching: function (model, newValue) {
			this.$el.toggleClass(searchingClass, newValue);
		},
		search: function (evt) {
			var self = this;
			evt.preventDefault();
			self.model.locateAddress(self.input.val());
		}
	});

	return LocationSearchView;
});