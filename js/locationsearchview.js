define('views/locationsearchview', ['jquery', 'dojo/_base/window', 'dojo/window', 'underscore', 'backbone', 'text!templates/locationsearchtemplate.html'], function ($, baseWin, dojoWin, _, Backbone, locationSearchTemplate) {
	'use strict';

	var LocationSearchView = Backbone.View.extend({
		initialize: function () {
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
		search: function (evt) {
			evt.preventDefault();
			if (this.model) {
				this.model.locateAddress(this.input.val());
			}
		}
	});

	return LocationSearchView;
});