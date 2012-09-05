define('views/locationsearchview', ['jquery', 'dojo/_base/window', 'dojo/window', 'underscore', 'backbone', 'text!templates/locationsearchtemplate.html'], function ($, baseWin, dojoWin, _, Backbone, locationSearchTemplate) {
	'use strict';

	var win = dojoWin.get(baseWin.doc);

	var searchingClass = 'searching';

	var LocationSearchView = Backbone.View.extend({
		initialize: function () {
			this.model.bind('change:isWorking', this.updateSearching, this);
			this.render();
		},
		template: _.template(locationSearchTemplate),
		render: function () {
			var self = this;

			self.$el.html(self.template({}));

			self.input = self.$('input[type=text]');

			win.require(['js/plugins/jquery.placeholder.js'], function () {
				self.input.placeholder();
			});

			return this;
		},
		events: {
			'submit form': 'search'
		},
		updateSearching: function (model, newValue) {
			this.$el.toggleClass(searchingClass, newValue);
			this.$('*').prop('disabled', newValue);
		},
		search: function (evt) {
			var self = this;
			evt.preventDefault();
			self.model.locateAddress(self.input.val());
		}
	});

	return LocationSearchView;
});