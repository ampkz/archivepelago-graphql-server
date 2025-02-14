import { Label } from "../../../archive/label";
import { Person } from "../../../archive/person";
import { Node, NodeType, PersonLabel, PersonLabelRelationship, RelationshipType } from "../../../archive/relationship/relationship";
import { createRelationship, deleteRelationship, getRelationships } from "../../utils/relationship/crud-relationship";

export async function createPersonLabel(personLabel: PersonLabel): Promise<PersonLabelRelationship | undefined>{
    const personLabelRelationship: PersonLabelRelationship = new PersonLabelRelationship(personLabel);

    await createRelationship(personLabelRelationship.getRelationship());

    return personLabelRelationship;
}

export async function deletePersonLabel(personLabel: PersonLabel): Promise<PersonLabelRelationship | undefined>{
    const personLabelRelationship: PersonLabelRelationship = new PersonLabelRelationship(personLabel);

    await deleteRelationship(personLabelRelationship.getRelationship());

    return personLabelRelationship;
}

export async function getPersonLabels(person: Person): Promise<Label[]> {
    const labels: Label[] = [];
    
    const match = await getRelationships(new Node(NodeType.PERSON, 'id', person.id), RelationshipType.IS);

    match.map((rawLabel: any) => {
        labels.push(new Label(rawLabel.name));
    })

    return labels;
}