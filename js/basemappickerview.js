define('views/basemappickerview', ['jquery', 'underscore', 'backbone', 'text!templates/basemapitemtemplate.html'], function ($, _, Backbone, itemTemplate) {
	'use strict';

	var BaseMapItemView = Backbone.View.extend({
		tagName: 'li',
		template: _.template(itemTemplate),
		render: function () {
			this.$el.html(this.template({ basemap : this.model }));
			return this;
		},
		events: {
      'click input': 'drawMap'
    },
    drawMap: function () {
			// iterate all basemaps. if they match my model, draw. if they don't, hide.
			var myId = this.model.get('esriLayer').id;
			_.each(this.collection.baseMaps(), function (layer) {
				var esriLayer = layer.get('esriLayer');
				if (esriLayer.id === myId) {
					esriLayer.show();
				} else {
					esriLayer.hide();
				}
			});
    }
	});

	// collection should be LayerModelCollection, no model
	var BaseMapPickerView = Backbone.View.extend({
		initialize: function () {
			var self = this;
			self.collection.bind('all', self.render, self); // if the layer collection changes, just redraw everything
			self.render();
		},
		render: function () {
			var self = this;

			var bases = self.collection.baseMaps();

			if (bases.length > 1) { // only draw if there are basemaps
				var $list = $('<ul>');

				_.each(bases, function (layer) {
					var view = new BaseMapItemView({ model: layer, collection: self.collection });
					$list.append(view.render().el);
				});

				self.$el.html($list);

				self.$el.removeClass('hidden');
			} else {
				self.$el.html('');
				self.$el.addClass('hidden');
			}

			return self;
		}
	});

	return BaseMapPickerView;
});