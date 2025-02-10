import { NextFunction, Response, Request } from "express";
import { CustomError } from "../_helpers/errors-helper";

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    res.status(err.getCode())
        .json({message: err.message, data: err.getData()});
}

export function error404(req: Request, res: Response, next: NextFunction) {
    const error: CustomError = new CustomError('Not Found', 404);
    next(error);
}