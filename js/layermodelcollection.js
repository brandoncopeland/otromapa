define('models/layermodelcollection', ['jquery', 'underscore', 'backbone', 'models/layermodel'], function ($, _, Backbone, LayerModel) {
	'use strict';

	var LayerModelCollection = Backbone.Collection.extend({
		model: LayerModel,
		baseMaps: function () {
			return this.filter(function (layer) {
				return layer.get('isBasemap');
			});
		}
	});

	return LayerModelCollection;
});