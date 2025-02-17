import { Node, NodeType } from "../../_helpers/nodes";
import { Correspondence, CorrespondenceI, UpdatedCorrespondenceI } from "../../archive/correspondence";
import { Person } from "../../archive/person";
import { Relationship, RelationshipType } from "../../archive/relationship/relationship";
import { createNode, deleteNode, getNode, getNodes, removeProperties, updateNode } from "../utils/crud";
import { createRelationship, deleteRelationship, getRelationshipsToNode } from "../utils/relationship/crud-relationship";

export async function getCorrespondence(correspondenceID: string): Promise<Correspondence | undefined> {
    const matchedNode = await getNode(NodeType.CORRESPONDENCE, 'correspondenceID: $correspondenceID', { correspondenceID });
    return matchedNode;
}

export async function createCorrespondence(correspondence: CorrespondenceI): Promise<Correspondence | undefined> {
    const createdCorrespondence = await createNode(NodeType.CORRESPONDENCE, prepCorrespondenceProps(correspondence), correspondence)

    return createdCorrespondence;
}

export async function deleteCorrespondence(correspondenceID: string): Promise<Correspondence | undefined> {
    const deletedCorrespondence = await deleteNode(NodeType.CORRESPONDENCE, 'correspondenceID: $correspondenceID', { correspondenceID });

    return deletedCorrespondence;
}

export async function updateCorrespondence(updatedCorrespondence: UpdatedCorrespondenceI): Promise<Correspondence | undefined> {
    const anythingToUpdate = updatedCorrespondenceToProps(updatedCorrespondence);
    let matchedCorrespondence;

    if(anythingToUpdate.length > 0){
        matchedCorrespondence = await updateNode(NodeType.CORRESPONDENCE, 'c', 'correspondenceID', anythingToUpdate, updatedCorrespondence);
    }

    const removedProps = updatedCorrespondenceRemovedProps(updatedCorrespondence);
    if(removedProps.length > 0){
        matchedCorrespondence = await removeProperties(NodeType.CORRESPONDENCE, 'c', 'correspondenceID', removedProps, { correspondenceID: updatedCorrespondence.correspondenceID });
    }

    return matchedCorrespondence;
}

function prepCorrespondenceProps(correspondence: CorrespondenceI): string[]{
    const props: string[] = [`correspondenceID:apoc.create.uuid()`];

    props.push('correspondenceType: $correspondenceType');

    if(correspondence.correspondenceDate) props.push('correspondenceDate: $correspondenceDate');

    return props;
}

function updatedCorrespondenceToProps(updatedCorrespondence: UpdatedCorrespondenceI): string[] {
    const props: string[] = [];

    if(updatedCorrespondence.updatedCorrespondenceDate !== undefined && updatedCorrespondence.updatedCorrespondenceDate !== null) props.push('c.correspondenceDate = $updatedCorrespondenceDate');
    if(updatedCorrespondence.updatedCorrespondenceType !== undefined) props.push('c.correspondenceType = $updatedCorrespondenceType');

    return props;
}

function updatedCorrespondenceRemovedProps(updatedCorrespondence: UpdatedCorrespondenceI): string[] {
    const removedProps: string[] = [];

    if(updatedCorrespondence.updatedCorrespondenceDate === null) removedProps.push('c.correspondenceDate');

    return removedProps;
}