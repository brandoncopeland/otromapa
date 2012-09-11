define('views/maptoolsview', ['jquery', 'underscore', 'backbone', 'text!templates/maptoolstemplate.html'], function ($, _, Backbone, mapToolsTemplate) {
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
	}];

	var MapToolsView = Backbone.View.extend({
		initialize: function () {
			this.render();
		},
		template: _.template(mapToolsTemplate),
		render: function () {
			var self = this;

			self.$el.html(self.template({ tools : tools }));

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
		}
	});

	return MapToolsView;
});