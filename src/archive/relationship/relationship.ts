import { Node, NodeType } from '../../_helpers/nodes';

export enum RelationshipType {
	IS = 'IS',
	SENT = 'SENT',
	RECEIVED = 'RECEIVED',
}

export enum RelationshipDirection {
	COMING,
	GOING,
}

export class Relationship {
	public node1: Node;
	public node2: Node;
	public name: RelationshipType;
	public direction: RelationshipDirection;

	constructor(node1: Node, node2: Node, name: RelationshipType, direction: RelationshipDirection = RelationshipDirection.GOING) {
		this.node1 = node1;
		this.node2 = node2;
		this.name = name;
		this.direction = direction;
	}

	getRelationshipParams() {
		return {
			...this.node1.getIdParams(),
			...this.node2.getIdParams(),
		};
	}
}

export class PersonLabel {
	public personID: string;
	public labelName: string;

	constructor(personID: string, labelName: string) {
		this.personID = personID;
		this.labelName = labelName;
	}

	getRelationship(): Relationship {
		return new Relationship(
			new Node(NodeType.PERSON, 'id', this.personID, true),
			new Node(NodeType.LABEL, 'name', this.labelName),
			RelationshipType.IS
		);
	}
}
