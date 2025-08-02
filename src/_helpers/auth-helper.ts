import { Auth } from '@ampkz/auth-neo4j/dist/auth/auth';
import { User } from '@ampkz/auth-neo4j/dist/users/user';

export function isPermitted(authorizedUser: User | undefined, ...rolesPermitted: Auth[]): boolean {
	if (!authorizedUser) return false;
	return rolesPermitted.includes(authorizedUser.auth);
}

// export function permitSelf(authorizedUser: User | undefined, emailQuery: string): boolean {
// 	if (!authorizedUser) return false;
// 	return authorizedUser.email === emailQuery;
// }
