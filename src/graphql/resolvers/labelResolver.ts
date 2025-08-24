import { isPermitted } from '../../_helpers/auth-helper';
import { Label } from '../../archive/label';
import { LabelType } from '../../generated/graphql';
import { Auth } from '@ampkz/auth-neo4j/auth';
import { createLabel, deleteLabel, getLabel, getLabels, updateLabel } from '../../db/archive/crud-label';
import { getPersonsByLabel } from '../../db/archive/relationship/person-label-relationship';
import { mutationFailed, serverFailed, unauthorizedError } from '../errors/errors';
import { Resolvers } from '../../generated/graphql';

export const resolvers: Resolvers = {
	Query: {
		label: async (_root, { name }) => {
			let label: Label | null = null;

			try {
				label = await getLabel(name);
			} catch (error: any) {
				throw serverFailed(error.message);
			}

			return label;
		},

		labels: async () => {
			let labels: Label[] = [];

			try {
				labels = await getLabels();
			} catch (error: any) {
				throw serverFailed(error.message);
			}

			return labels;
		},
	},

	Mutation: {
		createLabel: async (_root, { input: { name, type } }, { authorizedUser }) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let label: Label | null;

			try {
				label = await createLabel({ name, type: type as unknown as LabelType });
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return label;
		},

		deleteLabel: async (_root, { name }, { authorizedUser }) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let label: Label | null;

			try {
				label = await deleteLabel(name);
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return label;
		},

		updateLabel: async (_root, { input: { name, updatedName, updatedType } }, { authorizedUser }) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let label: Label | null;

			try {
				label = await updateLabel({ name, updatedName: updatedName, updatedType: updatedType });
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return label;
		},
	},

	Label: {
		persons: label => getPersonsByLabel(label),
	},
};
