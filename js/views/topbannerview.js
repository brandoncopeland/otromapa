// topbannerview.js
// view for banner notifications
define('views/topbannerview', ['jquery', 'underscore', 'backbone', 'views/topbanneritemview'], function ($, _, Backbone, TopBannerItemView) {
	'use strict';

	var temporaryDuration = 5000;

	var TopBannerView = Backbone.View.extend({
		el: $('#bannercontainer'), // use convention for default
		// isTemporary = hide automatically after short interval
		// options... additionalClasses
		addItem: function (htmlContent, isTemporary, options) {
			var data = _.extend({
				htmlContent: htmlContent
			}, options);

			if (isTemporary && isTemporary === true) {
				data = _.extend({
					showDuration: temporaryDuration
				}, data);
			}
			var item = new TopBannerItemView(data);
			this.$el.append(item.render().el);
		}
	});

	return TopBannerView;
});