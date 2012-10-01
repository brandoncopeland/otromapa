define('views/locationsearchview', ['jquery', 'dojo', 'dojo/_base/window', 'dojo/window', 'underscore', 'backbone', 'text!templates/locationsearchtemplate.html'], function ($, dojo, baseWin, dojoWin, _, Backbone, locationSearchTemplate) {
	'use strict';

	var win = dojoWin.get(baseWin.doc);

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

	var getParameterByName = function (name) {
		var match = RegExp('[?&]' + name + '=([^&]*)').exec(win.location.search);
		return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	};

	// options...
	// searchExtent
	// locationUrlParam - url param to search on init if provided
	var LocationSearchView = Backbone.View.extend({
		initialize: function () {
			this.model.on('change:isWorking', this.updateSearching, this);
			this.model.get('featureResults').on('all', this.setClearVisibility, this);
			this.render();

			// check for locationUrlParam and do search if present
			var paramLocation = getParameterByName(this.options.locationUrlParam);
			if (paramLocation) {
				this._input.val(paramLocation);
				this.search();
			}
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
			if (evt) {
				evt.preventDefault();
			}

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