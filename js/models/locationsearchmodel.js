// locationsearchmodel.js
// perform location search and add results to mapModel
// var locationSearchModel = new LocationSearchModel({ mapModel: map });
// locationSearchModel.locateAddress('2929 Briarpark, Houston, TX');

define('models/locationsearchmodel', ['jquery', 'underscore', 'backbone', 'esri', 'esri/geometry', 'esri/tasks/Locator', 'models/mapfeaturemodel', 'models/mapfeaturemodelcollection'], function ($, _, Backbone, esri, esriGeometry, esriLocator, MapFeatureModel, MapFeatureModelCollection) {
	'use strict';

	var outputWkid = 3857;

	var createLocator = function (url) {
		return new esri.tasks.Locator(url);
	};

	// bool if candidate matches good address requirements
	var isGoodAddress = function (candidate) {
		return true; // candidate.attributes.MatchLevel && candidate.attributes.MatchLevel === 'PointAddress'; // TODO. find out more about these fields. dups?
	};

	var LocationSearchModel = Backbone.Model.extend({
		defaults: {
			serviceUrl: 'http://tasks.arcgis.com/ArcGIS/rest/services/WorldLocator/GeocodeServer',
			isWorking: false,
			featureResults: new MapFeatureModelCollection()
		},
		initialize: function () {
			this._locator = createLocator(this.get('serviceUrl'));
			this.on('change:serviceUrl', function (model, value) {
				this._locator = createLocator(value);
			});
		},
		// options: searchExtent
		// featureResults populated with results after via reset
		locateAddress: function (address, options) {
			var self = this;

			self.set('isWorking', true);

			self.clearResults();

			var a = { SingleLine: address };
			var params = _.extend(options || {}, { address: a, outFields: ['*']});

			self._locator.outSpatialReference = new esri.SpatialReference(outputWkid);

			self._locator.addressToLocations(params, function (candidates) {
				var results = _.chain(candidates).filter(isGoodAddress).map(function (item) {
					// TODO. These fields (West_Lon, etc...) are service specific. Define better specs on how to construct this.
					var zoomExtent = esriGeometry.geographicToWebMercator(new esriGeometry.Extent(item.attributes.West_Lon, item.attributes.South_Lat, item.attributes.East_Lon, item.attributes.North_Lat, new esri.SpatialReference(4326)));
					return new MapFeatureModel({
						props: {
							score: item.score,
							matchType: item.attributes.MatchLevel,
							name: item.address,
							zoomExtent: zoomExtent // convention for all MapFeatureModels
						},
						geometry: new esriGeometry.Point(item.location.x, item.location.y, new esri.SpatialReference(item.location.spatialReference))
					});
				}).value();
				self.get('featureResults').reset(results);

				self.set('isWorking', false);
			});
		},
		clearResults: function () {
			this.get('featureResults').reset();
		}
	});

	return LocationSearchModel;
});