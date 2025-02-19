import { Node, NodeType } from '../../../_helpers/nodes';
import { createRelationship, deleteRelationship, getRelationshipsToNode } from '../../utils/relationship/crud-relationship';
import { Relationship, RelationshipDirection, RelationshipType } from '../../../archive/relationship/relationship';
import { Correspondence } from '../../../archive/correspondence';
import { Person } from '../../../archive/person';

export async function createPersonRelationship(
	correspondenceID: string,
	personID: string,
	relationshipType: RelationshipType
): Promise<Correspondence | undefined> {
	const correspondence = await createRelationship(prepRelationship(correspondenceID, personID, relationshipType));

	return correspondence[1];
}

export async function deletePersonRelationship(
	correspondenceID: string,
	personID: string,
	relationshipType: RelationshipType
): Promise<Correspondence | undefined> {
	const correspondence = await deleteRelationship(prepRelationship(correspondenceID, personID, relationshipType));

	return correspondence[1];
}

export async function getPersonsByCorrespondence(correspondenceID: string, relationshipType: RelationshipType): Promise<Person[]> {
	const persons: Person[] = [];

	const match = await getRelationshipsToNode(
		new Node(NodeType.CORRESPONDENCE, 'correspondenceID', correspondenceID),
		NodeType.PERSON,
		relationshipType,
		RelationshipDirection.COMING
	);

	match.map((rawPerson: any) => {
		persons.push(new Person(rawPerson));
	});

	return persons;
}

export async function getCorrespondencesByPerson(personID: string, relationshipType: RelationshipType): Promise<Correspondence[]> {
	const correspondences: Correspondence[] = [];

	const match = await getRelationshipsToNode(new Node(NodeType.PERSON, 'id', personID), NodeType.CORRESPONDENCE, relationshipType);

	match.map((rawCorrespondence: any) => {
		correspondences.push(new Correspondence(rawCorrespondence));
	});

	return correspondences;
}

function prepRelationship(correspondenceID: string, personID: string, relationshipType: RelationshipType): Relationship {
	const correspondenceNode: Node = new Node(NodeType.CORRESPONDENCE, 'correspondenceID', correspondenceID, true);
	const personNode: Node = new Node(NodeType.PERSON, 'id', personID);
	const relationship: Relationship = new Relationship(personNode, correspondenceNode, relationshipType);

	return relationship;
}
