define('app/demoModule', ['underscore'], function(_) {
	var doSomething = function () {
		return _.reduce([1, 2, 3], function(memo, num){ return memo + num; }, 0);
	};

	return {
		doIt: function () {
			doSomething();
		}
	}
});