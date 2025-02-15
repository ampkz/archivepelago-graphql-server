import { NodeType, Node } from "../../_helpers/nodes";
import { Correspondence, CorrespondenceI } from "../../archive/correspondence";
import { Relationship, RelationshipType } from "../../archive/relationship/relationship";
import { createNode, getNode } from "../utils/crud";
import { createRelationship } from "../utils/relationship/crud-relationship";

// correspondence id will be overwritten
export async function createCorrespondence(correspondence: CorrespondenceI): Promise<Correspondence | undefined>{
    const createdCorrespondence = await createNode(NodeType.CORRESPONDENCE, prepCorrespondenceProps(correspondence), correspondence);

    if(createdCorrespondence){
        if(correspondence.fromID){
            const node1: Node = new Node(NodeType.PERSON, 'id', correspondence.fromID);
            const node2: Node = new Node(NodeType.CORRESPONDENCE, 'correspondenceID', createdCorrespondence.correspondenceID);
            const relationship: Relationship = new Relationship(node1, node2, RelationshipType.SENT)
            
            await createRelationship(relationship);
        }

        if(correspondence.toID){
            const node1: Node = new Node(NodeType.CORRESPONDENCE, 'correspondenceID', createdCorrespondence.correspondenceID)
            const node2: Node = new Node(NodeType.PERSON, 'id', correspondence.toID);
            const relationship: Relationship = new Relationship(node1, node2, RelationshipType.RECEIVED);
            
            await createRelationship(relationship);
        }
    }

    return new Correspondence(createdCorrespondence as CorrespondenceI);
}

export async function getCorrespondence(correspondenceID: string): Promise<Correspondence | undefined> {
    return await getNode(NodeType.CORRESPONDENCE, 'correspondenceID: $correspondenceID', {correspondenceID});
}

function prepCorrespondenceProps(correspondence: CorrespondenceI): string[] {
    const props: string[] = [`correspondenceID:apoc.create.uuid()`];

    if(correspondence.fromID) props.push(`fromID: $fromID`);
    if(correspondence.toID) props.push(`toID: $toID`);
    if(correspondence.correspondenceDate) props.push(`correspondenceDate: $correspondenceDate`);
    if(correspondence.correspondenceType) props.push(`correspondenceType: $correspondenceType`);

    return props;
}