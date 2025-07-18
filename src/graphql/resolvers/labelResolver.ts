import { isPermitted } from '../../_helpers/auth-helpers';
import { Label } from '../../archive/label';
import { Auth } from '../../auth/authorization';
import { createLabel, deleteLabel, getLabel, getLabels, updateLabel } from '../../db/archive/crud-label';
import { getPersonsByLabel } from '../../db/archive/relationship/person-label-relationship';
import { mutationFailed, serverFailed, unauthorizedError } from '../errors/errors';

export default {
	Query: {
		label: async (_root: any, { name }: any) => {
			let label: Label | undefined = undefined;

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
		createLabel: async (_root: any, { input: { name, type } }: any, { authorizedUser }: any) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let label: Label;

			try {
				label = (await createLabel({ name, type })) as Label;
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return label;
		},

		deleteLabel: async (_root: any, { name }: any, { authorizedUser }: any) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let label: Label;

			try {
				label = (await deleteLabel(name)) as Label;
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return label;
		},

		updateLabel: async (_root: any, { input: { name, updatedName, updatedType } }: any, { authorizedUser }: any) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let label: Label;

			try {
				label = (await updateLabel(name, { updatedName, updatedType })) as Label;
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return label;
		},
	},

	Label: {
		persons: (label: Label) => getPersonsByLabel(label),
	},
};
