define('app/app', ['jquery', 'esri', 'esri/geometry', 'models/mapmodel', 'models/layermodel', 'models/locationsearchmodel', 'views/maptoolsview', 'views/basemappickerview', 'views/locationsearchview', 'views/mapfeaturerenderer', 'views/demonotificationtoolsview'], function ($, esri, esriGeometry, MapModel, LayerModel, LocationSearchModel, MapToolsView, BasemapPickerView, LocationSearchView, MapFeatureRenderer, DemoNotificationToolsView) {
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

		map.get('layers').add([
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

		// navigation tools
		var toolsView = new MapToolsView({
			el: $('#toolbox > .tools'),
			mapModel: map
		});

		var demoNotificationView = new DemoNotificationToolsView({
			el: $('#toolbox > .tools')
		});

		// basemap picker
		var basemapPickerView = new BasemapPickerView({
			el: $('#basemapbox > .basemaps'),
			collection: map.get('layers')
		});

		// location search
		var locationSymbol = new esri.symbol.PictureMarkerSymbol('img/pushpins/pushpin-DD1054.png', 28, 32);
		locationSymbol.setOffset(2, 16);
		var locationHoverSymbol = new esri.symbol.PictureMarkerSymbol('img/pushpins/pushpin-E88289.png', 28, 32);
		locationHoverSymbol.setOffset(2, 16);
		var locationSearchModel = new LocationSearchModel();
		var locationSearchView = new LocationSearchView({
			el: $('#searchbox'),
			model: locationSearchModel
		});
		var locationRenderer = new MapFeatureRenderer({
			collection: locationSearchModel.get('featureResults'),
			mapModel: map,
			symbol: locationSymbol,
			hoverSymbol: locationHoverSymbol,
			opacity: 0.9,
			infoTemplate: new esri.InfoTemplate('Location Search Result', '${name}'),
			doNorthSouthSort: true,
			zoomOnRender: true
		});
	};

	return {
		initialize: function () {
			init();
		}
	};
});