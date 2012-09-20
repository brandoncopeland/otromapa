define(['jquery', 'esri', 'esri/geometry', 'models/mapmodel'], function ($, esri, esriGeometry, MapModel) {
	// NOTE. a lot of testing of behaviors on ._widget. _widget is not part of public API, but best access to we have to many expected behaviors.

	describe('MapModel', function () {

		beforeEach(function () {
			this.mapStub = sinon.stub(esri, 'Map');
			this.mapStub.returns({
				infoWindow: {},
				layerIds: [],
				resize: function () {},
				reposition: function () {},
				addLayer: function () {},
				removeLayer: function () {},
				reorderLayer: function () {},
				getLevel: function () {},
				setLevel: function () {},
				setExtent: function () {},
				centerAndZoom: function () {},
				onExtentChange: function () {},
				onLoad: function () {}
			});
			this.model = new MapModel();
		});

		afterEach(function () {
			this.mapStub.restore();
		});

		describe('on intialize', function () {

			it('should have defaults set', function () {
				expect(this.model.get('domId')).toBe('map');
				expect(this.model.get('geographicWkid')).toBe(4326);
				expect(this.model.get('mercatorWkid')).toBe(3857);
				expect(this.model.get('fullExtent')).toEqual(new esriGeometry.Extent({
					xmin: -14148334,
					ymin: 1317618,
					xmax: -6158715,
					ymax: 6889553,
					spatialReference: { wkid: 3857 }
				}));
				expect(this.model.get('layers')).toBeDefined();
			});

			it('should have canZoomBackOne set to false', function () {
				expect(this.model.get('canZoomBackOne')).toBe(false);
			});

			it('should construct an ESRI Map with the expected parameters', function () {
				var fullExtent = this.model.get('fullExtent');
				expect(this.mapStub).toHaveBeenCalledWith('map', sinon.match({
					fadeOnZoom: true,
					fitExtent: true,
					logo: false,
					extent: sinon.match.instanceOf(esriGeometry.Extent)
						.and(sinon.match({ xmin: fullExtent.xmin }))
						.and(sinon.match({ ymin: fullExtent.ymin }))
						.and(sinon.match({ xmax: fullExtent.xmax }))
						.and(sinon.match({ ymax: fullExtent.ymax }))
						.and(sinon.match({ spatialReference: sinon.match.instanceOf(esri.SpatialReference)
							.and(sinon.match({ wkid: fullExtent.spatialReference.wkid }))}))
				}));
			});

			// can maybe do more here to test behavior or .fadeShow, but just check that its at least there for now
			it('should add a fadeShow function to the Map\'s infoWindow', function () {
				expect(this.model._widget.infoWindow.fadeShow).toBeDefined();
			});

		});

		// TODO. getScreenPointFromMapPoint. not sure if this is worth it. tough (not possible?) without actual

		describe('on map widget\'s ExtentChange', function () {
			it('should add current extent to internal _pastExtents array', function () {
				var expectedExtent = new esriGeometry.Extent({
					xmin: -14148334,
					ymin: 1317618,
					xmax: -6158715,
					ymax: 6889553,
					spatialReference: { wkid: 3857 }
				});
				this.model._widget.onExtentChange(expectedExtent);
				expect(this.model._pastExtents.length).toBe(1);
				expect(this.model._pastExtents[0]).toBe(expectedExtent);
			});
			it('should set canZoomBackOne to true if past extent count > 1', function () {
				var extent1 = new esriGeometry.Extent({
					xmin: -14148333,
					ymin: 1317617,
					xmax: -6158714,
					ymax: 6889552,
					spatialReference: { wkid: 3857 }
				});
				var extent2 = new esriGeometry.Extent({
					xmin: -14148335,
					ymin: 1317619,
					xmax: -6158716,
					ymax: 6889554,
					spatialReference: { wkid: 3857 }
				});
				this.model._widget.onExtentChange(extent1);
				expect(this.model.get('canZoomBackOne')).toBe(false);
				this.model._widget.onExtentChange(extent2);
				expect(this.model.get('canZoomBackOne')).toBe(true);
			});
		});

		describe('on window resize', function () {
			it('should call map widget\'s resize and reposition functions after 500ms timeout', function () {
				// map is resized and repositioned on window resize
				// some browsers can trigger multiple resizes on drag resize, so wait 500ms and any previous cleared
				var clock = sinon.useFakeTimers();
				var resizeSpy = sinon.spy(this.model._widget, 'resize');
				var repositionSpy = sinon.spy(this.model._widget, 'reposition');
				this.model._widget.onLoad();
				$(window).resize(); // couldn't trigger dojo.connect(window, 'onresize'), so using jQuery instead in source & spec
				clock.tick(200);
				$(window).resize(); // call twice, first should be cleared if less than 500 ms
				clock.tick(499);
				expect(resizeSpy.called).toBe(false);
				expect(repositionSpy.called).toBe(false);
				clock.tick(1);
				expect(resizeSpy).toHaveBeenCalledOnce();
				expect(repositionSpy).toHaveBeenCalledOnce();
				clock.restore();
			});
		});

		describe('on layers.add', function () {
			it('should call map widget\'s addLayer with the esriLayer', function () {
				var addLayerSpy = sinon.spy(this.model._widget, 'addLayer');
				var expectedEsriLayer = new esri.layers.GraphicsLayer();
				this.model.get('layers').add({
					esriLayer: expectedEsriLayer
				});
				expect(addLayerSpy).toHaveBeenCalledWith(expectedEsriLayer);
			});
		});

		describe('on layers.remove', function () {
			it('should call map widget\'s removeLayer with the esriLayer', function () {
				var removeLayerSpy = sinon.spy(this.model._widget, 'removeLayer');
				var expectedEsriLayer = new esri.layers.GraphicsLayer();
				this.model.get('layers').add([{
					esriLayer: new esri.layers.GraphicsLayer()
				}, {
					esriLayer: expectedEsriLayer
				}, {
					esriLayer: new esri.layers.GraphicsLayer()
				}]);
				this.model.get('layers').remove(this.model.get('layers').at(1)); // remove middle model
				expect(removeLayerSpy).toHaveBeenCalledWith(expectedEsriLayer);
			});
		});

		describe('on layers.reset', function () {
			// reset will completely remove/add everything in LayerModelCollection
			// we want to add and remove only necessary layers on map. esri has issues with removing then adding same layer instance
			beforeEach(function () {
				this.model._widget.addLayer = function (layer) {
					this.layerIds.push(layer.id); // mimic esri add layer
				};
				this.model._widget.getLayer = function (layerId) {
					// we're testing against ids, just give back new layer with expected id
					return new esri.layers.GraphicsLayer({
						id: layerId
					});
				};
			});
			it('should only add necessary layers to map layers when 2 additional layer models added via reset', function () {
				// collection with 1 layer
				// reset with that same layer plus 2 others
				var addLayerSpy = sinon.spy(this.model._widget, 'addLayer');
				var removeLayerSpy = sinon.spy(this.model._widget, 'removeLayer');
				var model1 = {
					esriLayer: new esri.layers.GraphicsLayer({
						id: 'model1'
					})
				}, model2 = {
					esriLayer: new esri.layers.GraphicsLayer({
						id: 'model2'
					})
				}, model3 = {
					esriLayer: new esri.layers.GraphicsLayer({
						id: 'model3'
					})
				};
				var layers = this.model.get('layers');
				layers.add(model1);
				layers.reset([ model1, model2, model3 ]); // should only be adding 2 additional to map here
				expect(addLayerSpy).toHaveBeenCalledThrice(); // addLayer should have been called 3 times only, 1 for each layer
				expect(removeLayerSpy.called).toBe(false); // should not have called removeLayer at all
			});
			it('should only remove necessary layers from map layers when 2 orginal layer models removed via reset', function () {
				// collection with 3 layer
				// reset with only 1st of 3
				var addLayerSpy = sinon.spy(this.model._widget, 'addLayer');
				var removeLayerSpy = sinon.spy(this.model._widget, 'removeLayer');
				var model1 = {
					esriLayer: new esri.layers.GraphicsLayer({
						id: 'model1'
					})
				}, model2 = {
					esriLayer: new esri.layers.GraphicsLayer({
						id: 'model2'
					})
				}, model3 = {
					esriLayer: new esri.layers.GraphicsLayer({
						id: 'model3'
					})
				};
				var layers = this.model.get('layers');
				layers.add([ model1, model2, model3 ]);
				addLayerSpy.reset(); // reset add spy to start tracking adds from here on
				layers.reset(model1); // should only be removing model2 and model3 from map here
				expect(addLayerSpy.called).toBe(false); // addLayer after reset
				expect(removeLayerSpy).toHaveBeenCalledTwice(); // removeLayer called twice - model2, model3
			});
			it('should reorder', function () {
				var reorderSpy = sinon.spy(this.model._widget, 'reorderLayer');
				var model1 = {
					esriLayer: new esri.layers.GraphicsLayer({
						id: 'model1'
					})
				}, model2 = {
					esriLayer: new esri.layers.GraphicsLayer({
						id: 'model2'
					})
				}, model3 = {
					esriLayer: new esri.layers.GraphicsLayer({
						id: 'model3'
					})
				};
				var layers = this.model.get('layers');
				layers.add([ model1, model2, model3 ]);
				layers.reset([ model3, model1, model2 ]);

				var modelOneSpy = reorderSpy.withArgs(sinon.match({ id: 'model1' }), 1);
				var modelTwoSpy = reorderSpy.withArgs(sinon.match({ id: 'model2' }), 2);
				var modelThreeSpy = reorderSpy.withArgs(sinon.match({ id: 'model3' }), 0);

				expect(reorderSpy).toHaveBeenCalledThrice(); // only 3 reorders total

				// each one called once
				expect(modelOneSpy).toHaveBeenCalledOnce();
				expect(modelTwoSpy).toHaveBeenCalledOnce();
				expect(modelThreeSpy).toHaveBeenCalledOnce();

				// order matters, should start from lower indexes and move up
				expect(modelThreeSpy).toHaveBeenCalledBefore(modelOneSpy);
				expect(modelOneSpy).toHaveBeenCalledBefore(modelTwoSpy);
			});
		});

		describe('on .getInfoWindow', function () {
			it('should return the ESRI map widget\'s infoWindow', function () {
				var infoWindow = this.model.getInfoWindow();
				expect(infoWindow).toBe(this.model._widget.infoWindow);
			});
		});

		describe('on .zoomInOne', function () {
			it('should call map widget\'s .setLevel with 1 level higher than the current', function () {
				sinon.stub(this.model._widget, 'getLevel').returns(3); // expect this plus 1
				var setLevelMock = sinon.spy(this.model._widget, 'setLevel');
				this.model.zoomInOne();
				expect(setLevelMock).toHaveBeenCalledWith(4);
			});
		});

		describe('on .zoomOutOne', function () {
			it('should call map widget\'s .setLevel with 1 level lower than the current', function () {
				sinon.stub(this.model._widget, 'getLevel').returns(3); // expect this plus 1
				var setLevelMock = sinon.spy(this.model._widget, 'setLevel');
				this.model.zoomOutOne();
				expect(setLevelMock).toHaveBeenCalledWith(2);
			});
		});

		describe('on .zoomToExtent', function () {
			beforeEach(function () {
				this.setExtentSpy = sinon.spy(this.model._widget, 'setExtent');
			});
			it('when extent is wkid 3857, should call map widget\'s .setExtent with the passed extent', function () {
				this.model.zoomToExtent(1, 2, 3, 4, 3857); // order of xs and ys diff from extent constructor
				var extentMatch = sinon.match.instanceOf(esriGeometry.Extent)
					.and(sinon.match({ xmin: 1 }))
					.and(sinon.match({ ymin: 3 }))
					.and(sinon.match({ xmax: 2 }))
					.and(sinon.match({ ymax: 4 }))
					.and(sinon.match({ spatialReference: sinon.match.instanceOf(esri.SpatialReference)
						.and(sinon.match({ wkid: 3857 }))}));
				expect(this.setExtentSpy).toHaveBeenCalledWith(extentMatch);
			});
			it('when extent is wkid 4326, should call map widget\'s .setExtent with the passed extent reprojected to web mercator', function () {
				this.model.zoomToExtent(-95.2, 29.1, -95.1, 29.2, 4326); // order of xs and ys diff from extent constructor
				var extentMatch = sinon.match.instanceOf(esriGeometry.Extent)
					.and(sinon.match({ xmin: -10597615.523519464 })) // trust me these are the right projected values
					.and(sinon.match({ ymin: -19845401.335498393 }))
					.and(sinon.match({ xmax: 3239397.1820842065 }))
					.and(sinon.match({ ymax: 3401126.264066427 }))
					.and(sinon.match({ spatialReference: sinon.match.instanceOf(esri.SpatialReference)
						.and(sinon.match({ wkid: 3857 }))}));
				expect(this.setExtentSpy).toHaveBeenCalledWith(extentMatch);
			});
			it('should call map widget\'s .setExtent with fit argument === true', function () {
				this.model.zoomToExtent(1, 3, 2, 4, 3857);
				expect(this.setExtentSpy).toHaveBeenCalledWith(sinon.match.any, true);
			});
		});

		describe('on .zoomToFullExtent', function () {
			beforeEach(function () {
				this.setExtentSpy = sinon.spy(this.model._widget, 'setExtent');
			});
			it('should call map widget\'s .setExtent with Full Extent', function () {
				var fullExtent = this.model.get('fullExtent');
				this.model.zoomToFullExtent();
				var extentMatch = sinon.match.instanceOf(esriGeometry.Extent)
					.and(sinon.match({ xmin: fullExtent.xmin }))
					.and(sinon.match({ ymin: fullExtent.ymin }))
					.and(sinon.match({ xmax: fullExtent.xmax }))
					.and(sinon.match({ ymax: fullExtent.ymax }))
					.and(sinon.match({ spatialReference: sinon.match.instanceOf(esri.SpatialReference)
						.and(sinon.match({ wkid: fullExtent.spatialReference.wkid }))}));
				expect(this.setExtentSpy).toHaveBeenCalledWith(extentMatch);
			});
			it('should call map widget\'s .setExtent with fit argument === true', function () {
				this.model.zoomToFullExtent();
				expect(this.setExtentSpy).toHaveBeenCalledWith(sinon.match.any, true);
			});
		});

		describe('on .zoomToLocation', function () {
			beforeEach(function () {
				this.centerAndZoomSpy = sinon.spy(this.model._widget, 'centerAndZoom');
			});

			it('when wkid is 3857, should call map widget\'s .centerAndZoom with point composed of x, y, wkid 3857', function () {
				this.model.zoomToLocation(1, 2, 3857);
				var pointMatch = sinon.match.instanceOf(esriGeometry.Point)
					.and(sinon.match({ x: 1 }))
					.and(sinon.match({ y: 2 }))
					.and(sinon.match({ spatialReference: sinon.match.instanceOf(esri.SpatialReference)
						.and(sinon.match({ wkid: 3857 }))}));
				expect(this.centerAndZoomSpy).toHaveBeenCalledWith(pointMatch);
			});

			it('when wkid is 4326, should call map widget\'s .centerAndZoom with point composed of projected x, projected y, wkid 3857', function () {
				this.model.zoomToLocation(-95, 29, 4326);
				var pointMatch = sinon.match.instanceOf(esriGeometry.Point)
					.and(sinon.match({ x: -10575351.62536081 })) // these are the project x and y, trust me
					.and(sinon.match({ y: 3375646.034919248 }))
					.and(sinon.match({ spatialReference: sinon.match.instanceOf(esri.SpatialReference)
						.and(sinon.match({ wkid: 3857 }))}));
				expect(this.centerAndZoomSpy).toHaveBeenCalledWith(pointMatch);
			});

			it('should call map widget\'s .centerAndZoom with passed scale', function () {
				this.model.zoomToLocation(1, 1, 3857, 16);
				expect(this.centerAndZoomSpy).toHaveBeenCalledWith(sinon.match.any, 16);
			});

			it('when no scale is passed, should call map widget\'s .centerAndZoom with map\'s current scale', function () {
				sinon.stub(this.model._widget, 'getLevel').returns(11);
				this.model.zoomToLocation(1, 1, 3857);
				expect(this.centerAndZoomSpy).toHaveBeenCalledWith(sinon.match.any, 11);
			});

			it('when passed scale is a prenamed string (ie. city), should call map widget\'s .centerAndZoom with the scale defined for that string', function () {
				this.model.zoomToLocation(1, 1, 3857, 'city');
				expect(this.centerAndZoomSpy).toHaveBeenCalledWith(sinon.match.any, 11);
			});
		});

		describe('on .zoomBackOneExtent', function () {
			describe('when canZoomBackOne === true', function () {
				beforeEach(function () {
					this.model.set('canZoomBackOne', true);
				});
				it('should pop off last 2 past extents', function () {
					var expectedExtent = new esriGeometry.Extent({
						xmin: -14148334,
						ymin: 1317618,
						xmax: -6158715,
						ymax: 6889553,
						spatialReference: { wkid: 3857 }
					});
					this.model._pastExtents.push(expectedExtent);
					this.model._pastExtents.push(new esriGeometry.Extent({
						xmin: -14148334,
						ymin: 1317618,
						xmax: -6158715,
						ymax: 6889553,
						spatialReference: { wkid: 3857 }
					}));
					this.model._pastExtents.push(new esriGeometry.Extent({
						xmin: -14148334,
						ymin: 1317618,
						xmax: -6158715,
						ymax: 6889553,
						spatialReference: { wkid: 3857 }
					}));
					this.model.zoomBackOneExtent();
					expect(this.model._pastExtents.length).toBe(1);
					expect(this.model._pastExtents[0]).toBe(expectedExtent);
				});
				it('should call map widget\'s .setExtent with 2nd extent from top', function () {
					// first extent on top is current, it goes away
					// second extent from top is last previous, it is zoomed to
					var setExtentSpy = sinon.spy(this.model._widget, 'setExtent');
					var expectedExtent = new esriGeometry.Extent({
						xmin: -14148334,
						ymin: 1317618,
						xmax: -6158715,
						ymax: 6889553,
						spatialReference: { wkid: 3857 }
					});
					this.model._pastExtents.push(expectedExtent);
					this.model._pastExtents.push(new esriGeometry.Extent({
						xmin: -14148333,
						ymin: 1317617,
						xmax: -6158714,
						ymax: 6889552,
						spatialReference: { wkid: 3857 }
					}));
					this.model.zoomBackOneExtent();
					var extentMatch = sinon.match.instanceOf(esriGeometry.Extent)
						.and(sinon.match({ xmin: expectedExtent.xmin }))
						.and(sinon.match({ ymin: expectedExtent.ymin }))
						.and(sinon.match({ xmax: expectedExtent.xmax }))
						.and(sinon.match({ ymax: expectedExtent.ymax }))
						.and(sinon.match({ spatialReference: sinon.match.instanceOf(esri.SpatialReference)
							.and(sinon.match({ wkid: expectedExtent.spatialReference.wkid }))}));
					expect(setExtentSpy).toHaveBeenCalledWith(extentMatch);
				});
			});
		});

	});
});