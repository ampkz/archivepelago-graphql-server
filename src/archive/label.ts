export enum LabelType {
    SEXUALITY = 'Sexuality',
    NATIONALITY = 'Nationality',
    CAREER = 'Career'
}

export class Label implements LabelI {
    public name: string;
    public type: LabelType;

    constructor(label: LabelI){
        this.name = label.name;
        this.type = label.type;
    }
}

export interface LabelI {
    name: string
    type: LabelType
}

export interface UpdatedLabelI {
    updatedName: string,
    updatedType?: LabelType
}