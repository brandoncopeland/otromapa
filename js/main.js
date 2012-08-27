require.config({
	'paths': {
		'Underscore': 'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min',
		'Backbone': 'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.2/backbone-min'
	},
	'shim': {
		Backbone: {
			'deps': [
				'jquery',
				'Underscore'
			],
			'exports': 'Backbone'
		}
	}
});

require(['jquery', 'Underscore', 'Backbone'], function ($, _, Backbone) {
});