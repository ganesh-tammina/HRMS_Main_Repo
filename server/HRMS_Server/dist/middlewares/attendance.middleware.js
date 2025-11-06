"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kjhkhk = kjhkhk;
function kjhkhk(req, res, next) {
    if (!req.body?.EmpID || !req.body?.LogType) {
        return res
            .status(400)
            .json({ success: false, error: 'EmpID and LogType are required' });
    }
    next();
}
//# sourceMappingURL=attendance.middleware.js.map