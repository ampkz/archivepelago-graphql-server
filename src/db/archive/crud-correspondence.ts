import { NodeType, Node } from "../../_helpers/nodes";
import { Correspondence, CorrespondenceI } from "../../archive/correspondence";
import { Relationship, RelationshipType } from "../../archive/relationship/relationship";
import { createNode } from "../utils/crud";
import { createRelationship } from "../utils/relationship/crud-relationship";

// correspondence id will be overwritten
export async function createCorrespondence(correspondence: CorrespondenceI): Promise<Correspondence | undefined>{
    const createdCorrespondence = await createNode(NodeType.CORRESPONDENCE, prepCorrespondenceProps(correspondence), correspondence);

    if(createdCorrespondence){
        if(correspondence.fromPerson){
            const node1: Node = new Node(NodeType.PERSON, 'id', correspondence.fromPerson);
            const node2: Node = new Node(NodeType.CORRESPONDENCE, 'correspondenceID', createdCorrespondence.correspondenceID);
            const relationship: Relationship = new Relationship(node1, node2, RelationshipType.SENT)
            
            await createRelationship(relationship);
        }

        if(correspondence.toPerson){
            const node1: Node = new Node(NodeType.CORRESPONDENCE, 'correspondenceID', createdCorrespondence.correspondenceID)
            const node2: Node = new Node(NodeType.PERSON, 'id', correspondence.toPerson);
            const relationship: Relationship = new Relationship(node1, node2, RelationshipType.RECEIVED);
            
            await createRelationship(relationship);
        }
    }

    return new Correspondence(createdCorrespondence as CorrespondenceI);
}

function prepCorrespondenceProps(correspondence: CorrespondenceI): string[] {
    const props: string[] = [`correspondenceID:apoc.create.uuid()`];

    if(correspondence.fromPerson) props.push(`fromPerson: $fromPerson`);
    if(correspondence.toPerson) props.push(`toPerson: $toPerson`);
    if(correspondence.correspondenceDate) props.push(`correspondenceDate: $correspondenceDate`);
    if(correspondence.correspondenceType) props.push(`correspondenceType: $correspondenceType`);

    return props;
}