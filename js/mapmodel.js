define('models/mapmodel', ['jquery', 'dojo', 'underscore', 'backbone', 'esri', 'esri/geometry', 'models/layermodel', 'models/layermodelcollection'], function ($, dojo, _, Backbone, esri, esriGeometry, LayerModel, LayerModelCollection) {

	var gWkid = '4326';
	var mWkid = '3857';

	var scales = { // use later
		house: 16,
		subdivision: 13,
		city: 11,
		county: 8
	};

	var defaultExtent = new esriGeometry.Extent({
		xmin: -14148334,
		ymin: 1317618,
		xmax: -6158715,
		ymax: 6889553,
		spatialReference: { wkid: mWkid }
	});

	var addMapLayer = function (map, layer, index) {
		map.addLayer(layer, index);
	};
	var removeMapLayer = function (map, layer) {
		map.removeLayer(layer); // seems like bug w/ ESRI API if doing this before map initial load
	};
	var resetMapLayers = function (map, layerModelCollection) {
		// complete reset...
		// add any new items in collection
		// remove any old items
		// reorder everything

		var collectionIds = [];

		// add
		layerModelCollection.each(function (layer) {
			var esriLayer = layer.get('esriLayer');
			if (_.indexOf(map.layerIds, esriLayer.id) === -1) {
				map.addLayer(esriLayer);
			}
			collectionIds.push(esriLayer.id);
		});

		// remove
		_.each(map.layerIds, function (id) {
			if (_.indexOf(collectionIds, id) === -1) {
				map.removeLayer(map.getLayer(id));
			}
		});

		// reorder
		var i = 0;
		layerModelCollection.each(function (layer) {
			map.reorderLayer(layer.get('esriLayer'), i);
			i = i + 1;
		});
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
			fullExtent: defaultExtent,
			fadeOnZoom: true,
			fitExtent: true,
			logo: false
		},
		initialize: function () {
			var self = this;

			var layers = self.layers = new LayerModelCollection();

			var mapSettings = {
				fadeOnZoom: self.get('fadeOnZoom'),
				fitExtent: self.get('getExtent'),
				logo: self.get('logo'),
				extent: self.get('fullExtent')
			};

			var map = new esri.Map(self.get('domId'), mapSettings);
			self.set('_widget', map);

			layers.on('add', function (layer, collection, options) {
			  addMapLayer(self.get('_widget'), layer.get('esriLayer'), options.index);
			});
			layers.on('remove', function (layer) {
				removeMapLayer(self.get('_widget'), layer.get('esriLayer'));
			});
			layers.on('reset', function (collection) {
				resetMapLayers(self.get('_widget'), collection);
			});
		},
		zoomInOne: function () {
			zoomMapInOne(this.get('_widget'));
		},
		zoomOutOne: function () {
			zoomMapOutOne(this.get('_widget'));
		},
		zoomToExtent: function (xmin, xmax, ymin, ymax, wkid) {
			zoomMapToExtent(this.get('_widget'), xmin, xmax, ymin, ymax, wkid);
		},
		zoomToFullExtent: function () {
			var extent = this.get('fullExtent');
			zoomMapToExtent(this.get('_widget'), extent.xmin, extent.xmax, extent.ymin, extent.ymax, extent.spatialReference.wkid);
		},
		zoomToLocation: function (x, y, wkid, scaleLevel) {
			zoomMapToLocation(this.get('_widget'), x, y, wkid, scaleLevel);
		}
	});

	return MapModel;
});