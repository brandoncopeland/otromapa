// floodplainlocatormodel
// listens for new features added to MapFeatureModelCollection, queries floodplain feature service, and appends floodplain attributes
// features - MapFeatureModelCollection
// floodplainServiceUrl - url to ESRI feature layer
// example usage...
// var floodplainLocator = new FloodplainLocatorModel({
//   features: someCollectionOfMapFeaturesToAppendFloodplainStatus,
//   floodplainServiceUrl: 'http://myserver/ArcGIS/rest/services/floodplain/MapServer/0',
//   floodMessageAttributeField: myFloodMessage,
//   floodZoneField: fieldNameDescribingZoneOnServer
// });	
define('models/floodplainlocatormodel', ['jquery', 'underscore', 'backbone', 'esri', 'utilities/geometryutils', 'text!data/floodzones.json', 'esri/tasks/query'], function ($, _, Backbone, esri, geomUtils, zoneData) {
	'use strict';

	var noMatchMessage = 'Flood Zone could not be determined for this location';
	var inSfhaMessage = 'This location is within a Special Flood Hazard Area (SFHA) and mandatory flood insurance purchase requirements and floodplain management standards apply.';
	var outSfhaMessage = 'This location is outside of a Special Flood Hazard Area (SFHA).';
	var nearSfhaMessage = 'This location is outside of a Special Flood Hazard Area (SFHA), but SFHA areas are in close proximity and further, more detailed investigation is recommended.';

	var FloodplainLocatorModel = Backbone.Model.extend({
		defaults: {
			floodMessageAttributeField: 'floodMessage', // field to add to MapFeatureModel.props with new flood message
			floodZoneField: 'FLD_ZONE' // field in GIS dataset with floodzone value
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
				query.outFields = [self.get('floodZoneField')];
				task.execute(query, function (result) {
					var zoneMessage = noMatchMessage;
					if (result.features.length === 1) {
						var featureZone = result.features[0].attributes[self.get('floodZoneField')];
						var zone = self._zoneData[featureZone];
						if (zone) {
							zoneMessage = 'Located in ' + zone.name + '.';

							if (zone.inSfha === true) {
								zoneMessage = zoneMessage + ' ' + inSfhaMessage;
							}
							if (zone.inSfha === false) {
								// zone is outside sfha. do second check for any inSfha within 500 feet.
								var buffered = geomUtils.getExpandedExtentForGeometry(query.geometry, 152.4); // 152.4 meters = 500 feet
								query.geometry = buffered;
								task.execute(query, function (bufferResult) {
									var isNearSfha = false;
									_.each(bufferResult.features, function (item) {
										var itemZone = item.attributes[self.get('floodZoneField')];
										var zone = self._zoneData[itemZone];
										isNearSfha = isNearSfha || zone.inSfha;
									});
									if (isNearSfha) { // nearby SFHA, use nearby message
										feature.get('props')[self.get('floodMessageAttributeField')] = feature.get('props')[self.get('floodMessageAttributeField')] + ' ' + nearSfhaMessage;
									} else { // no nearby, use standard out message
										feature.get('props')[self.get('floodMessageAttributeField')] = feature.get('props')[self.get('floodMessageAttributeField')] + ' ' + outSfhaMessage;
									}
								});
							}

						}
					} else if (result.features.length > 1) {
						zoneMessage = 'Multiple Flood Zones for this location'; // final implementation should construct message listing zones
					}
					feature.get('props')[self.get('floodMessageAttributeField')] = zoneMessage;
				});
			}
		}
	});

	return FloodplainLocatorModel;
});