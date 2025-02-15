import { Person } from "./person";

export enum CorrespondenceType { 
    LETTER = 'Letter'
}

export class Correspondence implements CorrespondenceI{
    public correspondenceID: string;
    public fromPerson: string | undefined;
    public toPerson: string | undefined;
    public correspondenceDate: string | undefined;
    public correspondenceType: CorrespondenceType | undefined;

    constructor(correspondence: CorrespondenceI) {
        this.correspondenceID = correspondence.correspondenceID;
        this.fromPerson = correspondence.fromPerson;
        this.toPerson = correspondence.toPerson;
        this.correspondenceDate = correspondence.correspondenceDate;
        this.correspondenceType = correspondence.correspondenceType;
    }
}

export interface CorrespondenceI {
    correspondenceID: string,
    fromPerson?: string,
    toPerson?: string,
    correspondenceDate?: string,
    correspondenceType?: CorrespondenceType
}