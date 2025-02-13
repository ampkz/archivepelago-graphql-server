import { Label } from "../../../archive/label";
import { Person } from "../../../archive/person";
import { Node, NodeType, Relationship, RelationshipType } from "../../../archive/relationship/relationship";
import { createRelationship, deleteRelationship } from "../../utils/relationship/crud-relationship";

export async function setPersonIsLabel(person: Person, label: Label): Promise<Relationship | undefined>{
    const personNode: Node = new Node(NodeType.PERSON, 'id', person.id);
    const labelNode: Node = new Node(NodeType.LABEL, 'name', label.name);

    const relationship: Relationship = new Relationship(personNode, labelNode, RelationshipType.IS);

    const createdRelationship: Relationship | undefined = await createRelationship(relationship);

    return createdRelationship;
}

export async function unsetPersonIsLabel(person: Person, label: Label): Promise<Relationship | undefined>{
    const personNode: Node = new Node(NodeType.PERSON, 'id', person.id);
    const labelNode: Node = new Node(NodeType.LABEL, 'name', label.name);

    const relationship: Relationship = new Relationship(personNode, labelNode, RelationshipType.IS);

    const deletedRelationship: Relationship | undefined = await deleteRelationship(relationship);

    return deletedRelationship;
}