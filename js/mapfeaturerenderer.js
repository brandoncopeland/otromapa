define('views/mapfeaturerenderer', ['jquery', 'dojo', 'underscore', 'backbone', 'esri', 'models/layermodel'], function ($, dojo, _, Backbone, esri, LayerModel) {
	'use strict';

	var wireLayerEvents = function (graphicsLayer, mapModel) {
		dojo.connect(graphicsLayer, 'onMouseOver', function (evt) {
			var graphic = evt.graphic;

			// graphic.setSymbol(self.get('hoverSymbol'));

			// default behavior is infowindow on click. hover iz better
			var content = graphic.getContent(); // TODO. no content
			if (mapModel && content) {
				var infoWindow = mapModel.getInfoWindow();
				infoWindow.setContent(content);
				var screenPoint = mapModel.getScreenPointFromMapPoint(graphic.geometry);
				if (infoWindow.fadeShow) {
					infoWindow.fadeShow(screenPoint);
				} else {
					infoWindow.show(screenPoint);
				}
			}
		});
		dojo.connect(graphicsLayer, 'onMouseOut', function (evt) {
			// evt.graphic.setSymbol(self.get('defaultSymbol'));

			if (mapModel) {
				mapModel.getInfoWindow().hide();
			}
		});
	};

	// returns array graphics
	var createGraphics = function (featureModels) {
		var graphics = featureModels.map(function (model) {
			var graphic = new esri.Graphic(model.get('geometry'));
			graphic.setAttributes(model.get('props'));
			return graphic;
		});
		return graphics;
	};

	// collection - MapFeatureModelCollection
	// options...
	// mapModel
	// symbol, hoverSymbol
	// infoTemplate
	// opacity
	// doNorthSouthSort
	var MapFeatureRenderer = Backbone.View.extend({
		_graphics: new esri.layers.GraphicsLayer(),
		initialize: function () {
			if ('opacity' in this.options) {
				this._graphics.setOpacity(this.options.opacity);
			}
			if ('infoTemplate' in this.options) {
				this._graphics.setInfoTemplate(this.options.infoTemplate);
			}
			if ('symbol' in this.options) {
				this._graphics.setRenderer(new esri.renderer.SimpleRenderer(this.options.symbol));
			}
			if ('mapModel' in this.options) {
				this.options.mapModel.get('layers').add(new LayerModel({
					esriLayer: this._graphics
				}));
				wireLayerEvents(this._graphics, this.options.mapModel);
			}

			this.collection.on('all', this.render, this);

			this.render();
		},
		render: function () {
			this._graphics.clear();

			var g;
			if (this.options.doNorthSouthSort) {
				g = createGraphics(this.collection.byNorthToSouth());
			} else {
				g = createGraphics(this.collection);
			}

			_.each(g, function (graphic) {
				this._graphics.add(graphic);
			}, this);

			return this;
		}
	});

	return MapFeatureRenderer;
});