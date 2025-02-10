import jwt, { Secret } from 'jsonwebtoken';
import { Auth } from '../auth/authorization';

export function signToken(email: string, auth: Auth, expiresIn: any): string {
    const SECRET_KEY: Secret = process.env.TOKEN_SECRET as string;
    return jwt.sign({ email, auth }, SECRET_KEY, { expiresIn });
}