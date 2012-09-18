define('views/maptoolsview', ['jquery', 'underscore', 'backbone', 'text!templates/toolstemplate.html'], function ($, _, Backbone, toolsTemplate) {
	'use strict';

	var toolTipSettings = {
		effect: 'fade',
		fadeOutSpeed: 100,
		predelay: 600,
		opacity: 0.8,
		position: 'center right',
		offset: [0, -5],
		events: {
			def: 'mouseenter',
			input: 'mouseenter,click mouseleave',
			widget: 'mouseenter,click mouseleave',
			tooltip: ''
		}
	};

	// TODO. these can be in their own module, so anyone can add to the array
	var tools = [{
		cl: 'zoomin',
		val: 'Zoom In',
		description: 'Move in one scale level',
		clickHandler: 'doZoomIn'
	}, {
		cl: 'zoomout',
		val: 'Zoom Out',
		description: 'Move out one scale level',
		clickHandler: 'doZoomOut'
	}, {
		cl: 'zoominitial',
		val: 'Zoom In',
		description: 'Go to the initial extent used when the map first loaded',
		clickHandler: 'doZoomInitial'
	}, {
		cl: 'zoomback',
		val: 'Previous Extent',
		description: 'Go to previous map extent',
		clickHandler: 'doZoomBack'
	}];

	var MapToolsView = Backbone.View.extend({
		initialize: function () {
			this.render();
		},
		template: _.template(toolsTemplate),
		render: function () {
			var self = this;

			self.$el.html(self.template({ tools : tools }));

			self.$('.zoomback').prop('disabled', true);
			if (self.options.mapModel) {
				self.options.mapModel.on('change:canZoomBackOne', function (model, canZoom) {
					self.$('.zoomback').prop('disabled', !self.options.mapModel.get('canZoomBackOne'));
				});
			}

			require(['js/plugins/jquery.tools.min.js'], function () {
				self.$('[title]').tooltip(toolTipSettings);
			});

			return self;
		},
		events: function () {
			var evts = {};
			_.each(tools, function (tool) {
				evts['click .' + tool.cl] = tool.clickHandler;
			});
			return evts;
		},
		doZoomIn: function () {
			if (this.options.mapModel) {
				this.options.mapModel.zoomInOne();
			}
		},
		doZoomOut: function () {
			if (this.options.mapModel) {
				this.options.mapModel.zoomOutOne();
			}
		},
		doZoomInitial: function () {
			if (this.options.mapModel) {
				this.options.mapModel.zoomToFullExtent();
			}
		},
		doZoomBack: function () {
			if (this.options.mapModel) {
				this.options.mapModel.zoomBackOneExtent();
			}
		}
	});

	return MapToolsView;
});