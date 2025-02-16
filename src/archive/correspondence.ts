import { Person } from "./person";

export enum CorrespondenceType { 
    LETTER = 'Letter'
}

export class Correspondence implements CorrespondenceI{
    public correspondenceID: string;
    public fromID: string[] | undefined;
    public toID: string[] | undefined;
    public correspondenceDate: string | undefined;
    public correspondenceType: CorrespondenceType | undefined;

    constructor(correspondence: CorrespondenceI) {
        this.correspondenceID = correspondence.correspondenceID;
        this.fromID = correspondence.fromID;
        this.toID = correspondence.toID;
        this.correspondenceDate = correspondence.correspondenceDate;
        this.correspondenceType = correspondence.correspondenceType;
    }
}

export interface CorrespondenceI {
    correspondenceID: string,
    fromID?: string[],
    toID?: string[],
    correspondenceDate?: string,
    correspondenceType?: CorrespondenceType
}

export interface UpdatedCorrespondenceI {
    correspondenceID: string,
    updatedFromID?: string[],
    updatedToID?: string[],
    updatedCorrespondenceDate?: string,
    updatedCorrespondenceType?: CorrespondenceType
}