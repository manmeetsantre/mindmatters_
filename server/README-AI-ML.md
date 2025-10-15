# MAITRI Space Station Crew Mental Health Monitoring System

## Backend and AI/ML Components

This document describes the complete backend and AI/ML implementation for the MAITRI space station crew mental health monitoring system.

## 🚀 System Architecture

### Core Components

1. **Multimodal Emotion Detection System**
   - Facial emotion recognition from images/video
   - Voice emotion analysis from audio
   - Multimodal fusion for comprehensive analysis

2. **AI Companion System**
   - Psychological support conversations
   - Adaptive responses based on emotional context
   - Crisis intervention capabilities

3. **Real-time Monitoring Dashboard**
   - Crew status monitoring
   - Critical issue detection and alerting
   - Ground control integration

4. **Offline Standalone System**
   - Independent operation without internet
   - Local database storage
   - Automated analysis and reporting

## 📁 Directory Structure

```
server/
├── src/
│   ├── routes/
│   │   ├── crew-monitoring.ts      # Crew monitoring endpoints
│   │   └── ground-control.ts       # Ground control dashboard
│   ├── ai/
│   │   ├── emotion-detector.py    # Multimodal emotion detection
│   │   └── ai-companion.py         # AI psychological companion
│   ├── standalone/
│   │   └── offline-system.py       # Offline standalone system
│   └── setup-crew-monitoring.ts    # Database schema for crew monitoring
├── requirements.txt                # Python dependencies
└── README-AI-ML.md                # This file
```

## 🧠 AI/ML Models

### Emotion Detection Models

#### Facial Emotion Recognition
- **Model**: CNN-based facial emotion classifier
- **Input**: 48x48 grayscale face images
- **Output**: 7 emotion classes (angry, disgust, fear, happy, neutral, sad, surprise)
- **Features**: Face detection using Haar cascades, emotion classification using CNN

#### Voice Emotion Analysis
- **Model**: MLP-based voice emotion classifier
- **Input**: 26-dimensional audio feature vector
- **Features**: MFCC, spectral centroid, zero-crossing rate, chroma features
- **Output**: 7 emotion classes matching facial emotions

#### Multimodal Fusion
- **Method**: Weighted combination of visual and audio predictions
- **Weights**: 60% visual, 40% audio
- **Output**: Fused emotion prediction with confidence scores

### AI Companion System

#### Psychological Support Templates
- **Greeting responses**: Context-aware welcome messages
- **Stress support**: Stress management guidance
- **Isolation support**: Loneliness and isolation assistance
- **Crisis intervention**: Emergency psychological support
- **Mission encouragement**: Positive reinforcement for mission success

#### Intervention Strategies
- **Breathing exercises**: 4-7-8 breathing technique
- **Mindfulness meditation**: Space-adapted meditation
- **Progressive muscle relaxation**: Microgravity relaxation techniques
- **Cognitive reframing**: Mission perspective and positive thinking

## 🗄️ Database Schema

### Core Tables

#### Crew Members
```sql
CREATE TABLE crew_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    mission_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    join_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Emotion Analysis
```sql
CREATE TABLE crew_emotion_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crew_member_id INTEGER NOT NULL,
    session_id TEXT,
    file_path TEXT,
    emotion_data TEXT NOT NULL,
    confidence_scores TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    location TEXT,
    analysis_type TEXT NOT NULL
);
```

#### Critical Issues
```sql
CREATE TABLE critical_issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crew_member_id INTEGER NOT NULL,
    issue_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    location TEXT,
    auto_detected BOOLEAN DEFAULT FALSE,
    resolved BOOLEAN DEFAULT FALSE
);
```

#### AI Companion Conversations
```sql
CREATE TABLE ai_companion_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crew_member_id INTEGER NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    emotional_context TEXT
);
```

## 🔧 API Endpoints

### Crew Monitoring Endpoints

#### Analyze Media
```http
POST /crew-monitoring/analyze-media
Content-Type: multipart/form-data

{
  "media": <file>,
  "crewMemberId": "1",
  "sessionId": "session_123",
  "location": "command_module"
}
```

#### Start Monitoring
```http
POST /crew-monitoring/start-monitoring
Content-Type: application/json

{
  "crewMemberId": "1",
  "sessionId": "session_123",
  "monitoringType": "continuous"
}
```

#### AI Companion
```http
POST /crew-monitoring/ai-companion
Content-Type: application/json

