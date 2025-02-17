import { Request, Response } from "express";

export function sendStatus405(allow: string) {
    return (req: Request, res: Response) => {
        res.set('Allow', allow).status(405).end();
    }
}

export function sendStatus401(res: Response) {
    return res.set('WWW-Authenticate', `xBasic realm="${process.env.AUTH_REALM}"`).status(401).end();
}