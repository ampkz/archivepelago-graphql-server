// import { destroyDBs, initializeDBs } from '../../../src/db/utils/init-dbs';
import { createLabel, deleteLabel, getLabel, getLabels, updateLabel } from '../../../src/db/archive/crud-label';
import { Label, LabelType } from '../../../src/archive/label';
import { Errors } from '../../../src/db/utils/crud';

describe(`CRUD Label Tests`, () => {
	it(`should create a Label`, async () => {
		const name: string = `create_${(global as any).UniqueAdjIterator.next().value}`;

		const label: Label = new Label({ name, type: LabelType.PROFESSION });

		const createdLabel: Label | undefined = await createLabel({ name, type: LabelType.PROFESSION });

		expect(createdLabel).toEqual(label);
	});

	it(`should get a created Label`, async () => {
		const name: string = `get_created_${(global as any).UniqueAdjIterator.next().value}`;

		const label: Label = new Label({ name, type: LabelType.PROFESSION });

		await createLabel({ name, type: LabelType.PROFESSION });

		const matchedLabel: Label | undefined = await getLabel(name);

		expect(matchedLabel).toEqual(label);
	});

	it(`should throw an error if trying to create an existing label`, async () => {
		const name: string = `exists_error_${(global as any).UniqueAdjIterator.next().value}`;

		await createLabel({ name, type: LabelType.PROFESSION });

		await expect(createLabel({ name, type: LabelType.PROFESSION })).rejects.toThrow(Errors.CANNOT_CREATE_NODE);
	});

	it(`should delete a created Label`, async () => {
		const name: string = `delete_${(global as any).UniqueAdjIterator.next().value}`;

		const label: Label = new Label({ name, type: LabelType.PROFESSION });

		await createLabel({ name, type: LabelType.PROFESSION });

		const matchedLabel: Label | undefined = await deleteLabel(name);

		expect(matchedLabel).toEqual(label);
	});

	test(`getLabel should return undefined if no Label exists`, async () => {
		const matchedLabel: Label | undefined = await getLabel(`get_undefined_${(global as any).UniqueAdjIterator.next().value}`);
		expect(matchedLabel).toBeUndefined();
	});

	test(`deleteLabel should return undefined if no Label exists`, async () => {
		const deletedLabel: Label | undefined = await deleteLabel(`delete_undefined_${(global as any).UniqueAdjIterator.next().value}`);

		expect(deletedLabel).toBeUndefined();
	});

	it(`should update a created label`, async () => {
		const name: string = `updated_${(global as any).UniqueAdjIterator.next().value}`;
		const updatedName: string = `${(global as any).UniqueAdjIterator.next().value}`;

		await createLabel({ name, type: LabelType.PROFESSION });
		const updatedLabel: Label | undefined = await updateLabel(name, { updatedName, updatedType: LabelType.SEXUALITY });

		expect(updatedLabel).toEqual(new Label({ name: updatedName, type: LabelType.SEXUALITY }));
	});

	test(`updateLabel should return undefined if no Label exists`, async () => {
		const updatedLabel: Label | undefined = await updateLabel(`${(global as any).UniqueAdjIterator.next().value}`, {
			updatedName: `updated_undefined_${(global as any).UniqueAdjIterator.next().value}`,
		});

		expect(updatedLabel).toBeUndefined();
	});

	test(`getLabels should return a list of created labels`, async () => {
		const label: Label = new Label({ name: `get_list_${(global as any).UniqueAdjIterator.next().value}`, type: LabelType.PROFESSION });
		const label2: Label = new Label({ name: `get_list_${(global as any).UniqueAdjIterator.next().value}`, type: LabelType.PROFESSION });
		const label3: Label = new Label({ name: `get_list_${(global as any).UniqueAdjIterator.next().value}`, type: LabelType.PROFESSION });

		const createdLabel: Label | undefined = await createLabel(label);
		const createdLabel2: Label | undefined = await createLabel(label2);
		const createdLabel3: Label | undefined = await createLabel(label3);

		const labels = await getLabels();

		expect(labels).toContainEqual(createdLabel);
		expect(labels).toContainEqual(createdLabel2);
		expect(labels).toContainEqual(createdLabel3);
	});
});
