define('views/locationsearchview', ['jquery', 'underscore', 'backbone', 'text!templates/locationsearchtemplate.html'], function ($, _, Backbone, locationSearchTemplate) {
	'use strict';

	var searchingClass = 'searching';

	var toolTipSettings = {
		effect: 'fade',
		fadeOutSpeed: 100,
		predelay: 100,
		opacity: 1.0,
		position: 'center right',
		offset: [0, 11],
		tipClass: 'tipsearchclose',
		events: {
			def: 'mouseenter',
			input: 'mouseenter,click mouseleave',
			widget: 'mouseenter,click mouseleave',
			tooltip: ''
		}
	};

	// options... searchExtent
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

			require(['js/plugins/jquery.placeholder.js'], function () {
				self._input.placeholder();
			});

			require(['js/plugins/jquery.tools.min.js'], function () {
				self.$('[title]').tooltip(toolTipSettings);
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

			var searchOptions = {};
			if (this.options.searchExtent) {
				searchOptions = _.extend(searchOptions, { searchExtent: this.options.searchExtent });
			}

			if (self._input.val()) {
				self.model.locateAddress(self._input.val(), searchOptions);
				$(self._input).blur();
			}
		},
		clearSearch: function () {
			this.model.clearResults();
			$(this._input).val('');
		}
	});

	return LocationSearchView;
});