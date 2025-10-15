"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const setup_1 = require("./setup");
const adminSeed_1 = require("./data/adminSeed");
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const profile_1 = __importDefault(require("./routes/profile"));
const journal_1 = __importDefault(require("./routes/journal"));
const activities_1 = __importDefault(require("./routes/activities"));
const mentors_1 = __importDefault(require("./routes/mentors"));
const community_1 = __importDefault(require("./routes/community"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const assessment_1 = __importDefault(require("./routes/assessment"));
const crew_monitoring_1 = __importDefault(require("./routes/crew-monitoring"));
const ground_control_1 = __importDefault(require("./routes/ground-control"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: true, credentials: true }
});
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
(0, setup_1.ensureDatabase)();
(0, adminSeed_1.seedAdminData)();
io.on('connection', (socket) => {
    console.log('Admin connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Admin disconnected:', socket.id);
    });
});
// Make io available to routes
app.set('io', io);
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.get("/", (_req, res) => {
    res.json({
        message: "MAITRI API",
        health: "/health",
        auth: {
            signup: { method: "POST", path: "/auth/signup" },
            login: { method: "POST", path: "/auth/login" },
            logout: { method: "POST", path: "/auth/logout" }
        },
        admin: { entries: { method: "GET", path: "/admin/entries" } }
    });
});
app.use("/auth", auth_1.default);
app.use("/admin", admin_1.default);
app.use("/profile", profile_1.default);
app.use("/journal", journal_1.default);
app.use("/activities", activities_1.default);
app.use("/mentors", mentors_1.default);
app.use("/community", community_1.default);
app.use("/bookings", bookings_1.default);
app.use("/assessment", assessment_1.default);
app.use("/crew-monitoring", crew_monitoring_1.default);
app.use("/ground-control", ground_control_1.default);
// Note: Static file serving disabled in dev to avoid ESM __dirname issues
server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${PORT}`);
});
