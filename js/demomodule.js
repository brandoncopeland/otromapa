define('app/demomodule', ['underscore', 'text!templates/demoTemplate.html', 'app/themap'], function (_, demoTemplate, map) {
	var doSomething = function () {
		var x = _.reduce([1, 2, 3], function (memo, num) { return memo + num; }, 0);
		map.getTheMap().zoomInOne();
	};

	return {
		doIt: function () {
			return doSomething();
		}
	};
});