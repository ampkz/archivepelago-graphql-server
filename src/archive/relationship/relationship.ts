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

    constructor(nodeType: NodeType, idProp: string, idValue: string){
        this.idProp = idProp;
        this.idValue = idValue;
        this.nodeType = nodeType;
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
    public person: Person;
    public label: Label;

    constructor(person: Person, label: Label){
        this.person = person;
        this.label = label;
    }
}

export class PersonLabelRelationship extends PersonLabel {
    private _relationship: Relationship;

    constructor(personLabel: PersonLabel){
        super(personLabel.person, personLabel.label);
        this._relationship = new Relationship(new Node(NodeType.PERSON, "id", personLabel.person.id), new Node(NodeType.LABEL, "name", personLabel.label.name), RelationshipType.IS)
    }

    getRelationship(): Relationship{
        return this._relationship;
    }
}