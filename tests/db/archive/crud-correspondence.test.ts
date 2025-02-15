import dotenv from 'dotenv';
import { destroyTestingDBs, initializeDBs } from '../../../src/db/utils/init-dbs';
import { faker } from '@faker-js/faker';
import { Correspondence, CorrespondenceType } from '../../../src/archive/correspondence';
import { Person } from '../../../src/archive/person';
import { createPerson } from '../../../src/db/archive/crud-person';
import { createCorrespondence } from '../../../src/db/archive/crud-correspondence';

dotenv.config();

describe(`CRUD Person Tests`, () => {
    beforeAll(async () => {
        await initializeDBs();
    });

    afterAll(async () => {
        await destroyTestingDBs();
    });

    it(`should create a correspondence`, async () => {
        const toPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const fromPerson: Person = await createPerson({ id: '', firstName: faker.person.firstName() });
        const correspondenceDate = faker.date.anytime().toDateString();
        const correspondenceType = CorrespondenceType.LETTER;

        const correspondence: Correspondence = new Correspondence({ correspondenceID: faker.database.mongodbObjectId(), toPerson: toPerson.id, fromPerson: fromPerson.id, correspondenceDate, correspondenceType });

        const createdCorrespondence = await createCorrespondence(correspondence);

        correspondence.correspondenceID = createdCorrespondence?.correspondenceID as string;

        expect(createdCorrespondence).toEqual(correspondence);
    })

});