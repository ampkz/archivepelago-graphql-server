export class Person implements IPerson {
	public id: string;
	public firstName: string | undefined;
	public lastName: string | undefined;
	public secondName: string | undefined;
	public birthDate: string | undefined;
	public deathDate: string | undefined;

	constructor(person: IPerson) {
		this.id = person.id;
		this.firstName = person.firstName;
		this.lastName = person.lastName;
		this.secondName = person.secondName;
		this.birthDate = person.birthDate;
		this.deathDate = person.deathDate;
	}
}

export interface IPerson {
	id: string;
	firstName?: string;
	lastName?: string;
	secondName?: string;
	birthDate?: string;
	deathDate?: string;
}

export interface IUpdatedPerson {
	id: string;
	updatedFirstName?: string | null;
	updatedLastName?: string | null;
	updatedSecondName?: string | null;
	updatedBirthDate?: string | null;
	updatedDeathDate?: string | null;
}
