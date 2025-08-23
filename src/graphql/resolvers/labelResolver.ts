import { isPermitted } from '../../_helpers/auth-helper';
import { Label, LabelType } from '../../archive/label';
import { Auth } from '@ampkz/auth-neo4j/auth';
import { createLabel, deleteLabel, getLabel, getLabels, updateLabel } from '../../db/archive/crud-label';
import { getPersonsByLabel } from '../../db/archive/relationship/person-label-relationship';
import { mutationFailed, serverFailed, unauthorizedError } from '../errors/errors';
import { Resolvers, Label as GqlLabel } from '../../generated/graphql';

export const resolvers: Resolvers = {
	Query: {
		label: async (_root, { name }) => {
			let label: Label | null = null;

			try {
				label = await getLabel(name);
			} catch (error: any) {
				throw serverFailed(error.message);
			}

			return label as unknown as GqlLabel;
		},

		labels: async () => {
			let labels: Label[] = [];

			try {
				labels = await getLabels();
			} catch (error: any) {
				throw serverFailed(error.message);
			}

			return labels as unknown as GqlLabel[];
		},
	},

	Mutation: {
		createLabel: async (_root, { input: { name, type } }, { authorizedUser }) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let label: Label;

			try {
				label = (await createLabel({ name, type: type as unknown as LabelType })) as Label;
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return label as unknown as GqlLabel;
		},

		deleteLabel: async (_root, { name }, { authorizedUser }) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let label: Label;

			try {
				label = (await deleteLabel(name)) as Label;
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return label as unknown as GqlLabel;
		},

		updateLabel: async (_root, { input: { name, updatedName, updatedType } }, { authorizedUser }) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let label: Label;

			try {
				label = (await updateLabel(name, { updatedName: updatedName as string, updatedType: updatedType as unknown as LabelType })) as Label;
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return label as unknown as GqlLabel;
		},
	},

	Label: {
		persons: label => getPersonsByLabel(label as unknown as Label),
	},
};
