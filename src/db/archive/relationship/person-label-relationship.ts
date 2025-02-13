import { PersonLabel, PersonLabelRelationship } from "../../../archive/relationship/relationship";
import { createRelationship, deleteRelationship } from "../../utils/relationship/crud-relationship";

export async function setPersonIsLabel(personLabel: PersonLabel): Promise<PersonLabelRelationship | undefined>{
    const personLabelRelationship: PersonLabelRelationship = new PersonLabelRelationship(personLabel);

    await createRelationship(personLabelRelationship.getRelationship());

    return personLabelRelationship;
}

export async function unsetPersonIsLabel(personLabel: PersonLabel): Promise<PersonLabelRelationship | undefined>{
    const personLabelRelationship: PersonLabelRelationship = new PersonLabelRelationship(personLabel);

    await deleteRelationship(personLabelRelationship.getRelationship());

    return personLabelRelationship;
}