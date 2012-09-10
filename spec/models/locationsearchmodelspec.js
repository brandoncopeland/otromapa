define(['models/locationsearchmodel'], function (LocationSearchModel) {
	describe('LocationSearchModel', function () {

		beforeEach(function () {
			this.model = new LocationSearchModel();
		});

		describe('when instantiated', function () {
			it('should have defaults', function () {
				expect(this.model.get('serviceUrl')).toEqual('http://tasks.arcgis.com/ArcGIS/rest/services/WorldLocator/GeocodeServer');
				expect(this.model.get('isWorking')).toEqual(true);
				expect(this.model.get('featureResults')).not.toBeUndefined();
			});
		});

	});
});