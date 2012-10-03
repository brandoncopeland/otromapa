define('app/app-brazoria-floodplain', ['jquery', 'esri', 'esri/geometry', 'models/mapmodel', 'models/layermodel', 'models/locationsearchmodel', 'views/maptoolsview', 'views/basemappickerview', 'views/locationsearchview', 'views/floodplaininfoview', 'views/mapfeaturerenderer', 'models/floodplainlocatormodel', 'esri/virtualearth/vetiledlayer'], function ($, esri, esriGeometry, MapModel, LayerModel, LocationSearchModel, MapToolsView, BasemapPickerView, LocationSearchView, FloodplainInfoView, MapFeatureRenderer, FloodplainLocatorModel) {
	'use strict';

	var defaultExtent = new esriGeometry.Extent({
		xmin: -10685400,
		ymin: 3343200,
		xmax: -10570600,
		ymax: 3454800,
		spatialReference: { wkid: '3857' }
	});

	var init = function () {

		var floodplainInfoView = new FloodplainInfoView({
			el: $('#panelbox')
		});

		var map = new MapModel({
			fullExtent: defaultExtent
		});

		map.get('layers').add([
			new LayerModel({
				esriLayer: new esri.layers.ArcGISTiledMapServiceLayer('http://gisdemo.ljaengineering.com/ArcGIS/rest/services/brazoria/standardbasemap/MapServer', {
					id: 'Standard'
				}),
				isBasemap: true
			}), new LayerModel({
				esriLayer: new esri.virtualearth.VETiledLayer({
					bingMapsKey: 'AiY7AwSxrYKtsiTIcgzEtqNA932v5vJcyqjTVRfm_eoaYTAdFOm-fYEuanVZreIn',
					mapStyle: esri.virtualearth.VETiledLayer.MAP_STYLE_AERIAL,
					id: 'Aerial',
					visible: false
				}),
				isBasemap: true
			})
		]);

		map.get('layers').add([
			new LayerModel({
				esriLayer: new esri.layers.ArcGISTiledMapServiceLayer('http://gisdemo.ljaengineering.com/ArcGIS/rest/services/brazoria/floodplain/MapServer', {
					id: 'Floodplains',
					opacity: 0.75
				})
			})
		]);

		// navigation tools
		var toolsView = new MapToolsView({
			el: $('#toolbox > .tools'),
			mapModel: map
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
			model: locationSearchModel,
			searchExtent: defaultExtent,
			locationUrlParam: 'l'
		});
		var locationRenderer = new MapFeatureRenderer({
			collection: locationSearchModel.get('featureResults'),
			mapModel: map,
			symbol: locationSymbol,
			hoverSymbol: locationHoverSymbol,
			opacity: 0.9,
			infoTemplate: new esri.InfoTemplate('Location Search Result', '${name}<p class="floodmessage">${floodMessage}</p>'),
			doNorthSouthSort: true,
			zoomOnRender: true
		});

		var floodplainLocator = new FloodplainLocatorModel({
			features: locationSearchModel.get('featureResults'),
			floodplainServiceUrl: 'http://gisdemo.ljaengineering.com/ArcGIS/rest/services/brazoria/floodplain/MapServer/0'
		});
	};

	return {
		initialize: function () {
			init();
		}
	};
});