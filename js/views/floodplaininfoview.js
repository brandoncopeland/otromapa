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

			var $content = $(this.template({definitions: definitions})).hide();
			this.$el.append($content);
			$content.fadeIn(700);

			this.$allDefinitions = this.$('.floodplaininfo dd').hide();
			this.$allDefinitionHeads = this.$('.floodplaininfo dt');

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