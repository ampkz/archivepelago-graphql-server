import dotenv from 'dotenv';
import { destroyTestingDBs, initializeDBs } from '../../../src/db/utils/init-dbs';
import { faker } from '@faker-js/faker';
import { createPerson, deletePerson, getPerson, getPersons, updatePerson } from '../../../src/db/archive/crud-person';
import { Person, IUpdatedPerson } from '../../../src/archive/person';

dotenv.config();

describe(`CRUD Person Tests`, () => {
	beforeAll(async () => {
		await initializeDBs();
	});

	afterAll(async () => {
		await destroyTestingDBs();
	});

	it(`should create a Person`, async () => {
		const firstName: string = faker.person.firstName(),
			lastName: string = faker.person.lastName(),
			secondName: string = faker.person.middleName(),
			birthDate: string = faker.date.birthdate().toDateString(),
			deathDate: string = faker.date.birthdate().toDateString();

		const person: Person = new Person({ id: '', firstName, lastName, secondName, birthDate, deathDate });

		const createdPerson: Person = await createPerson(person);

		person.id = createdPerson.id;

		expect(createdPerson).toEqual(person);
	});

	it(`should create a Person with undefined values`, async () => {
		const person: Person = new Person({ id: '' });

		const createdPerson: Person = await createPerson(person);

		person.id = createdPerson.id;

		expect(createdPerson).toEqual(person);
		expect(createdPerson.firstName).toBeUndefined();
		expect(createdPerson.lastName).toBeUndefined();
		expect(createdPerson.secondName).toBeUndefined();
		expect(createdPerson.birthDate).toBeUndefined();
		expect(createdPerson.deathDate).toBeUndefined();
	});

	it(`should get a created person`, async () => {
		const firstName: string = faker.person.firstName(),
			lastName: string = faker.person.lastName(),
			secondName: string = faker.person.middleName(),
			birthDate: string = faker.date.birthdate().toDateString(),
			deathDate: string = faker.date.birthdate().toDateString();

		const person: Person = new Person({ id: '', firstName, lastName, secondName, birthDate, deathDate });

		const createdPerson: Person = await createPerson(person);

		const matchedPerson: Person | undefined = await getPerson(createdPerson.id);

		expect(matchedPerson).toEqual(createdPerson);
	});

	it(`should delete a created person`, async () => {
		const firstName: string = faker.person.firstName(),
			lastName: string = faker.person.lastName(),
			secondName: string = faker.person.middleName(),
			birthDate: string = faker.date.birthdate().toDateString(),
			deathDate: string = faker.date.birthdate().toDateString();

		const person: Person = new Person({ id: '', firstName, lastName, secondName, birthDate, deathDate });

		const createdPerson: Person = await createPerson(person);

		const deletedPerson: Person | undefined = await deletePerson(createdPerson.id);

		expect(deletedPerson).toEqual(createdPerson);
	});

	test(`deletePerson should return undefined if no person exists`, async () => {
		const deletedPerson: Person | undefined = await deletePerson(faker.database.mongodbObjectId());

		expect(deletedPerson).toBeUndefined();
	});

	it(`should update a created person`, async () => {
		const firstName: string = faker.person.firstName(),
			lastName: string = faker.person.lastName(),
			secondName: string = faker.person.middleName(),
			birthDate: string = faker.date.birthdate().toDateString(),
			deathDate: string = faker.date.birthdate().toDateString();

		const updatedFirstName: string = faker.person.firstName(),
			updatedLastName: string = faker.person.lastName(),
			updatedSecondName: string = faker.person.middleName(),
			updatedBirthDate: string = faker.date.birthdate().toDateString(),
			updatedDeathDate: string = faker.date.birthdate().toDateString();

		const person: Person = new Person({ id: '', firstName, lastName, secondName, birthDate, deathDate });

		const createdPerson: Person = await createPerson(person);
		const updatedPerson: IUpdatedPerson = {
			id: createdPerson.id,
			updatedFirstName,
			updatedBirthDate,
			updatedDeathDate,
			updatedLastName,
			updatedSecondName,
		};

		const matchedPerson: Person | undefined = await updatePerson(updatedPerson);

		expect(matchedPerson).toEqual(
			new Person({
				id: createdPerson.id,
				firstName: updatedFirstName,
				lastName: updatedLastName,
				secondName: updatedSecondName,
				birthDate: updatedBirthDate,
				deathDate: updatedDeathDate,
			})
		);
	});

	it(`should update a created person and delete a property set to null`, async () => {
		const firstName: string = faker.person.firstName(),
			lastName: string = faker.person.lastName(),
			secondName: string = faker.person.middleName(),
			birthDate: string = faker.date.birthdate().toDateString(),
			deathDate: string = faker.date.birthdate().toDateString();

		const person: Person = new Person({ id: '', firstName, lastName, secondName, birthDate, deathDate });

		const createdPerson: Person = await createPerson(person);
		const updatedPerson: IUpdatedPerson = {
			id: createdPerson.id,
			updatedFirstName: null,
			updatedBirthDate: null,
			updatedDeathDate: null,
			updatedLastName: null,
			updatedSecondName: null,
		};

		const matchedPerson: Person | undefined = await updatePerson(updatedPerson);

		expect(matchedPerson).toEqual(new Person({ id: createdPerson.id }));
	});

	test(`updatePerson should return undefined if no person exists`, async () => {
		const updatedPerson: Person | undefined = await updatePerson({
			id: faker.database.mongodbObjectId(),
			updatedFirstName: faker.person.firstName(),
		});

		expect(updatedPerson).toBeUndefined();
	});

	test(`getPerson should return undefined if no person exists`, async () => {
		const person: Person | undefined = await getPerson(faker.database.mongodbObjectId());

		expect(person).toBeUndefined();
	});

	test(`getPersons should return a list of persons`, async () => {
		const person: Person = new Person({ id: faker.database.mongodbObjectId(), firstName: faker.person.firstName() });
		const person2: Person = new Person({ id: faker.database.mongodbObjectId(), firstName: faker.person.firstName() });
		const person3: Person = new Person({ id: faker.database.mongodbObjectId(), firstName: faker.person.firstName() });

		const createdPerson: Person = await createPerson(person);
		const createdPerson2: Person = await createPerson(person2);
		const createdPerson3: Person = await createPerson(person3);

		const matchedPersons: Person[] = await getPersons();

		expect(matchedPersons).toContainEqual(createdPerson);
		expect(matchedPersons).toContainEqual(createdPerson2);
		expect(matchedPersons).toContainEqual(createdPerson3);
	});
});
