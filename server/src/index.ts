import express from "express";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { ensureDatabase } from "./setup";
import { seedAdminData } from "./data/adminSeed";
import authRouter from "./routes/auth";
import adminRouter from "./routes/admin";
import profileRouter from "./routes/profile";
import journalRouter from "./routes/journal";
import activitiesRouter from "./routes/activities";
import mentorsRouter from "./routes/mentors";
import communityRouter from "./routes/community";
import bookingsRouter from "./routes/bookings";
import assessmentRouter from "./routes/assessment";
import crewMonitoringRouter from "./routes/crew-monitoring";
import groundControlRouter from "./routes/ground-control";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true }
});
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

ensureDatabase();
seedAdminData();

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

app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/profile", profileRouter);
app.use("/journal", journalRouter);
app.use("/activities", activitiesRouter);
app.use("/mentors", mentorsRouter);
app.use("/community", communityRouter);
app.use("/bookings", bookingsRouter);
app.use("/assessment", assessmentRouter);
app.use("/crew-monitoring", crewMonitoringRouter);
app.use("/ground-control", groundControlRouter);

// Note: Static file serving disabled in dev to avoid ESM __dirname issues

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
});
