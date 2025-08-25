import { faker } from '@faker-js/faker';
import { createPerson, deletePerson, getPerson, getPersons, updatePerson } from '../../../src/db/archive/crud-person';
import { Person } from '../../../src/archive/person';
import { ArchiveDate, UpdatePersonInput as IUpdatedPerson } from '../../../src/generated/graphql';
import { convertDateStringToArchiveDate } from '../../../src/archive/date';

describe(`CRUD Person Tests`, () => {
	it(`should create a Person`, async () => {
		const firstName: string = faker.person.firstName(),
			lastName: string = faker.person.lastName(),
			secondName: string = faker.person.middleName(),
			birthDate: ArchiveDate | null = convertDateStringToArchiveDate('1901-01-01'),
			deathDate: ArchiveDate | null = convertDateStringToArchiveDate('1901-01-31');

		const person: Person = new Person({ id: '', firstName, lastName, secondName, birthDate, deathDate });

		const createdPerson = await createPerson(person);

		person.id = createdPerson!.id;

		expect(createdPerson).toEqual(person);
	});

	it(`should create a Person with null values`, async () => {
		const person: Person = new Person({ id: '' });

		const createdPerson = await createPerson(person);

		person.id = createdPerson!.id;

		expect(createdPerson).toEqual(person);
		expect(createdPerson!.firstName).toBeUndefined();
		expect(createdPerson!.lastName).toBeUndefined();
		expect(createdPerson!.secondName).toBeUndefined();
		expect(createdPerson!.birthDate).toBeUndefined();
		expect(createdPerson!.deathDate).toBeUndefined();
	});

	it(`should get a created person`, async () => {
		const firstName: string = faker.person.firstName(),
			lastName: string = faker.person.lastName(),
			secondName: string = faker.person.middleName(),
			birthDate: ArchiveDate | null = convertDateStringToArchiveDate('1901-01-01'),
			deathDate: ArchiveDate | null = convertDateStringToArchiveDate('1901-01-31');

		const createdPerson = await createPerson({ firstName, lastName, secondName, birthDate, deathDate });

		const matchedPerson: Person | null = await getPerson(createdPerson!.id);

		expect(matchedPerson).toEqual(createdPerson);
	});

	it(`should delete a created person`, async () => {
		const firstName: string = faker.person.firstName(),
			lastName: string = faker.person.lastName(),
			secondName: string = faker.person.middleName(),
			birthDate: ArchiveDate | null = convertDateStringToArchiveDate('1901-01-01'),
			deathDate: ArchiveDate | null = convertDateStringToArchiveDate('1901-01-31');

		const person: Person = new Person({ id: '', firstName, lastName, secondName, birthDate, deathDate });

		const createdPerson = await createPerson(person);

		const deletedPerson: Person | null = await deletePerson(createdPerson!.id);

		expect(deletedPerson).toEqual(createdPerson);
	});

	test(`deletePerson should return null if no person exists`, async () => {
		const deletedPerson: Person | null = await deletePerson(faker.database.mongodbObjectId());

		expect(deletedPerson).toBeNull();
	});

	it(`should update a created person`, async () => {
		const firstName: string = faker.person.firstName(),
			lastName: string = faker.person.lastName(),
			secondName: string = faker.person.middleName(),
			birthDate: ArchiveDate | null = convertDateStringToArchiveDate('1901-01-01'),
			deathDate: ArchiveDate | null = convertDateStringToArchiveDate('1901-01-31');

		const updatedFirstName: string = faker.person.firstName(),
			updatedLastName: string = faker.person.lastName(),
			updatedSecondName: string = faker.person.middleName(),
			updatedBirthDate: ArchiveDate | null = convertDateStringToArchiveDate('1902-01-01'),
			updatedDeathDate: ArchiveDate | null = convertDateStringToArchiveDate('1902-01-31');

		const person: Person = new Person({ id: '', firstName, lastName, secondName, birthDate, deathDate });

		const createdPerson = await createPerson(person);
		const updatedPerson: IUpdatedPerson = {
			id: createdPerson!.id,
			updatedFirstName,
			updatedBirthDate,
			updatedDeathDate,
			updatedLastName,
			updatedSecondName,
		};

		const matchedPerson: Person | null = await updatePerson(updatedPerson);

		expect(matchedPerson).toEqual(
			new Person({
				id: createdPerson!.id,
				firstName: updatedFirstName,
				lastName: updatedLastName,
				secondName: updatedSecondName,
				birthDate: updatedBirthDate,
				deathDate: updatedDeathDate,
			})
		);
	});

	it(`should update a created person and delete a property set to undefined`, async () => {
		const firstName: string = faker.person.firstName(),
			lastName: string = faker.person.lastName(),
			secondName: string = faker.person.middleName(),
			birthDate: ArchiveDate | null = convertDateStringToArchiveDate('1901-01-01'),
			deathDate: ArchiveDate | null = convertDateStringToArchiveDate('1901-01-31');

		const person: Person = new Person({ id: '', firstName, lastName, secondName, birthDate, deathDate });

		const createdPerson = await createPerson(person);
		const updatedPerson: IUpdatedPerson = {
			id: createdPerson!.id,
			updatedFirstName: undefined,
			updatedBirthDate: undefined,
			updatedDeathDate: undefined,
			updatedLastName: undefined,
			updatedSecondName: undefined,
		};

		const matchedPerson: Person | null = await updatePerson(updatedPerson);

		expect(matchedPerson).toEqual(new Person({ id: createdPerson!.id }));
	});

	test(`updatePerson should return null if no person exists`, async () => {
		const updatedPerson: Person | null = await updatePerson({
			id: faker.database.mongodbObjectId(),
			updatedFirstName: faker.person.firstName(),
		});

		expect(updatedPerson).toBeNull();
	});

	test(`getPerson should return null if no person exists`, async () => {
		const person: Person | null = await getPerson(faker.database.mongodbObjectId());

		expect(person).toBeNull();
	});

	test(`getPersons should return a list of persons`, async () => {
		const person: Person = new Person({ id: faker.database.mongodbObjectId(), firstName: faker.person.firstName() });
		const person2: Person = new Person({ id: faker.database.mongodbObjectId(), firstName: faker.person.firstName() });
		const person3: Person = new Person({ id: faker.database.mongodbObjectId(), firstName: faker.person.firstName() });

		const createdPerson = await createPerson(person);
		const createdPerson2 = await createPerson(person2);
		const createdPerson3 = await createPerson(person3);

		const matchedPersons: Person[] = await getPersons();

		expect(matchedPersons).toContainEqual(createdPerson);
		expect(matchedPersons).toContainEqual(createdPerson2);
		expect(matchedPersons).toContainEqual(createdPerson3);
	});
});
