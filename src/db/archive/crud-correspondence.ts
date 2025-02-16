import { InternalError } from "../../_helpers/errors-helper";
import { NodeType, Node } from "../../_helpers/nodes";
import { addedValues, removedValues } from "../../_helpers/utils";
import { Correspondence, CorrespondenceI, UpdatedCorrespondenceI } from "../../archive/correspondence";
import { Relationship, RelationshipDirection, RelationshipType } from "../../archive/relationship/relationship";
import { createNode, deleteNode, getNode, removeProperties, updateNode } from "../utils/crud";
import { createRelationship, Errors as CRUDRelationshipErrors, deleteRelationship } from "../utils/relationship/crud-relationship";

// correspondence id will be overwritten
export async function createCorrespondence(correspondence: CorrespondenceI): Promise<Correspondence | undefined>{
    const createdCorrespondence = await createNode(NodeType.CORRESPONDENCE, prepCorrespondenceProps(correspondence), correspondence);

    if(createdCorrespondence){
        const createdToFromTuple = await createToFromRelationships(correspondence, createdCorrespondence.correspondenceID);
        createdCorrespondence.fromID = createdToFromTuple[0];
        createdCorrespondence.toID = createdToFromTuple[1];
    }
 
    return new Correspondence(createdCorrespondence as CorrespondenceI);
}

export async function getCorrespondence(correspondenceID: string): Promise<Correspondence | undefined> {
    return await getNode(NodeType.CORRESPONDENCE, 'correspondenceID: $correspondenceID', {correspondenceID});
}

export async function deleteCorrespondence(correspondenceID: string): Promise<Correspondence | undefined> {
    return await deleteNode(NodeType.CORRESPONDENCE, 'correspondenceID: $correspondenceID', { correspondenceID });
}

export async function updateCorrespondence(updatedCorrespondence: UpdatedCorrespondenceI): Promise<Correspondence | undefined>{
    const preCorrespondence = await getCorrespondence(updatedCorrespondence.correspondenceID);
    const correspondence = await updateNode(NodeType.CORRESPONDENCE, 'c', 'correspondenceID', updatedCorrespondenceToProps(updatedCorrespondence), updatedCorrespondence);
    
    if(correspondence && preCorrespondence){
        let removeProps: string[] = [],
            propRemoved: string | undefined;
        propRemoved = await updateCorrespondenceRelationships(correspondence.correspondenceID, updatedCorrespondence.updatedFromID, preCorrespondence.fromID, 'c.fromID', RelationshipType.SENT);
        if(propRemoved) removeProps.push(propRemoved);
        
        propRemoved = await updateCorrespondenceRelationships(correspondence.correspondenceID, updatedCorrespondence.updatedToID, preCorrespondence.toID, 'c.toID', RelationshipType.RECEIVED);
        if(propRemoved) removeProps.push(propRemoved);

        if(removeProps.length > 0){
            return await removeProperties(NodeType.CORRESPONDENCE, 'c', 'correspondenceID', removeProps, { correspondenceID: correspondence.correspondenceID });
        }
    }
    
    return correspondence;
}

async function updateCorrespondenceRelationships(correspondenceID: string, updatedIDs: string[] | undefined, preUpdateIDs: string[] | undefined, propToRemove: string, relationshipType: RelationshipType): Promise<string | undefined>{
    let removedIDs: string[] = [],
        removeCorrespondenceRelationship: string | undefined;
    
    if(updatedIDs && preUpdateIDs){
        removedIDs = removedValues(preUpdateIDs, updatedIDs);
    }else if(!updatedIDs && preUpdateIDs){
        removedIDs = preUpdateIDs;
        removeCorrespondenceRelationship = propToRemove;
    }

    await Promise.all(removedIDs.map(async (id) => {
        await deleteToFromRelationship(correspondenceID, id, relationshipType);
    }));

    let addedIDs: string[] = [];

    if(updatedIDs && preUpdateIDs){
        addedIDs = addedValues(preUpdateIDs, updatedIDs);
    }else if(updatedIDs && !preUpdateIDs){
        addedIDs = updatedIDs;
    }

    await Promise.all(addedIDs.map(async (id) => {
        await createToFromRelationship(correspondenceID, id, relationshipType);
    }));

    return removeCorrespondenceRelationship;
}

