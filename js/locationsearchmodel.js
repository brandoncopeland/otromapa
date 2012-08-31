define('models/locationsearchmodel', ['jquery', 'dojo', 'underscore', 'backbone', 'esri', 'esri/geometry', 'models/layermodel', 'esri/tasks/Locator'], function ($, dojo, _, Backbone, esri, esriGeometry, LayerModel) {
	'use strict';

	var layerId = 'LocationSearchGraphics';
	var defaultPushpin = 'img/pushpins/pushpin-DD1054.png';
	var defaultHoverPushpin = 'img/pushpins/pushpin-F9417F.png';

	var getPushpinSymbol = function (imageUrl) {
		var symbol = new esri.symbol.PictureMarkerSymbol(imageUrl, 28, 32);
		symbol.setOffset(2, 16);
		return symbol;
	};

	var getLocator = function (url) {
		return new esri.tasks.Locator(url);
	};

	var addLayerToMap = function (esriLayer, mapModel) {
		mapModel.layers.add(new LayerModel({ esriLayer: esriLayer}));
	};

	var isGoodAddress = function (candidate) {
		return candidate.attributes.MatchLevel && candidate.attributes.MatchLevel === 'PointAddress'; // TODO. find out more about these fields. dups?
	}

	var LocationSearchModel = Backbone.Model.extend({
		defaults: {
			serviceUrl: 'http://tasks.arcgis.com/ArcGIS/rest/services/WorldLocator/GeocodeServer',
			defaultSymbol: getPushpinSymbol(defaultPushpin),
			hoverSymbol: getPushpinSymbol(defaultHoverPushpin),
			mapModel: undefined
		},
		_graphics: new esri.layers.GraphicsLayer({ opacity: 0.90, id: layerId }),
		initialize: function () {
			var self = this;

			// assign locator
			this._locator = getLocator(self.get('serviceUrl'));
			self.on('change:serviceUrl', function (model, value) {
				this._locator = getLocator(value);
			});

			// graphic events
			dojo.connect(self._graphics, 'onMouseOver', function (evt) {
				evt.graphic.setSymbol(self.get('hoverSymbol'));
			});
			dojo.connect(self._graphics, 'onMouseOut', function (evt) {
				evt.graphic.setSymbol(self.get('defaultSymbol'));
			});

			// map layer
			if (self.get('mapModel')) {
				addLayerToMap(self._graphics, self.get('mapModel'));
			}
			// what if mapModel changes a second time? is it ok to readd graphics layer to another map?
			self.on('change:mapModel', function (model, value) {
				addLayerToMap(self._graphics, value);
			});
		},
		// options: searchExtent
		locateAddress: function (address, options) {
			var self = this;

			self._graphics.clear();

			var a = { 'SingleLine': address };
			var params = _.extend(options || {}, { address: a, outFields: ['*']});

			var map = self.get('mapModel');
			if (map) {
				self._locator.outSpatialReference = map.spatialReference;
			}

			self._locator.addressToLocations(params, function (candidates) {
				if (map) {
					var filtered = _.filter(candidates, isGoodAddress);					
					_.each(filtered, function (item) {
						var geom = new esriGeometry.Point(item.location.x, item.location.y, new esri.SpatialReference(item.location.spatialReference));
						if (geom.spatialReference.wkid === map.get('geographicWkid')) {
							geom = esriGeometry.geographicToWebMercator(geom);
						}
						var infoTemplate = new esri.InfoTemplate('Location Search Result', '${address}');
						var graphic = new esri.Graphic(geom, self.get('defaultSymbol'), {
							address: item.address,
							score: item.score
						}, infoTemplate);
						self._graphics.add(graphic);
					});

					self._graphics.show();
				}
			});
		}
	});

	return LocationSearchModel;
});