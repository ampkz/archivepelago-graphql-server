import { Correspondence as GqlCorrespondence, ArchiveDate, CorrespondenceType } from '../generated/graphql';

// export enum CorrespondenceType {
// 	LETTER = 'LETTER',
// }

// export interface ICorrespondence {
// 	correspondenceID: string;
// 	correspondenceType: CorrespondenceType;
// 	correspondenceDate?: string;
// 	correspondenceEndDate?: string;
// }

// export interface IUpdatedCorrespondence {
// 	correspondenceID: string;
// 	updatedCorrespondenceType?: string;
// 	updatedCorrespondenceDate?: string | null;
// 	updatedCorrespondenceEndDate?: string | null;
// }

// Initially assumes a singly dated correspondence.
// If the correspondence lasted over a spn of time, then add a correspondenceEndDate.
// If there's an end date, the start date will be set to the correspondenceDate.
export class Correspondence implements GqlCorrespondence {
	public correspondenceID: string;
	public correspondenceDate?: ArchiveDate | null;
	public correspondenceEndDate?: ArchiveDate | null;
	public correspondenceType?: CorrespondenceType | null;

	constructor(correspondence: GqlCorrespondence) {
		this.correspondenceID = correspondence.correspondenceID;
		this.correspondenceDate = correspondence.correspondenceDate;
		this.correspondenceType = correspondence.correspondenceType;
		this.correspondenceEndDate = correspondence.correspondenceEndDate;
	}
}
