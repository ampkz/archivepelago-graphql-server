import { Auth } from '../auth/authorization';

export function isValidEmail(email: string): boolean {
	const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return regex.test(email);
}

export function isValidAuth(auth: Auth): boolean {
	return Object.values(Auth).includes(auth);
}
