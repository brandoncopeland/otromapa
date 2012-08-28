define('app/demoModule', ['underscore', 'text!templates/demoTemplate.html'], function(_, demoTemplate) {
	var doSomething = function () {
		return _.reduce([1, 2, 3], function(memo, num){ return memo + num; }, 0);
	};

	return {
		doIt: function () {
			return doSomething();
		}
	}
});