import dotenv from 'dotenv';
import { destroyTestingDBs, initializeDBs } from '../../../src/db/utils/init-dbs';
import { faker } from '@faker-js/faker';
import { Correspondence, CorrespondenceType, UpdatedCorrespondenceI } from '../../../src/archive/correspondence';
import { Person } from '../../../src/archive/person';
import { createPerson } from '../../../src/db/archive/crud-person';
import { createCorrespondence, deleteCorrespondence, getCorrespondence, updateCorrespondence } from '../../../src/db/archive/crud-correspondence';
import * as CRUDRelationship from '../../../src/db/utils/relationship/crud-relationship';
import { InternalError } from '../../../src/_helpers/errors-helper';

dotenv.config();

describe(`CRUD Correspondence Tests`, () => {
    beforeAll(async () => {
        await initializeDBs();
    });

    afterAll(async () => {
        await destroyTestingDBs();
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it(`should create a correspondence`, async () => {
        const toPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), toID: [toPerson.id], fromID: [fromPerson.id], correspondenceDate, correspondenceType });

        const createdCorrespondence = await createCorrespondence(correspondence);

        correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;

        expect(createdCorrespondence).toEqual(correspondence);
    });

    it(`should create a correspondence with multiple toIDs and fromIDs`, async () => {
        const toPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const toPerson2: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson2: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const toPerson3: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson3: Person = await createPerson({ id: '', firstName: faker.person.firstName() });

        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), toID: [toPerson.id, toPerson2.id, toPerson3.id], fromID: [fromPerson.id, fromPerson2.id, fromPerson3.id], correspondenceDate, correspondenceType });

        const createdCorrespondence = await createCorrespondence(correspondence) as Correspondence;

        correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;

        expect(createdCorrespondence.toID).toEqual(expect.arrayContaining(correspondence.toID as string[]));
        expect(createdCorrespondence.fromID).toEqual(expect.arrayContaining(correspondence.fromID as string[]));
    });

    it(`should throw an error if there was an issue with the server when creating a relationship`, async () => {
        const toPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), toID: [toPerson.id], fromID: [fromPerson.id], correspondenceDate, correspondenceType });

        const createRelationshipSpy = jest.spyOn(CRUDRelationship, "createRelationship");
        createRelationshipSpy.mockRejectedValue(new InternalError(''));

        await expect(createCorrespondence(correspondence)).rejects.toThrow();
    });

    it(`should created a correspondence with no matching fromID`, async () => {
        const toPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), toID: [toPerson.id], fromID: ["does-not-exist"], correspondenceDate, correspondenceType });

        const createdCorrespondence = await createCorrespondence(correspondence);

        correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;
        correspondence.fromID = [];
        expect(createdCorrespondence).toEqual(correspondence);
    });

    it(`should created a correspondence with no matching toID`, async () => {
        const fromPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), toID: ["does-not-exist"], fromID: [fromPerson.id], correspondenceDate, correspondenceType });

        const createdCorrespondence = await createCorrespondence(correspondence);

        correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;
        correspondence.toID = [];
        expect(createdCorrespondence).toEqual(correspondence);
    });

    it(`should get a created correspondence`, async () => {
        const toPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), toID: [toPerson.id], fromID: [fromPerson.id], correspondenceDate, correspondenceType });

        const createdCorrespondence = await createCorrespondence(correspondence);

        correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;

        const matchedCorrespondence = await getCorrespondence(correspondence.correspondenceID);

        expect(matchedCorrespondence).toEqual(correspondence);
    })

    it(`should delete a created correspondence`, async () => {
        const toPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), toID: [toPerson.id], fromID: [fromPerson.id], correspondenceDate, correspondenceType });

        const createdCorrespondence = await createCorrespondence(correspondence);

        correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;

        const matchedCorrespondence = await deleteCorrespondence(correspondence.correspondenceID);

        expect(matchedCorrespondence).toEqual(correspondence);
    })

    it(`should update a created correspondence`, async () => {
        const toPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), toID: [toPerson.id], fromID: [fromPerson.id], correspondenceDate, correspondenceType });

        const createdCorrespondence = await createCorrespondence(correspondence);

        correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;

        const updatedCorrespondence: UpdatedCorrespondenceI = { correspondenceID: correspondence.correspondenceID, updatedCorrespondenceDate: faker.date.anytime().toDateString(), updatedCorrespondenceType: CorrespondenceType.LETTER, updatedFromID: [fromPerson.id], updatedToID: [toPerson.id] }

        const matchedCorrespondence = await updateCorrespondence(updatedCorrespondence);

        expect(matchedCorrespondence).toEqual({ correspondenceID: updatedCorrespondence.correspondenceID, correspondenceDate: updatedCorrespondence.updatedCorrespondenceDate, correspondenceType: updatedCorrespondence.updatedCorrespondenceType, toID: updatedCorrespondence.updatedToID, fromID: updatedCorrespondence.updatedFromID });
    });

    it(`should update a created correspondence and remove properties`, async () => {
        const toPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), toID: [toPerson.id], fromID: [fromPerson.id], correspondenceDate, correspondenceType });

        const createdCorrespondence = await createCorrespondence(correspondence);

        correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;

        const updatedCorrespondence: UpdatedCorrespondenceI = { correspondenceID: correspondence.correspondenceID, updatedCorrespondenceDate: null, updatedCorrespondenceType: null, updatedFromID: null,  updatedToID: null}

        const matchedCorrespondence = await updateCorrespondence(updatedCorrespondence);
        
        expect(matchedCorrespondence).toEqual({ correspondenceID: updatedCorrespondence.correspondenceID });
    });

    it(`should update a created correspondence and add extra toID and fromID`, async () => {
        const toPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const toPerson2: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson2: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), toID: [toPerson.id], fromID: [fromPerson.id], correspondenceDate, correspondenceType });

        const createdCorrespondence = await createCorrespondence(correspondence);

        correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;

        const updatedCorrespondence: UpdatedCorrespondenceI = { correspondenceID: correspondence.correspondenceID, updatedCorrespondenceDate: faker.date.anytime().toDateString(), updatedCorrespondenceType: CorrespondenceType.LETTER, updatedFromID: [fromPerson.id, fromPerson2.id], updatedToID: [toPerson.id, toPerson2.id] }

        const matchedCorrespondence = await updateCorrespondence(updatedCorrespondence);

        expect(matchedCorrespondence).toEqual({ correspondenceID: updatedCorrespondence.correspondenceID, correspondenceDate: updatedCorrespondence.updatedCorrespondenceDate, correspondenceType: updatedCorrespondence.updatedCorrespondenceType, fromID: updatedCorrespondence.updatedFromID, toID: updatedCorrespondence.updatedToID });
    });

    it(`should update a created correspondence and add toID and fromID`, async () => {
        const toPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const toPerson2: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson2: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), correspondenceDate, correspondenceType });

        const createdCorrespondence = await createCorrespondence(correspondence);

        correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;

        const updatedCorrespondence: UpdatedCorrespondenceI = { correspondenceID: correspondence.correspondenceID, updatedCorrespondenceDate: faker.date.anytime().toDateString(), updatedCorrespondenceType: CorrespondenceType.LETTER, updatedFromID: [fromPerson.id, fromPerson2.id], updatedToID: [toPerson.id, toPerson2.id] }

        const matchedCorrespondence = await updateCorrespondence(updatedCorrespondence);

        expect(matchedCorrespondence).toEqual({ correspondenceID: updatedCorrespondence.correspondenceID, correspondenceDate: updatedCorrespondence.updatedCorrespondenceDate, correspondenceType: updatedCorrespondence.updatedCorrespondenceType, fromID: updatedCorrespondence.updatedFromID, toID: updatedCorrespondence.updatedToID });
    });

    it(`should update a created correspondence and remove extra toID and fromID`, async () => {
        const toPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const toPerson2: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson2: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), correspondenceDate, correspondenceType, toID: [toPerson.id, toPerson2.id], fromID: [fromPerson.id, fromPerson2.id] });

        const createdCorrespondence = await createCorrespondence(correspondence);

        correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;

        const updatedCorrespondence: UpdatedCorrespondenceI = { correspondenceID: correspondence.correspondenceID, updatedCorrespondenceDate: faker.date.anytime().toDateString(), updatedCorrespondenceType: CorrespondenceType.LETTER, updatedFromID: [fromPerson.id], updatedToID: [toPerson.id] }

        const matchedCorrespondence = await updateCorrespondence(updatedCorrespondence);

        expect(matchedCorrespondence).toEqual({ correspondenceID: updatedCorrespondence.correspondenceID, correspondenceDate: updatedCorrespondence.updatedCorrespondenceDate, correspondenceType: updatedCorrespondence.updatedCorrespondenceType, fromID: updatedCorrespondence.updatedFromID, toID: updatedCorrespondence.updatedToID });
    });

    it(`should throw an error if there was an issue with the server when deleting a relationship`, async () => {
        const toPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), toID: [toPerson.id], fromID: [fromPerson.id], correspondenceDate, correspondenceType });

        const createdCorrespondence = await createCorrespondence(correspondence);

        correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;

        const updatedCorrespondence: UpdatedCorrespondenceI = { correspondenceID: correspondence.correspondenceID, updatedCorrespondenceDate: faker.date.anytime().toDateString(), updatedCorrespondenceType: CorrespondenceType.LETTER, updatedToID: [toPerson.id], updatedFromID: null }

        const deleteRelationshipSpy = jest.spyOn(CRUDRelationship, "deleteRelationship");
        deleteRelationshipSpy.mockRejectedValue(new InternalError(''));

        await expect(updateCorrespondence(updatedCorrespondence)).rejects.toThrow();
    });

    it(`should throw an error if it could not delete a relationship`, async () => {
        const toPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), toID: [toPerson.id], fromID: [fromPerson.id], correspondenceDate, correspondenceType });

        const createdCorrespondence = await createCorrespondence(correspondence);

        correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;

        const updatedCorrespondence: UpdatedCorrespondenceI = { correspondenceID: correspondence.correspondenceID, updatedCorrespondenceDate: faker.date.anytime().toDateString(), updatedCorrespondenceType: CorrespondenceType.LETTER, updatedToID: [toPerson.id], updatedFromID: null }

        const deleteRelationshipSpy = jest.spyOn(CRUDRelationship, "deleteRelationship");
        deleteRelationshipSpy.mockRejectedValue(new InternalError(CRUDRelationship.Errors.COULD_NOT_DELETE_RELATIONSHIP));

        const matchedCorrespondence = await updateCorrespondence(updatedCorrespondence);

        expect(matchedCorrespondence).toEqual({ correspondenceID: updatedCorrespondence.correspondenceID, correspondenceDate: updatedCorrespondence.updatedCorrespondenceDate, correspondenceType: updatedCorrespondence.updatedCorrespondenceType, toID: updatedCorrespondence.updatedToID });
    });

});