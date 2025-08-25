import { isPermitted } from '../../_helpers/auth-helper';
import { Correspondence } from '../../archive/correspondence';
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
import { mutationFailed, unauthorizedError } from '../errors/errors';
import { Resolvers, Correspondence as GqlCorrespondence } from '../../generated/graphql';

export const resolvers: Resolvers = {
	Query: {
		correspondence: (_root, { correspondenceID }) => getCorrespondence(correspondenceID),
		correspondences: () => getCorrespondences(),
	},

	Mutation: {
		createCorrespondence: async (_root, { input: { correspondenceDate, correspondenceEndDate, correspondenceType } }, { authorizedUser }) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let correspondence: Correspondence | null;

			try {
				correspondence = await createCorrespondence({
					correspondenceDate,
					correspondenceEndDate,
					correspondenceType,
				});
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return correspondence;
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

			return correspondence;
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
					updatedCorrespondenceDate,
					updatedCorrespondenceEndDate,
					updatedCorrespondenceType,
				});
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return correspondence;
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

			return correspondence;
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

			return correspondence;
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

			return correspondence;
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

			return correspondence;
		},
	},

	Correspondence: {
		to: correspondence => getPersonsByCorrespondence(correspondence.correspondenceID, RelationshipType.RECEIVED),
		from: correspondence => getPersonsByCorrespondence(correspondence.correspondenceID, RelationshipType.SENT),
	},
};
