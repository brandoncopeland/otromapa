define('views/getchromeframeview', ['jquery', 'underscore', 'backbone', 'text!templates/getchromeframetemplate.html', 'ready!'], function ($, _, Backbone, htmlTemplate) {
	var View = Backbone.View.extend({
		initialize: function () {
			this.render();
		},
		events: {
			'click #closechromenotification': 'close'
		},
		template: _.template(htmlTemplate),
		render: function () {
			this.$message = $(this.template({})).hide();
			this.$el.append(this.$message);
			this.$message.fadeIn(600);
			return this;
		},
		close: function () {
			this.$message.fadeOut(400, function () {
				$(this).remove();
			});
		}
	});

	return new View({el: $('body')});
});