import { Label } from '../../src/archive/label';
import { LabelType } from '../../src/generated/graphql';

describe(`Label Tests`, () => {
	it(`should create a label with CAREER type`, () => {
		const name: string = `${(global as any).UniqueAdjIterator.next().value}`;
		const label: Label = new Label({ name, type: LabelType.Profession });

		expect(label.name).toEqual(name);
		expect(label.type).toEqual(LabelType.Profession);
	});

	it(`should create a label with SEXUALITY type`, () => {
		const name: string = `${(global as any).UniqueAdjIterator.next().value}`;
		const label: Label = new Label({ name, type: LabelType.Sexuality });

		expect(label.name).toEqual(name);
		expect(label.type).toEqual(LabelType.Sexuality);
	});

	it(`should create a label with NATIONALITY type`, () => {
		const name: string = `${(global as any).UniqueAdjIterator.next().value}`;
		const label: Label = new Label({ name, type: LabelType.Nationality });

		expect(label.name).toEqual(name);
		expect(label.type).toEqual(LabelType.Nationality);
	});
});
