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

	getIdString(prefix: string = ''): string {
		return `${this.idProp}:$${prefix}${this.idProp}`;
	}

	getIdParams(prefix: string = '') {
		const params: any = {};

		params[`${prefix}${this.idProp}`] = this.idValue;

		return params;
	}
}
