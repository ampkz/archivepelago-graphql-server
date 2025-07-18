import { createNode, Errors as CRUDErrors, deleteNode, getNode, getNodes, removeProperties, updateNode } from '../../../src/db/utils/crud';
import { faker } from '@faker-js/faker';
import { Neo4jError, Record, Session } from 'neo4j-driver';
import neo4j, { Driver } from 'neo4j-driver';
import { Label, LabelType } from '../../../src/archive/label';
import { NodeType } from '../../../src/_helpers/nodes';

describe(`CRUD Tests`, () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it(`should create a new node`, async () => {
		const email: string = faker.internet.email();
		const node: object | undefined = await createNode(NodeType.USER, ['email: $email'], { email }, process.env.USERS_DB as string);
		expect(node).toEqual({ email });
	});

	it(`should create a new node in the default database`, async () => {
		const email: string = faker.internet.email();
		const node: object | undefined = await createNode(NodeType.USER, ['email: $email'], { email });
		expect(node).toEqual({ email });
	});

	it(`should get a node in the default database`, async () => {
		const email: string = faker.internet.email();
		const node: object | undefined = await createNode(NodeType.USER, ['email: $email'], { email });
		const matchedNode: any | undefined = await getNode(NodeType.USER, 'email: $email', { email });
		expect(matchedNode).toEqual(node);
	});

	it(`should delete a node in the default database`, async () => {
		const email: string = faker.internet.email();
		const node: object | undefined = await createNode(NodeType.USER, ['email: $email'], { email });
		const matchedNode: any | undefined = await deleteNode(NodeType.USER, 'email: $email', { email });
		expect(matchedNode).toEqual(node);
	});

	it(`should throw an error if trying to create a user with an existing email`, async () => {
		const email: string = faker.internet.email();

		await createNode(NodeType.USER, ['email: $email'], { email }, process.env.USERS_DB as string);

		await expect(createNode(NodeType.USER, ['email: $email'], { email }, process.env.USERS_DB as string)).rejects.toThrow(
			CRUDErrors.CANNOT_CREATE_NODE
		);
	});

	it(`should throw an error if the query was successful but still didn't create a node`, async () => {
		const driverMock = {
			session: jest.fn().mockReturnValue({
				run: jest.fn().mockResolvedValueOnce({ summary: { counters: { _stats: { nodesCreated: 0 } } } }),
				close: jest.fn(),
			} as unknown as Session),
			close: jest.fn(),
			getServerInfo: jest.fn(),
		} as unknown as Driver;

		const driverSpy = jest.spyOn(neo4j, 'driver');
		driverSpy.mockReturnValueOnce(driverMock);

		await expect(createNode(NodeType.USER, ['email: $email'], { email: faker.internet.email() }, process.env.USERS_DB as string)).rejects.toThrow(
			CRUDErrors.CANNOT_CREATE_NODE
		);
	});

	it(`should return a created node`, async () => {
		const email: string = faker.internet.email();
		const node: object | undefined = await createNode(NodeType.USER, ['email: $email'], { email }, process.env.USERS_DB as string);

		const matchedNode: any | undefined = await getNode(NodeType.USER, 'email: $email', { email }, process.env.USERS_DB as string);

		expect(matchedNode).toEqual(node);
	});

	it(`should throw an error if there was an issue with the query`, async () => {
		const driverMock = {
			session: jest.fn().mockReturnValue({
				run: jest.fn().mockRejectedValue(new Neo4jError('', '', '', '')),
				close: jest.fn(),
			} as unknown as Session),
			close: jest.fn(),
			getServerInfo: jest.fn(),
		} as unknown as Driver;

		const driverSpy = jest.spyOn(neo4j, 'driver');
		driverSpy.mockReturnValueOnce(driverMock);

		await expect(getNode(NodeType.USER, 'email: $email', { email: faker.internet.email() }, process.env.USERS_DB as string)).rejects.toThrow(
			CRUDErrors.CANNOT_MATCH_NODE
		);
	});

	it(`should delete an existing node`, async () => {
		const email: string = faker.internet.email();
		const node: object | undefined = await createNode(NodeType.USER, ['email: $email'], { email }, process.env.USERS_DB as string);

		const deletedNode: any | undefined = await deleteNode(NodeType.USER, 'email: $email', { email }, process.env.USERS_DB as string);

		expect(deletedNode).toEqual(node);
	});

	it(`should throw an error if there was an issue deleting the node`, async () => {
		const mockRecord = {
			get: (key: any) => {
				if (key === 'id') {
					return { low: 1, high: 0 }; // Neo4j integer
				}
				if (key === 'name') {
					return 'Test Node';
				}
				if (key === 'properties') {
					return { name: 'Test Node' };
				}
				return { properties: {} };
			},
			toObject: () => ({
				id: { low: 1, high: 0 },
				name: 'Test Node',
			}),
		} as unknown as Record;

		const mockResult = {
			records: [mockRecord],
		};

		const driverMock = {
			session: jest.fn().mockReturnValue({
				run: jest
					.fn()
					.mockResolvedValueOnce(mockResult)
					.mockResolvedValueOnce({ summary: { counters: { _stats: { nodesDeleted: 0 } } } }),
				close: jest.fn(),
			} as unknown as Session),
			close: jest.fn(),
			getServerInfo: jest.fn(),
		} as unknown as Driver;

		const driverSpy = jest.spyOn(neo4j, 'driver');
		driverSpy.mockReturnValueOnce(driverMock);

		await expect(deleteNode(NodeType.USER, 'email: $email', { email: faker.internet.email() }, process.env.USERS_DB as string)).rejects.toThrow(
			CRUDErrors.CANNOT_DELETE_NODE
		);
	});

	it(`should throw an error if there was an issue with the database in deleting the node`, async () => {
		const mockRecord = {
			get: (key: any) => {
				if (key === 'id') {
					return { low: 1, high: 0 }; // Neo4j integer
				}
				if (key === 'name') {
					return 'Test Node';
				}
				if (key === 'properties') {
					return { name: 'Test Node' };
				}
				return { properties: {} };
			},
			toObject: () => ({
				id: { low: 1, high: 0 },
				name: 'Test Node',
			}),
		} as unknown as Record;

		const mockResult = {
			records: [mockRecord],
		};

		const driverMock = {
			session: jest.fn().mockReturnValue({
				run: jest
					.fn()
					.mockResolvedValueOnce(mockResult)
					.mockRejectedValueOnce(new Neo4jError('', '', '', '')),
				close: jest.fn(),
			} as unknown as Session),
			close: jest.fn(),
			getServerInfo: jest.fn(),
		} as unknown as Driver;

		const driverSpy = jest.spyOn(neo4j, 'driver');
		driverSpy.mockReturnValueOnce(driverMock);

		await expect(deleteNode(NodeType.USER, 'email: $email', { email: faker.internet.email() }, process.env.USERS_DB as string)).rejects.toThrow(
			CRUDErrors.CANNOT_DELETE_NODE
		);
	});

	it(`should update a created node`, async () => {
		const email: string = faker.internet.email(),
			firstName: string = faker.person.firstName(),
			updatedFirstName: string = faker.person.firstName();

		await createNode(NodeType.USER, ['email: $email', 'firstName: $firstName'], { email, firstName }, process.env.USERS_DB as string);

		const updatedNode: any | undefined = await updateNode(
			NodeType.USER,
			'u',
			'email',
			['u.firstName = $firstName'],
			{ email, firstName: updatedFirstName },
			process.env.USERS_DB as string
		);

		expect(updatedNode).toEqual({ email, firstName: updatedFirstName });
	});

	it(`should update a created node on default database`, async () => {
		const email: string = faker.internet.email(),
			firstName: string = faker.person.firstName(),
			updatedFirstName: string = faker.person.firstName();

		await createNode(NodeType.USER, ['email: $email', 'firstName: $firstName'], { email, firstName });

		const updatedNode: any | undefined = await updateNode(NodeType.USER, 'u', 'email', ['u.firstName = $firstName'], {
			email,
			firstName: updatedFirstName,
		});

		expect(updatedNode).toEqual({ email, firstName: updatedFirstName });
	});

	it(`should return undefined if no node was updated`, async () => {
		const email: string = faker.internet.email(),
			updatedFirstName: string = faker.person.firstName();

		const updatedNode: any | undefined = await updateNode(NodeType.USER, 'u', 'email', ['u.firstName = $firstName'], {
			email,
			firstName: updatedFirstName,
		});

		expect(updatedNode).toBeUndefined();
	});

	it(`should throw an error if there was an issue with the database in updating the node`, async () => {
		const driverMock = {
			session: jest.fn().mockReturnValue({
				run: jest.fn().mockRejectedValueOnce(new Neo4jError('', '', '', '')),
				close: jest.fn(),
			} as unknown as Session),
			close: jest.fn(),
			getServerInfo: jest.fn(),
		} as unknown as Driver;

		const driverSpy = jest.spyOn(neo4j, 'driver');
		driverSpy.mockReturnValueOnce(driverMock);

		const email: string = faker.internet.email(),
			updatedFirstName: string = faker.person.firstName();

		await expect(updateNode(NodeType.USER, 'u', 'email', ['u.firstName = $firstName'], { email, firstName: updatedFirstName })).rejects.toThrow(
			CRUDErrors.CANNOT_UPDATE_NODE
		);
	});

	it(`should get a list of created nodes`, async () => {
		const label: Label = new Label({ name: `list_${(global as any).UniqueAdjIterator.next().value}`, type: LabelType.PROFESSION });
		const label2: Label = new Label({ name: `list_${(global as any).UniqueAdjIterator.next().value}`, type: LabelType.PROFESSION });
		const label3: Label = new Label({ name: `list_${(global as any).UniqueAdjIterator.next().value}`, type: LabelType.PROFESSION });

		await createNode(NodeType.LABEL, ['name: $name', 'type: $type'], label);
		await createNode(NodeType.LABEL, ['name: $name', 'type: $type'], label2);
		await createNode(NodeType.LABEL, ['name: $name', 'type: $type'], label3);

		const labels: any[] = await getNodes('Label');

		expect(labels).toContainEqual(label);
		expect(labels).toContainEqual(label2);
		expect(labels).toContainEqual(label3);
	});

	it(`should delete a property on a created node`, async () => {
		const email: string = faker.internet.email(),
			firstName: string = faker.person.firstName();

		await createNode(NodeType.USER, ['email: $email', 'firstName: $firstName'], { email, firstName });

		const updatedNode: any | undefined = await removeProperties(NodeType.USER, 'u', 'email', ['u.firstName'], { email });

		expect(updatedNode).toEqual({ email });
		expect(updatedNode.firstName).toBeUndefined();
	});

	it(`should throw an error if there was an issue with the database in removing properties from a node`, async () => {
		const driverMock = {
			session: jest.fn().mockReturnValue({
				run: jest.fn().mockRejectedValueOnce(new Neo4jError('', '', '', '')),
				close: jest.fn(),
			} as unknown as Session),
			close: jest.fn(),
			getServerInfo: jest.fn(),
		} as unknown as Driver;

		const driverSpy = jest.spyOn(neo4j, 'driver');
		driverSpy.mockReturnValueOnce(driverMock);

		const email: string = faker.internet.email();

		await expect(removeProperties(NodeType.USER, 'u', 'email', ['u.firstName'], { email })).rejects.toThrow(CRUDErrors.CANNOT_UPDATE_NODE);
	});

	it(`should return undefined if no node exists to remove properties`, async () => {
		const email: string = faker.internet.email();

		const updatedNode: any | undefined = await removeProperties(NodeType.USER, 'u', 'email', ['u.firstName'], { email });

		expect(updatedNode).toBeUndefined();
	});
});
