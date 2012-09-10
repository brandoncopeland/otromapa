define(['models/locationsearchmodel'], function (LocationSearchModel) {
	describe('LocationSearchModel', function () {

		beforeEach(function () {
			this.model = new LocationSearchModel();
		});

		describe('when instantiated', function () {
			it('should have defaults', function () {
				expect(this.model.get('serviceUrl')).toEqual('http://tasks.arcgis.com/ArcGIS/rest/services/WorldLocator/GeocodeServer');
				expect(this.model.get('isWorking')).toEqual(false);
				expect(this.model.get('featureResults')).not.toBeUndefined();
			});
		});

		describe('on locateAddress()', function () {

			beforeEach(function () {
				this._locator = sinon.stub(this.model._locator); // avoid actual trips to server
			});

			it('should set isWorking to true', function () {
				var spy = sinon.spy(this.model, 'set');
				this.model.locateAddress('fake address');
				expect(spy).toHaveBeenCalledWith('isWorking', true);
			});

			it('should clear previous results', function () {
				var spy = sinon.spy(this.model, 'clearResults');
				this.model.locateAddress('fake address');
				expect(spy).toHaveBeenCalled();
			});
		});

	});
});