import { isPermitted } from '../../_helpers/auth-helper';
import { Label } from '../../archive/label';
import { LabelType } from '../../generated/graphql';
import { Auth } from '@ampkz/auth-neo4j/auth';
import { createLabel, deleteLabel, getLabel, getLabels, updateLabel } from '../../db/archive/crud-label';
import { getPersonsByLabel } from '../../db/archive/relationship/person-label-relationship';
import { mutationFailed, unauthorizedError } from '../errors/errors';
import { Resolvers } from '../../generated/graphql';

export const resolvers: Resolvers = {
	Query: {
		label: (_root, { name }) => getLabel(name),
		labels: () => getLabels(),
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
