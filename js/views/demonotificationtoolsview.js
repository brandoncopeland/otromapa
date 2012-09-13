// demonotificationtoolsview.js
// Demonstration of various ways to add content to and open TopBannerView

define('views/demonotificationtoolsview', ['jquery', 'underscore', 'backbone', 'text!templates/toolstemplate.html', 'views/topbannerview'], function ($, _, Backbone, toolstemplate, TopBannerView) {
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
	}, {
		cl: 'notigetchromeframe',
		val: 'Notification for Google Chrome Frame',
		description: 'Demo notification using an HTML template',
		clickHandler: 'showGetChromeFrame'
	}];

	var DemoNotificationToolsView = Backbone.View.extend({
		initialize: function () {
			this._bannerView = new TopBannerView();
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
			var text = $('<p>').text('You clicked a llama. Check out some ');
			var link = $('<a>').attr('href', 'http://xkcd.com/974').text('XKCD');
			text.append(link);
			contentWrapper.append(text);

			this._bannerView.addItem(contentWrapper.html(), {
				additionalClasses: 'notisimple'
			});
		},
		showGetChromeFrame: function () {
			var view = this;
			require(['text!templates/getchromeframetemplate.html'], function (getChromeFrameTemplate) {
				view._bannerView.addItem(_.template(getChromeFrameTemplate, {}));
			});
		}
	});

	return DemoNotificationToolsView;
});