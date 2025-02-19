import { Driver, RecordShape, Session } from 'neo4j-driver';
import { connect } from '../utils/connection';
import { getSessionOptions } from '../../_helpers/db-helper';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/users';

export async function checkPassword(email: string, password: string): Promise<User | undefined> {
	const driver: Driver = await connect();
	const session: Session = driver.session(getSessionOptions(process.env.USERS_DB as string));
	const match: RecordShape = await session.run(`MATCH(u:User WHERE u.email = $email) RETURN u`, { email: email });

	let user: User | undefined = undefined;

	if (match.records.length === 1) {
		const matchedUser = match.records[0].get(0).properties;
		const pwdMatch = await bcrypt.compare(password, matchedUser.pwd);

		if (pwdMatch) {
			user = new User(matchedUser.email, matchedUser.auth, matchedUser.firstName, matchedUser.lastName, matchedUser.secondName);
		}
	}

	await session.close();
	await driver.close();
	return user;
}
