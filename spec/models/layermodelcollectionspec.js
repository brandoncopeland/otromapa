define(['underscore', 'models/layermodel', 'models/layermodelcollection'], function (_, LayerModel, LayerModelCollection) {
	describe('LayerModelCollection', function () {

		beforeEach(function () {
			this.collection = new LayerModelCollection();
		});

		describe('on invoking basemaps()', function () {

			var mockModel = function (isBasemap) {
				var model = new LayerModel();
				sinon.stub(model, 'validate').returns();
				sinon.stub(model, 'get').withArgs('isBasemap').returns(isBasemap);
				return model;
			};

			it('should return only basemaps', function () {
				this.collection.add([
					mockModel(true),			// 1
					mockModel(true),			// 2
					mockModel(false),
					mockModel(true),			// 3
					mockModel(false)
				]);
				var basemaps = this.collection.baseMaps();
				var isBasemapValues = _.map(basemaps, function (item) { return item.get('isBasemap'); });
				expect(basemaps.length).toBe(3);
				expect(isBasemapValues).not.toContain(false); // no isBasemap === false
			});
		});
	});
});