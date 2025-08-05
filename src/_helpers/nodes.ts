export enum NodeType {
	PERSON = 'Person',
	LABEL = 'Label',
	CORRESPONDENCE = 'Correspondence',
}

export class Node {
	public idProp: string;
	public idValue: string;
	public nodeType: NodeType;
	public shouldReturnFromQuery: boolean;

	constructor(nodeType: NodeType, idProp: string, idValue: string, shouldReturnFromQuery: boolean = false) {
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
