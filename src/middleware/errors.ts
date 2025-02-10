import { NextFunction, Response, Request } from "express";
import { CustomError } from "../_helpers/errors-helper";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    let code: number,
        data: any;
    
    if(err instanceof CustomError){
        code = (err as CustomError).getCode();
        data = (err as CustomError).getData();
    }else{
        code = 500,
        data = {}
    }
    
    res.status(code)
        .json({message: err.message, data });
}

export function error404(req: Request, res: Response, next: NextFunction) {
    const error: CustomError = new CustomError('Not Found', 404);
    next(error);
}