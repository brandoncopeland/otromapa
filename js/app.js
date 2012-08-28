define('app/app', ['jquery', 'esri', 'esri/geometry', 'app/mapmodel', 'app/themap'], function ($, esri, esriGeometry, MapModel, theMap) {

	var defaultExtent = new esriGeometry.Extent({
		xmin: -10739056,
		ymin: 3358910,
		xmax: -10506207,
		ymax: 3602617,
		spatialReference: { wkid: '3857' }
	});

	var init = function () {
		// a couple options for app specific config... can just create custom app.js for each project (current winner) or load from some config.json
		theMap.setTheMap(new MapModel({ fullExtent: defaultExtent }));
	};

	return {
		initialize: function () {
			init();
		}
	};
});