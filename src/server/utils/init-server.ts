import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { initializeDB } from '../../db/utils/init-db';
import dotenv from 'dotenv';
import { User } from '@ampkz/auth-neo4j/user';
import { Auth } from '@ampkz/auth-neo4j/auth';
import { initUser, initializeDB as initUserDB } from '@ampkz/auth-neo4j/db';

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
	await initializeDB();
	await initUserDB();

	if (process.env.NODE_ENV === 'production') {
		const email = await fieldQ('email');
		const firstName = await fieldQ('first name');
		const secondName = await fieldQ('second/middle name (leave blank if none)');
		const lastName = await fieldQ('last name');

		const user: User = new User({ email, auth: Auth.ADMIN, firstName, lastName, secondName });

		await initUser(user, user.email);

		rl.close();
	} else {
		const user: User = new User({ email: 'admin@dev', auth: Auth.ADMIN });
		await initUser(user, user.email);
	}

	process.exit(0);
}

init();
