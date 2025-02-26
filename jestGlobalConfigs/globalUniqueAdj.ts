import { faker } from '@faker-js/faker';

const uniqueAdjs: string[] = faker.helpers.uniqueArray(faker.word.adjective, 200);

(global as any).UniqueAdjIterator = uniqueAdjs[Symbol.iterator]();
