import { faker } from '@faker-js/faker';
import { Label } from '../../src/archive/label';

describe(`Label Tests`, () => {
    it(`should create a label`, () => {
        const name: string = faker.word.adjective();
        const label:Label = new Label(name);

        expect(label.name).toEqual(name);
    })
});