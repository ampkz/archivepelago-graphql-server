import { faker } from '@faker-js/faker';
import { Person } from '../../src/archive/person';
import { ArchiveDate } from '../../src/generated/graphql';
import { convertDateStringToArchiveDate } from '../../src/archive/date';

describe(`Person Tests`, () => {
	it(`should create a person`, () => {
		const id: string = faker.string.uuid(),
			firstName: string = faker.person.firstName(),
			lastName: string = faker.person.lastName(),
			secondName: string = faker.person.middleName(),
			birthDate: ArchiveDate | null = convertDateStringToArchiveDate('1901-01-01'),
			deathDate: ArchiveDate | null = convertDateStringToArchiveDate('1901-01-31');

		const person: Person = new Person({ id, firstName, lastName, secondName, birthDate, deathDate });

		expect(person).toEqual({ id, firstName, lastName, secondName, birthDate, deathDate });
	});

	it(`should create a person with undefined values`, () => {
		const id: string = faker.string.uuid();

		const person: Person = new Person({ id });

		expect(person).toEqual({ id });
		expect(person.firstName).toBeUndefined();
		expect(person.lastName).toBeUndefined();
		expect(person.secondName).toBeUndefined();
		expect(person.birthDate).toBeUndefined();
		expect(person.deathDate).toBeUndefined();
	});
});
