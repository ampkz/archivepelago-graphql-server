import { isPermitted } from '../../_helpers/auth-helpers';
import { convertDateStringToArchiveDate } from '../../archive/date';
import { Person, IPerson } from '../../archive/person';
import { PersonLabel, RelationshipType } from '../../archive/relationship/relationship';
import { Auth } from '../../auth/authorization';
import { createPerson, deletePerson, getPerson, getPersons, updatePerson } from '../../db/archive/crud-person';
import { getCorrespondencesByPerson } from '../../db/archive/relationship/person-correspondence-relationship';
import { createPersonLabel, deletePersonLabel, getLabelsByPerson } from '../../db/archive/relationship/person-label-relationship';
import { mutationFailed, serverFailed, unauthorizedError } from '../errors/errors';

export default {
	Query: {
		person: async (_root: any, { id }: any) => {
			let person: Person | undefined = undefined;

			try {
				person = await getPerson(id);
			} catch (error: any) {
				throw serverFailed(error.message);
			}

			return person;
		},

		persons: async () => {
			let persons: Person[] = [];

			try {
				persons = await getPersons();
			} catch (error: any) {
				throw serverFailed(error.message);
			}

			return persons;
		},
	},

	Mutation: {
		createPerson: async (_root: any, { input: { firstName, lastName, secondName, birthDate, deathDate } }: any, { authorizedUser }: any) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let person: Person;

			try {
				person = await createPerson({ firstName, lastName, secondName, birthDate, deathDate } as IPerson);
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return person;
		},

		deletePerson: async (_root: any, { id }: any, { authorizedUser }: any) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation`);
			}

			let person: Person | undefined = undefined;

			try {
				person = await deletePerson(id);
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return person;
		},

		updatePerson: async (
			_root: any,
			{ input: { id, updatedFirstName, updatedLastName, updatedSecondName, updatedBirthDate, updatedDeathDate } }: any,
			{ authorizedUser }: any
		) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation`);
			}

			let person: Person | undefined = undefined;

			try {
				person = await updatePerson({ id, updatedFirstName, updatedLastName, updatedSecondName, updatedBirthDate, updatedDeathDate });
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return person;
		},

		createLabelRelationship: async (_root: any, { personID, labelName }: any, { authorizedUser }: any) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation`);
			}

			let person: Person | undefined = undefined;

			try {
				person = await createPersonLabel(new PersonLabel(personID, labelName));
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return person;
		},

		deleteLabelRelationship: async (_root: any, { personID, labelName }: any, { authorizedUser }: any) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation`);
			}

			let person: Person | undefined = undefined;

			try {
				person = await deletePersonLabel(new PersonLabel(personID, labelName));
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return person;
		},
	},

	Person: {
		labels: (person: Person) => getLabelsByPerson(person),
		sentCorrespondences: async (person: Person) => {
			const convertedCorrespondences: any[] = [];

			const correspondences = await getCorrespondencesByPerson(person.id, RelationshipType.SENT);

			correspondences.map(correspondence => {
				convertedCorrespondences.push({
					...correspondence,
					correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate),
					correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate),
				});
			});

			return convertedCorrespondences;
		},
		receivedCorrespondences: async (person: Person) => {
			const convertedCorrespondences: any[] = [];

			const correspondences = await getCorrespondencesByPerson(person.id, RelationshipType.RECEIVED);

			correspondences.map(correspondence => {
				convertedCorrespondences.push({
					...correspondence,
					correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate),
					correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate),
				});
			});

			return convertedCorrespondences;
		},
	},
};
