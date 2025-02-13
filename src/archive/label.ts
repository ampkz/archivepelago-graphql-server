export class Label {
    public name: string;

    constructor(name: string){
        this.name = name;
    }
}

export interface UpdatedLabelI {
    updatedName: string,
}