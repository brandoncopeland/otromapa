// topbanneritemview.js
// individual top banner item used by topbannerview
// options... showDuration = number of milliseconds to show before hiding. Do not set to leave permenantly
define('views/topbanneritemview', ['jquery', 'underscore', 'backbone', 'text!templates/topbanneritemtemplate.html', 'ready!'], function ($, _, Backbone, topBannerItemTemplate) {
	'use strict';
	var TopBannerItemView = Backbone.View.extend({
		tagName: 'div',
		className: 'topbanner',
		events: {
			'click input.close': 'close'
		},
		template: _.template(topBannerItemTemplate),
		render: function () {
			var self = this;
			if (self.options.additionalClasses) {
				self.$el.addClass(self.options.additionalClasses);
			}

			self.$el.hide();

			self.$el.html(self.template({
				htmlContent: self.options.htmlContent
			}));

			var inDuration = 500;
			self.$el.fadeIn(500);

			if (self.options.showDuration) {
				self._hideTimeout = setTimeout(function () {
					self.close();
				}, self.options.showDuration);
			}

			return self;
		},
		close: function () {
			if (this._hideTimeout) {
				clearTimeout(this._hideTimeout);
			}
			this.$el.fadeOut(400, function () {
				$(this).remove();
			});
			return false;
		}
	});

	return TopBannerItemView;
});