define('utilities/geometryutils', ['jquery', 'esri', 'esri/geometry'], function ($, esri, esriGeometry) {
	'use strict';

	var doExpand = function (geometry, distance) {
		if (geometry.type === 'extent') {
			return new esriGeometry.Extent(geometry.xmin - distance, geometry.ymin - distance, geometry.xmax + distance, geometry.ymax + distance, geometry.spatialReference);
		} else if (geometry.type === 'point') {
			return new esriGeometry.Extent(geometry.x - distance, geometry.y - distance, geometry.x + distance, geometry.y + distance, geometry.spatialReference);
		} else if ('getExtent' in geometry) { // covers all other known geometry types @ ESRI v. 3.1
			var geomExtent = geometry.getExtent();
			return new esriGeometry.Extent(geomExtent.xmin - distance, geomExtent.ymin - distance, geomExtent.xmax + distance, geomExtent.ymax + distance, geometry.spatialReference);
		}
	};

	return {
		// geometry - geometry to expand
		// distance - expand distance to add to each side in geometry spatial reference units
		getExpandedExtentForGeometry: function (geometry, distance) {
			return doExpand(geometry, distance);
		}
	};
});