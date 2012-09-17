// model encapsulating attributes and geometry of map feature
// NOTE. can add features like projecting geometry
define('models/mapfeaturemodel', ['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
	'use strict';

	// use convention...
	// prop zoomExtent should always be used for specifying an extent when zooming when needing to override default extent
	var MapFeatureModel = Backbone.Model.extend({
		defaults: {
			props: {},
			geometry: undefined
		}
	});

	return MapFeatureModel;
});