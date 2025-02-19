import { Label } from '../../../archive/label';
import { Person } from '../../../archive/person';
import { PersonLabel, RelationshipDirection, RelationshipType } from '../../../archive/relationship/relationship';
import { Node, NodeType } from '../../../_helpers/nodes';
import { createRelationship, deleteRelationship, getRelationshipsToNode } from '../../utils/relationship/crud-relationship';

export async function createPersonLabel(personLabel: PersonLabel): Promise<Person | undefined> {
	const [f] = await createRelationship(personLabel.getRelationship());

	return f as Person;
}

export async function deletePersonLabel(personLabel: PersonLabel): Promise<Person | undefined> {
	const [f] = await deleteRelationship(personLabel.getRelationship());

	return f as Person;
}

export async function getLabelsByPerson(person: Person): Promise<Label[]> {
	const labels: Label[] = [];

	const match = await getRelationshipsToNode(new Node(NodeType.PERSON, 'id', person.id), NodeType.LABEL, RelationshipType.IS);

	match.map((rawLabel: any) => {
		labels.push(new Label(rawLabel));
	});

	return labels;
}

export async function getPersonsByLabel(label: Label): Promise<Person[]> {
	const persons: Person[] = [];

	const match = await getRelationshipsToNode(
		new Node(NodeType.LABEL, 'name', label.name),
		NodeType.PERSON,
		RelationshipType.IS,
		RelationshipDirection.COMING
	);

	match.map((rawPerson: any) => {
		persons.push(new Person(rawPerson));
	});

	return persons;
}
