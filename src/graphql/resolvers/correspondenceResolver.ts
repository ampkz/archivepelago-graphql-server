import { isPermitted } from '../../_helpers/auth-helper';
import { Correspondence, ICorrespondence, IUpdatedCorrespondence } from '../../archive/correspondence';
import { convertArchiveDateToDateString, convertDateStringToArchiveDate } from '../../archive/date';
import { RelationshipType } from '../../archive/relationship/relationship';
import { Auth } from '@ampkz/auth-neo4j/auth';
import {
	createCorrespondence,
	deleteCorrespondence,
	getCorrespondence,
	getCorrespondences,
	updateCorrespondence,
} from '../../db/archive/crud-correspondence';
import {
	createPersonRelationship,
	deletePersonRelationship,
	getPersonsByCorrespondence,
} from '../../db/archive/relationship/person-correspondence-relationship';
import { mutationFailed, serverFailed, unauthorizedError } from '../errors/errors';
import { Resolvers, Correspondence as GqlCorrespondence } from '../../generated/graphql';

export const resolvers: Resolvers = {
	Query: {
		correspondence: async (_root, { correspondenceID }) => {
			let correspondence: Correspondence | null = null;

			try {
				correspondence = await getCorrespondence(correspondenceID);
			} catch (error: any) {
				throw serverFailed(error.message);
			}

			return correspondence as unknown as GqlCorrespondence;
		},

		correspondences: async () => {
			let correspondences: Correspondence[] = [];
			const convertedCorrespondences: any[] = [];

			try {
				correspondences = await getCorrespondences();
			} catch (error: any) {
				throw serverFailed(error.message);
			}

			correspondences.map(correspondence => {
				convertedCorrespondences.push({
					...correspondence,
					correspondenceDate: convertDateStringToArchiveDate(correspondence.correspondenceDate),
					correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate),
				});
			});

			return convertedCorrespondences;
		},
	},

	Mutation: {
		createCorrespondence: async (_root, { input: { correspondenceDate, correspondenceEndDate, correspondenceType } }, { authorizedUser }) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let correspondence: Correspondence | null;

			try {
				correspondence = await createCorrespondence({
					correspondenceDate: convertArchiveDateToDateString(correspondenceDate),
					correspondenceEndDate: convertArchiveDateToDateString(correspondenceEndDate),
					correspondenceType,
				} as unknown as ICorrespondence);
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			if (correspondence !== null) {
				return {
					...correspondence,
					correspondenceDate: convertDateStringToArchiveDate(correspondence.correspondenceDate),
					correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate),
				} as unknown as GqlCorrespondence;
			}

			return null;
		},

		deleteCorrespondence: async (_root, { correspondenceID }, { authorizedUser }) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let correspondence: Correspondence | null;

			try {
				correspondence = await deleteCorrespondence(correspondenceID);
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			if (correspondence !== null) {
				return {
					...correspondence,
					correspondenceDate: convertDateStringToArchiveDate(correspondence.correspondenceDate),
					correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate),
				} as unknown as GqlCorrespondence;
			}

			return null;
		},

		updateCorrespondence: async (
			_root,
			{ input: { correspondenceID, updatedCorrespondenceDate, updatedCorrespondenceEndDate, updatedCorrespondenceType } },
			{ authorizedUser }
		) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let correspondence: Correspondence | null;

			try {
				correspondence = await updateCorrespondence({
					correspondenceID,
					updatedCorrespondenceDate: convertArchiveDateToDateString(updatedCorrespondenceDate),
					updatedCorrespondenceEndDate: convertArchiveDateToDateString(updatedCorrespondenceEndDate),
					updatedCorrespondenceType,
				} as unknown as IUpdatedCorrespondence);
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			if (correspondence !== null) {
				return {
					...correspondence,
					correspondenceDate: convertDateStringToArchiveDate(correspondence.correspondenceDate),
					correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate),
				} as unknown as GqlCorrespondence;
			}

			return null;
		},

		addReceived: async (_root, { correspondenceID, receivedID }, { authorizedUser }) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let correspondence: Correspondence | null;

			try {
				correspondence = await createPersonRelationship(correspondenceID, receivedID, RelationshipType.RECEIVED);
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			if (correspondence !== null) {
				return {
					...correspondence,
					correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate),
					correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate),
				} as unknown as GqlCorrespondence;
			}

			return null;
		},

		removeReceived: async (_root, { correspondenceID, receivedID }, { authorizedUser }) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let correspondence: Correspondence | null;

			try {
				correspondence = await deletePersonRelationship(correspondenceID, receivedID, RelationshipType.RECEIVED);
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			if (correspondence !== null) {
				return {
					...correspondence,
					correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate),
					correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate),
				} as unknown as GqlCorrespondence;
			}

			return null;
		},

		addSent: async (_root, { correspondenceID, sentID }, { authorizedUser }) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let correspondence: Correspondence | null;

			try {
				correspondence = await createPersonRelationship(correspondenceID, sentID, RelationshipType.SENT);
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			if (correspondence !== null) {
				return {
					...correspondence,
					correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate),
					correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate),
				} as unknown as GqlCorrespondence;
			}

			return null;
		},

		removeSent: async (_root, { correspondenceID, sentID }, { authorizedUser }) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let correspondence: Correspondence | null;

			try {
				correspondence = await deletePersonRelationship(correspondenceID, sentID, RelationshipType.SENT);
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			if (correspondence !== null) {
				return {
					...correspondence,
					correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate),
					correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate),
				} as unknown as GqlCorrespondence;
			}

			return null;
		},
	},

	Correspondence: {
		to: correspondence => getPersonsByCorrespondence(correspondence.correspondenceID, RelationshipType.RECEIVED),
		from: Correspondence => getPersonsByCorrespondence(Correspondence.correspondenceID, RelationshipType.SENT),
	},
};
