# MapModel

## Properties

- domId: <String> id of the dom element to set up as map widget. Do net set after instantiation. Default 'map'.
- geographicWkid: <String> WKID used by the model to determine geographic projection. Should not be set.
- mercatorWkid: <String> WKID used by the model to determine mercator projection. Should not be set.
- fullExtent: <esri.geometry.Geometry.Extent> Initial extent of the map.
- layers: <LayerModelCollection> Map layers. Map handles almost anything you want to do to this collection - add, remove, reorder, combinations, etc...

## Methods

- zoomInOne: Navigate map in 1 level.
- zoomOutOne: Navigate map out 1 level.
- zoomToExtent: Navigate map to defined extent via xmin, xmax, ymin, ymax, and wkid.
- zoomToFullExtent: Navigate map to extent defined in fullExtent property.
- zoomToLocation: Navigate map to point location defined with x, y, wkid, and scale level.

# LayerModel

## Properties

- esriLayer: <esri.layers.Layer> ESRI layer associated with the model. Must be set on instantiation and can never be falsy.
- isBasemap: <Boolean> Is layer considered a basemap type layer. Used specifically for basemap switcher or TOC style interfaces. Default false.

# Usage Examples

	var map = new MapModel({
		fullExtent: someExtent
	});

	map.layers.add(new LayerModel({
		esriLayer: new esri.layers.ArcGISTiledMapServiceLayer('layerUrl')
	}));

	// 1 layer added

	map.layers.add([
		new LayerModel({
			esriLayer: new esri.layers.ArcGISTiledMapServiceLayer('layerUrl')
		}),
		new LayerModel({
			esriLayer: new esri.layers.ArcGISTiledMapServiceLayer('layerUrl')
		})
	]);

	// 2 more layers added

	map.layers.add(new LayerModel({
		esriLayer: new esri.layers.ArcGISTiledMapServiceLayer('layerUrl')
	}), { at: 1 });

	// another layer added at index 1

	map.layers.reset(map.layers.shuffle());

	// layer order shuffled