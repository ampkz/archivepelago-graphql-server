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

dotenv.config();

describe(`Relationship CRUD Tests`, () => {
    beforeAll(async () => {
        await initializeDBs();
    });

    afterAll(async () => {
        await destroyTestingDBs();
    });
    
    it(`should create a relationship`, async () => {
        const createdPerson: Person = await createPerson(new Person({ id: '', firstName: faker.person.firstName() })) as Person;
        const createdLabel: Label = await createLabel(faker.word.adjective()) as Label;

        const person: Node = new Node(NodeType.PERSON, "id", createdPerson.id);
        const label: Node = new Node(NodeType.LABEL, "name", createdLabel.name);
        const relationship: Relationship = new Relationship(person, label, RelationshipType.IS);

        const createdRelationship = await createRelationship(relationship);

        expect(createdRelationship).toEqual(relationship);
    });

    it(`should throw an error if a relationship was not created`, async () => {
        const createdPerson: Person = await createPerson(new Person({ id: '', firstName: faker.person.firstName() })) as Person;
        const createdLabel: Label = await createLabel(faker.word.adjective()) as Label;

        const person: Node = new Node(NodeType.PERSON, "id", createdPerson.id);
        const label: Node = new Node(NodeType.LABEL, "name", createdLabel.name);
        const relationship: Relationship = new Relationship(person, label, RelationshipType.IS);

        await createRelationship(relationship);

        const driverMock = {
            session: jest.fn().mockReturnValue({
                run: jest.fn().mockResolvedValueOnce({summary: {counters: { _stats: { relationshipsCreated: 0 }}}}),
                close: jest.fn(),
            } as unknown as Session),
            close: jest.fn(),
            getServerInfo: jest.fn()
        } as unknown as Driver;
        
        const driverSpy = jest.spyOn(neo4j, "driver");
        driverSpy.mockReturnValueOnce(driverMock);

        await expect(createRelationship(relationship)).rejects.toThrow(Errors.COULD_NOT_CREATE_RELATIONSHIP);
    });

    it(`should delete a relationship`, async () => {
        const createdPerson: Person = await createPerson(new Person({ id: '', firstName: faker.person.firstName() })) as Person;
        const createdLabel: Label = await createLabel(faker.word.adjective()) as Label;

        const person: Node = new Node(NodeType.PERSON, "id", createdPerson.id);
        const label: Node = new Node(NodeType.LABEL, "name", createdLabel.name);
        const relationship: Relationship = new Relationship(person, label, RelationshipType.IS);

        await createRelationship(relationship);

        const deletedRelationship = await deleteRelationship(relationship);

        expect(deletedRelationship).toEqual(relationship);
    });

    it(`should throw an error if a relationship was not deleted`, async () => {
        const createdPerson: Person = await createPerson(new Person({ id: '', firstName: faker.person.firstName() })) as Person;
        const createdLabel: Label = await createLabel(faker.word.adjective()) as Label;

        const person: Node = new Node(NodeType.PERSON, "id", createdPerson.id);
        const label: Node = new Node(NodeType.LABEL, "name", createdLabel.name);
        const relationship: Relationship = new Relationship(person, label, RelationshipType.IS);

        await createRelationship(relationship);

        const driverMock = {
            session: jest.fn().mockReturnValue({
                run: jest.fn().mockResolvedValueOnce({summary: {counters: { _stats: { relationshipsDeleted: 0 }}}}),
                close: jest.fn(),
            } as unknown as Session),
            close: jest.fn(),
            getServerInfo: jest.fn()
        } as unknown as Driver;
        
        const driverSpy = jest.spyOn(neo4j, "driver");
        driverSpy.mockReturnValueOnce(driverMock);

        await expect(deleteRelationship(relationship)).rejects.toThrow(Errors.COULD_NOT_DELETE_RELATIONSHIP);
    });

    it(`should delete a node with a relationship`, async () => {
        const createdPerson: Person = await createPerson(new Person({ id: '', firstName: faker.person.firstName() })) as Person;
        const createdLabel: Label = await createLabel(faker.word.adjective()) as Label;

        const person: Node = new Node(NodeType.PERSON, "id", createdPerson.id);
        const label: Node = new Node(NodeType.LABEL, "name", createdLabel.name);
        const relationship: Relationship = new Relationship(person, label, RelationshipType.IS);

        const createdRelationship = await createRelationship(relationship);

        const deletedPerson = await deletePerson(createdPerson.id);

        expect(createdRelationship).toEqual(relationship);
        expect(deletedPerson).toEqual(createdPerson);
    });
})