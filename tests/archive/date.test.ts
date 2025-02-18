import { faker } from "@faker-js/faker"
import { convertArchiveDateToDate, IArchiveDate } from "../../src/archive/date"

describe(`Date tests`, () => {
    it(`should create a date with just a year`, () => {
        const dateObj: IArchiveDate = { year: faker.date.anytime().getFullYear().toString() };

        expect(convertArchiveDateToDate(dateObj)).toEqual(dateObj.year);
    });

    it(`should create a date with just a year and month`, () => {
        const dateObj: IArchiveDate = { year: faker.date.anytime().getFullYear().toString(), month: faker.date.anytime().getMonth().toString() };

        expect(convertArchiveDateToDate(dateObj)).toEqual(`${dateObj.year}-${dateObj.month}`);
    });

    it(`should create a date with a year, month, and day`, () => {
        const dateObj: IArchiveDate = { year: faker.date.anytime().getFullYear().toString(), 
            month: faker.date.anytime().getMonth().toString(),
            day: faker.date.anytime().getDay().toString() };

        expect(convertArchiveDateToDate(dateObj)).toEqual(`${dateObj.year}-${dateObj.month}-${dateObj.day}`);
    });
})