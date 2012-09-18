// model for interacting with map
// props... layers, canZoomBackOne
define('models/mapmodel', ['jquery', 'dojo', 'dojo/_base/window', 'dojo/window', 'underscore', 'backbone', 'esri', 'esri/geometry', 'models/layermodel', 'models/layermodelcollection'], function ($, dojo, baseWin, dojoWin, _, Backbone, esri, esriGeometry, LayerModel, LayerModelCollection) {
	'use strict';

	var win = dojoWin.get(baseWin.doc);

	var gWkid = 4326;
	var mWkid = 3857;

	var scales = {
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

	// update map on window resize
	var wireMapResize = function (map) {
		var timer;
		dojo.connect(map, 'onLoad', function (evt) {
			dojo.connect(win, 'onresize', function (evt) {
				clearTimeout(timer);
				timer = setTimeout(function () {
					map.resize();
					map.reposition();
				}, 500);
			});
		});
	};

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
		if (wkid === gWkid) {
			extent = esriGeometry.geographicToWebMercator(extent);
			extent.setSpatialReference(new esri.SpatialReference({ wkid: mWkid })); // projection still uses older 102100, update manually
		}
		map.setExtent(extent, true);
	};

	var getScaleFrom = function (definition) {
		if (!definition) {
			return;
		}
		// number is just a number. string could mean predined scale string.
		if ($.isNumeric(definition)) {
			return definition;
		} else if (scales.hasOwnProperty(definition.toString())) {
			return scales[definition.toString()];
		}

		return;
	};
	var zoomMapToLocation = function (map, x, y, wkid, scaleLevel) {
		var location = new esriGeometry.Point(x, y, new esri.SpatialReference({ wkid: wkid }));
		if (wkid === gWkid) {
			location = esriGeometry.geographicToWebMercator(location);
			location.setSpatialReference(new esri.SpatialReference({ wkid: mWkid })); // projection still uses older 102100, update manually
		}
		map.centerAndZoom(location, getScaleFrom(scaleLevel) || map.getLevel());
	};

	// model...

  var MapModel = Backbone.Model.extend({
		defaults: {
			domId: 'map',
			geographicWkid: gWkid,
			mercatorWkid: mWkid,
			fullExtent: defaultExtent
		},
		initialize: function () {
			var self = this;

			self._pastExtents = []; // hold previous extent list

			self.set('canZoomBackOne', false);
			self.set('layers', new LayerModelCollection());

			var mapSettings = {
				fadeOnZoom: true,
				fitExtent: true,
				logo: false,
				extent: self.get('fullExtent')
			};

			var map = new esri.Map(self.get('domId'), mapSettings);
			self._widget = map;

			// display infoWindow with a fade in view fadeShow
			// this is really view type stuff, but ESRI holds the view and this is the simplest spot
			map.infoWindow.fadeShow = function (location) {
				map.infoWindow.show(location);
				var $infoContent = $('#' + self.get('domId') + '_infowindow .content').hide();
				setTimeout(function () {
					$infoContent.fadeIn(500);
				}, 600);
			};

			wireMapResize(map);

			dojo.connect(map, 'onExtentChange', function (newExtent) {
				self._pastExtents.push(newExtent);
				if (self._pastExtents.length > 1) {
					self.set('canZoomBackOne', true);
				} else {
					self.set('canZoomBackOne', false);
				}
			});

			var layers = self.get('layers');
			layers.on('add', function (layer, collection, options) {
				addMapLayer(self._widget, layer.get('esriLayer'), options.index);
			});
			layers.on('remove', function (layer) {
				removeMapLayer(self._widget, layer.get('esriLayer'));
			});
			layers.on('reset', function (collection) {
				resetMapLayers(self._widget, collection);
			});
		},
		// get map widget's infoWindow
		getInfoWindow: function () {
			return this._widget.infoWindow;
		},
		// get x/y location in screen pixels for mapPoint geometry on the map
		getScreenPointFromMapPoint: function (mapPoint) {
			var m = this._widget;
			return esriGeometry.toScreenGeometry(m.extent, m.width, m.height, mapPoint);
		},
		zoomInOne: function () {
			zoomMapInOne(this._widget);
		},
		zoomOutOne: function () {
			zoomMapOutOne(this._widget);
		},
		zoomToExtent: function (xmin, xmax, ymin, ymax, wkid) {
			zoomMapToExtent(this._widget, xmin, xmax, ymin, ymax, wkid);
		},
		zoomToFullExtent: function () {
			var extent = this.get('fullExtent');
			zoomMapToExtent(this._widget, extent.xmin, extent.xmax, extent.ymin, extent.ymax, extent.spatialReference.wkid);
		},
		// may use number scale or one of predefined scales (house, subdivision, city, county)
		zoomToLocation: function (x, y, wkid, scaleLevel) {
			zoomMapToLocation(this._widget, x, y, wkid, scaleLevel);
		},
		zoomBackOneExtent: function () {
			if (this.get('canZoomBackOne') === true) {
				this._pastExtents.pop(); // take off current
				var newExtent = this._pastExtents.pop(); // this will get pushed back on extent change
				zoomMapToExtent(this._widget, newExtent.xmin, newExtent.xmax, newExtent.ymin, newExtent.ymax, newExtent.spatialReference.wkid);
			}
		}
	});

	return MapModel;
});