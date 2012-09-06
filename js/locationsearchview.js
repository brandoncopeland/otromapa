define('views/locationsearchview', ['jquery', 'dojo/_base/window', 'dojo/window', 'underscore', 'backbone', 'text!templates/locationsearchtemplate.html'], function ($, baseWin, dojoWin, _, Backbone, locationSearchTemplate) {
	'use strict';

	var win = dojoWin.get(baseWin.doc);

	var searchingClass = 'searching';

	var LocationSearchView = Backbone.View.extend({
		initialize: function () {
			this.model.on('change:isWorking', this.updateSearching, this);
			this.model.get('featureResults').on('all', this.setClearVisibility, this);
			this.render();
		},
		template: _.template(locationSearchTemplate),
		render: function () {
			var self = this;

			self.$el.html(self.template({}));

			self._input = self.$('input[type=text]');

			win.require(['js/plugins/jquery.placeholder.js'], function () {
				self._input.placeholder();
			});

			self._clearButton = self.$('#clearsearch');

			return this;
		},
		events: {
			'submit form': 'search',
			'click #clearsearch': 'clearSearch'
		},
		// update state based if currently searching or not
		updateSearching: function (model, newValue) {
			this.$el.toggleClass(searchingClass, newValue);
			this.$('*').prop('disabled', newValue);
		},
		// update state of clear button if there are or are not results
		setClearVisibility: function () {
			$(this._clearButton).toggleClass('hidden', this.model.get('featureResults').isEmpty());
		},
		search: function (evt) {
			var self = this;
			evt.preventDefault();
			if (self._input.val()) {
				self.model.locateAddress(self._input.val());
			}
		},
		clearSearch: function () {
			this.model.clearResults();
			$(this._input).val('');
		}
	});

	return LocationSearchView;
});