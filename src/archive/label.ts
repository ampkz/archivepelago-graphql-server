import { LabelType, Label as GqlLabel } from '../generated/graphql';

// export enum LabelType {
// 	SEXUALITY = 'SEXUALITY',
// 	NATIONALITY = 'NATIONALITY',
// 	PROFESSION = 'PROFESSION',
// }

export class Label implements GqlLabel {
	public name: string;
	public type: LabelType;

	constructor(label: GqlLabel) {
		this.name = label.name;
		this.type = label.type;
	}
}

// export interface ILabel {
// 	name: string;
// 	type: LabelType;
// }

// export interface IUpdatedLabel {
// 	updatedName?: string;
// 	updatedType?: LabelType;
// }
