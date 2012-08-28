(function (window) {

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
        location: 'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3',
        main: 'underscore-min'
      }, {
        name: 'backbone',
        location: 'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.2',
        main: 'backbone-min'
      }
    ]
  });

  window.define.amd.jQuery = true;

  window.require(['jquery', 'dojo/ready'], function ($, ready) {
  });
  
}(window));