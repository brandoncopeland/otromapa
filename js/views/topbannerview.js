define('views/topbannerview', ['jquery', 'underscore', 'backbone', 'views/topbanneritemview'], function ($, _, Backbone, TopBannerItemView) {
	var TopBannerView = Backbone.View.extend({
		el: $('#bannercontainer'), // use convention for default
		// options... additionalClasses
		addItem: function (htmlContent, options) {
			var data = _.extend({
				htmlContent: htmlContent
			}, options);
			var item = new TopBannerItemView(data);
			this.$el.append(item.render().el);
		}
	});

	return TopBannerView;
});