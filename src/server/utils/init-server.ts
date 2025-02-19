import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { initializeDBs } from '../../db/utils/init-dbs';
import dotenv from 'dotenv';
import { createUser, Errors as UserErrors } from '../../db/users/crud-user';
import { ResourceExistsError } from '../../_helpers/errors-helper';
import { User } from '../../users/users';
import { Auth } from '../../auth/authorization';

dotenv.config();

const rl = readline.createInterface({ input, output });

function fieldQ(field: string): Promise<string> {
	return new Promise(resolve => {
		rl.question(`Enter admin's ${field}: `, answer => {
			resolve(answer);
		});
	});
}

async function init() {
	await initializeDBs();

	const email = await fieldQ('email');
	const firstName = await fieldQ('first name');
	const secondName = await fieldQ('second/middle name (leave blank if none)');
	const lastName = await fieldQ('last name');

	const user: User = new User(email, Auth.ADMIN, firstName, lastName, secondName);

	try {
		await createUser(user, email);
	} catch (error) {
		if (error instanceof ResourceExistsError && (error as ResourceExistsError).getData().info === UserErrors.USER_ALREADY_EXISTS) {
			console.error(`user ${email} already exists`);
		}
	}

	rl.close();
}

init();
