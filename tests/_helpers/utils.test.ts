import { addedValues, removedValues } from '../../src/_helpers/utils';

describe(`Utils Helper Tests`, () => {
	it(`should return a list of removed values`, () => {
		const original = ['a', 'b', 'c', 'd', 'e', 'f'];
		const updated = ['a', 'c', 'f'];

		expect(removedValues(original, updated)).toEqual(['b', 'd', 'e']);
	});

	it(`should return a list of added values`, () => {
		const original = ['a', 'c', 'f'];
		const updated = ['a', 'b', 'c', 'd', 'e', 'f'];

		expect(addedValues(original, updated)).toEqual(['b', 'd', 'e']);
	});
});
