define('models/mapfeaturemodelcollection', ['jquery', 'underscore', 'backbone', 'models/mapfeaturemodel'], function ($, _, Backbone, MapFeatureModel) {
	'use strict';

	var MapFeatureModelCollection = Backbone.Collection.extend({
		model: MapFeatureModel,
		byNorthToSouth: function () {
			return this.sortBy(function (item) {
				var geom = item.get('geometry');

				var sort = 0;
				if (geom.type === 'extent') {
					sort = geom.ymax;
				} else if (geom.type === 'point') {
					sort = geom.y;
				} else if ('getExtent' in geom) { // covers all other known geometry types @ ESRI v. 3.1
					sort = geom.getExtent().ymax;
				}

				return -1 * sort;
			});
		}
	});

	return MapFeatureModelCollection;
});