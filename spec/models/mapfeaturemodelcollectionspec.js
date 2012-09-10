define(['underscore', 'esri/geometry', 'models/mapfeaturemodel', 'models/mapfeaturemodelcollection'], function (_, esriGeometry, MapFeatureModel, MapFeatureModelCollection) {
	describe('MapFeatureModelCollection', function () {

		beforeEach(function () {
			this.collection = new MapFeatureModelCollection();
		});

		describe('on byNorthToSouth', function () {

			it('should sort extents', function () {
				var geometry1 = new esriGeometry.Extent(0, 0, 0, 3, null),
					model1 = new MapFeatureModel({ geometry: geometry1, name: 'Model1' }),
					geometry2 = new esriGeometry.Extent(0, 0, 0, 2, null),
					model2 = new MapFeatureModel({ geometry: geometry2, name: 'Model2' }),
					geometry3 = new esriGeometry.Extent(0, 0, 0, 1, null),
					model3 = new MapFeatureModel({ geometry: geometry3, name: 'Model3' });

				this.collection.add([model1, model3, model2]);
				var sorted = this.collection.byNorthToSouth();

				var modelNames = _.map(sorted, function (model) { // make failing tests readible
					return model.get('name');
				});
				expect(modelNames).toEqual(['Model1', 'Model2', 'Model3']);
			});

			it('should sort points', function () {
				var geometry1 = new esriGeometry.Point(0, 3, null),
					model1 = new MapFeatureModel({ geometry: geometry1, name: 'Model1' }),
					geometry2 = new esriGeometry.Point(0, 2, null),
					model2 = new MapFeatureModel({ geometry: geometry2, name: 'Model2' }),
					geometry3 = new esriGeometry.Point(0, 1, null),
					model3 = new MapFeatureModel({ geometry: geometry3, name: 'Model3' });

				this.collection.add([model1, model3, model2]);
				var sorted = this.collection.byNorthToSouth();

				var modelNames = _.map(sorted, function (model) { // make failing tests readible
					return model.get('name');
				});
				expect(modelNames).toEqual(['Model1', 'Model2', 'Model3']);
			});

			it('should sort other geometry types like multipoint (or polyline, or polygon, but they\'re all handled the same)', function () {
				var point1 = new esriGeometry.Point(0, 3, null);
				var geometry1 = new esriGeometry.Multipoint();
				geometry1.addPoint(point1);
				var model1 = new MapFeatureModel({ geometry: geometry1, name: 'Model1' });

				var point2 = new esriGeometry.Point(0, 2, null);
				var geometry2 = new esriGeometry.Multipoint();
				geometry2.addPoint(point2);
				var model2 = new MapFeatureModel({ geometry: geometry2, name: 'Model2' });

				var point3 = new esriGeometry.Point(0, 1, null);
				var geometry3 = new esriGeometry.Multipoint();
				geometry3.addPoint(point3);
				var model3 = new MapFeatureModel({ geometry: geometry3, name: 'Model3' });

				this.collection.add([model1, model3, model2]);
				var sorted = this.collection.byNorthToSouth();

				var modelNames = _.map(sorted, function (model) { // make failing tests readible
					return model.get('name');
				});
				expect(modelNames).toEqual(['Model1', 'Model2', 'Model3']);
			});

		});
	});
});