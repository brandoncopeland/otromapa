// demonotificationtoolsview.js
// Demonstration of various ways to add content to and open TopBannerView

define('views/demonotificationtoolsview', ['jquery', 'underscore', 'backbone', 'text!templates/toolstemplate.html'], function ($, _, Backbone, toolstemplate) {
	'use strict';

	var toolTipSettings = {
		effect: 'fade',
		fadeOutSpeed: 100,
		predelay: 600,
		opacity: 0.8,
		position: 'center right',
		offset: [0, -5],
		events: {
			def: 'mouseenter',
			input: 'mouseenter,click mouseleave',
			widget: 'mouseenter,click mouseleave',
			tooltip: ''
		}
	};

	var tools = [{
		cl: 'notisimplewithlink',
		val: 'Notification with Text and Link',
		description: 'Demo simple notification with text and link',
		clickHandler: 'showSimpleWithLink'
	}];

	var DemoNotificationToolsView = Backbone.View.extend({
		initialize: function () {
			this.render();
		},
		template: _.template(toolstemplate),
		render: function () {
			var self = this;

			self.$el.append(self.template({ tools : tools }));

			require(['js/plugins/jquery.tools.min.js'], function () {
				self.$('[title]').tooltip(toolTipSettings);
			});

			return self;
		},
		events: function () {
			var evts = {};
			_.each(tools, function (tool) {
				evts['click .' + tool.cl] = tool.clickHandler;
			});
			return evts;
		},
		showSimpleWithLink: function () {
			var contentWrapper = $('<div>');
			var text = $('<p>').text('Demonstration of banner type notification with link to ');
			var link = $('<a>').attr('href', 'http://www.google.com').text('Google');
			text.append(link);
			contentWrapper.append(text);

			require(['views/topbannerview'], function (TopBannerView) {
				var view = new TopBannerView();
				view.addItem(contentWrapper.html(), {
					additionalClasses: 'notisimple'
				});
			});
		}
	});

	return DemoNotificationToolsView;
});