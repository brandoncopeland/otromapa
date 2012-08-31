define('views/maptoolsview', ['jquery', 'underscore', 'backbone', 'text!templates/maptoolstemplate.html', 'js/plugins/jquery.tools.min.js'], function ($, _, Backbone, mapToolsTemplate) {
	'use strict';

	var toolTipSettings = {
		effect: 'fade',
		fadeOutSpeed: 100,
		predelay: 600,
		opacity: 0.9,
		position: 'center right',
		offset: [12, -6],
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
		description: 'Go in one scale level',
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
			this.$el.html(this.template({ tools : tools }));

			$(this.$el.find('[title]')).tooltip(toolTipSettings);

			return this;
		},
		events: function () {
			var evts = {};
			_.each(tools, function (tool) {
				var selector = 'click .' + tool.cl;
				evts[selector] = tool.clickHandler;
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