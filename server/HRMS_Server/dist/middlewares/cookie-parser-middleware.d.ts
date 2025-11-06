import { Request, Response, NextFunction } from 'express';
export declare function checkWhoAmI(req: Request, res: Response, next: NextFunction): void;
export declare function checkMyRole(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function checkIfIamValidEmployee(req: Request, res: Response, next: NextFunction): void;
export declare function checkIfIamEmployeeAtAll(req: Request, res: Response, next: NextFunction): Promise<void> | undefined;
export declare const verifyAccessToken: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=cookie-parser-middleware.d.ts.map