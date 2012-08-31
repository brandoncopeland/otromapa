define('app/app', ['jquery', 'esri', 'esri/geometry', 'models/mapmodel', 'models/layermodel', 'models/locationsearchmodel', 'views/maptoolsview', 'views/basemappickerview'], function ($, esri, esriGeometry, MapModel, LayerModel, LocationSearchModel, MapToolsView, BasemapPickerView) {
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

		map.layers.add([
			new LayerModel({
				esriLayer: new esri.layers.ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer', {
					id: 'Canvas'
				}),
				isBasemap: true
			}),
			new LayerModel({
				esriLayer: new esri.layers.ArcGISTiledMapServiceLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer', {
					visible: false,
					id: 'Aerial'
				}),
				isBasemap: true
			}),
			new LayerModel({
				esriLayer: new esri.layers.ArcGISTiledMapServiceLayer('http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer', {
					visible: false,
					id: 'Atlas'
				}),
				isBasemap: true
			})
		]);

		var toolsView = new MapToolsView({
			el: $('#toolbox > .tools'),
			mapModel: map
		});

		var basemapPickerView = new BasemapPickerView({
			el: $('#basemapbox > .basemaps'),
			collection: map.layers
		});

		var locationSearchModel = new LocationSearchModel({ mapModel: map });
		locationSearchModel.locateAddress('2929 briarpark, houston, tx 77042');
	};

	return {
		initialize: function () {
			init();
		}
	};
});