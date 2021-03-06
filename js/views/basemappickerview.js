// basemappickerview.js
// BaseMapPickerView collects all LayerModels in the MapModel's layers w/ isBasemap === true, 
//   renders in list, and ensures exactly 1 is visible at any time.
// Currently visible item in list tagged w/ 'selected' class.

define('views/basemappickerview', ['jquery', 'underscore', 'backbone', 'text!templates/basemapitemtemplate.html'], function ($, _, Backbone, itemTemplate) {
	'use strict';

	var selectedClass = 'selected';

	// view representing single basemap selector item
	// collection - LayerModelCollection, model - LayerModel
	var BaseMapItemView = Backbone.View.extend({
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

	// view representing collection of basemap selector items
	// collection should be LayerModelCollection, no model
	// TODO. could probably also handle edge cases... what if current basemap is removed? what if new visible basemap added?
	var BaseMapPickerView = Backbone.View.extend({
		initialize: function () {
			var self = this;
			self.collection.on('all', self.render, self); // if the layer collection changes, just redraw everything

			// make sure that 1 and only 1 is visible
			var bases = self.collection.baseMaps();
			var visibles = _.filter(bases, function (layer) {
				return layer.get('esriLayer').visible;
			});
			if (visibles.length === 0) {
				_.first(bases).get('esriLayer').show();
			} else {
				_.chain(visibles).rest(1).each(function (layer) {
					layer.get('esriLayer').hide();
				});
			}

			self.render();
		},
		views: [],
		events: {
			'click li': 'updateActive'
		},
		render: function () {
			var self = this;

			self.views = [];

			var bases = self.collection.baseMaps();

			if (bases.length > 1) {
				var $list = $('<ul>');

				_.each(bases, function (layer) {
					var view = new BaseMapItemView({
						model: layer,
						collection: self.collection,
						tagName: 'li',
						className: layer.get('esriLayer').visible ? selectedClass : ''
					});

					var element = view.render().el;
					$list.append(element);
					self.views.push(element);
				});

				self.$el.html($list);

				self.$el.removeClass('hidden');
			} else {
				// no need for this view if there are less than 2 basemaps...
				self.$el.html('');
				self.$el.addClass('hidden');
			}

			return self;
		},
		updateActive: function (evt) {
			// also handle click here... (in addition to item views)
			// Item view knows how to interact with the model (draw basemap) for each input click
			// Picker view knows how to manage all child views (dom elements), that they're 'li's, and their classes
			_.each(this.views, function (element) {
				$(element).removeClass(selectedClass);
			});
			$(evt.currentTarget).addClass(selectedClass);
		}
	});

	return BaseMapPickerView;
});