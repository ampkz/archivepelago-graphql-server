import { faker } from '@faker-js/faker';
import { Person } from '../../../../src/archive/person';
import { Node, NodeType, Relationship, RelationshipType } from '../../../../src/archive/relationship/relationship';
import { createPerson, deletePerson } from '../../../../src/db/archive/crud-person';
import { Label } from '../../../../src/archive/label';
import { createLabel } from '../../../../src/db/archive/crud-label';
import { createRelationship, deleteRelationship, Errors } from '../../../../src/db/utils/relationship/crud-relationship';
import { destroyTestingDBs, initializeDBs } from '../../../../src/db/utils/init-dbs';
import dotenv from 'dotenv';
import neo4j, { Driver, Session } from 'neo4j-driver';

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

        const createdRelationship = await setPersonIsLabel(createdPerson, createdLabel);

        expect(createdRelationship).toEqual(new Relationship(new Node(NodeType.PERSON, "id", createdPerson.id), new Node(NodeType.LABEL, "name", createdLabel.name), RelationshipType.IS));
    });

    it(`should delete a relationship between a person and label`, async () => {
        const createdPerson: Person = await createPerson(new Person({ id: '', firstName: faker.person.firstName() })) as Person;
        const createdLabel: Label = await createLabel(faker.word.adjective()) as Label;

        await setPersonIsLabel(createdPerson, createdLabel);

        const deletedRelationship = await unsetPersonIsLabel(createdPerson, createdLabel);

        expect(deletedRelationship).toEqual(new Relationship(new Node(NodeType.PERSON, "id", createdPerson.id), new Node(NodeType.LABEL, "name", createdLabel.name), RelationshipType.IS));
    });
})