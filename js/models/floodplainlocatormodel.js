// floodplainlocatormodel
// listens for new features added to MapFeatureModelCollection, queries floodplain feature service, and appends floodplain attributes
// features - MapFeatureModelCollection
// floodplainServiceUrl - url to ESRI feature layer
define('models/floodplainlocatormodel', ['jquery', 'underscore', 'backbone', 'esri', 'text!data/floodzones.json', 'esri/tasks/query'], function ($, _, Backbone, esri, zoneData) {
	'use strict';

	var FloodplainLocatorModel = Backbone.Model.extend({
		defaults: {
			floodMessageAttributeField: 'floodMessage',
			floodZoneField: 'FLD_ZONE'
		},
		initialize: function () {
			var self = this;
			self._zoneData = $.parseJSON(zoneData);
			var features = self.get('features');
			if (features) {
				features.on('add', function (item) {
					self.locateFloodplainForFeature(item);
				});
				features.on('reset', function (items) {
					items.each(function (item) {
						self.locateFloodplainForFeature(item);
					});
				});
			}
		},
		locateFloodplainForFeature: function (feature) {
			var self = this;
			var serviceUrl = self.get('floodplainServiceUrl');
			if (serviceUrl) {
				var task = new esri.tasks.QueryTask(serviceUrl);
				var query = new esri.tasks.Query();
				query.geometry = feature.get('geometry');
				query.returnGeometry = false;
				query.outFields = ['*'];
				task.execute(query, function (result) {
					var zoneMessage;
					if (result.features.length === 0) {
						zoneMessage = 'Flood Zone could not be determined for this location.';
					} else if (result.features.length === 1) {
						var featureZone = result.features[0].attributes[self.get('floodZoneField')];
						zoneMessage = 'Located in Flood Zone ' + featureZone;
						if (self._zoneData[featureZone]) {
							zoneMessage = zoneMessage + '. ' + self._zoneData[featureZone].sfhaDescription;
						}
					}
					feature.get('props')[self.get('floodMessageAttributeField')] = zoneMessage;
				});
			}
		}
	});

	return FloodplainLocatorModel;
});