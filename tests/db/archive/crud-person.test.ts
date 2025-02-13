import dotenv from 'dotenv';
import { destroyTestingDBs, initializeDBs } from '../../../src/db/utils/init-dbs';
import { faker } from '@faker-js/faker';
import { createPerson, deletePerson, getPerson } from '../../../src/db/archive/crud-person';
import { Person } from '../../../src/archive/person';

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

        const person: Person = new Person({id: '', firstName, lastName, secondName, birthDate, deathDate});

        const createdPerson: Person = await createPerson(person);

        person.id = createdPerson.id;

        expect(createdPerson).toEqual(person);
    });

    it(`should create a Person with undefined values`, async () => {
        const person: Person = new Person({id: ''});

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

        const person: Person = new Person({id: '', firstName, lastName, secondName, birthDate, deathDate});

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

        const person: Person = new Person({id: '', firstName, lastName, secondName, birthDate, deathDate});

        const createdPerson: Person = await createPerson(person);

        const deletedPerson: Person | undefined = await deletePerson(createdPerson.id);

        expect(deletedPerson).toEqual(createdPerson);
    });

    test(`deletePerson should return undefined if no person exists`, async () => {
        const deletedPerson: Person | undefined = await deletePerson(faker.database.mongodbObjectId());

        expect(deletedPerson).toBeUndefined();
    });
})