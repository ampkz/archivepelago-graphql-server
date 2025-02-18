export interface IArchiveDate {
    year: string;
    month?: string;
    day?: string;
}

export function convertArchiveDateToDate(archiveDate: IArchiveDate): string | undefined {
    return archiveDate ? `${archiveDate.year}${archiveDate.month ? `-${archiveDate.month}${archiveDate.day ? `-${archiveDate.day}`: ``}`: ``}` : undefined;
}