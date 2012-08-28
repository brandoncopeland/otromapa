define('app/app', ['jquery', 'esri', 'esri/geometry', 'app/mapmodel'], function ($, esri, esriGeometry, MapModel) {

	var defaultExtent = new esriGeometry.Extent({
		xmin: -10739056,
		ymin: 3358910,
		xmax: -10506207,
		ymax: 3602617,
		spatialReference: { wkid: '3857' }
	});

	var init = function () {
		// a couple options here... can just create custom app.js for each project (current winner) or load from some config.json
		var map = new MapModel({ fullExtent: defaultExtent });
	};

	return {
		initialize: function () {
			init();
		}
	};
});