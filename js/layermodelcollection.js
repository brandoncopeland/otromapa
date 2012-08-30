define('models/layermodelcollection', ['jquery', 'underscore', 'backbone', 'models/layermodel'], function ($, _, Backbone, LayerModel) {

	var LayerModelCollection = Backbone.Collection.extend({
		model: LayerModel
	});

	return LayerModelCollection;
});