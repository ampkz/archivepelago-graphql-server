import type { Person as GqlPerson, ArchiveDate } from '../generated/graphql.js';

export class Person implements GqlPerson {
	public id: string;
	public firstName?: string | null;
	public lastName?: string | null;
	public secondName?: string | null;
	public birthDate?: ArchiveDate | null;
	public deathDate?: ArchiveDate | null;

	constructor(person: GqlPerson) {
		this.id = person.id;
		this.firstName = person.firstName;
		this.lastName = person.lastName;
		this.secondName = person.secondName;
		this.birthDate = person.birthDate;
		this.deathDate = person.deathDate;
	}
}

// export interface IPerson {
// 	id: string;
// 	firstName?: string;
// 	lastName?: string;
// 	secondName?: string;
// 	birthDate?: string;
// 	deathDate?: string;
// }

// export interface IUpdatedPerson {
// 	id: string;
// 	updatedFirstName?: string | null;
// 	updatedLastName?: string | null;
// 	updatedSecondName?: string | null;
// 	updatedBirthDate?: string | null;
// 	updatedDeathDate?: string | null;
// }
