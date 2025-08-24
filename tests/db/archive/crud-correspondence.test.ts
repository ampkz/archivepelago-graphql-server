// import { destroyDBs, initializeDBs } from '../../../src/db/utils/init-dbs';
import { faker } from '@faker-js/faker';
import { Correspondence } from '../../../src/archive/correspondence';
import { ArchiveDate, CorrespondenceType } from '../../../src/generated/graphql';
import {
	createCorrespondence,
	deleteCorrespondence,
	getCorrespondence,
	getCorrespondences,
	updateCorrespondence,
} from '../../../src/db/archive/crud-correspondence';
import { convertDateStringToArchiveDate } from '../../../src/archive/date';

describe(`CRUD Correspondence Tests`, () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it(`should create a Correspondence`, async () => {
		const correspondenceType: CorrespondenceType = CorrespondenceType.Letter,
			correspondenceDate: ArchiveDate | null = convertDateStringToArchiveDate('2022-01-01'),
			correspondenceEndDate: ArchiveDate | null = convertDateStringToArchiveDate('2022-01-31');

		const correspondence: Correspondence = new Correspondence({
			correspondenceID: '',
			correspondenceType,
			correspondenceDate,
			correspondenceEndDate,
		});

		const createdCorrespondence = await createCorrespondence({
			correspondenceType,
			correspondenceDate,
			correspondenceEndDate,
		});

		correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;

		expect(createdCorrespondence).toEqual(correspondence);
	});

	it(`should get a created Correspondence`, async () => {
		const correspondenceType: CorrespondenceType = CorrespondenceType.Letter,
			correspondenceDate: ArchiveDate | null = convertDateStringToArchiveDate('2024-01-01'),
			correspondenceEndDate: ArchiveDate | null = convertDateStringToArchiveDate('2024-01-31');

		const createdCorrespondence = await createCorrespondence({ correspondenceType, correspondenceDate, correspondenceEndDate });

		const matchedCorrespondence = await getCorrespondence(createdCorrespondence?.correspondenceID!);

		expect(matchedCorrespondence).toEqual(createdCorrespondence);
	});

	it(`should delete a created Correspondence`, async () => {
		const correspondenceType: CorrespondenceType = CorrespondenceType.Letter,
			correspondenceDate: ArchiveDate | null = convertDateStringToArchiveDate('2024-01-01'),
			correspondenceEndDate: ArchiveDate | null = convertDateStringToArchiveDate('2024-01-31');

		const createdCorrespondence = await createCorrespondence({ correspondenceType, correspondenceDate, correspondenceEndDate });

		const deletedCorrespondence = await deleteCorrespondence(createdCorrespondence?.correspondenceID!);

		expect(deletedCorrespondence).toEqual(createdCorrespondence);
	});

	test(`getCorrespondence should return null if no Correspondence exists`, async () => {
		const matchedCorrespondence = await getCorrespondence(faker.database.mongodbObjectId());
		expect(matchedCorrespondence).toBeNull();
	});

	test(`deleteCorrespondence should return null if no Correspondence exists`, async () => {
		const deletedCorrespondence = await deleteCorrespondence(faker.database.mongodbObjectId());
		expect(deletedCorrespondence).toBeNull();
	});

	test(`updateCorrespondence should return null if no Label exists`, async () => {
		const updatedCorrespondence = await updateCorrespondence({
			correspondenceID: faker.database.mongodbObjectId(),
			updatedCorrespondenceDate: convertDateStringToArchiveDate(faker.date.anytime().toDateString()),
		});

		expect(updatedCorrespondence).toBeNull();
	});

	it(`should update a created correspondence`, async () => {
		const updatedCorrespondenceDate = convertDateStringToArchiveDate('2024-01-01'),
			updatedCorrespondenceEndDate = convertDateStringToArchiveDate('2024-01-31');

		const createdCorrespondence = await createCorrespondence({ correspondenceType: CorrespondenceType.Letter });

		const updatedCorrespondence = await updateCorrespondence({
			correspondenceID: createdCorrespondence?.correspondenceID as string,
			updatedCorrespondenceDate,
			updatedCorrespondenceEndDate,
			updatedCorrespondenceType: CorrespondenceType.Letter,
		});

		expect(updatedCorrespondence).toEqual({
			correspondenceID: createdCorrespondence?.correspondenceID as string,
			correspondenceDate: updatedCorrespondenceDate,
			correspondenceType: CorrespondenceType.Letter,
			correspondenceEndDate: updatedCorrespondenceEndDate,
		});
	});

	it(`should update a created correspondence by deleted a null date`, async () => {
		const createdCorrespondence = await createCorrespondence({
			correspondenceType: CorrespondenceType.Letter,
			correspondenceDate: convertDateStringToArchiveDate('1900-01-01'),
			correspondenceEndDate: convertDateStringToArchiveDate('1900-01-31'),
		});

		const updatedCorrespondence = await updateCorrespondence({
			correspondenceID: createdCorrespondence?.correspondenceID as string,
			updatedCorrespondenceDate: undefined,
			updatedCorrespondenceEndDate: undefined,
		});

		expect(updatedCorrespondence).toEqual({
			correspondenceID: createdCorrespondence?.correspondenceID as string,
			correspondenceType: CorrespondenceType.Letter,
		});
	});

	it(`should get a list of created Correspondences`, async () => {
		const correspondenceType: CorrespondenceType = CorrespondenceType.Letter,
			correspondenceDate: ArchiveDate | null = convertDateStringToArchiveDate('2024-01-01'),
			correspondenceDate2: ArchiveDate | null = convertDateStringToArchiveDate('2024-01-02'),
			correspondenceDate3: ArchiveDate | null = convertDateStringToArchiveDate('2024-01-03');

		const createdCorrespondence = await createCorrespondence({ correspondenceType, correspondenceDate });
		const createdCorrespondence2 = await createCorrespondence({
			correspondenceType,
			correspondenceDate: correspondenceDate2,
		});
		const createdCorrespondence3 = await createCorrespondence({
			correspondenceType,
			correspondenceDate: correspondenceDate3,
		});

		const matchedCorrespondence = await getCorrespondences();

		expect(matchedCorrespondence).toContainEqual(createdCorrespondence);
		expect(matchedCorrespondence).toContainEqual(createdCorrespondence2);
		expect(matchedCorrespondence).toContainEqual(createdCorrespondence3);
	});
});
