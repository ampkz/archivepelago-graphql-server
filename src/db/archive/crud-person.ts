import { NodeType } from '../../_helpers/nodes';
import { convertArchiveDateToDateString, convertDateStringToArchiveDate } from '../../archive/date';
import { matchedNodeToPerson, Person } from '../../archive/person';
import { CreatePersonInput, UpdatePersonInput } from '../../generated/graphql';
import { createNode, deleteNode, getNode, getNodes, removeProperties, updateNode } from '../utils/crud';

export async function getPerson(id: string): Promise<Person | null> {
	const matchedNode = await getNode(NodeType.PERSON, ['id: $id'], { id });

	return matchedNodeToPerson(matchedNode);
}

export async function createPerson(person: CreatePersonInput): Promise<Person | null> {
	const createdPerson = await createNode(NodeType.PERSON, prepPersonProps(person), {
		...person,
		birthDate: convertArchiveDateToDateString(person.birthDate),
		deathDate: convertArchiveDateToDateString(person.deathDate),
	});

	return matchedNodeToPerson(createdPerson);
}

export async function deletePerson(id: string): Promise<Person | null> {
	const deletedPerson = await deleteNode(NodeType.PERSON, ['id: $id'], { id });

	return matchedNodeToPerson(deletedPerson);
}

export async function updatePerson(updatedPerson: UpdatePersonInput): Promise<Person | null> {
	const anythingToUpdate: string[] = updatedPersonToProps(updatedPerson);
	let matchedPerson;

	if (anythingToUpdate.length > 0) {
		matchedPerson = await updateNode(NodeType.PERSON, 'p', ['id: $id'], anythingToUpdate, {
			...updatedPerson,
			updatedBirthDate: convertArchiveDateToDateString(updatedPerson.updatedBirthDate),
			updatedDeathDate: convertArchiveDateToDateString(updatedPerson.updatedDeathDate),
		});
	}

	const removedProps = updatedPersonRemovedProps(updatedPerson);

	if (removedProps.length > 0) {
		matchedPerson = await removeProperties(NodeType.PERSON, 'p', ['id: $id'], removedProps, { id: updatedPerson.id });
	}

	return matchedNodeToPerson(matchedPerson);
}

export async function getPersons(): Promise<Person[]> {
	const persons: Person[] = [];

	const matchedPersons = await getNodes(NodeType.PERSON);

	matchedPersons.map(person => {
		persons.push(matchedNodeToPerson(person)!);
	});

	return persons;
}

function prepPersonProps(person: CreatePersonInput): string[] {
	const props: string[] = [`id:apoc.create.uuid()`];

	if (person.firstName) props.push('firstName: $firstName');
	if (person.secondName) props.push('secondName: $secondName');
	if (person.lastName) props.push('lastName: $lastName');
	if (person.birthDate) props.push('birthDate: $birthDate');
	if (person.deathDate) props.push('deathDate: $deathDate');

	return props;
}

function updatedPersonRemovedProps(updatedPerson: UpdatePersonInput): string[] {
	const removedProps: string[] = [];

	if (!updatedPerson.updatedFirstName) removedProps.push(`p.firstName`);
	if (!updatedPerson.updatedSecondName) removedProps.push(`p.secondName`);
	if (!updatedPerson.updatedLastName) removedProps.push(`p.lastName`);
	if (!updatedPerson.updatedBirthDate) removedProps.push(`p.birthDate`);
	if (!updatedPerson.updatedDeathDate) removedProps.push(`p.deathDate`);

	return removedProps;
}

function updatedPersonToProps(updatedPerson: UpdatePersonInput): string[] {
	const props: string[] = [];

	if (!!updatedPerson.updatedFirstName) props.push(`p.firstName = $updatedFirstName`);
	if (!!updatedPerson.updatedSecondName) props.push(`p.secondName = $updatedSecondName`);
	if (!!updatedPerson.updatedLastName) props.push(`p.lastName = $updatedLastName`);
	if (!!updatedPerson.updatedBirthDate) props.push(`p.birthDate = $updatedBirthDate`);
	if (!!updatedPerson.updatedDeathDate) props.push(`p.deathDate = $updatedDeathDate`);

	return props;
}
