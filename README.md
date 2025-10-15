# MAITRI 🚀

**AI-Powered Multimodal Mental Health Monitoring System for Bhartiya Antariksh Station Crew**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](https://python.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?logo=tensorflow&logoColor=white)](https://tensorflow.org/)

## 📋 Table of Contents
- [Project Title](#-project-title)
- [Team Members](#-team-members)
- [Background](#-background)
- [Problem Statement](#-problem-statement)
- [Detailed Description](#-detailed-description)
- [Challenges](#-challenges)
- [Features](#-features)
- [Architecture/Technologies Used](#-architecturetechnologies-used)
- [Installation](#-installation)
- [Usage Instructions](#-usage-instructions)
- [Future Work](#-future-work)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## 🎯 Project Title

**MAITRI: Advanced Multimodal AI Assistant for Space Station Crew Mental Health Monitoring**

MAITRI (Mental Health AI for Space Station Crew) is a comprehensive AI-powered system designed to monitor and support the psychological well-being of astronauts during extended space missions at Bhartiya Antariksh Station.

## 👥 Team Members

### Core Development Team
- **Ayush Shevde** - Project Lead & Full-stack Architect
- **Manmeet Santre** - Frontend Developer (React/TypeScript)
- **Anvit Panhalkar** - Backend Developer (Node.js/Express)
- **Shreesh Jugade** - ML Engineer & AI Specialist
- **Nihar Bapat** - UI/UX Designer & Accessibility Expert
- **Ananya Munshi** - Project Manager & Video Documentation

### Advisors & Mentors
- **Professor H.B. Mali** - Academic Advisor
- **Clinical Psychologists** - Domain Experts (Team Members' Families)
- **Industry Professionals** - Technical Mentors

## 🌌 Background

As India prepares for its ambitious space program with the development of Bhartiya Antariksh Station, ensuring the mental health and psychological well-being of astronauts during long-duration space missions becomes paramount. Extended stays in space present unique challenges that traditional mental health monitoring systems cannot adequately address.

MAITRI was developed as part of Smart India Hackathon 2025 to address this critical gap, leveraging cutting-edge AI and machine learning technologies to provide real-time psychological support for space station crew.

## 🚨 Problem Statement

Space station crew members face unprecedented psychological and physiological challenges:

- **Extended Isolation**: 6-12 month missions with limited communication with Earth
- **Microgravity Effects**: Physical discomfort and disorientation affecting mental state
- **High-Stakes Environment**: Mission-critical responsibilities with zero margin for error
- **Sleep Disruption**: Irregular sleep patterns due to orbital mechanics
- **Communication Delays**: 4-20 minute delays in communication with ground control
- **Crew Dynamics**: Small team interactions in confined spaces
- **Distance from Family**: Psychological impact of separation from loved ones

Traditional mental health monitoring is reactive and insufficient for the unique demands of space missions, creating an urgent need for proactive, AI-powered psychological support systems.

## 📖 Detailed Description

MAITRI is a comprehensive multimodal AI system that provides continuous psychological monitoring and support for space station crew. The system integrates:

- **Real-time Emotion Detection**: Using facial recognition, voice analysis, and text sentiment analysis
- **AI-Powered Companionship**: Intelligent conversational AI with therapeutic techniques (both online and offline modes)
- **Predictive Analytics**: ML models forecasting mental health trends
- **Automated Intervention**: Critical issue detection with ground control alerts
- **Comprehensive Monitoring**: Integration of multiple data sources for holistic assessment

The system is designed for space station environments with **hybrid online/offline capabilities**, low-bandwidth operation, and mission-critical reliability. It seamlessly switches between online cloud services (Gemini AI) and offline local models (Llama 3.1 via Ollama) based on connectivity and mission requirements.

## 🛠️ Challenges

### Technical Challenges
- **Multimodal Data Integration**: Combining facial, vocal, and textual data for accurate emotion detection
- **Space Environment Adaptation**: Optimizing for microgravity, radiation, and limited resources
- **Real-time Processing**: Low-latency analysis with minimal computational overhead
- **Offline Operation**: Full functionality without internet connectivity
- **Data Privacy**: Secure handling of sensitive psychological data

### Domain Challenges
- **Psychological Expertise**: Developing AI responses based on evidence-based therapeutic techniques
- **Cultural Adaptation**: Hindi and English support for diverse Indian astronaut teams
- **Accessibility**: WCAG 2.1 AAA compliance for all crew members
- **Mission Integration**: Seamless integration with existing space station systems

## 🌟 Features

### 🤖 AI & ML Capabilities (Auto-detected from codebase)
- **Intelligent Chat Assistant** (`src/pages/AIChat.tsx`): NLP-powered conversations with therapeutic techniques using Gemini AI
- **TARS Interstellar AI Companion** (`Tars_Interstellar/`): Offline AI assistant inspired by TARS from Interstellar, running Llama 3.1 model locally via Ollama with voice recognition and text-to-speech capabilities
- **Mood Prediction Models** (`moodtracker/`): TensorFlow/Keras models for mental health trend forecasting with facial emotion recognition using OpenCV face detection
- **Sentiment Analysis** (`src/components/journal/`): Real-time emotion detection in journals and chats
- **Voice Emotion Detection** (`Voice/voice_assistant.py`): Advanced audio-based emotion recognition using Whisper speech-to-text, supporting English, Hindi, and Kashmiri languages with multimodal fusion
- **Multimodal Fusion**: Combined analysis of visual, audio, and textual inputs for comprehensive emotion detection

### 📊 Mental Health Tools (Auto-detected from components)
- **Digital Journaling** (`src/pages/Journal.tsx`): Secure, private journaling with AI analysis
- **Mood Tracking** (`src/pages/MoodTracker.tsx`): Visual mood charts with pattern recognition
- **Wellness Activities** (`src/data/activities.ts`): Guided meditation and mindfulness sessions
- **Assessment Tools** (`src/data/assessmentTools.ts`): Comprehensive mental health evaluations
- **Quote of the Day** (`src/components/QuoteCard.tsx`): Daily inspirational content

### 🌍 Community & Support Features
- **Peer Support Network** (`src/pages/PeerSupport.tsx`): Verified community for crew member interaction
- **Mentorship Program** (`src/pages/VolunteerMentor.tsx`): Experienced crew supporting newcomers
- **Professional Counseling** (`src/pages/BookingSession.tsx`): Session booking with Earth-based therapists
- **Anonymous Support Groups** (`src/components/activities/`): Topic-based discussion forums

### 🛡️ Security & Accessibility (Auto-detected from implementation)
- **End-to-End Encryption**: Zero-knowledge architecture for all user data
- **Multi-language Support** (`src/contexts/LanguageContext.tsx`): Hindi and English interfaces
- **WCAG 2.1 AAA Compliance**: Full accessibility for users with disabilities
- **Offline Capability**: Core features functional without internet
- **Voice Interface** (`Voice/`): Natural language processing for hands-free interaction

### 📈 Administrative Features
- **Admin Dashboard** (`src/pages/AdminDashboard.tsx`): Comprehensive monitoring interface
- **Analytics Panel** (`src/pages/Analytics.tsx`): Institution-wide mental health trends
- **User Management** (`src/pages/AdminProfiles.tsx`): Crew member profile management
- **Assessment Management** (`src/pages/AdminAssessments.tsx`): Tool customization and monitoring

## 🏗️ Architecture/Technologies Used

### Frontend Architecture
```
React 18 + TypeScript + Vite
├── UI Framework: Tailwind CSS + shadcn/ui
├── State Management: React Query + Context API
├── Routing: React Router
├── 3D Graphics: Spline
├── Charts: Chart.js + Recharts
└── Accessibility: WCAG 2.1 AAA compliant
```

### Backend Architecture
```
Node.js + Express.js + TypeScript
├── Database: SQLite with better-sqlite3
├── Authentication: JWT + bcryptjs
├── Real-time: Socket.io
├── API: RESTful endpoints
└── Middleware: CORS, security headers
```

### AI/ML Architecture
```
Python 3.8+ Ecosystem
├── Deep Learning: TensorFlow/Keras (moodtracker/)
├── NLP: BERT Models + Scikit-learn + Whisper (Voice/)
├── Voice Processing: Vosk + PyAudio + Librosa (Voice/)
├── Conversational AI: Gemini AI + Llama 3.1 via Ollama (Tars_Interstellar/)
├── Computer Vision: OpenCV face detection (moodtracker/)
└── Model Serving: Flask APIs (Voice/, moodtracker/)
```

### Key Technologies (From package.json analysis)
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, SQLite, Socket.io
- **AI/ML**: Python, TensorFlow, Scikit-learn, Gemini AI
- **Additional**: Chart.js, Spline, date-fns, bcryptjs

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or bun package manager
- Python 3.8+ (for ML components)
- Git

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd "MindMatters 2"
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set Up Environment Variables**
   ```bash
   # Create .env file in root directory
   VITE_MINDCARE_BASE_URL=http://localhost:3000
   JWT_SECRET=your_secure_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Set Up AI Components**
   ```bash
   # Mood Tracker (Facial emotion recognition)
   cd moodtracker
   pip install -r requirements.txt

   # Voice Assistant (Multimodal emotion detection)
   cd ../Voice
   pip install -r requirements.txt

   # TARS Interstellar (Offline AI companion)
   cd ../Tars_Interstellar
   npm install
   # Install Ollama and pull Llama 3.1 model:
   # ollama pull llama3.1:8b-instruct
   ```

6. **Start Development Servers**
   ```bash
   # Full Application (Frontend + Backend)
   npm run dev:full

   # Individual Components
   npm run dev          # Frontend only
   npm run dev:server   # Backend only
   ```

## 🚀 Usage Instructions

### For Space Station Crew
1. **Initial Setup**: Complete psychological baseline assessment
2. **Daily Check-ins**: Regular mood tracking and journaling
3. **AI Interaction**: Use chat assistant for immediate support
4. **Activity Engagement**: Participate in guided wellness activities
5. **Peer Connection**: Engage with crew support network
6. **Professional Support**: Book sessions with Earth-based counselors

### For Ground Control
1. **Dashboard Access**: Monitor crew psychological status
2. **Alert Management**: Respond to critical issue notifications
3. **Trend Analysis**: Review mental health patterns and predictions
4. **Intervention Planning**: Coordinate support based on AI recommendations

### API Usage Examples

**Crew Authentication:**
```javascript
POST /api/auth/login
{
  "email": "astronaut@isro.gov.in",
  "password": "securepassword"
}
```

**AI Chat Interaction:**
```javascript
POST /api/chat
{
  "message": "I'm feeling stressed about the mission timeline",
  "crewMemberId": "crew_001"
}
```

**Mood Tracking:**
```javascript
POST /api/mood/track
{
  "crewMemberId": "crew_001",
  "mood": 7,
  "notes": "Good progress on experiments today"
}
```

## 🔮 Future Work

### Immediate Enhancements
- **Advanced ML Models**: Integration of transformer-based emotion detection
- **Real-time Video Analysis**: Continuous facial expression monitoring
- **Biofeedback Integration**: Heart rate and biometric data correlation
- **Multi-crew Analysis**: Social dynamics and team psychology assessment

### Long-term Vision
- **ISRO Integration**: Direct integration with space station systems
- **International Collaboration**: Support for multinational crew missions
- **Extended Reality**: VR/AR therapeutic environments
- **Predictive Intervention**: AI-driven preventive mental health strategies

### Research Opportunities
- **Space Psychology Database**: Building comprehensive psychological datasets
- **Long-duration Studies**: Analysis of multi-year mission psychological patterns
- **Cultural Adaptation**: Cross-cultural psychological support systems

## 🤝 Contributing

We welcome contributions from developers, psychologists, and space medicine experts!

### Development Guidelines
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Follow** TypeScript and Python best practices
4. **Maintain** accessibility standards (WCAG 2.1 AAA)
5. **Test** thoroughly across all components
6. **Document** new features and API endpoints
7. **Commit** with clear messages
8. **Submit** a Pull Request with detailed description

### Code Standards
- TypeScript for frontend/backend, Python for ML components
- ESLint/Prettier for JavaScript/TypeScript
- Black for Python code formatting
- Comprehensive error handling and logging
- Security-first approach for sensitive data

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**MAITRI Development Team**
- **Email**: mindmatters.sih2025@gmail.com
- **Project Lead**: Ayush Shevde
- **Technical Lead**: Manmeet Santre

**Academic Advisor**
- **Professor H.B. Mali** - Department of Computer Engineering, [Institution]

---

**MAITRI** - Pioneering AI-powered psychological support for India's space program. 🧠🚀

*Built with ❤️ for Smart India Hackathon 2025 | Empowering Bhartiya Antariksh Station Crew*

---

**⚠️ Important Notice**
: Please do not fork, clone, or redistribute this repository without the explicit permission of the repository owner. Unauthorized use may lead to plagiarism and copyright violations. Kindly obtain consent from the owner before forking, cloning, or redistributing this repository. Thank you for your understanding.

