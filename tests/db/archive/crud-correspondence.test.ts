// import { destroyDBs, initializeDBs } from '../../../src/db/utils/init-dbs';
import { faker } from '@faker-js/faker';
import { Correspondence, CorrespondenceType } from '../../../src/archive/correspondence';
import {
	createCorrespondence,
	deleteCorrespondence,
	getCorrespondence,
	getCorrespondences,
	updateCorrespondence,
} from '../../../src/db/archive/crud-correspondence';

describe(`CRUD Correspondence Tests`, () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it(`should create a Correspondence`, async () => {
		const correspondenceType: CorrespondenceType = CorrespondenceType.LETTER,
			correspondenceDate: string = faker.date.anytime().toDateString(),
			correspondenceEndDate: string = faker.date.anytime().toDateString();

		const correspondence: Correspondence = new Correspondence({
			correspondenceID: '',
			correspondenceType,
			correspondenceDate,
			correspondenceEndDate,
		});

		const createdCorrespondence = await createCorrespondence({
			correspondenceID: '',
			correspondenceType,
			correspondenceDate,
			correspondenceEndDate,
		});

		correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;

		expect(createdCorrespondence).toEqual(correspondence);
	});

	it(`should get a created Correspondence`, async () => {
		const correspondenceType: CorrespondenceType = CorrespondenceType.LETTER,
			correspondenceDate: string = faker.date.anytime().toDateString();

		const createdCorrespondence = await createCorrespondence({ correspondenceID: '', correspondenceType, correspondenceDate });

		const matchedCorrespondence = await getCorrespondence(createdCorrespondence?.correspondenceID as string);

		expect(matchedCorrespondence).toEqual(createdCorrespondence);
	});

	it(`should delete a created Correspondence`, async () => {
		const correspondenceType: CorrespondenceType = CorrespondenceType.LETTER,
			correspondenceDate: string = faker.date.anytime().toDateString();

		const createdCorrespondence = await createCorrespondence({ correspondenceID: '', correspondenceType, correspondenceDate });

		const deletedCorrespondence = await deleteCorrespondence(createdCorrespondence?.correspondenceID as string);

		expect(deletedCorrespondence).toEqual(createdCorrespondence);
	});

	test(`getCorrespondence should return undefined if no Correspondence exists`, async () => {
		const matchedCorrespondence = await getCorrespondence(faker.database.mongodbObjectId());
		expect(matchedCorrespondence).toBeUndefined();
	});

	test(`deleteCorrespondence should return undefined if no Correspondence exists`, async () => {
		const deletedCorrespondence = await deleteCorrespondence(faker.database.mongodbObjectId());
		expect(deletedCorrespondence).toBeUndefined();
	});

	test(`updateCorrespondence should return undefined if no Label exists`, async () => {
		const updatedCorrespondence = await updateCorrespondence({
			correspondenceID: faker.database.mongodbObjectId(),
			updatedCorrespondenceDate: faker.date.anytime().toDateString(),
		});

		expect(updatedCorrespondence).toBeUndefined();
	});

	it(`should update a created correspondence`, async () => {
		const updatedCorrespondenceDate = faker.date.anytime().toDateString(),
			updatedCorrespondenceEndDate = faker.date.anytime().toDateString();

		const createdCorrespondence = await createCorrespondence({ correspondenceID: '', correspondenceType: CorrespondenceType.LETTER });

		const updatedCorrespondence = await updateCorrespondence({
			correspondenceID: createdCorrespondence?.correspondenceID as string,
			updatedCorrespondenceDate,
			updatedCorrespondenceEndDate,
			updatedCorrespondenceType: CorrespondenceType.LETTER,
		});

		expect(updatedCorrespondence).toEqual({
			correspondenceID: createdCorrespondence?.correspondenceID as string,
			correspondenceDate: updatedCorrespondenceDate,
			correspondenceType: CorrespondenceType.LETTER,
			correspondenceEndDate: updatedCorrespondenceEndDate,
		});
	});

	it(`should update a created correspondence by deleted a null date`, async () => {
		const createdCorrespondence = await createCorrespondence({
			correspondenceID: '',
			correspondenceType: CorrespondenceType.LETTER,
			correspondenceDate: faker.date.anytime().toDateString(),
			correspondenceEndDate: faker.date.anytime().toDateString(),
		});

		const updatedCorrespondence = await updateCorrespondence({
			correspondenceID: createdCorrespondence?.correspondenceID as string,
			updatedCorrespondenceDate: null,
			updatedCorrespondenceEndDate: null,
		});

		expect(updatedCorrespondence).toEqual({
			correspondenceID: createdCorrespondence?.correspondenceID as string,
			correspondenceType: CorrespondenceType.LETTER,
		});
	});

	it(`should get a list of created Correspondences`, async () => {
		const correspondenceType: CorrespondenceType = CorrespondenceType.LETTER,
			correspondenceDate: string = faker.date.anytime().toDateString(),
			correspondenceDate2: string = faker.date.anytime().toDateString(),
			correspondenceDate3: string = faker.date.anytime().toDateString();

		const createdCorrespondence = await createCorrespondence({ correspondenceID: '', correspondenceType, correspondenceDate });
		const createdCorrespondence2 = await createCorrespondence({
			correspondenceID: '',
			correspondenceType,
			correspondenceDate: correspondenceDate2,
		});
		const createdCorrespondence3 = await createCorrespondence({
			correspondenceID: '',
			correspondenceType,
			correspondenceDate: correspondenceDate3,
		});

		const matchedCorrespondence = await getCorrespondences();

		expect(matchedCorrespondence).toContainEqual(createdCorrespondence);
		expect(matchedCorrespondence).toContainEqual(createdCorrespondence2);
		expect(matchedCorrespondence).toContainEqual(createdCorrespondence3);
	});
});
