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
				this.model.set('floodplainServiceUrl', 'someurl');
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
						queryArgs = query;
					}
				});
				var expectedGeometry = new esriGeometry.Point(-118.15, 33.80, new esri.SpatialReference({ wkid: 4326 }));
				var model = new MapFeatureModel({
					geometry: expectedGeometry
				});
				this.featureCollection.add(model);
				expect(queryArgs).toBeDefined();
				expect(queryArgs.geometry).toBe(expectedGeometry);
				expect(queryArgs.returnGeometry).toBe(false);
				expect(queryArgs.outFields).toEqual([this.model.get('floodZoneField')]);
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
		});

	});
});