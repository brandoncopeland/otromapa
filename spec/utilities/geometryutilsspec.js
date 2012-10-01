define(['jquery', 'esri', 'esri/geometry', 'utilities/geometryutils'], function ($, esri, esriGeometry, geometryUtils) {

	describe('geometryUtils', function () {

		describe('on getExpandedExtentForGeometry', function () {
			it('should return the expected extent for point', function () {
				var point = new esriGeometry.Point(-118, 33, new esri.SpatialReference({ wkid: 4326 }));
				var newExtent = geometryUtils.getExpandedExtentForGeometry(point, 5);
				expect(newExtent.xmax).toBe(-113);
				expect(newExtent.xmin).toBe(-123);
				expect(newExtent.ymax).toBe(38);
				expect(newExtent.ymin).toBe(28);
				expect(newExtent.spatialReference.wkid).toBe(4326);
			});
			it('should return the expected expanded extent for extent', function () {
				var extent = new esriGeometry.Extent(-123, 45, -122, 46, new esri.SpatialReference({ wkid: 4326 }));
				var newExtent = geometryUtils.getExpandedExtentForGeometry(extent, 5);
				expect(newExtent.xmax).toBe(-117);
				expect(newExtent.xmin).toBe(-128);
				expect(newExtent.ymax).toBe(51);
				expect(newExtent.ymin).toBe(40);
				expect(newExtent.spatialReference.wkid).toBe(4326);
			});
			it('should return the expected extent for other geometry types like polygon (but all non-points, non-extent should behave similarly)', function () {
				// polygon from json. extents are -123, -122, 45, 46
				var polygon = new esriGeometry.Polygon({
					"rings": [[[-123, 45], [-122, 45], [-122, 46]]],
					"spatialReference": {"wkid": 4326}
				});
				var newExtent = geometryUtils.getExpandedExtentForGeometry(polygon, 5);
				expect(newExtent.xmax).toBe(-117);
				expect(newExtent.xmin).toBe(-128);
				expect(newExtent.ymax).toBe(51);
				expect(newExtent.ymin).toBe(40);
				expect(newExtent.spatialReference.wkid).toBe(4326);
			});
		});

	});
});