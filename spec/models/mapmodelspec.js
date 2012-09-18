define(['esri', 'esri/geometry', 'models/mapmodel'], function (esri, esriGeometry, MapModel) {
	// NOTE. a lot of testing of behaviors on ._widget. _widget is not part of public API, but best access to we have to many expected behaviors.

	describe('MapModel', function () {

		beforeEach(function () {
			this.mapStub = sinon.stub(esri, 'Map');
			this.mapStub.returns({
				infoWindow: {},
				addLayer: function () {},
				getLevel: function () {},
				setLevel: function () {},
				setExtent: function () {},
				centerAndZoom: function () {},
				onExtentChange: function () {}
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

			// TODO. window resize

		});

		// TODO. add, remove, reset layers

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