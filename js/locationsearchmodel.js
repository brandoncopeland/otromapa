define('models/locationsearchmodel', ['jquery', 'dojo', 'underscore', 'backbone', 'esri', 'esri/geometry', 'models/layermodel', 'esri/tasks/Locator'], function ($, dojo, _, Backbone, esri, esriGeometry, LayerModel) {
	'use strict';

	var layerId = 'LocationSearchGraphics';
	var defaultPushpin = 'img/pushpin-DD1054.png';

	var addLayerToMap = function (esriLayer, mapModel) {
		mapModel.layers.add(new LayerModel({ esriLayer: esriLayer}));
	};

	var LocationSearchModel = Backbone.Model.extend({
		defaults: {
			serviceUrl: 'http://tasks.arcgis.com/ArcGIS/rest/services/WorldLocator/GeocodeServer',
			resultSymbol: undefined,
			mapModel: undefined
		},
		_graphics: new esri.layers.GraphicsLayer({ opacity: 0.70, id: layerId }),
		_createLocator: function () {
			this._locator = new esri.tasks.Locator(this.get('serviceUrl'));
		},
		initialize: function () {
			var self = this;

			self._createLocator();
			self.on('change:serviceUrl', self._createLocator);

			if (self.get('mapModel')) {
				addLayerToMap(self._graphics, self.get('mapModel'));
			}
			// what if mapModel changes a second time? is it ok to readd graphics layer to another map?
			self.on('change:mapModel', function () {
				addLayerToMap(self._graphics, self.get('mapModel'));
			});

			var symbol = new esri.symbol.PictureMarkerSymbol(defaultPushpin, 28, 32);
			symbol.setOffset(2, 16);
			self.set('resultSymbol', symbol);
		},
		// options: searchExtent
		locateAddress: function (address, options) {
			var self = this;

			self._graphics.clear();

			var a = { 'SingleLine': address };
			var params = _.extend(options || {}, { address: a, outFields: ['*']});

			//locator.outSpatialReference= map.spatialReference;

			self._locator.addressToLocations(params, function (candidates) {
				var map = self.get('mapModel');
				if (map) {
					var filtered = _.filter(candidates, function (candidate) {
						return candidate.attributes.MatchLevel && candidate.attributes.MatchLevel === 'PointAddress'; // TODO. find out more about these fields. dups?
					});
					_.each(filtered, function (item) {
						var geom = new esriGeometry.Point(item.location.x, item.location.y, new esri.SpatialReference(item.location.spatialReference));
						if (geom.spatialReference.wkid === map.get('geographicWkid')) {
							geom = esriGeometry.geographicToWebMercator(geom);
						}
						var infoTemplate = new esri.InfoTemplate('Location Search Result', '${address}');
						var graphic = new esri.Graphic(geom, self.get('resultSymbol'), {
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