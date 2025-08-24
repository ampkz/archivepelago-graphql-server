import { ArchiveDate, ArchiveDateInput } from '../generated/graphql';

// export interface IArchiveDate {
// 	year: string;
// 	month?: string;
// 	day?: string;
// }

export function convertArchiveDateToDateString(archiveDate?: ArchiveDateInput | null): string | null {
	return archiveDate
		? `${archiveDate.year}${archiveDate.month ? `-${archiveDate.month}${archiveDate.day ? `-${archiveDate.day}` : ``}` : ``}`
		: null;
}

export function convertDateStringToArchiveDate(dateString?: string): ArchiveDate | null {
	if (dateString === undefined) return null;

	const dateArray = dateString.split(`-`);

	/* istanbul ignore next line */
	switch (dateArray.length) {
		default:
		case 1:
			return { year: dateArray[0] };
		case 2:
			return { year: dateArray[0], month: dateArray[1] };
		case 3:
			return {
				year: dateArray[0],
				month: dateArray[1],
				day: dateArray[2],
			};
	}
}
