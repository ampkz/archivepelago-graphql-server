import dotenv from 'dotenv';
import { destroyTestingDBs, initializeDBs } from '../../../../src/db/utils/init-dbs';
import { faker } from '@faker-js/faker';
import { CorrespondenceType } from '../../../../src/archive/correspondence';
import { createCorrespondence } from '../../../../src/db/archive/crud-correspondence';
import { createPerson } from '../../../../src/db/archive/crud-person';
import { RelationshipType } from '../../../../src/archive/relationship/relationship';
import {
	createPersonRelationship,
	deletePersonRelationship,
	getCorrespondencesByPerson,
	getPersonsByCorrespondence,
} from '../../../../src/db/archive/relationship/person-correspondence-relationship';

dotenv.config();

describe(`CRUD Correspondence Tests`, () => {
	beforeAll(async () => {
		await initializeDBs();
	});

	afterAll(async () => {
		await destroyTestingDBs();
	});

	it(`should create a relationship between a created person and a created correspondence`, async () => {
		const createdPerson = await createPerson({ id: '', firstName: faker.person.firstName() });
		const createdCorrespondence = await createCorrespondence({ correspondenceID: '', correspondenceType: CorrespondenceType.LETTER });
		const returnedCorrespondence = await createPersonRelationship(
			createdCorrespondence?.correspondenceID as string,
			createdPerson.id,
			RelationshipType.SENT
		);

		expect(returnedCorrespondence).toEqual(createdCorrespondence);
	});

	it(`should delete a created relationship between a created person and a created correspondence`, async () => {
		const createdPerson = await createPerson({ id: '', firstName: faker.person.firstName() });
		const createdCorrespondence = await createCorrespondence({ correspondenceID: '', correspondenceType: CorrespondenceType.LETTER });
		await createPersonRelationship(createdCorrespondence?.correspondenceID as string, createdPerson.id, RelationshipType.SENT);
		const returnedCorrespondence = await deletePersonRelationship(
			createdCorrespondence?.correspondenceID as string,
			createdPerson.id,
			RelationshipType.SENT
		);

		expect(returnedCorrespondence).toEqual(createdCorrespondence);
	});

	it(`should get persons who sent correspondence`, async () => {
		const createdPerson = await createPerson({ id: '', firstName: faker.person.firstName() });
		const createdCorrespondence = await createCorrespondence({ correspondenceID: '', correspondenceType: CorrespondenceType.LETTER });
		await createPersonRelationship(createdCorrespondence?.correspondenceID as string, createdPerson.id, RelationshipType.SENT);

		const persons = await getPersonsByCorrespondence(createdCorrespondence?.correspondenceID as string, RelationshipType.SENT);

		expect(persons).toContainEqual(createdPerson);
	});

	it(`should get persons who received correspondence`, async () => {
		const createdPerson = await createPerson({ id: '', firstName: faker.person.firstName() });
		const createdCorrespondence = await createCorrespondence({ correspondenceID: '', correspondenceType: CorrespondenceType.LETTER });
		await createPersonRelationship(createdCorrespondence?.correspondenceID as string, createdPerson.id, RelationshipType.RECEIVED);

		const persons = await getPersonsByCorrespondence(createdCorrespondence?.correspondenceID as string, RelationshipType.RECEIVED);

		expect(persons).toContainEqual(createdPerson);
	});

	it(`should get correspondences sent by person`, async () => {
		const createdPerson = await createPerson({ id: '', firstName: faker.person.firstName() });
		const createdCorrespondence = await createCorrespondence({ correspondenceID: '', correspondenceType: CorrespondenceType.LETTER });
		await createPersonRelationship(createdCorrespondence?.correspondenceID as string, createdPerson.id, RelationshipType.SENT);

		const correspondences = await getCorrespondencesByPerson(createdPerson.id, RelationshipType.SENT);

		expect(correspondences).toContainEqual(createdCorrespondence);
	});

	it(`should get correspondences received by person`, async () => {
		const createdPerson = await createPerson({ id: '', firstName: faker.person.firstName() });
		const createdCorrespondence = await createCorrespondence({ correspondenceID: '', correspondenceType: CorrespondenceType.LETTER });
		await createPersonRelationship(createdCorrespondence?.correspondenceID as string, createdPerson.id, RelationshipType.RECEIVED);

		const correspondences = await getCorrespondencesByPerson(createdPerson.id, RelationshipType.RECEIVED);

		expect(correspondences).toContainEqual(createdCorrespondence);
	});
});
