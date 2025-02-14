import { faker } from '@faker-js/faker';
import { Label, LabelType } from '../../src/archive/label';

describe(`Label Tests`, () => {
    it(`should create a label with CAREER type`, () => {
        const name: string = faker.word.adjective();
        const label:Label = new Label({name, type: LabelType.CAREER});

        expect(label.name).toEqual(name);
        expect(label.type).toEqual(LabelType.CAREER);
    })

    it(`should create a label with SEXUALITY type`, () => {
        const name: string = faker.word.adjective();
        const label:Label = new Label({name, type: LabelType.SEXUALITY});

        expect(label.name).toEqual(name);
        expect(label.type).toEqual(LabelType.SEXUALITY);
    })

    it(`should create a label with NATIONALITY type`, () => {
        const name: string = faker.word.adjective();
        const label:Label = new Label({name, type: LabelType.NATIONALITY});

        expect(label.name).toEqual(name);
        expect(label.type).toEqual(LabelType.NATIONALITY);
    })
});