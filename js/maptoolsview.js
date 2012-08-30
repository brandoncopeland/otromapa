define('views/maptoolsview', ['jquery', 'underscore', 'backbone', 'text!templates/maptoolstemplate.html'], function ($, _, Backbone, mapToolsTemplate) {

	// TODO. these can be in their own module, so anyone can add to the array
	var tools = [{
		cl: 'zoomin',
		val: 'Zoom In',
		clickHandler: 'doZoomIn'
	}, {
		cl: 'zoomout',
		val: 'Zoom Out',
		clickHandler: 'doZoomOut'
	}, {
		cl: 'zoominitial',
		val: 'Zoom In',
		clickHandler: 'doZoomInitial'
	}];

	var MapToolsView = Backbone.View.extend({
		initialize: function () {
			this.render();
		},
		template: _.template(mapToolsTemplate),
		render: function () {
			this.$el.html(this.template({ tools : tools }));
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