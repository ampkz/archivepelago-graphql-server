import { faker } from '@faker-js/faker';
import { Person } from '../../../../src/archive/person';
import { PersonLabel } from '../../../../src/archive/relationship/relationship';
import { createPerson } from '../../../../src/db/archive/crud-person';
import { Label } from '../../../../src/archive/label';
import { LabelType } from '../../../../src/generated/graphql';
import { createLabel } from '../../../../src/db/archive/crud-label';

import {
	createPersonLabel,
	deletePersonLabel,
	getLabelsByPerson,
	getPersonsByLabel,
} from '../../../../src/db/archive/relationship/person-label-relationship';

describe(`Person-[:IS]->Label Tests`, () => {
	it(`should create a relationship between a person and label`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: `label_person_${(global as any).UniqueAdjIterator.next().value}`,
			type: LabelType.Profession,
		})) as Label;

		const personLabel: PersonLabel = new PersonLabel(createdPerson.id, createdLabel.name);

		const matchedPerson = await createPersonLabel(personLabel);

		expect(matchedPerson).toEqual(createdPerson);
	});

	it(`should delete a relationship between a person and label`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: `delete_label_${(global as any).UniqueAdjIterator.next().value}`,
			type: LabelType.Nationality,
		})) as Label;

		const personLabel: PersonLabel = new PersonLabel(createdPerson.id, createdLabel.name);

		await createPersonLabel(personLabel);

		const matchedPerson = await deletePersonLabel(personLabel);

		expect(matchedPerson).toEqual(createdPerson);
	});

	test(`getLabelsByPerson should get a label`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: `${(global as any).UniqueAdjIterator.next().value}`,
			type: LabelType.Sexuality,
		})) as Label;

		const personLabel: PersonLabel = new PersonLabel(createdPerson.id, createdLabel.name);

		await createPersonLabel(personLabel);

		const matchedLabels: Label[] = await getLabelsByPerson(createdPerson);

		expect(matchedLabels).toEqual([createdLabel]);
	});

	test(`getLabelsByPerson should get a list of labels`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: `label_person_${(global as any).UniqueAdjIterator.next().value}`,
			type: LabelType.Profession,
		})) as Label;
		const createdLabel2: Label = (await createLabel({
			name: `label_person_${(global as any).UniqueAdjIterator.next().value}`,
			type: LabelType.Profession,
		})) as Label;
		const createdLabel3: Label = (await createLabel({
			name: `label_person_${(global as any).UniqueAdjIterator.next().value}`,
			type: LabelType.Profession,
		})) as Label;

		const personLabel: PersonLabel = new PersonLabel(createdPerson.id, createdLabel.name);
		const personLabel2: PersonLabel = new PersonLabel(createdPerson.id, createdLabel2.name);
		const personLabel3: PersonLabel = new PersonLabel(createdPerson.id, createdLabel3.name);

		await createPersonLabel(personLabel);
		await createPersonLabel(personLabel2);
		await createPersonLabel(personLabel3);

		const matchedLabels: Label[] = await getLabelsByPerson(createdPerson);

		expect(matchedLabels).toContainEqual(createdLabel);
		expect(matchedLabels).toContainEqual(createdLabel2);
		expect(matchedLabels).toContainEqual(createdLabel3);
	});

	test(`getPersonsByLabel should get a list of persons`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdPerson2: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdPerson3: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: `person_label_${(global as any).UniqueAdjIterator.next().value}`,
			type: LabelType.Profession,
		})) as Label;

		const personLabel: PersonLabel = new PersonLabel(createdPerson.id, createdLabel.name);
		const personLabel2: PersonLabel = new PersonLabel(createdPerson2.id, createdLabel.name);
		const personLabel3: PersonLabel = new PersonLabel(createdPerson3.id, createdLabel.name);

		await createPersonLabel(personLabel);
		await createPersonLabel(personLabel2);
		await createPersonLabel(personLabel3);

		const matchedPersons: Person[] = await getPersonsByLabel(createdLabel);

		expect(matchedPersons).toContainEqual(createdPerson);
		expect(matchedPersons).toContainEqual(createdPerson2);
		expect(matchedPersons).toContainEqual(createdPerson3);
	});
});
