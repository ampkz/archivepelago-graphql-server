import dotenv from 'dotenv';
import { destroyTestingDBs, initializeDBs } from '../../../src/db/utils/init-dbs';
import { faker } from '@faker-js/faker';
import { createLabel, deleteLabel, getLabel, updateLabel } from '../../../src/db/archive/crud-label';
import { Label } from '../../../src/archive/label';
import { Errors } from '../../../src/db/utils/crud';

dotenv.config();

describe(`CRUD Label Tests`, () => {
    beforeAll(async () => {
        await initializeDBs();
    });

    afterAll(async () => {
        await destroyTestingDBs();
    });
    
    it(`should create a Label`, async () => {
        const name: string = faker.word.adjective();

        const label: Label = new Label(name);

        const createdLabel: Label | undefined = await createLabel(name);

        expect(createdLabel).toEqual(label);
    });

    it(`should get a created Label`, async () => {
        const name: string = faker.word.adjective();

        const label: Label = new Label(name);

        await createLabel(name);

        const matchedLabel: Label | undefined = await getLabel(name);

        expect(matchedLabel).toEqual(label);
    });

    it(`should throw an error if trying to create an existing label`, async () => {
        const name: string = faker.word.adjective();

        await createLabel(name);

        await expect(createLabel).rejects.toThrow(Errors.CANNOT_CREATE_NODE);
    });

    it(`should delete a created Label`, async () => {
        const name: string = faker.word.adjective();

        const label: Label = new Label(name);

        await createLabel(name);

        const matchedLabel: Label | undefined = await deleteLabel(name);

        expect(matchedLabel).toEqual(label);
    });

    test(`getLabel should return undefined if no Label exists`, async () => {
        const matchedLabel: Label | undefined = await getLabel(faker.word.adjective());
        expect(matchedLabel).toBeUndefined();
    });

    test(`deleteLabel should return undefined if no Label exists`, async () => {
        const deletedLabel: Label | undefined = await deleteLabel(faker.word.adjective());

        expect(deletedLabel).toBeUndefined();
    });

    it(`should update a created label`, async () => {
        const name: string = faker.word.adjective();
        const updatedName: string = faker.word.adjective();

        await createLabel(name);
        const updatedLabel: Label | undefined = await updateLabel(name, { updatedName });

        expect(updatedLabel).toEqual(new Label(updatedName));
    });

    test(`updateLabel should return undefined if no Label exists`, async () => {
        const updatedLabel: Label | undefined = await updateLabel(faker.word.adjective(), { updatedName: faker.word.adjective() });

        expect(updatedLabel).toBeUndefined();
    });
});