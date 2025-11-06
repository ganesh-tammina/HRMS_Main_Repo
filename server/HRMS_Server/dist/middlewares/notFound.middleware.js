"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
function notFound(req, res, next) {
    res.status(404).json({
        status: false,
        message: `Not Found - ${req.originalUrl}`,
    });
}
//# sourceMappingURL=notFound.middleware.js.map