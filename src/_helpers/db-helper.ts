export type SessionOptions = {
	database: string;
};

export function getSessionOptions(dbName: string): SessionOptions {
	/* istanbul ignore next line */
	return { database: `${dbName}${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ``}` };
}
