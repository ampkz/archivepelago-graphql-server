import { NodeType } from "../../_helpers/nodes";
import { Correspondence, ICorrespondence, IUpdatedCorrespondence } from "../../archive/correspondence";
import { createNode, deleteNode, getNode, getNodes, removeProperties, updateNode } from "../utils/crud";

export async function getCorrespondence(correspondenceID: string): Promise<Correspondence | undefined> {
    const matchedNode = await getNode(NodeType.CORRESPONDENCE, 'correspondenceID: $correspondenceID', { correspondenceID });
    return matchedNode;
}

export async function createCorrespondence(correspondence: ICorrespondence): Promise<Correspondence | undefined> {
    const createdCorrespondence = await createNode(NodeType.CORRESPONDENCE, prepCorrespondenceProps(correspondence), correspondence)

    return createdCorrespondence;
}

export async function deleteCorrespondence(correspondenceID: string): Promise<Correspondence | undefined> {
    const deletedCorrespondence = await deleteNode(NodeType.CORRESPONDENCE, 'correspondenceID: $correspondenceID', { correspondenceID });

    return deletedCorrespondence;
}

export async function updateCorrespondence(updatedCorrespondence: IUpdatedCorrespondence): Promise<Correspondence | undefined> {
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

export async function getCorrespondences(): Promise<Correspondence[]> {
    const correspondences: Correspondence[] = [];

    const matchedCorrespondences = await getNodes(NodeType.CORRESPONDENCE);

    matchedCorrespondences.map((rawCorrespondence: any) => {
        correspondences.push(new Correspondence(rawCorrespondence));
    })

    return correspondences;
}

function prepCorrespondenceProps(correspondence: ICorrespondence): string[]{
    const props: string[] = [`correspondenceID:apoc.create.uuid()`];

    props.push('correspondenceType: $correspondenceType');

    if(correspondence.correspondenceDate) props.push('correspondenceDate: $correspondenceDate');
    if(correspondence.correspondenceStartDate) props.push('correspondenceStartDate: $correspondenceStartDate')

    return props;
}

function updatedCorrespondenceToProps(updatedCorrespondence: IUpdatedCorrespondence): string[] {
    const props: string[] = [];

    if(updatedCorrespondence.updatedCorrespondenceDate !== undefined && updatedCorrespondence.updatedCorrespondenceDate !== null) props.push('c.correspondenceDate = $updatedCorrespondenceDate');
    if(updatedCorrespondence.updatedCorrespondenceStartDate !== undefined && updatedCorrespondence.updatedCorrespondenceStartDate !== null) props.push('c.correspondenceStartDate = $updatedCorrespondenceStartDate');
    if(updatedCorrespondence.updatedCorrespondenceType !== undefined) props.push('c.correspondenceType = $updatedCorrespondenceType');

    return props;
}

function updatedCorrespondenceRemovedProps(updatedCorrespondence: IUpdatedCorrespondence): string[] {
    const removedProps: string[] = [];

    if(updatedCorrespondence.updatedCorrespondenceDate === null) removedProps.push('c.correspondenceDate');
    if(updatedCorrespondence.updatedCorrespondenceStartDate === null) removedProps.push('c.correspondenceStartDate');

    return removedProps;
}