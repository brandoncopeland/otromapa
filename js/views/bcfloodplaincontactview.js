define('views/bcfloodplaincontactview', ['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
  'use strict';

  var countyUrl = 'http://www.brazoria-county.com/floodplain';

  var BcFloodplainContactView = Backbone.View.extend({
    initialize: function () {
      this.render();
    },
    render: function () {
      var $container = $('<div>').addClass('floodplaincontact').html('For additional information concerning Floodplains and/or Building Permits in Brazoria County, please visit the ');
      $container.append($('<a>').attr('href', countyUrl).text('Brazoria County Floodplain and 911 Administration Office homepage'));
      this.$el.append($container);
      return this;
    }
  });

  return BcFloodplainContactView;
});