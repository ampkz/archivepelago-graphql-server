import { faker } from '@faker-js/faker';
import { Person } from '../../../../src/archive/person';
import { Relationship, RelationshipDirection, RelationshipType } from '../../../../src/archive/relationship/relationship';
import { Node, NodeType } from '../../../../src/_helpers/nodes';
import { createPerson, deletePerson } from '../../../../src/db/archive/crud-person';
import { Label, LabelType } from '../../../../src/archive/label';
import { createLabel } from '../../../../src/db/archive/crud-label';
import { createRelationship, deleteRelationship, Errors, getRelationshipsToNode } from '../../../../src/db/utils/relationship/crud-relationship';
// import { destroyDBs, initializeDBs } from '../../../../src/db/utils/init-dbs';
import neo4j, { Driver, Session } from 'neo4j-driver';

describe(`Relationship CRUD Tests`, () => {
	// beforeAll(async () => {
	// 	await initializeDBs();
	// });

	// afterAll(async () => {
	// 	await destroyDBs();
	// });

	it(`should create a relationship`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: (global as any).UniqueAdjIterator.next().value,
			type: LabelType.PROFESSION,
		})) as Label;

		const person: Node = new Node(NodeType.PERSON, 'id', createdPerson.id, true);
		const label: Node = new Node(NodeType.LABEL, 'name', createdLabel.name, true);
		const relationship: Relationship = new Relationship(person, label, RelationshipType.IS);

		const createdRelationship = await createRelationship(relationship);

		expect(createdRelationship).toEqual([createdPerson, createdLabel]);
	});

	it(`should create a COMING relationship`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: (global as any).UniqueAdjIterator.next().value,
			type: LabelType.PROFESSION,
		})) as Label;

		const person: Node = new Node(NodeType.PERSON, 'id', createdPerson.id, true);
		const label: Node = new Node(NodeType.LABEL, 'name', createdLabel.name, true);
		const relationship: Relationship = new Relationship(person, label, RelationshipType.IS, RelationshipDirection.COMING);

		const createdRelationship = await createRelationship(relationship);

		expect(createdRelationship).toEqual([createdPerson, createdLabel]);
	});

	it(`should throw an error if a relationship was not created`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: (global as any).UniqueAdjIterator.next().value,
			type: LabelType.PROFESSION,
		})) as Label;

		const person: Node = new Node(NodeType.PERSON, 'id', createdPerson.id);
		const label: Node = new Node(NodeType.LABEL, 'name', createdLabel.name);
		const relationship: Relationship = new Relationship(person, label, RelationshipType.IS);

		await createRelationship(relationship);

		const driverMock = {
			session: jest.fn().mockReturnValue({
				run: jest.fn().mockResolvedValueOnce({ summary: { counters: { _stats: { relationshipsCreated: 0 } } } }),
				close: jest.fn(),
			} as unknown as Session),
			close: jest.fn(),
			getServerInfo: jest.fn(),
		} as unknown as Driver;

		const driverSpy = jest.spyOn(neo4j, 'driver');
		driverSpy.mockReturnValueOnce(driverMock);

		await expect(createRelationship(relationship)).rejects.toThrow(Errors.COULD_NOT_CREATE_RELATIONSHIP);
	});

	it(`should delete a relationship`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: (global as any).UniqueAdjIterator.next().value,
			type: LabelType.PROFESSION,
		})) as Label;

		const person: Node = new Node(NodeType.PERSON, 'id', createdPerson.id, true);
		const label: Node = new Node(NodeType.LABEL, 'name', createdLabel.name, true);
		const relationship: Relationship = new Relationship(person, label, RelationshipType.IS);

		await createRelationship(relationship);

		const deletedRelationship = await deleteRelationship(relationship);

		expect(deletedRelationship).toEqual([createdPerson, createdLabel]);
	});

	it(`should delete a COMING relationship`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: (global as any).UniqueAdjIterator.next().value,
			type: LabelType.PROFESSION,
		})) as Label;

		const person: Node = new Node(NodeType.PERSON, 'id', createdPerson.id, true);
		const label: Node = new Node(NodeType.LABEL, 'name', createdLabel.name, true);
		const relationship: Relationship = new Relationship(person, label, RelationshipType.IS, RelationshipDirection.COMING);

		await createRelationship(relationship);

		const deletedRelationship = await deleteRelationship(relationship);

		expect(deletedRelationship).toEqual([createdPerson, createdLabel]);
	});

	it(`should throw an error if a relationship was not deleted`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: (global as any).UniqueAdjIterator.next().value,
			type: LabelType.PROFESSION,
		})) as Label;

		const person: Node = new Node(NodeType.PERSON, 'id', createdPerson.id);
		const label: Node = new Node(NodeType.LABEL, 'name', createdLabel.name);
		const relationship: Relationship = new Relationship(person, label, RelationshipType.IS);

		await createRelationship(relationship);

		const driverMock = {
			session: jest.fn().mockReturnValue({
				run: jest.fn().mockResolvedValueOnce({ summary: { counters: { _stats: { relationshipsDeleted: 0 } } } }),
				close: jest.fn(),
			} as unknown as Session),
			close: jest.fn(),
			getServerInfo: jest.fn(),
		} as unknown as Driver;

		const driverSpy = jest.spyOn(neo4j, 'driver');
		driverSpy.mockReturnValueOnce(driverMock);

		await expect(deleteRelationship(relationship)).rejects.toThrow(Errors.COULD_NOT_DELETE_RELATIONSHIP);
	});

	it(`should delete a node with a relationship`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: (global as any).UniqueAdjIterator.next().value,
			type: LabelType.PROFESSION,
		})) as Label;

		const person: Node = new Node(NodeType.PERSON, 'id', createdPerson.id);
		const label: Node = new Node(NodeType.LABEL, 'name', createdLabel.name);
		const relationship: Relationship = new Relationship(person, label, RelationshipType.IS);

		await createRelationship(relationship);

		const deletedPerson = await deletePerson(createdPerson.id);

		expect(deletedPerson).toEqual(createdPerson);
	});

	it(`should retrieve a relationship`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: (global as any).UniqueAdjIterator.next().value,
			type: LabelType.PROFESSION,
		})) as Label;

		const person: Node = new Node(NodeType.PERSON, 'id', createdPerson.id);
		const label: Node = new Node(NodeType.LABEL, 'name', createdLabel.name);
		const relationship: Relationship = new Relationship(person, label, RelationshipType.IS);

		await createRelationship(relationship);

		const matchedRelationships = await getRelationshipsToNode(
			new Node(NodeType.PERSON, 'id', createdPerson.id),
			NodeType.LABEL,
			RelationshipType.IS
		);

		expect(matchedRelationships).toEqual([createdLabel]);
	});

	it(`should retrieve a COMING relationship`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: (global as any).UniqueAdjIterator.next().value,
			type: LabelType.PROFESSION,
		})) as Label;

		const person: Node = new Node(NodeType.PERSON, 'id', createdPerson.id);
		const label: Node = new Node(NodeType.LABEL, 'name', createdLabel.name);
		const relationship: Relationship = new Relationship(person, label, RelationshipType.IS, RelationshipDirection.COMING);

		await createRelationship(relationship);

		const matchedRelationships = await getRelationshipsToNode(
			new Node(NodeType.PERSON, 'id', createdPerson.id),
			NodeType.LABEL,
			RelationshipType.IS,
			RelationshipDirection.COMING
		);

		expect(matchedRelationships).toEqual([createdLabel]);
	});

	it(`should retrieve a list of relationships`, async () => {
		const createdPerson: Person = (await createPerson(new Person({ id: '', firstName: faker.person.firstName() }))) as Person;
		const createdLabel: Label = (await createLabel({
			name: (global as any).UniqueAdjIterator.next().value,
			type: LabelType.PROFESSION,
		})) as Label;
		const createdLabel2: Label = (await createLabel({
			name: (global as any).UniqueAdjIterator.next().value,
			type: LabelType.PROFESSION,
		})) as Label;
		const createdLabel3: Label = (await createLabel({
			name: (global as any).UniqueAdjIterator.next().value,
			type: LabelType.PROFESSION,
		})) as Label;

		const person: Node = new Node(NodeType.PERSON, 'id', createdPerson.id);
		const label: Node = new Node(NodeType.LABEL, 'name', createdLabel.name);
		const label2: Node = new Node(NodeType.LABEL, 'name', createdLabel2.name);
		const label3: Node = new Node(NodeType.LABEL, 'name', createdLabel3.name);

		const relationship: Relationship = new Relationship(person, label, RelationshipType.IS);
		const relationship2: Relationship = new Relationship(person, label2, RelationshipType.IS);
		const relationship3: Relationship = new Relationship(person, label3, RelationshipType.IS);

		await createRelationship(relationship);
		await createRelationship(relationship2);
		await createRelationship(relationship3);

		const matchedRelationships = await getRelationshipsToNode(
			new Node(NodeType.PERSON, 'id', createdPerson.id),
			NodeType.LABEL,
			RelationshipType.IS
		);

		expect(matchedRelationships).toContainEqual(createdLabel);
		expect(matchedRelationships).toContainEqual(createdLabel2);
		expect(matchedRelationships).toContainEqual(createdLabel3);
	});
});
