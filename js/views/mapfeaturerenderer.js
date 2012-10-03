// mapfeaturerenderer.js
// maps MapFeatureModelCollection on a MapModel
define('views/mapfeaturerenderer', ['jquery', 'dojo', 'underscore', 'backbone', 'esri', 'esri/geometry', 'models/layermodel'], function ($, dojo, _, Backbone, esri, esriGeometry, LayerModel) {
	'use strict';

	var defaultOpacity = 1.0;
	var zoomExpansionFactor = 1.3;
	var someSmallAmount = 0.0001;

	var getGraphicExtent = function (graphic) {
		if (graphic.attributes.zoomExtent) {
			return graphic.attributes.zoomExtent;
		} else if (graphic.geometry.type === 'extent') {
			return graphic.geometry;
		} else if (graphic.geometry.type === 'point') {
			return new esriGeometry.Extent(graphic.geometry.x - someSmallAmount, graphic.geometry.y - someSmallAmount, graphic.geometry.x + someSmallAmount, graphic.geometry.y + someSmallAmount, graphic.geometry.spatialReference);
		} else if ('getExtent' in graphic.geometry) { // covers all other known geometry types @ ESRI v. 3.1
			return graphic.geometry.getExtent();
		}
	};

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
			var zoomExt = getGraphicExtent(evt.graphic).expand(zoomExpansionFactor);
			mapModel.zoomToExtent(zoomExt.xmin, zoomExt.xmax, zoomExt.ymin, zoomExt.ymax, zoomExt.spatialReference.wkid);
		});
	};

	// returns array graphics from MapFeatureModelCollection
	var createGraphics = function (featureModels) {
		var graphics = _.map(featureModels, function (model) {
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
	// zoomOnRender
	var MapFeatureRenderer = Backbone.View.extend({
		initialize: function () {
			this._graphics = new esri.layers.GraphicsLayer();
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
				graphicsExtent = graphicsExtent.expand(zoomExpansionFactor);
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