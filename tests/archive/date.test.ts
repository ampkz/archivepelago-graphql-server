import { faker } from '@faker-js/faker';
import { convertArchiveDateToDateString, convertDateStringToArchiveDate } from '../../src/archive/date';
import { ArchiveDateInput } from '../../src/generated/graphql';

describe(`Date tests`, () => {
	it(`should create a date with just a year`, () => {
		const dateObj: ArchiveDateInput = { year: faker.date.anytime().getFullYear().toString() };

		expect(convertArchiveDateToDateString(dateObj)).toEqual(dateObj.year);
	});

	it(`should create a date with just a year and month`, () => {
		const dateObj: ArchiveDateInput = { year: faker.date.anytime().getFullYear().toString(), month: faker.date.anytime().getMonth().toString() };

		expect(convertArchiveDateToDateString(dateObj)).toEqual(`${dateObj.year}-${dateObj.month}`);
	});

	it(`should create a date with a year, month, and day`, () => {
		const dateObj: ArchiveDateInput = {
			year: faker.date.anytime().getFullYear().toString(),
			month: faker.date.anytime().getMonth().toString(),
			day: faker.date.anytime().getDay().toString(),
		};

		expect(convertArchiveDateToDateString(dateObj)).toEqual(`${dateObj.year}-${dateObj.month}-${dateObj.day}`);
	});

	it(`should convert a year string into an IArchiveDate`, () => {
		const dateString = '2005';

		expect(convertDateStringToArchiveDate(dateString)).toEqual({ year: '2005' });
	});

	it(`should convert a year-month string into an IArchiveDate`, () => {
		const dateString = '2005-12';

		expect(convertDateStringToArchiveDate(dateString)).toEqual({ year: '2005', month: '12' });
	});

	it(`should convert a year-month-day string into an IArchiveDate`, () => {
		const dateString = '2005-12-27';

		expect(convertDateStringToArchiveDate(dateString)).toEqual({ year: '2005', month: '12', day: '27' });
	});

	it(`should return null with an null datestring`, () => {
		const dateString = undefined;

		expect(convertDateStringToArchiveDate(dateString)).toBeNull();
	});
});
