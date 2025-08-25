import type { Person as GqlPerson, ArchiveDate } from '../generated/graphql';
import { convertDateStringToArchiveDate } from './date';

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

export function matchedNodeToPerson(matchedNode: any | null): Person | null {
	if (matchedNode === null) return null;
	if (!!matchedNode.birthDate) matchedNode.birthDate = convertDateStringToArchiveDate(matchedNode.birthDate);
	if (!!matchedNode.deathDate) matchedNode.deathDate = convertDateStringToArchiveDate(matchedNode.deathDate);
	return new Person(matchedNode);
}
