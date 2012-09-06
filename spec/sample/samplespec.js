define(function () {
	describe('Sample', function () {
		it('should pass', function () {
			expect(1 + 2).toEqual(3);
		});
		describe('when doing bad things', function () {
			it('should fail miserably', function () {
				expect(1 + 2).toEqual(4);
				expect(2 + 2).toEqual(5);
			});
		});
		it('should fail again', function () {
			expect('whats expected').toEqual('whats not');
		});
	});

	return {
		name: 'Sample Spec'
	};
});