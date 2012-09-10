require.config({
	baseUrl: 'js',
	paths: {
		'jquery': 'lib/jquery-1.8.0.min',
		'underscore': 'lib/underscore-amd-min',
		'backbone': 'lib/backbone-amd-min',
		'specs': '../spec'
	}
});

// for more specs, add as additional dependencies
require(['specs/models/layermodelspec', 'specs/models/layermodelcollectionspec'], function () {
	var jasmineEnv = jasmine.getEnv();
	jasmineEnv.updateInterval = 1000;

	var htmlReporter = new jasmine.HtmlReporter();
	jasmineEnv.addReporter(htmlReporter);

	jasmineEnv.specFilter = function (spec) {
		return htmlReporter.specFilter(spec);
	};

	var currentWindowOnload = window.onload;

	function execJasmine() {
		jasmineEnv.execute();
	}

	window.onload = function () {
		if (currentWindowOnload) {
			currentWindowOnload();
		}
		execJasmine();
	};
});