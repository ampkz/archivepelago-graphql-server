import { Label } from '../../../archive/label';
import { matchedNodeToPerson, Person } from '../../../archive/person';
import { PersonLabel, RelationshipType } from '../../../archive/relationship/relationship';
import { Node, NodeType } from '../../../_helpers/nodes';
import { createRelationship, deleteRelationship, getRelationshipsToNode } from '../../utils/relationship/crud-relationship';

export async function createPersonLabel(personLabel: PersonLabel): Promise<Person | null> {
	const [f] = await createRelationship(personLabel.getRelationship());

	return matchedNodeToPerson(f);
}

export async function deletePersonLabel(personLabel: PersonLabel): Promise<Person | null> {
	const [f] = await deleteRelationship(personLabel.getRelationship());

	return matchedNodeToPerson(f);
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

	const match = await getRelationshipsToNode(new Node(NodeType.LABEL, 'name', label.name), NodeType.PERSON, RelationshipType.IS, true);

	match.map((rawPerson: any) => {
		persons.push(matchedNodeToPerson(rawPerson)!);
	});

	return persons;
}