async function createToFromRelationships(correspondence: CorrespondenceI, createdCorrespondenceID: string): Promise<[string[] | undefined, string[] | undefined]> {
    const createdFromRelationships: string[] = [];
    const createdToRelationships: string[] = [];
    let flagChange: boolean = false;

    if(correspondence.fromID){
        await Promise.all(correspondence.fromID.map(async (fromID) => {
            const id: string | undefined = await createToFromRelationship(createdCorrespondenceID, fromID, RelationshipType.SENT);
            
            if(id !== undefined){
                createdFromRelationships.push(id);
            }else{
                flagChange = true;
            }
        }));
    }

    if(correspondence.toID){
        await Promise.all(correspondence.toID.map(async (toID) => {
            const id: string | undefined = await createToFromRelationship(createdCorrespondenceID, toID, RelationshipType.RECEIVED);
            if(id !== undefined){
                createdToRelationships.push(id);
            }else{
                flagChange = true;
            }
        }));
    }

    if(flagChange) {
        await updateNode(NodeType.CORRESPONDENCE, 'c', 'correspondenceID', ['c.toID = $toID', 'c.fromID = $fromID'], { correspondenceID: createdCorrespondenceID, toID: createdToRelationships, fromID: createdFromRelationships });
        return [createdFromRelationships, createdToRelationships];
    }

    /* istanbul ignore next line */
    return [((correspondence.fromID && correspondence.fromID.length !== createdFromRelationships.length) ? createdFromRelationships : correspondence.fromID), ((correspondence.toID && correspondence.toID.length !== createdToRelationships.length) ? createdToRelationships : correspondence.toID)];
}

async function createToFromRelationship(correspondenceID: string, id: string, relationshipType: RelationshipType): Promise<string | undefined>{
    const node1: Node = new Node(NodeType.PERSON, 'id', id);
    const node2: Node = new Node(NodeType.CORRESPONDENCE, 'correspondenceID', correspondenceID);
    const relationship: Relationship = new Relationship(node1, node2, relationshipType);
    
    try{
        await createRelationship(relationship);
    }catch( error: any ){
        if(error.message === CRUDRelationshipErrors.COULD_NOT_CREATE_RELATIONSHIP){
            return undefined;
        }else{
            throw error;
        }
    }
    
    return id;
}

async function deleteToFromRelationship(correspondenceID: string, id: string, relationshipType: RelationshipType): Promise<string | undefined> {
    const node1: Node = new Node(NodeType.PERSON, 'id', id);
    const node2: Node = new Node(NodeType.CORRESPONDENCE, 'correspondenceID', correspondenceID);
    const relationship: Relationship = new Relationship(node1, node2, relationshipType);
    
    try{
        await deleteRelationship(relationship);
    }catch( error: any ){
        if(error.message === CRUDRelationshipErrors.COULD_NOT_DELETE_RELATIONSHIP){
            return undefined;
        }else{
            throw error;
        }
    }
    
    return id;
}

function updatedCorrespondenceToProps(updatedCorrespondence: UpdatedCorrespondenceI): string[] {
    const props: string[] = [];

    if(updatedCorrespondence.updatedCorrespondenceDate) props.push(`c.correspondenceDate = $updatedCorrespondenceDate`);
    if(updatedCorrespondence.updatedCorrespondenceType) props.push(`c.correspondenceType = $updatedCorrespondenceType`);
    if(updatedCorrespondence.updatedToID) props.push(`c.toID = $updatedToID`);
    if(updatedCorrespondence.updatedFromID) props.push(`c.fromID = $updatedFromID`);

    return props;
}

function prepCorrespondenceProps(correspondence: CorrespondenceI): string[] {
    const props: string[] = [`correspondenceID:apoc.create.uuid()`];

    if(correspondence.fromID) props.push(`fromID: $fromID`);
    if(correspondence.toID) props.push(`toID: $toID`);
    if(correspondence.correspondenceDate) props.push(`correspondenceDate: $correspondenceDate`);
    if(correspondence.correspondenceType) props.push(`correspondenceType: $correspondenceType`);

    return props;
}