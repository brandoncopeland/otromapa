// Single map model instance for app

define('app/themap', [], function () {
	var map;
	return {
		setTheMap: function (mapModel) {
			map = mapModel;
		},
		getTheMap: function () {
			return map;
		}
	};
});