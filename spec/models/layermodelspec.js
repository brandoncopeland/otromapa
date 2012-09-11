define(['models/layermodel'], function (LayerModel) {
	describe('LayerModel', function () {

		beforeEach(function () {
			this.model = new LayerModel();
		});

		describe('when instantiated', function () {
			it('should have defaults', function () {
				expect(this.model.get('isBasemap')).toEqual(false);
			});
		});

		describe('when setting attributes', function () {
			it('should not allow undefined esriLayer', function () {
				var spy = sinon.spy();
				this.model.on('error', spy);
				this.model.set('esriMap', undefined);
				expect(spy).toHaveBeenCalledOnce();
				expect(spy).toHaveBeenCalledWith(sinon.match.any, 'LayerModel attribute esriLayer must have a value');
			});
		});

	});
});