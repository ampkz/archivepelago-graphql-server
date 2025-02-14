import { faker } from '@faker-js/faker';
import { Person } from '../../../../src/archive/person';
import { Node, NodeType, PersonLabel, Relationship, RelationshipType } from '../../../../src/archive/relationship/relationship';
import { createPerson } from '../../../../src/db/archive/crud-person';
import { Label } from '../../../../src/archive/label';
import { createLabel } from '../../../../src/db/archive/crud-label';
import { destroyTestingDBs, initializeDBs } from '../../../../src/db/utils/init-dbs';
import dotenv from 'dotenv';

import { createPersonLabel, deletePersonLabel, getPersonLabels } from '../../../../src/db/archive/relationship/person-label-relationship';


dotenv.config();

describe(`Person-[:IS]->Label Tests`, () => {
    beforeAll(async () => {
        await initializeDBs();
    });

    afterAll(async () => {
        await destroyTestingDBs();
    });
    
    it(`should create a relationship between a person and label`, async () => {
        const createdPerson: Person = await createPerson(new Person({ id: '', firstName: faker.person.firstName() })) as Person;
        const createdLabel: Label = await createLabel(faker.word.adjective()) as Label;

        const personLabel: PersonLabel = new PersonLabel(createdPerson.id, createdLabel.name);

        const matchedPerson = await createPersonLabel(personLabel);
        
        expect(matchedPerson).toEqual(createdPerson);
    });

    it(`should delete a relationship between a person and label`, async () => {
        const createdPerson: Person = await createPerson(new Person({ id: '', firstName: faker.person.firstName() })) as Person;
        const createdLabel: Label = await createLabel(faker.word.adjective()) as Label;

        const personLabel: PersonLabel = new PersonLabel(createdPerson.id, createdLabel.name);

        await createPersonLabel(personLabel);

        const matchedPerson = await deletePersonLabel(personLabel);

        expect(matchedPerson).toEqual(createdPerson);
    });

    it(`should get a relationship between a person and label`, async () => {
        const createdPerson: Person = await createPerson(new Person({ id: '', firstName: faker.person.firstName() })) as Person;
        const createdLabel: Label = await createLabel(faker.word.adjective()) as Label;

        const personLabel: PersonLabel = new PersonLabel(createdPerson.id, createdLabel.name);

        await createPersonLabel(personLabel);

        const matchedRelationship: Label[] = await getPersonLabels(createdPerson);

        expect(matchedRelationship).toEqual([createdLabel]);
    });

    it(`should get a list of relationships between a person and label`, async () => {
        const createdPerson: Person = await createPerson(new Person({ id: '', firstName: faker.person.firstName() })) as Person;
        const createdLabel: Label = await createLabel(faker.word.adjective()) as Label;
        const createdLabel2: Label = await createLabel(faker.word.adjective()) as Label;
        const createdLabel3: Label = await createLabel(faker.word.adjective()) as Label;

        const personLabel: PersonLabel = new PersonLabel(createdPerson.id, createdLabel.name);
        const personLabel2: PersonLabel = new PersonLabel(createdPerson.id, createdLabel2.name);
        const personLabel3: PersonLabel = new PersonLabel(createdPerson.id, createdLabel3.name);


        await createPersonLabel(personLabel);
        await createPersonLabel(personLabel2);
        await createPersonLabel(personLabel3);

        const matchedRelationships: Label[] = await getPersonLabels(createdPerson);

        expect(matchedRelationships).toContainEqual(createdLabel);
        expect(matchedRelationships).toContainEqual(createdLabel2);
        expect(matchedRelationships).toContainEqual(createdLabel3);
    });
})