import { faker } from '@faker-js/faker';
import { Person } from '../../../../src/archive/person';
import { Node, NodeType, PersonLabel, PersonLabelRelationship, Relationship, RelationshipType } from '../../../../src/archive/relationship/relationship';
import { createPerson } from '../../../../src/db/archive/crud-person';
import { Label } from '../../../../src/archive/label';
import { createLabel } from '../../../../src/db/archive/crud-label';
import { destroyTestingDBs, initializeDBs } from '../../../../src/db/utils/init-dbs';
import dotenv from 'dotenv';

import { setPersonIsLabel, unsetPersonIsLabel } from '../../../../src/db/archive/relationship/person-label-relationship';


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

        const personLabel: PersonLabel = new PersonLabel(createdPerson, createdLabel);

        const createdRelationship = await setPersonIsLabel(personLabel);

        expect(createdRelationship).toEqual(new PersonLabelRelationship(personLabel));
    });

    it(`should delete a relationship between a person and label`, async () => {
        const createdPerson: Person = await createPerson(new Person({ id: '', firstName: faker.person.firstName() })) as Person;
        const createdLabel: Label = await createLabel(faker.word.adjective()) as Label;

        const personLabel: PersonLabel = new PersonLabel(createdPerson, createdLabel);

        await setPersonIsLabel(personLabel);

        const deletedRelationship = await unsetPersonIsLabel(personLabel);

        expect(deletedRelationship).toEqual(new PersonLabelRelationship(personLabel));
    });
})