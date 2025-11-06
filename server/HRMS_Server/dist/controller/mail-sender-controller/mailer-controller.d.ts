import { Request, Response } from "express";
export default class MailController {
    static mailsender(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=mailer-controller.d.ts.map