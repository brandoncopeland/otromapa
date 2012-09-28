define(['underscore', 'esri', 'esri/geometry', 'models/floodplainlocatormodel', 'models/mapfeaturemodel', 'models/mapfeaturemodelcollection', 'esri/tasks/query'], function (_, esri, esriGeometry, FloodplainLocatorModel, MapFeatureModel, MapFeatureModelCollection) {
	describe('FloodplainLocatorModel', function () {
		beforeEach(function () {
			this.featureCollection = new MapFeatureModelCollection();
			this.model = new FloodplainLocatorModel({
				features: this.featureCollection
			});
		});

		describe('when instantiated', function () {
			it('should have defaults', function () {
				expect(this.model.get('floodMessageAttributeField')).toEqual('floodMessage');
				expect(this.model.get('floodZoneField')).toEqual('FLD_ZONE');
			});
		});

		describe('on features .add', function () {
			beforeEach(function () {
				this.model.set('floodplainServiceUrl', 'someurl'); // have to have url to perform locate
				this.queryTaskStub = sinon.stub(esri.tasks, 'QueryTask');
				this.queryTaskStub.returns({
					execute: function () {}
				});
				this.queryStub = sinon.stub(esri.tasks, 'Query');
			});
			afterEach(function () {
				this.queryTaskStub.restore();
				this.queryStub.restore();
			});
			it('should call call QueryTask.execute with expected parameters', function () {
				var queryArgs;
				this.queryTaskStub.returns({
					execute: function (query) {
						queryArgs = query; // save out args to check against in expect
					}
				});
				var expectedGeometry = new esriGeometry.Point(-118.15, 33.80, new esri.SpatialReference({ wkid: 4326 }));
				var model = new MapFeatureModel({
					geometry: expectedGeometry
				});
				this.featureCollection.add(model);
				expect(queryArgs).toBeDefined();
				expect(queryArgs.geometry).toBe(expectedGeometry); // features geometry
				expect(queryArgs.returnGeometry).toBe(false); // never return geometry from query
				expect(queryArgs.outFields).toEqual([this.model.get('floodZoneField')]); // only field we need is flood zone field, maybe floodway field later
			});
			describe('when no floodplain areas returned from query', function () {
				it('should append expected "not determined" message to feature props', function () {
					var expectedMessage = 'Flood Zone could not be determined for this location';
					this.queryTaskStub.returns({
						execute: sinon.stub().callsArgWith(1, {
							features: []
						})
					});
					var feature = new MapFeatureModel({
						geometry: new esriGeometry.Point(-118.15, 33.80, new esri.SpatialReference({ wkid: 4326 }))
					});
					this.featureCollection.add(feature);
					expect(feature.get('props')[this.model.get('floodMessageAttributeField')]).toBe(expectedMessage);
				});
			});
			describe('when 1 floodplain area is returned from query', function () {
				describe('and zone data exists', function () {
					it('should append expected message including zone name and sfha description to feature props', function () {
						this.model._zoneData = {
							sampleZone: {
								name: 'Sample',
								sfhaDescription: 'This is in SFHA'
							}
						};
						var returnedFeature = {
							attributes: {}
						};
						returnedFeature.attributes[this.model.get('floodZoneField')] = 'sampleZone'; // match zone data above
						this.queryTaskStub.returns({
							execute: sinon.stub().callsArgWith(1, { features: [returnedFeature] })
						});
						var feature = new MapFeatureModel({
							geometry: new esriGeometry.Point(-118.15, 33.80, new esri.SpatialReference({ wkid: 4326 }))
						});
						this.featureCollection.add(feature);
						var expectedMessage = 'Located in Sample. This is in SFHA'; // 'Located in ' + name + '. ' + sfhaDescription
						expect(feature.get('props')[this.model.get('floodMessageAttributeField')]).toBe(expectedMessage);
					});
				});
				describe('and no zone data exists', function () {
					it('should append expected message from returned zone name to feature props', function () {
						this.model._zoneData = {}; // no zone data
						var returnedFeature = {
							attributes: {}
						};
						returnedFeature.attributes[this.model.get('floodZoneField')] = 'sampleZone'; // match zone data above
						this.queryTaskStub.returns({
							execute: sinon.stub().callsArgWith(1, { features: [returnedFeature] })
						});
						var feature = new MapFeatureModel({
							geometry: new esriGeometry.Point(-118.15, 33.80, new esri.SpatialReference({ wkid: 4326 }))
						});
						this.featureCollection.add(feature);
						var expectedMessage = 'Located in Flood Zone sampleZone'; // 'Located in Flood Zone' + zone name
						expect(feature.get('props')[this.model.get('floodMessageAttributeField')]).toBe(expectedMessage);
					});
				});
			});
			describe('when multiple floodplain areas are returned from query', function () {
				it('should append expected message to feature props', function () {
					this.queryTaskStub.returns({
						execute: sinon.stub().callsArgWith(1, { features: [{}, {}] }) // 2 features returned
					});
					var feature = new MapFeatureModel({
						geometry: new esriGeometry.Point(-118.15, 33.80, new esri.SpatialReference({ wkid: 4326 }))
					});
					this.featureCollection.add(feature);
					var expectedMessage = 'Multiple Flood Zones for this location'; // temporary message until better implementation in place
					expect(feature.get('props')[this.model.get('floodMessageAttributeField')]).toBe(expectedMessage);
				});
			});
		});
	});
});