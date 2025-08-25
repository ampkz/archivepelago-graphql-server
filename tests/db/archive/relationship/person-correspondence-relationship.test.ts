import { faker } from '@faker-js/faker';
import { createCorrespondence } from '../../../../src/db/archive/crud-correspondence';
import { CorrespondenceType } from '../../../../src/generated/graphql';
import { createPerson } from '../../../../src/db/archive/crud-person';
import { RelationshipType } from '../../../../src/archive/relationship/relationship';
import {
	createPersonRelationship,
	deletePersonRelationship,
	getCorrespondencesByPerson,
	getPersonsByCorrespondence,
} from '../../../../src/db/archive/relationship/person-correspondence-relationship';
import { Person } from '../../../../src/archive/person';

describe(`CRUD Correspondence Tests`, () => {
	it(`should create a relationship between a created person and a created correspondence`, async () => {
		const createdPerson: Person = (await createPerson(
			new Person({
				id: '',
				firstName: faker.person.firstName(),
				birthDate: { year: '2000', month: '01', day: '01' },
				deathDate: { year: '2020', month: '01', day: '01' },
			})
		)) as Person;
		const createdCorrespondence = await createCorrespondence({ correspondenceType: CorrespondenceType.Letter });
		const returnedCorrespondence = await createPersonRelationship(
			createdCorrespondence?.correspondenceID as string,
			createdPerson!.id,
			RelationshipType.SENT
		);

		expect(returnedCorrespondence).toEqual(createdCorrespondence);
	});

	it(`should delete a created relationship between a created person and a created correspondence`, async () => {
		const createdPerson: Person = (await createPerson(
			new Person({
				id: '',
				firstName: faker.person.firstName(),
				birthDate: { year: '2000', month: '01', day: '01' },
				deathDate: { year: '2020', month: '01', day: '01' },
			})
		)) as Person;
		const createdCorrespondence = await createCorrespondence({ correspondenceType: CorrespondenceType.Letter });
		await createPersonRelationship(createdCorrespondence?.correspondenceID as string, createdPerson!.id, RelationshipType.SENT);
		const returnedCorrespondence = await deletePersonRelationship(
			createdCorrespondence?.correspondenceID as string,
			createdPerson!.id,
			RelationshipType.SENT
		);

		expect(returnedCorrespondence).toEqual(createdCorrespondence);
	});

	it(`should get persons who sent correspondence`, async () => {
		const createdPerson: Person = (await createPerson(
			new Person({
				id: '',
				firstName: faker.person.firstName(),
				birthDate: { year: '2000', month: '01', day: '01' },
				deathDate: { year: '2020', month: '01', day: '01' },
			})
		)) as Person;
		const createdCorrespondence = await createCorrespondence({ correspondenceType: CorrespondenceType.Letter });
		await createPersonRelationship(createdCorrespondence?.correspondenceID as string, createdPerson!.id, RelationshipType.SENT);

		const persons = await getPersonsByCorrespondence(createdCorrespondence?.correspondenceID as string, RelationshipType.SENT);

		expect(persons).toContainEqual(createdPerson);
	});

	it(`should get persons who received correspondence`, async () => {
		const createdPerson: Person = (await createPerson(
			new Person({
				id: '',
				firstName: faker.person.firstName(),
				birthDate: { year: '2000', month: '01', day: '01' },
				deathDate: { year: '2020', month: '01', day: '01' },
			})
		)) as Person;
		const createdCorrespondence = await createCorrespondence({ correspondenceType: CorrespondenceType.Letter });
		await createPersonRelationship(createdCorrespondence?.correspondenceID as string, createdPerson!.id, RelationshipType.RECEIVED);

		const persons = await getPersonsByCorrespondence(createdCorrespondence?.correspondenceID as string, RelationshipType.RECEIVED);

		expect(persons).toContainEqual(createdPerson);
	});

	it(`should get correspondences sent by person`, async () => {
		const createdPerson: Person = (await createPerson(
			new Person({
				id: '',
				firstName: faker.person.firstName(),
				birthDate: { year: '2000', month: '01', day: '01' },
				deathDate: { year: '2020', month: '01', day: '01' },
			})
		)) as Person;
		const createdCorrespondence = await createCorrespondence({ correspondenceType: CorrespondenceType.Letter });
		await createPersonRelationship(createdCorrespondence?.correspondenceID as string, createdPerson!.id, RelationshipType.SENT);

		const correspondences = await getCorrespondencesByPerson(createdPerson!.id, RelationshipType.SENT);

		expect(correspondences).toContainEqual(createdCorrespondence);
	});

	it(`should get correspondences received by person`, async () => {
		const createdPerson: Person = (await createPerson(
			new Person({
				id: '',
				firstName: faker.person.firstName(),
				birthDate: { year: '2000', month: '01', day: '01' },
				deathDate: { year: '2020', month: '01', day: '01' },
			})
		)) as Person;
		const createdCorrespondence = await createCorrespondence({ correspondenceType: CorrespondenceType.Letter });
		await createPersonRelationship(createdCorrespondence?.correspondenceID as string, createdPerson!.id, RelationshipType.RECEIVED);

		const correspondences = await getCorrespondencesByPerson(createdPerson!.id, RelationshipType.RECEIVED);

		expect(correspondences).toContainEqual(createdCorrespondence);
	});
});
