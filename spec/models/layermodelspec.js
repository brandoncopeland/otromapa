define(['../../js/layermodel'], function (LayerModel) {
	describe('LayerModel', function () {
		var layerModel;

		beforeEach(function () {
			layerModel = new LayerModel();
		});

		describe('when instantiated', function () {
			it('should have defaults', function () {
				expect(layerModel.get('isBasemap')).toEqual(false);
			});
		});
	});

	return {
		name: 'LayerModel spec'
	};
});