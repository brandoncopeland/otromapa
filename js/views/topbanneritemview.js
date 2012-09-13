define('views/topbanneritemview', ['jquery', 'underscore', 'backbone', 'text!templates/topbanneritemtemplate.html', 'ready!'], function ($, _, Backbone, topBannerItemTemplate) {
	var TopBannerItemView = Backbone.View.extend({
		tagName: 'div',
		className: 'topbanner',
		initialize: function () {
			this.render();
		},
		events: {
			'click input.close': 'close'
		},
		template: _.template(topBannerItemTemplate),
		render: function () {
			if (this.options.additionalClasses) {
				this.$el.addClass(this.options.additionalClasses);
			}

			this.$el.hide();

			this.$el.html(this.template({
				additionalClasses: this.options.additionalClasses,
				htmlContent: this.options.htmlContent
			}));

			var inDuration = 500;
			this.$el.fadeIn(500);

			return this;
		},
		close: function () {
			this.$el.fadeOut(400, function () {
				$(this).remove();
			});
			return false;
		}
	});

	return TopBannerItemView;
});