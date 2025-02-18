export enum LabelType {
    SEXUALITY = 'SEXUALITY',
    NATIONALITY = 'NATIONALITY',
    PROFESSION = 'PROFESSION'
}

export class Label implements ILabel {
    public name: string;
    public type: LabelType;

    constructor(label: ILabel){
        this.name = label.name;
        this.type = label.type;
    }
}

export interface ILabel {
    name: string
    type: LabelType
}

export interface IUpdatedLabel {
    updatedName?: string,
    updatedType?: LabelType
}