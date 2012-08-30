define('models/layermodel', ['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {

	var LayerModel = Backbone.Model.extend({
		defaults: {
			esriLayer: undefined,
			isBasemap: false
		},
		initialize: function () {
			var validation = this.validate(this.attributes);
			if (validation) {
				this.trigger('error', this, validation);
			}
		},
		validate: function (attrs) {
			if (!attrs.esriLayer) {
				return 'LayerModel attribute esriLayer must have a value';
			}
		}
	});

	return LayerModel;
});