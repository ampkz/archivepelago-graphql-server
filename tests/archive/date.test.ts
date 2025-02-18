import { faker } from "@faker-js/faker"
import { convertArchiveDateToDate, convertDateStringToArchiveDate, IArchiveDate } from "../../src/archive/date"

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

    it(`should convert a year string into an IArchiveDate`, () => {
        const dateString = "2005";

        expect(convertDateStringToArchiveDate(dateString)).toEqual({ year: "2005" });
    });

    it(`should convert a year-month string into an IArchiveDate`, () => {
        const dateString = "2005-12";

        expect(convertDateStringToArchiveDate(dateString)).toEqual({ year: "2005", month: "12" });
    });

    it(`should convert a year-month-day string into an IArchiveDate`, () => {
        const dateString = "2005-12-27";

        expect(convertDateStringToArchiveDate(dateString)).toEqual({ year: "2005", month: "12", day: "27" });
    });

    it(`should return undefined with an undefined datestring`, () => {
        const dateString = undefined;

        expect(convertDateStringToArchiveDate(dateString)).toBeUndefined();
    });
})