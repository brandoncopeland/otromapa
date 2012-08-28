(function (window) {

  var local = window.location.pathname.replace(/\/[^/]+$/, '');
  var localJs = local + '/js';
  var localLib = localJs + '/lib';
  var localTemplates = local + '/templates';

  window.require({
    async: true,
    parseOnLoad: true,
    aliases: [
      ['text', 'dojo/text']
    ],
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
      }, {
        name: 'app',
        location: localJs
      }, {
        name: 'templates',
        location: localTemplates
      }
    ]
  });

  window.define.amd.jQuery = true;

  window.require(['jquery', 'app/app'], function ($, application) {
    application.initialize();
  });

}(window));