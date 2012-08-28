(function (window) {

  var localJs = window.location.pathname.replace(/\/[^/]+$/, '') + '/js';
  var localLib = localJs + '/lib';

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
      }
    ]
  });

  window.define.amd.jQuery = true;

  window.require(['jquery', 'dojo/domReady!'], function ($) {
  });

}(window));