define('views/floodplaininfoview', ['jquery', 'underscore', 'backbone', 'views/floodplaininfoitemview', 'text!data/floodzones.json', 'text!templates/floodplaininfotemplate.html'], function ($, _, Backbone, FloodplainInfoItemView, zoneData, floodplainInfoTemplate) {
	'use strict';

	var activeClassName = 'active';
	var slideSpeed = 500;

	// pull zone definition models from floodzones.json
	// only use items with description property
	var parseDefinitions = function (zones) {
		var definitions = {};
		_.each(zones, function (item, key) {
			if (item.description) {
				definitions[key.split(' ').join('')] = { // remove any spaces
					name: item.name,
					definition: item.description,
					url: item.femaUrl,
					legendColor: item.legendColor
				};
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
			this.definitions = parseDefinitions($.parseJSON(zoneData));

			var $content = $(this.template({definitions: this.definitions})).hide();
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

			// where individual zone details will go when selected
			// slide up to better interact with slideDown on open later
			this.$detailContainer = $('.floodplaininfo .detailcontent').slideUp(0);

			return this;
		},
		events: {
			'click li': 'expandDefinition',
			'click .closedef': 'backToList'
		},
		expandDefinition: function (evt) {
			var $target = $(evt.currentTarget); // li element

			var detailModel = this.definitions[$target.attr('data-definitionkey')];
			var detailView = new FloodplainInfoItemView({
				model: detailModel
			});
			this.$detailContainer.html(detailView.render().$el.html()).slideDown(200);

			// TODO. stop any previous close animations. NOTE. $.stop doesn't seem to stop fully.

			// move from left to right panel but keep target li somewhat in place and fade out
			$target.addClass(activeClassName).animate({
				'margin-right': '-90%',
				'margin-left': '90%',
				'opacity': '0'
			}, slideSpeed);
			this.$('.floodplaininfo .wrapper').animate({
				'margin-left': '-100%'
			}, slideSpeed);
		},
		backToList: function () {
			var self = this;

			// TODO. stop any previous opening animations

			// slide target li back to place, fade back in, and move back from right to left panel
			// slide up details when complete to help with extra bottom space on long details
			self.$('.' + activeClassName).animate({
				'margin-left': '0',
				'margin-right': '0',
				'opacity': '1'
			}, slideSpeed);
			self.$('.floodplaininfo .wrapper').animate({
				'margin-left': '0'
			}, slideSpeed, function () {
				self.$detailContainer.slideUp(300);
			});
		}
	});

	return FloodplainInfoView;
});