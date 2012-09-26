define(['underscore', 'esri', 'esri/geometry', 'models/locationsearchmodel'], function (_, esri, esriGeometry, LocationSearchModel) {
	var defaultUrl = 'http://tasks.arcgis.com/ArcGIS/rest/services/WorldLocator/GeocodeServer';

	describe('LocationSearchModel', function () {

		beforeEach(function () {
			this.model = new LocationSearchModel();
		});

		describe('when instantiated', function () {

			it('should have defaults', function () {
				expect(this.model.get('serviceUrl')).toEqual(defaultUrl);
				expect(this.model.get('isWorking')).toEqual(false);
				expect(this.model.get('featureResults')).not.toBeUndefined();
			});

			it('should have an internal locator with url set', function () {
				expect(this.model._locator.url).toBe(defaultUrl);
			});
		});

		describe('on serviceUrl change', function () {
			it('should update the internal locator with the url', function () {
				this.model.set('serviceUrl', 'somenewurl');
				expect(this.model._locator.url).toBe('somenewurl');
			});
		});

		describe('on locateAddress()', function () {

			beforeEach(function () {
				this.locator = sinon.stub(this.model._locator); // avoid actual trips to server
			});

			it('should set isWorking to true prior to searching', function () {
				var spy = sinon.spy(this.model, 'set').withArgs('isWorking', true);
				this.model.locateAddress('fake address');
				expect(spy).toHaveBeenCalled();
				expect(spy).toHaveBeenCalledBefore(this.locator.addressToLocations);
			});

			it('should clear previous results before searching', function () {
				var spy = sinon.spy(this.model, 'clearResults');
				this.model.locateAddress('fake address');
				expect(spy).toHaveBeenCalled();
				expect(spy).toHaveBeenCalledBefore(this.locator.addressToLocations);
			});

			it('should use the right input address parameters for the ESRI locator', function () {
				this.model.locateAddress('my address');
				expect(this.locator.addressToLocations).toHaveBeenCalledWith({
					address: { SingleLine: 'my address' },
					outFields: ['*']
				});
			});

			it('should set the expected spatial reference on the ESRI locator', function () {
				this.model.locateAddress('fake address');
				expect(this.locator.outSpatialReference.wkid).toBe(3857);
			});

			// TEST GOOD but specs currently changed to not do any checking. Always true in current implementation.
			// Maybe the good test function should be passed from caller in future?
			// 'good' candidates are candidates w/ MatchLevel === 'PointAddress'
			// it('should set featureResults to only \'good\' address candidates returned from locator', function () {
			// 	var srStub = sinon.stub(esri, 'SpatialReference');
			// 	var ptStub = sinon.stub(esriGeometry, 'Point');

			// 	var candidates = [{
			// 		attributes: { MatchLevel: 'PointAddress' },		// 1
			// 		location: {} // have to set location to avoid undefined
			// 	}, {
			// 		attributes: {	MatchLevel: 'StreetAddress' },
			// 		location: {}
			// 	}, {
			// 		attributes: {	MatchLevel: 'PointAddress' },		// 2
			// 		location: {}
			// 	}, {
			// 		attributes: {	MatchLevel: 'PointAddress' },		// 3
			// 		location: {}
			// 	}];
			// 	this.locator.addressToLocations.callsArgWith(1, candidates);
			// 	this.model.locateAddress('fake address');

			// 	expect(this.model.get('featureResults').length).toBe(3);
			// 	var matchLevelValues = _.pluck(this.model.get('featureResults').featureResults, 'props.matchType');
			// 	expect(matchLevelValues).not.toContain('StreetAddress');

			// 	srStub.restore();
			// 	ptStub.restore();
			// });

			it('should construct featureResults with props and geometry correctly set', function () {
				var score = 97, address = 'some address', x = 1, y = 2, sr = { wkid: 3857 };
				var goodGeom = {good: 'geometry'}; // just some object, doesn't matter what
				var candidates = [{
					score: score,
					address: address,
					attributes: {
						MatchLevel: 'PointAddress',
						North_Lat: 29.2,
						South_Lat: 29.1,
						West_Lon: -95.2,
						East_Lon: -95.1
					},
					location: {
						x: x,
						y: y,
						spatialReference: sr
					}
				}];

				// if esri.SpatialReference and esriGeometry.Point are both constructed as expected, goodGeom returned
				// test for geometry === goodGeom
				var srStub = sinon.stub(esri, 'SpatialReference');
				srStub.withArgs(sinon.match({ wkid: sr.wkid })).returns(sr);
				var pointStub = sinon.stub(esriGeometry, 'Point');
				pointStub.withArgs(x, y, sinon.match({ wkid: sr.wkid })).returns(goodGeom);

				this.locator.addressToLocations.callsArgWith(1, candidates);
				this.model.locateAddress('fake address');

				var feature = this.model.get('featureResults').first();
				expect(feature.get('geometry')).toBe(goodGeom);
				expect(feature.get('props').score).toBe(score);
				expect(feature.get('props').matchType).toBe('PointAddress');
				expect(feature.get('props').name).toBe(address);
				// TODO. Add zoomExtent once spec better defined

				srStub.restore();
				pointStub.restore();
			});

			it('should set isWorking to false after candidates returned', function () {
				var spy = sinon.spy(this.model, 'set').withArgs('isWorking', true);
				this.locator.addressToLocations.callsArg(1);
				this.model.locateAddress('fake address');
				expect(spy).toHaveBeenCalled(); // should also test time called (after results)
			});

			describe('with searchExtent option', function () {
				it('should pass searchExtent to locator\'s addressToLocations', function () {
					var searchExtent = new esriGeometry.Extent({
						xmin: -10685400,
						ymin: 3343200,
						xmax: -10570600,
						ymax: 3454800,
						spatialReference: { wkid: '3857' }
					});
					this.model.locateAddress('fake address', { searchExtent: searchExtent });
					expect(this.locator.addressToLocations).toHaveBeenCalledWith(sinon.match({ searchExtent: searchExtent }));
				});
				it('should filter candidates for only those within extent', function () {
					// first candidate is inside, second is outside
					// test that result only has 1 item and is equivalent to first candidate

					var searchExtent = new esriGeometry.Extent({
						xmin: -10685400,
						ymin: 3343200,
						xmax: -10570600,
						ymax: 3454800,
						spatialReference: { wkid: '3857' }
					});

					var candidates = [{
						attributes: {},
						location: {
							x: -10600000,
							y: 3400000,
							spatialReference: { wkid: '3857' }
						}
					}, {
						attributes: {},
						location: {
							x: -10700000,
							y: 3500000,
							spatialReference: { wkid: '3857' }
						}
					}];

					this.locator.addressToLocations.callsArgWith(1, candidates);
					this.model.locateAddress('fake address', { searchExtent: searchExtent });

					var feature = this.model.get('featureResults').first();
					expect(this.model.get('featureResults').length).toBe(1);
					expect(feature.get('geometry').x).toBe(-10600000); // use x prop to make sure this is the expected candidate
				});
			});

		});

		describe('on clearResults', function () {
			it('should reset featureResults', function () {
				var spy = sinon.spy(this.model.get('featureResults'), 'reset');
				this.model.clearResults();
				expect(spy).toHaveBeenCalledWith();
			});
		});

	});
});