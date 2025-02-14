import { Label } from "../label";
import { Person } from "../person";

export enum NodeType {
    PERSON = "Person",
    LABEL = "Label"
}

export enum RelationshipType {
    IS = "IS"
}

export class Relationship {
    public node1: Node;
    public node2: Node;
    public name: RelationshipType;

    constructor(node1: Node, node2: Node, name: RelationshipType){
        this.node1 = node1;
        this.node2 = node2;
        this.name = name;
    }

    getRelationshipParams() {
        return {... this.node1.getIdParams(), ... this.node2.getIdParams() }
    }
}

export class Node {
    public idProp: string;
    public idValue: string;
    public nodeType: NodeType;
    public shouldReturnFromQuery: boolean;

    constructor(nodeType: NodeType, idProp: string, idValue: string, shouldReturnFromQuery: boolean = false){
        this.idProp = idProp;
        this.idValue = idValue;
        this.nodeType = nodeType;
        this.shouldReturnFromQuery = shouldReturnFromQuery;
    }

    getIdString(): string {
        return `${this.idProp}:$${this.idProp}`;
    }

    getIdParams() {
        const params: any = {};
        
        params[this.idProp] = this.idValue;
        
        return params;
    }
}

export class PersonLabel {
    public personID: string;
    public labelName: string;

    constructor(personID: string, labelName: string){
        this.personID = personID;
        this.labelName = labelName;
    }

    getRelationship(): Relationship {
        return new Relationship(new Node(NodeType.PERSON, "id", this.personID, true), new Node(NodeType.LABEL, "name", this.labelName), RelationshipType.IS)
    }
}