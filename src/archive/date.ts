export interface IArchiveDate {
	year: string;
	month?: string;
	day?: string;
}

export function convertArchiveDateToDate(archiveDate: IArchiveDate): string | undefined {
	return archiveDate
		? `${archiveDate.year}${archiveDate.month ? `-${archiveDate.month}${archiveDate.day ? `-${archiveDate.day}` : ``}` : ``}`
		: undefined;
}

export function convertDateStringToArchiveDate(dateString?: string): IArchiveDate | undefined {
	if (dateString === undefined) return undefined;

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
