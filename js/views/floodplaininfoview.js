define('views/floodplaininfoview', ['jquery', 'underscore', 'backbone', 'text!data/floodzones.json', 'text!templates/floodplaininfotemplate.html'], function ($, _, Backbone, zoneData, floodplainInfoTemplate) {
	'use strict';

	var activeClassName = 'active';
	var slideSpeed = 'fast';

	var parseDefinitions = function (zones) {
		var definitions = [];
		_.each(zones, function (item, key) {
			if (item.description) {
				definitions.push({
					name: item.name,
					definition: item.description,
					url: item.femaUrl,
					legendColor: item.legendColor
				});
			}
		});
		return definitions;
	};

	var FloodplainInfoView = Backbone.View.extend({
		initialize: function () {
			this.render();
		},
		template: _.template(floodplainInfoTemplate),
		render: function () {

			var definitions = parseDefinitions($.parseJSON(zoneData));

			this.$el.hide();
			this.$el.append(this.template({definitions: definitions}));
			this.$el.fadeIn(700);

			this.$allDefinitions = this.$('.flooplaininfo dd').hide();
			this.$allDefinitionHeads = this.$('.flooplaininfo dt');

			return this;
		},
		events: {
			'click dt': 'expandDefinition'
		},
		expandDefinition: function (evt) {
			var $dt = $(evt.target);
			var $toExpand = $dt.next();
			if (!$dt.hasClass(activeClassName)) {
				this.$allDefinitionHeads.removeClass(activeClassName);
				this.$allDefinitions.slideUp(slideSpeed);
				$dt.addClass(activeClassName);
				$toExpand.slideDown(slideSpeed);
			} else {
				$dt.removeClass(activeClassName);
				$toExpand.slideUp(slideSpeed);
			}
		}
	});

	return FloodplainInfoView;
});