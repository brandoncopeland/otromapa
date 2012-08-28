(function (window, require, define) {
	var libsPath = window.location.pathname + 'js/lib'; // use full, rel is to dojo on cdn

	require({
		async: true,
    parseOnLoad: true,
    aliases: [['text', 'dojo/text']],
    packages: [
      {
        name: 'jquery',
        location: libsPath,
        main: 'jquery-1.8.0.min'
      }, {
        name: 'underscore',
        location: libsPath,
        main: 'underscore-min'
      }, {
        name: 'backbone',
        location: libsPath,
        main: 'backbone-min'
      }
    ]
  });

  define.amd.jQuery = true;

  // can do something like...
  // require(['jquery', 'esri', 'esri/geometry'], function ($, esri, geometry))
  require(['jquery'], function ($) {
  });
}(window, require, define));