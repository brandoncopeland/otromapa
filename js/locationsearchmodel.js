// locationsearchmodel.js
// perform location search and add results to mapModel
// var locationSearchModel = new LocationSearchModel({ mapModel: map });
// locationSearchModel.locateAddress('2929 Briarpark, Houston, TX');

define('models/locationsearchmodel', ['jquery', 'dojo', 'underscore', 'backbone', 'esri', 'esri/geometry', 'models/layermodel', 'esri/tasks/Locator'], function ($, dojo, _, Backbone, esri, esriGeometry, LayerModel) {
	'use strict';

	var layerId = 'LocationSearchGraphics';
	var defaultPushpin = 'img/pushpins/pushpin-DD1054.png';
	var defaultHoverPushpin = 'img/pushpins/pushpin-F9417F.png';

	var createPushpinSymbol = function (imageUrl) {
		var symbol = new esri.symbol.PictureMarkerSymbol(imageUrl, 28, 32);
		symbol.setOffset(2, 16);
		return symbol;
	};

	var createLocator = function (url) {
		return new esri.tasks.Locator(url);
	};

	var addLayerToMap = function (esriLayer, mapModel) {
		mapModel.layers.add(new LayerModel({ esriLayer: esriLayer}));
	};

	// bool if candidate matches good address requirements
	var isGoodAddress = function (candidate) {
		return candidate.attributes.MatchLevel && candidate.attributes.MatchLevel === 'PointAddress'; // TODO. find out more about these fields. dups?
	};

	var LocationSearchModel = Backbone.Model.extend({
		defaults: {
			serviceUrl: 'http://tasks.arcgis.com/ArcGIS/rest/services/WorldLocator/GeocodeServer',
			defaultSymbol: createPushpinSymbol(defaultPushpin),
			hoverSymbol: createPushpinSymbol(defaultHoverPushpin),
			mapModel: undefined
		},
		_graphics: new esri.layers.GraphicsLayer({ opacity: 0.90, id: layerId }),
		initialize: function () {
			var self = this;

			// assign locator
			this._locator = createLocator(self.get('serviceUrl'));
			self.on('change:serviceUrl', function (model, value) {
				this._locator = createLocator(value);
			});

			// graphic events
			dojo.connect(self._graphics, 'onMouseOver', function (evt) {
				var graphic = evt.graphic;
				graphic.setSymbol(self.get('hoverSymbol'));

				// default behavior is infowindow on click. hover iz better
				// TODO. factor this out to some util somewhere or plugin updating graphic prototype
				var map = self.get('mapModel');
				var content = graphic.getContent();
				if (map && content) {
					var infoWindow = map.getInfoWindow();
					infoWindow.setContent(content);
					var screenPoint = map.getScreenPointFromMapPoint(graphic.geometry);
					if (infoWindow.fadeShow) {
						infoWindow.fadeShow(screenPoint);
					} else {
						infoWindow.show(screenPoint);
					}
				}
			});
			dojo.connect(self._graphics, 'onMouseOut', function (evt) {
				evt.graphic.setSymbol(self.get('defaultSymbol'));

				var map = self.get('mapModel');
				if (map) {
					map.getInfoWindow().hide();
				}
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
		},
		getEsriGraphicsLayer: function () {
			return this._graphics;
		}
	});

	return LocationSearchModel;
});