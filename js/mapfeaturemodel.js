// model encapsulating attributes and geometry of map feature
// NOTE. can add features like projecting geometry
define('models/mapfeaturemodel', ['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
	'use strict';

	var MapFeatureModel = Backbone.Model.extend({
		defaults: {
			attributes: {},
			geometry: undefined
		}
	});

	return MapFeatureModel;
});