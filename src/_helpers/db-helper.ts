export type SessionOptions = {
	database: string;
};

export function getSessionOptions(dbName: string): SessionOptions {
	return { database: `${dbName}${process.env.NODE_ENV ? `${process.env.NODE_ENV}` : ``}` };
}
