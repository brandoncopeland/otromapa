define('views/floodplaininfoitemview', ['jquery', 'underscore', 'backbone', 'text!templates/floodplaininfoitemtemplate.html'], function ($, _, Backbone, floodplainInfoItemTemplate) {
	'use strict';

	var FloodplainInfoItemView = Backbone.View.extend({
		template: _.template(floodplainInfoItemTemplate),
		tagName: 'div',
		render: function () {
			this.$el.html(this.template(this.model));
			return this;
		}
	});

	return FloodplainInfoItemView;
});