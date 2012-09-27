// floodplainlocatormodel
// listens for new features added to MapFeatureModelCollection, queries floodplain feature service, and appends floodplain attributes
// features - MapFeatureModelCollection
// floodplainServiceUrl - url to ESRI feature layer
define('models/floodplainlocatormodel', ['jquery', 'underscore', 'backbone', 'esri'], function ($, _, Backbone, esri) {
	'use strict';

	var FloodplainLocatorModel = Backbone.Model.extend({
		initialize: function () {
			var self = this;
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
			console.log('floodplain located for feature ' + feature.get('props').name);
		}
	});

	return FloodplainLocatorModel;
});