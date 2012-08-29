define('app/demomodule', ['underscore', 'text!templates/demotemplate.html'], function (_, demoTemplate) {
	var doSomething = function () {
		var x = _.reduce([1, 2, 3], function (memo, num) { return memo + num; }, 0);
	};

	return {
		doIt: function () {
			return doSomething();
		}
	};
});