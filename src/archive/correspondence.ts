export enum CorrespondenceType {
    LETTER = 'LETTER'
}

export interface ICorrespondence {
    correspondenceID: string,
    correspondenceType: CorrespondenceType,
    correspondenceDate?: string,
    correspondenceEndDate?: string
}

export interface IUpdatedCorrespondence {
    correspondenceID: string,
    updatedCorrespondenceType?: string,
    updatedCorrespondenceDate?: string | null,
    updatedCorrespondenceEndDate?: string | null
}

// Initially assumes a singly dated correspondence.
// If the correspondence lasted over a spn of time, then add a correspondenceEndDate.
// If there's an end date, the start date will be set to the correspondenceDate.
export class Correspondence implements ICorrespondence {
    public correspondenceID: string;
    public correspondenceDate?: string | undefined;
    public correspondenceEndDate?: string | undefined;
    public correspondenceType: CorrespondenceType;

    constructor(correspondence: ICorrespondence){
        this.correspondenceID = correspondence.correspondenceID;
        this.correspondenceDate = correspondence.correspondenceDate;
        this.correspondenceType = correspondence.correspondenceType;
        this.correspondenceEndDate = correspondence.correspondenceEndDate;
    }
}