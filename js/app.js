define('app/app', ['jquery', 'esri', 'esri/geometry', 'app/mapmodel'], function ($, esri, esriGeometry, MapModel) {

	var init = function () {
		var map = new MapModel({
			fullExtent: new esriGeometry.Extent({
				xmin: -10739056,
				ymin: 3358910,
				xmax: -10506207,
				ymax: 3602617,
				spatialReference: { wkid: '3857' }
			})
		});
	};

	return {
		initialize: function () {
			init();
		}
	};
});