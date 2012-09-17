// mapfeaturerenderer.js
// maps MapFeatureModelCollection on a MapModel
define('views/mapfeaturerenderer', ['jquery', 'dojo', 'underscore', 'backbone', 'esri', 'models/layermodel'], function ($, dojo, _, Backbone, esri, LayerModel) {
	'use strict';

	var defaultOpacity = 1.0;

	// attach standard events to graphicsLayer
	// change symbol and show info window on hover. go back on out.
	var wireLayerEvents = function (graphicsLayer, mapModel) {

		dojo.connect(graphicsLayer, 'onMouseOver', function (evt) {
			var graphic = evt.graphic;

			graphic.setSymbol(graphicsLayer.hoverSymbol); // this is fine if undefined

			// default behavior is infowindow on click. hover iz better
			var content = graphic.getContent();
			if (mapModel && content) {
				var infoWindow = mapModel.getInfoWindow();
				infoWindow.setContent(content);
				var screenPoint = mapModel.getScreenPointFromMapPoint(graphic.geometry);
				if (infoWindow.fadeShow) {
					infoWindow.fadeShow(screenPoint); // not esri. added by MapModel
				} else {
					infoWindow.show(screenPoint);
				}
			}
		});

		dojo.connect(graphicsLayer, 'onMouseOut', function (evt) {
			evt.graphic.setSymbol(undefined); // use layer's renderer

			if (mapModel) {
				mapModel.getInfoWindow().hide();
			}
		});

		dojo.connect(graphicsLayer, 'onDblClick', function (evt) {
			evt.preventDefault();
			var geom = evt.graphic.geometry;
			if (geom.type === 'point') {
				if (evt.graphic.attributes.zoomExtent) {
					var extent = evt.graphic.attributes.zoomExtent;
					mapModel.zoomToExtent(extent.xmin, extent.xmax, extent.ymin, extent.ymax, extent.spatialReference.wkid);
				} else {
					mapModel.zoomToLocation(geom.x, geom.y, geom.spatialReference.wkid, 'city');
				}
			}
		});
	};

	// returns array graphics from MapFeatureModelCollection
	var createGraphics = function (featureModels) {
		var graphics = featureModels.map(function (model) {
			var graphic = new esri.Graphic(model.get('geometry'));
			graphic.setAttributes(model.get('props'));
			return graphic;
		});
		return graphics;
	};

	var getGraphicExtent = function (graphic) {
		if (graphic.attributes.zoomExtent) {
			return graphic.attributes.zoomExtent;
		}

		// TODO. Handle other extent types... point, other geoms
	};

	// collection - MapFeatureModelCollection
	// options...
	// mapModel
	// symbol, hoverSymbol
	// infoTemplate
	// opacity
	// doNorthSouthSort
	// zoomOnRender
	var MapFeatureRenderer = Backbone.View.extend({
		_graphics: new esri.layers.GraphicsLayer(),
		initialize: function () {
			this._graphics.setOpacity(this.options.opacity || defaultOpacity);

			if ('infoTemplate' in this.options) {
				this._graphics.setInfoTemplate(this.options.infoTemplate);
			}
			if ('symbol' in this.options) {
				this._graphics.setRenderer(new esri.renderer.SimpleRenderer(this.options.symbol));
			}
			if ('hoverSymbol' in this.options) {
				this._graphics.hoverSymbol = this.options.hoverSymbol;
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

			var coll = this.options.doNorthSouthSort ? this.collection.byNorthToSouth() : this.collection;
			var g = createGraphics(coll);

			var graphicsExtent;

			_.each(g, function (graphic) {
				this._graphics.add(graphic);
				if ('undefined' === typeof graphicsExtent) {
					graphicsExtent = getGraphicExtent(graphic);
				} else {
					graphicsExtent = graphicsExtent.union(getGraphicExtent(graphic));
				}
			}, this);

			if (graphicsExtent && this.options.mapModel && this.options.zoomOnRender === true) {
				this.options.mapModel.zoomToExtent(graphicsExtent.xmin, graphicsExtent.xmax, graphicsExtent.ymin, graphicsExtent.ymax, graphicsExtent.spatialReference.wkid);
			}

			return this;
		},
		getGraphicsLayer: function () {
			return this._graphics;
		}
	});

	return MapFeatureRenderer;
});