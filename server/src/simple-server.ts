import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true }
});
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Mock data for demonstration
const mockCrewMembers = [
  { id: 1, name: "Commander Sarah Chen", role: "Mission Commander", status: "active" },
  { id: 2, name: "Dr. Rajesh Kumar", role: "Flight Engineer", status: "active" },
  { id: 3, name: "Lt. Maria Rodriguez", role: "Payload Specialist", status: "active" },
  { id: 4, name: "Dr. Alexei Volkov", role: "Mission Specialist", status: "active" },
  { id: 5, name: "Captain Li Wei", role: "Pilot", status: "active" },
  { id: 6, name: "Dr. Priya Sharma", role: "Science Officer", status: "active" }
];

const mockEmotions = [
  { id: 1, crew_member_id: 1, primary_emotion: "happy", confidence: 0.85, timestamp: new Date().toISOString() },
  { id: 2, crew_member_id: 2, primary_emotion: "neutral", confidence: 0.78, timestamp: new Date().toISOString() },
  { id: 3, crew_member_id: 3, primary_emotion: "calm", confidence: 0.92, timestamp: new Date().toISOString() }
];

const mockCriticalIssues = [
  { id: 1, crew_member_id: 1, issue_type: "emotional_distress", severity: "medium", description: "Detected stress indicators", timestamp: new Date().toISOString() }
];

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API info endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "MAITRI Space Station API",
    health: "/health",
    endpoints: {
      crew: "/crew-monitoring/*",
      groundControl: "/ground-control/*"
    }
  });
});

// Crew monitoring endpoints
app.get("/crew-monitoring/crew", (req, res) => {
  res.json({
    success: true,
    crew: mockCrewMembers
  });
});

app.get("/crew-monitoring/crew/:id/emotions", (req, res) => {
  const crewId = parseInt(req.params.id);
  const crewEmotions = mockEmotions.filter(e => e.crew_member_id === crewId);
  
  res.json({
    success: true,
    emotions: crewEmotions,
    summary: {
      dominantEmotion: crewEmotions[0]?.primary_emotion || "neutral",
      averageConfidence: crewEmotions.reduce((acc, e) => acc + e.confidence, 0) / crewEmotions.length || 0
    }
  });
});

app.post("/crew-monitoring/analyze-media", (req, res) => {
  // Mock media analysis
  const analysisResult = {
    success: true,
    analysis: {
      type: "multimodal",
      primary_emotion: "neutral",
      confidence: 0.75,
      emotion_scores: {
        angry: 0.05,
        disgust: 0.02,
        fear: 0.03,
        happy: 0.15,
        neutral: 0.75,
        sad: 0.05,
        surprise: 0.05
      }
    },
    critical_issues: [],
    recommendations: [
      {
        type: "general_wellness",
        priority: "low",
        action: "Continue current activities",
        duration: "ongoing"
      }
    ],
    timestamp: new Date().toISOString()
  };
  
  res.json(analysisResult);
});

app.post("/crew-monitoring/ai-companion", (req, res) => {
  const { message, crewMemberId } = req.body;
  
  // Mock AI companion response
  const responses = [
    "I understand you're reaching out. How can I help you today?",
    "I'm here to support you during your mission. What's on your mind?",
    "I can sense you might be feeling some stress. Let's work through this together.",
    "You're doing incredible work up here. Your mission is important and meaningful.",
    "I'm here to provide companionship and support. How are you feeling?"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  res.json({
    success: true,
    response: randomResponse,
    recommendations: [
      {
        type: "emotional_support",
        priority: "medium",
        action: "Continue conversation",
        duration: "10-15 minutes"
      }
    ],
    emotional_support: "general_support",
    intervention_needed: false,
    timestamp: new Date().toISOString()
  });
});

// Ground control endpoints
app.get("/ground-control/dashboard", (req, res) => {
  res.json({
    success: true,
    dashboard: {
      crewStatus: mockCrewMembers.map(member => ({
        ...member,
        last_analysis: new Date().toISOString(),
        primary_emotion: mockEmotions.find(e => e.crew_member_id === member.id)?.primary_emotion || "neutral",
        confidence: mockEmotions.find(e => e.crew_member_id === member.id)?.confidence || 0.5,
        critical_issues_count: mockCriticalIssues.filter(i => i.crew_member_id === member.id).length
      })),
      recentIssues: mockCriticalIssues,
      currentPhase: {
        phase_name: "Mission Operations",
        start_date: "2025-01-15T00:00:00Z",
        description: "Primary mission operations and experiments"
      },
      systemHealth: {
        active_monitoring: mockCrewMembers.length,
        unresolved_issues: mockCriticalIssues.length,
        avg_confidence: 0.8
      },
      lastUpdated: new Date().toISOString()
    }
  });
});

app.get("/ground-control/critical-issues", (req, res) => {
  res.json({
    success: true,
    issues: mockCriticalIssues,
    summary: {
      total: mockCriticalIssues.length,
      bySeverity: { medium: 1 },
      byCrewMember: { "Commander Sarah Chen": 1 }
    }
  });
});

app.get("/ground-control/analytics", (req, res) => {
  res.json({
    success: true,
    analytics: {
      timeRange: "7 days",
      emotionalDistribution: [
        { date: "2025-01-15", primary_emotion: "happy", count: 5 },
        { date: "2025-01-15", primary_emotion: "neutral", count: 3 }
      ],
      stressTrends: [
        { date: "2025-01-15", stress_level: 0.2 }
      ],
      issuesByType: [
        { issue_type: "emotional_distress", severity: "medium", count: 1 }
      ],
      crewPerformance: mockCrewMembers.map(member => ({
        name: member.name,
        role: member.role,
        total_analyses: 10,
        avg_confidence: 0.8,
        critical_issues: mockCriticalIssues.filter(i => i.crew_member_id === member.id).length
      })),
      generatedAt: new Date().toISOString()
    }
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Send real-time updates
  setInterval(() => {
    socket.emit('crew_update', {
      timestamp: new Date().toISOString(),
      crewStatus: mockCrewMembers.length,
      activeIssues: mockCriticalIssues.length
    });
  }, 30000); // Every 30 seconds
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 MAITRI Space Station API listening on http://localhost:${PORT}`);
  console.log(`📊 Ground Control Dashboard: http://localhost:${PORT}/ground-control/dashboard`);
  console.log(`👥 Crew Monitoring: http://localhost:${PORT}/crew-monitoring/crew`);
  console.log(`🤖 AI Companion: http://localhost:${PORT}/crew-monitoring/ai-companion`);
});
