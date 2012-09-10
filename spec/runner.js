(function (window) {
  'use strict';

  var local = window.location.pathname.replace(/\/[^/]+$/, '');
  var localJs = local + '/js';
  var localSpecs = local + '/spec';
  var localLib = localJs + '/lib';
  var localTemplates = local + '/templates';

  window.require({
    async: true,
    parseOnLoad: true,
    aliases: [
      ['text', 'dojo/text'],
      ['ready', 'dojo/domReady']
    ],
    paths: {
      'app': localJs,
      'views': localJs + '/views',
      'models': localJs + '/models',
      'specs': localSpecs,
      'templates': localTemplates
    },
    packages: [
      {
        name: 'jquery',
        location: 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.0',
        main: 'jquery.min'
      }, {
        name: 'underscore',
        location: localLib,
        main: 'underscore-amd-min'
      }, {
        name: 'backbone',
        location: localLib,
        main: 'backbone-amd-min'
      }
    ]
  });

  window.define.amd.jQuery = true;

	var specs = [
		'specs/models/layermodelspec',
		'specs/models/layermodelcollectionspec',
		'specs/models/locationsearchmodelspec'
	];
	window.require(specs, function () {
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

}(window));