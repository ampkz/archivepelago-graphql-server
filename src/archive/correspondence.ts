export enum CorrespondenceType {
    LETTER = 'Letter'
}

export interface CorrespondenceI {
    correspondenceID: string,
    correspondenceType: CorrespondenceType,
    correspondenceDate?: string,
}

export interface UpdatedCorrespondenceI {
    correspondenceID: string,
    updatedCorrespondenceType?: string,
    updatedCorrespondenceDate?: string | null
}

export class Correspondence implements CorrespondenceI {
    public correspondenceID: string;
    public correspondenceDate?: string | undefined;
    public correspondenceType: CorrespondenceType;

    constructor(correspondence: CorrespondenceI){
        this.correspondenceID = correspondence.correspondenceID;
        this.correspondenceDate = correspondence.correspondenceDate;
        this.correspondenceType = correspondence.correspondenceType;
    }
}