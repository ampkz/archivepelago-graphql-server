import { InternalError } from "../../_helpers/errors-helper";
import { NodeType, Node } from "../../_helpers/nodes";
import { Correspondence, CorrespondenceI, updatedCorrespondenceI } from "../../archive/correspondence";
import { Relationship, RelationshipDirection, RelationshipType } from "../../archive/relationship/relationship";
import { createNode, deleteNode, getNode, updateNode } from "../utils/crud";
import { createRelationship, Errors as CRUDRelationshipErrors } from "../utils/relationship/crud-relationship";

// correspondence id will be overwritten
export async function createCorrespondence(correspondence: CorrespondenceI): Promise<Correspondence | undefined>{
    const createdCorrespondence = await createNode(NodeType.CORRESPONDENCE, prepCorrespondenceProps(correspondence), correspondence);

    if(createdCorrespondence){
        const createdFromRelationships: string[] = [];
        const createdToRelationships: string[] = [];
        let flagChange: boolean = false;

        if(correspondence.fromID){
            await Promise.all(correspondence.fromID.map(async (fromID) => {
                const id: string | undefined = await createToFromRelationship(createdCorrespondence.correspondenceID, fromID, RelationshipType.SENT);
                
                if(id !== undefined){
                    createdFromRelationships.push(id);
                }else{
                    flagChange = true;
                }
            }));
            
            createdCorrespondence.fromID = createdFromRelationships;
        }

        if(correspondence.toID){
            await Promise.all(correspondence.toID.map(async (toID) => {
                const id: string | undefined = await createToFromRelationship(createdCorrespondence.correspondenceID, toID, RelationshipType.RECEIVED);
                if(id !== undefined){
                    createdToRelationships.push(id);
                }else{
                    flagChange = true;
                }
            }));

            createdCorrespondence.toID = createdToRelationships;
        }

        if(flagChange) {
            await updateToFromRelationships(createdCorrespondence.correspondenceID, createdToRelationships, createdFromRelationships);
        }
    }
 
    return new Correspondence(createdCorrespondence as CorrespondenceI);
}

export async function getCorrespondence(correspondenceID: string): Promise<Correspondence | undefined> {
    return await getNode(NodeType.CORRESPONDENCE, 'correspondenceID: $correspondenceID', {correspondenceID});
}

export async function deleteCorrespondence(correspondenceID: string): Promise<Correspondence | undefined> {
    return await deleteNode(NodeType.CORRESPONDENCE, 'correspondenceID: $correspondenceID', { correspondenceID });
}

export async function updateCorrespondence(updatedCorrespondence: updatedCorrespondenceI): Promise<Correspondence | undefined>{


    return undefined;
}

async function updateToFromRelationships(correspondenceID: string, toID: string[], fromID: string[]) {
    await updateNode(NodeType.CORRESPONDENCE, 'c', 'correspondenceID', ['c.toID = $toID', 'c.fromID = $fromID'], { correspondenceID, toID, fromID });
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

function prepCorrespondenceProps(correspondence: CorrespondenceI): string[] {
    const props: string[] = [`correspondenceID:apoc.create.uuid()`];

    if(correspondence.fromID) props.push(`fromID: $fromID`);
    if(correspondence.toID) props.push(`toID: $toID`);
    if(correspondence.correspondenceDate) props.push(`correspondenceDate: $correspondenceDate`);
    if(correspondence.correspondenceType) props.push(`correspondenceType: $correspondenceType`);

    return props;
}