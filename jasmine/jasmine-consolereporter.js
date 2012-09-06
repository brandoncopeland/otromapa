(function () {
	function red(s) { return ['\033[31m', s, '\033[0m'].join(''); }
	function green(s) { return ['\033[32m', s, '\033[0m'].join(''); }
	function cyan(s) { return ['\033[36m', s, '\033[0m'].join(''); }
	function yellow(s) { return ['\033[33m', s, '\033[0m'].join(''); }
	function blue(s) { return ['\033[34m', s, '\033[0m'].join(''); }

	function ConsoleReporter() {
	}

	ConsoleReporter.prototype.reportRunnerResults = function (runner) {		
		var output = [], results = runner.results(), specs = runner.specs();

		var msg = [specs.length, 'specs...', results.passedCount, 'pass,', results.failedCount, 'fail.'].join(' ');
		if (results.failedCount > 0) {
			msg = red(msg);
		} else {
			msg = green(msg);
		}
		output.push(msg);

		for (var i = 0; i < specs.length; i++) {
			var spec = specs[i];
			var results = spec.results();
			if (results.failedCount > 0) {
				output.push(''); // empty line
				var items = results.getItems();
				var numItems = items.length;
				for (var j = 0; j < numItems; j++) {
					var result = items[j];
					if (result.type == 'log') {
						output.push(yellow('  LOG. ' + result.toString()));
					} else if (result.type == 'expect' && result.passed && !result.passed()) {
						output.push([spec.getFullName(), red(result.message)].join(' '));
					}
				}
			}
		}

		console.log(output.join('\n'));
	};

	exports.ConsoleReporter = ConsoleReporter;
}());