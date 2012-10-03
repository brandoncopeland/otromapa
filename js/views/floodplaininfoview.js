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

			this.$('.floodplaininfo').css('position', 'relative');
			this.$('.floodplaininfo .wrapper').addClass('clearfix').css({
				'width': '200%'
			});
			this.$('.floodplaininfo .wrapper > div').css({
				'width': '50%',
				'float': 'left'
			});

			$content.fadeIn(700);

			this.$allDefinitions = this.$('.floodplaininfo dd').hide();

			return this;
		},
		events: {
			'click li': 'expandDefinition',
			'click .closedef': 'backToList'
		},
		expandDefinition: function (evt) {
			// construct new item view here...
			$(evt.target).addClass(activeClassName).animate({
				'margin-right': '-100%',
				'margin-left': '100%',
				'opacity': '0'
			}, 800);
			this.$('.floodplaininfo .wrapper').animate({
				'margin-left': '-100%'
			}, 800);
		},
		backToList: function () {
			var self = this;
			this.$('.' + activeClassName).animate({
				'margin-left': '0',
				'margin-right': '0',
				'opacity': '1'
			}, 800);
			this.$('.floodplaininfo .wrapper').animate({
				'margin-left': '0'
			}, 800);
			// clear detail content here...
		}
	});

	return FloodplainInfoView;
});