{
  "crewMemberId": "1",
  "message": "I'm feeling stressed about the mission",
  "context": {
    "recentEmotions": ["stress", "anxiety"],
    "recentIssues": []
  }
}
```

### Ground Control Endpoints

#### Dashboard
```http
GET /ground-control/dashboard
```

#### Crew Analysis
```http
GET /ground-control/crew/:crewMemberId/analysis?hours=24
```

#### Critical Issues
```http
GET /ground-control/critical-issues?severity=high&hours=24
```

#### Analytics
```http
GET /ground-control/analytics?days=7
```

## 🤖 AI Companion Features

### Emotional Context Awareness
- Analyzes recent emotional patterns
- Adapts responses based on psychological state
- Provides appropriate intervention strategies

### Crisis Detection
- Identifies high-risk emotional states
- Triggers immediate support protocols
- Escalates to ground control when necessary

### Adaptive Conversations
- Learns from crew member interactions
- Maintains conversation history
- Provides personalized support

### Psychological Interventions
- Breathing exercises for stress management
- Mindfulness techniques for space environment
- Cognitive reframing for mission perspective
- Social connection facilitation

## 📊 Real-time Monitoring

### Crew Status Dashboard
- Real-time emotional state monitoring
- Critical issue alerts
- Mission phase tracking
- System health metrics

### Alert System
- Automatic critical issue detection
- Ground control notifications
- Escalation protocols
- Acknowledgment tracking

### Analytics and Reporting
- Emotional trend analysis
- Stress level monitoring
- Crew performance metrics
- Mission success indicators

## 🔒 Offline Standalone System

### Independent Operation
- No internet connection required
- Local database storage
- Automated analysis and reporting
- Self-contained AI models

### Key Features
- Continuous crew monitoring
- Media file analysis
- Critical issue detection
- AI companion support
- Ground control reporting

### Usage
```bash
# Start monitoring a crew member
python offline-system.py start 1

# Analyze media file
python offline-system.py analyze /path/to/media.mp4 1

# Get crew status
python offline-system.py status

# Generate report
python offline-system.py report 7
```

## 🛠️ Installation and Setup

### Backend Dependencies
```bash
cd server
npm install
```

### Python AI/ML Dependencies
```bash
pip install -r requirements.txt
```

### Database Setup
The database schema is automatically created when the server starts.

### Model Training
Pre-trained models should be placed in the `models/` directory:
- `facial_emotion_model.h5`
- `voice_emotion_model.h5`
- `multimodal_fusion_model.h5`

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Offline System
```bash
python standalone/offline-system.py start <crew_member_id>
```

## 📈 Performance Considerations

### Model Optimization
- Use TensorFlow Lite for mobile deployment
- Implement model quantization for reduced size
- Optimize inference speed for real-time processing

### Database Performance
- Indexed queries for fast retrieval
- Efficient data storage and compression
- Automated cleanup of old data

### System Monitoring
- Resource usage tracking
- Performance metrics collection
- Error logging and alerting

## 🔧 Configuration

### Environment Variables
```bash
PORT=4000
NODE_ENV=production
DATABASE_PATH=./data.sqlite
MODELS_PATH=./models
UPLOADS_PATH=./uploads
```

### Model Configuration
```python
# Emotion detection thresholds
CRITICAL_THRESHOLDS = {
    'stress': 0.7,
    'depression': 0.6,
    'anxiety': 0.8,
    'isolation': 0.5
}
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### AI Model Testing
```bash
python -m pytest tests/
```

### Integration Tests
```bash
python tests/test_integration.py
```

## 📚 Documentation

### API Documentation
- Swagger/OpenAPI documentation available at `/api-docs`
- Interactive API testing interface
- Request/response examples

### Model Documentation
- Model architecture descriptions
- Training data requirements
- Performance benchmarks
- Accuracy metrics

## 🔄 Maintenance

### Model Updates
- Regular model retraining with new data
- Performance monitoring and optimization
- A/B testing for model improvements

### Database Maintenance
- Regular backups
- Data archival for long-term storage
- Performance optimization

### System Monitoring
- Health checks and alerts
- Resource usage monitoring
- Error tracking and resolution

## 🚨 Emergency Procedures

### Critical Issue Response
1. Automatic detection and alerting
2. Immediate ground control notification
3. Crew member support activation
4. Escalation to mission control

### System Failures
- Automatic failover to offline mode
- Data backup and recovery procedures
- Emergency communication protocols

## 📞 Support

### Technical Support
- System documentation and troubleshooting
- Model performance optimization
- Database maintenance and backup

### Psychological Support
- AI companion system maintenance
- Intervention strategy updates
- Crisis response protocols

---

**MAITRI Space Station Crew Mental Health Monitoring System**
*Advanced AI-powered psychological support for space missions*
