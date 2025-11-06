"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const index_1 = __importDefault(require("./routes/index"));
const notFound_middleware_1 = require("./middlewares/notFound.middleware");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const candidate_service_1 = __importDefault(require("./services/candidate-service")); // path to your route file
const offerDetails_1 = __importDefault(require("./services/offerDetails"));
const salary_structure_1 = __importDefault(require("./services/salary-structure"));
const attendance_route_1 = __importDefault(require("./routes/attendance-route"));
const mail_route_1 = __importDefault(require("./routes/mail-route"));
const role_crud_routes_1 = __importDefault(require("./routes/role-crud-routes"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const path_1 = __importDefault(require("path"));
const employee_login_service_1 = __importDefault(require("./services/employee-login-service"));
dotenv_1.default.config();
class Server {
    app;
    port;
    constructor() {
        this.app = (0, express_1.default)();
        const corsOptions = {
            origin: true,
            credentials: true,
            optionsSuccessStatus: 200,
        };
        this.app.use(express_1.default.json({ limit: '100mb' }));
        this.app.use((0, cors_1.default)(corsOptions));
        // Request logger
        this.app.use((req, res, next) => {
            const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
            console.log(`[${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} - from ${clientIp}`);
            next();
        });
        this.port = env_1.config.PORT;
        this.middlewares();
        this.routes();
    }
    middlewares() {
        this.app.use((0, cookie_parser_1.default)());
        this.app.use('/api/v1/login', (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 50,
            message: 'Too many sign-in attempts, please try again later',
        }));
    }
    routes() {
        // ✅ Health check first
        this.app.get('/health', async (req, res) => {
            res.status(200).json({
                status: true,
                message: '✅ HRMS Server is healthy and running',
                time: new Date().toISOString(),
            });
        });
        // ✅ Default API root route (this must come BEFORE other routers)
        this.app.get('/api', (req, res) => {
            res.status(200).json({
                status: true,
                message: '✅ HRMS API is running successfully!',
                routes: [
                    '/api/v1/login',
                    '/api/v1/test-api',
                    '/api/v1/leave-balance',
                    '/api/v1/leave-request',
                ],
                time: new Date().toISOString(),
            });
        });
        // ✅ Now attach your route modules
        this.app.use('/api', index_1.default);
        this.app.use('/api', attendance_route_1.default);
        this.app.use('/api', role_crud_routes_1.default);
        this.app.use('/', offerDetails_1.default);
        this.app.use('/', mail_route_1.default);
        this.app.use('/', salary_structure_1.default);
        this.app.use('/candidates', candidate_service_1.default);
        // ✅ Finally, keep your notFound middleware last
        this.app.use(notFound_middleware_1.notFound);
    }
    start() {
        const sslOptions = {
            key: fs_1.default.readFileSync(path_1.default.join(__dirname, '../../../ssl/privkey.pem')),
            cert: fs_1.default.readFileSync(path_1.default.join(__dirname, '../../../ssl/fullchain.pem')),
        };
        const httpsServer = https_1.default.createServer(sslOptions, this.app);
        httpsServer.listen(this.port, async () => {
            try {
                const conn = await database_1.pool.getConnection();
                if (conn) {
                    console.log(`Connected to database on host ${conn.connection.config.host}`);
                    conn.release();
                }
            }
            catch (err) {
                console.error('Database connection failed:', err);
            }
            console.log(`Server running at https://30.0.0.78:${this.port}/api`);
            // 🔥 Auto-call your role service when server starts
            try {
                const result = await employee_login_service_1.default.getEmployeeRoles(594);
                console.log('✅ Startup Role Check:', result);
            }
            catch (err) {
                console.error('❌ Error in startup role check:', err.message);
            }
        });
    }
}
const server = new Server();
server.start();
//# sourceMappingURL=server.js.map