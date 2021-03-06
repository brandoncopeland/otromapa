(function (window) {
  'use strict';

  var local = window.location.pathname.replace(/\/[^/]+$/, '');
  var localJs = local + '/js';
  var localLib = localJs + '/lib';
  var localTemplates = local + '/templates';
  var localData = local + '/data';

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
      'utilities': localJs + '/utilities',
      'templates': localTemplates,
      'data': localData
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

  window.require(['app/app-brazoria-floodplain'], function (application) {
    application.initialize();
  });

}(window));