define('models/mapmodel', ['jquery', 'dojo', 'underscore', 'backbone', 'esri', 'esri/geometry'], function ($, dojo, _, Backbone, esri, esriGeometry) {

	var gWkid = '4326';
	var mWkid = '3857';

	var scales = { // use later
		'house': 16,
		'subdivision': 13,
		'city': 11,
		'county': 8
	};

	// navigation...

	var zoomMapInOne = function (map) {
		map.setLevel(map.getLevel() + 1);
	};

	var zoomMapOutOne = function (map) {
		map.setLevel(map.getLevel() - 1);
	};

	var zoomMapToExtent = function (map, xmin, xmax, ymin, ymax, wkid) {
		var extent = new esriGeometry.Extent({
			xmin: xmin,
			ymin: ymin,
			xmax: xmax,
			ymax: ymax,
			spatialReference: { wkid: wkid }
		});
		map.setExtent(extent, true);
	};

	var zoomMapToLocation = function (map, x, y, wkid, scaleLevel) {
		var location = new esriGeometry.Point(x, y, new esri.SpatialReference({ wkid: wkid }));
		if (wkid === gWkid) {
			location = esriGeometry.geographicToWebMercator(location);
		}
		map.centerAndZoom(location, scaleLevel || map.getLevel());
	};

	// model...

  var MapModel = Backbone.Model.extend({
		defaults: {
			domId: 'map',
			geographicWkid: gWkid,
			mercatorWkid: mWkid,
			fullExtent: new esriGeometry.Extent({
				xmin: -14148334,
				ymin: 1317618,
				xmax: -6158715,
				ymax: 6889553,
				spatialReference: { wkid: mWkid }
			}),
			fadeOnZoom: true,
			fitExtent: true,
			logo: false,
			baselayers: [
				new esri.layers.ArcGISTiledMapServiceLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer')
			]
		},
		initialize: function () {
			var self = this;

			var mapSettings = {
				fadeOnZoom: self.get('fadeOnZoom'),
				fitExtent: self.get('getExtent'),
				logo: self.get('logo'),
				extent: self.get('fullExtent')
			};

			var map = new esri.Map(self.get('domId'), mapSettings);
			self.set('widget', map);

			_.each(self.get('baselayers'), function (layer) {
				map.addLayer(layer);
			});
		},
		zoomInOne: function () {
			zoomMapInOne(this.get('widget'));
		},
		zoomOutOne: function () {
			zoomMapOutOne(this.get('widget'));
		},
		zoomToExtent: function (xmin, xmax, ymin, ymax, wkid) {
			zoomMapToExtent(this.get('widget'), xmin, xmax, ymin, ymax, wkid);
		},
		zoomToFullExtent: function () {
			var extent = this.get('fullExtent');
			zoomMapToExtent(this.get('widget'), extent.xmin, extent.xmax, extent.ymin, extent.ymax, extent.spatialReference.wkid);
		},
		zoomToLocation: function (x, y, wkid, scaleLevel) {
			zoomMapToLocation(this.get('widget'), x, y, wkid, scaleLevel);
		}
	});

	return MapModel;
});