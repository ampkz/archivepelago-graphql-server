import { Label } from "../../../archive/label";
import { Person } from "../../../archive/person";
import { Node, NodeType, PersonLabel, Relationship, RelationshipType } from "../../../archive/relationship/relationship";
import { createRelationship, deleteRelationship, getRelationshipsToNode } from "../../utils/relationship/crud-relationship";

export async function createPersonLabel(personLabel: PersonLabel): Promise<Person | undefined>{
    const [f] = await createRelationship(personLabel.getRelationship());

    return f as Person;
}

export async function deletePersonLabel(personLabel: PersonLabel): Promise<Person | undefined>{
    const [f] = await deleteRelationship(personLabel.getRelationship());

    return f as Person;
}

export async function getLabelsByPerson(person: Person): Promise<Label[]> {
    const labels: Label[] = [];
    
    const match = await getRelationshipsToNode(new Node(NodeType.PERSON, 'id', person.id), RelationshipType.IS);

    match.map((rawLabel: any) => {
        labels.push(new Label(rawLabel.name));
    })

    return labels;
}