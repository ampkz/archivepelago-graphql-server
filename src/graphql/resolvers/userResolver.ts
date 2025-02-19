import { ResourceExistsError } from '../../_helpers/errors-helper';
import { Auth, isPermitted, permitSelf } from '../../auth/authorization';
import { createUser, deleteUser, getUserByEmail, updateUser } from '../../db/users/crud-user';
import { User } from '../../users/users';
import { mutationFailed, notFoundError, unauthorizedError } from '../errors/errors';

export default {
	Query: {
		user: async (_root: any, { email }: any, { authorizedUser }: any) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN) && !permitSelf(authorizedUser, email)) {
				throw unauthorizedError(`You are not authorized to make this query.`);
			}

			const user: User | undefined = await getUserByEmail(email);

			if (!user) {
				throw notFoundError(`no user with email ${email}`);
			}

			return user;
		},
	},

	Mutation: {
		createUser: async (_root: any, { input: { email, auth, firstName, lastName, password, secondName } }: any, { authorizedUser }: any) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let newUser: User;

			try {
				newUser = await createUser(new User(email, auth, firstName, lastName, secondName), password);
			} catch (error: any) {
				if (error instanceof ResourceExistsError) {
					throw mutationFailed(`Cannot create user ${email}`);
				} else {
					throw mutationFailed(error.message);
				}
			}

			return newUser;
		},

		updateUser: async (
			_root: any,
			{ input: { existingEmail, updatedEmail, updatedAuth, updatedFirstName, updatedLastName, updatedPassword, updatedSecondName } }: any,
			{ authorizedUser }: any
		) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN) && !permitSelf(authorizedUser, existingEmail)) {
				throw unauthorizedError(`You are not authorized to make this query.`);
			}

			let updatedUser: User | undefined;

			try {
				updatedUser = await updateUser(existingEmail, {
					updatedEmail,
					updatedAuth,
					updatedFirstName,
					updatedLastName,
					updatedSecondName,
					updatedPassword,
				});
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return updatedUser;
		},

		deleteUser: async (_root: any, { email }: any, { authorizedUser }: any) => {
			if (!isPermitted(authorizedUser, Auth.ADMIN) && !permitSelf(authorizedUser, email)) {
				throw unauthorizedError(`You are not authorized to make this mutation.`);
			}

			let deletedUser: User | undefined;

			try {
				deletedUser = await deleteUser(email);
			} catch (error: any) {
				throw mutationFailed(error.message);
			}

			return deletedUser;
		},
	},
};
