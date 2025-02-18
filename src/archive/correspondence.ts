export enum CorrespondenceType {
    LETTER = 'LETTER'
}

export interface ICorrespondence {
    correspondenceID: string,
    correspondenceType: CorrespondenceType,
    correspondenceDate?: string,
    correspondenceStartDate?: string
}

export interface IUpdatedCorrespondence {
    correspondenceID: string,
    updatedCorrespondenceType?: string,
    updatedCorrespondenceDate?: string | null,
    updatedCorrespondenceStartDate?: string | null
}

// Initially assumes a singly dated correspondence.
// If the correspondence lasted over a spn of time, then add a correspondenceStartDate.
// If there's a start date, the end date will be set to the correspondenceDate.
export class Correspondence implements ICorrespondence {
    public correspondenceID: string;
    public correspondenceDate?: string | undefined;
    public correspondenceStartDate?: string | undefined;
    public correspondenceType: CorrespondenceType;

    constructor(correspondence: ICorrespondence){
        this.correspondenceID = correspondence.correspondenceID;
        this.correspondenceDate = correspondence.correspondenceDate;
        this.correspondenceType = correspondence.correspondenceType;
        this.correspondenceStartDate = correspondence.correspondenceStartDate;
    }
}