define('app/app', ['jquery', 'esri', 'esri/geometry', 'models/mapmodel', 'models/layermodel', 'views/maptoolsview'], function ($, esri, esriGeometry, MapModel, LayerModel, MapToolsView) {
	'use strict';

	var defaultExtent = new esriGeometry.Extent({
		xmin: -10739056,
		ymin: 3358910,
		xmax: -10506207,
		ymax: 3602617,
		spatialReference: { wkid: '3857' }
	});

	var init = function () {
		// a couple options for app specific config... can just create custom app.js for each project (current winner) or load from some config.json
		var map = new MapModel({
			fullExtent: defaultExtent
		});

		map.layers.add(new LayerModel({
			esriLayer: new esri.layers.ArcGISTiledMapServiceLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer')
		}));

		var toolsView = new MapToolsView({
			el: $('#toolbox'),
			mapModel: map
		});
	};

	return {
		initialize: function () {
			init();
		}
	};
});