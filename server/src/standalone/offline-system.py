#!/usr/bin/env python3
"""
Standalone Offline System for Space Station Crew Mental Health Monitoring
This system can run independently without internet connection
"""

import os
import sys
import json
import sqlite3
import logging
import threading
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import cv2
import numpy as np
import librosa
import tensorflow as tf
from tensorflow.keras.models import load_model
import queue
import multiprocessing as mp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('space_station_monitoring.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class OfflineSpaceStationSystem:
    def __init__(self, data_dir: str = "./space_station_data"):
        """
        Initialize the offline space station monitoring system
        
        Args:
            data_dir: Directory to store all data and models
        """
        self.data_dir = data_dir
        self.db_path = os.path.join(data_dir, "crew_monitoring.db")
        self.models_dir = os.path.join(data_dir, "models")
        self.uploads_dir = os.path.join(data_dir, "uploads")
        self.alerts_dir = os.path.join(data_dir, "alerts")
        
        # Create directories
        for directory in [data_dir, self.models_dir, self.uploads_dir, self.alerts_dir]:
            os.makedirs(directory, exist_ok=True)
        
        # Initialize components
        self.emotion_detector = None
        self.ai_companion = None
        self.monitoring_active = False
        self.crew_members = {}
        self.critical_thresholds = {
            'stress': 0.7,
            'depression': 0.6,
            'anxiety': 0.8,
            'isolation': 0.5
        }
        
        # Initialize database
        self._init_database()
        
        # Load models
        self._load_models()
        
        # Initialize AI companion
        self._init_ai_companion()
        
        logger.info("Offline Space Station System initialized successfully")
    
    def _init_database(self):
        """Initialize the SQLite database for offline operation"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Crew members table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS crew_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                mission_id TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                join_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Emotion analysis table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS emotion_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crew_member_id INTEGER NOT NULL,
                timestamp DATETIME NOT NULL,
                emotion_type TEXT NOT NULL,
                primary_emotion TEXT NOT NULL,
                confidence REAL NOT NULL,
                emotion_scores TEXT NOT NULL,
                analysis_data TEXT,
                file_path TEXT,
                location TEXT,
                FOREIGN KEY (crew_member_id) REFERENCES crew_members(id)
            )
        ''')
        
        # Critical issues table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS critical_issues (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crew_member_id INTEGER NOT NULL,
                issue_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                description TEXT NOT NULL,
                timestamp DATETIME NOT NULL,
                auto_detected BOOLEAN DEFAULT FALSE,
                resolved BOOLEAN DEFAULT FALSE,
                resolved_at DATETIME,
                FOREIGN KEY (crew_member_id) REFERENCES crew_members(id)
            )
        ''')
        
        # AI companion conversations
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ai_conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crew_member_id INTEGER NOT NULL,
                user_message TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                timestamp DATETIME NOT NULL,
                emotional_context TEXT,
                FOREIGN KEY (crew_member_id) REFERENCES crew_members(id)
            )
        ''')
        
        # System alerts
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS system_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp DATETIME NOT NULL,
                crew_member_id INTEGER,
                acknowledged BOOLEAN DEFAULT FALSE,
                acknowledged_at DATETIME,
                FOREIGN KEY (crew_member_id) REFERENCES crew_members(id)
            )
        ''')
        
        # Wellness metrics
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS wellness_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crew_member_id INTEGER NOT NULL,
                metric_type TEXT NOT NULL,
                value REAL NOT NULL,
                unit TEXT,
                timestamp DATETIME NOT NULL,
                location TEXT,
                FOREIGN KEY (crew_member_id) REFERENCES crew_members(id)
            )
        ''')
        
        conn.commit()
        conn.close()
        
        # Insert default crew members
        self._seed_crew_data()
    
    def _seed_crew_data(self):
        """Seed the database with default crew members"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        crew_members = [
            ("Commander Sarah Chen", "Mission Commander", "BAS-1"),
            ("Dr. Rajesh Kumar", "Flight Engineer", "BAS-1"),
            ("Lt. Maria Rodriguez", "Payload Specialist", "BAS-1"),
            ("Dr. Alexei Volkov", "Mission Specialist", "BAS-1"),
            ("Captain Li Wei", "Pilot", "BAS-1"),
            ("Dr. Priya Sharma", "Science Officer", "BAS-1")
        ]
        
        for name, role, mission_id in crew_members:
            cursor.execute('''
                INSERT OR IGNORE INTO crew_members (name, role, mission_id)
                VALUES (?, ?, ?)
            ''', (name, role, mission_id))
        
        conn.commit()
        conn.close()
    
    def _load_models(self):
        """Load pre-trained models for emotion detection"""
        try:
            # Try to load existing models
            facial_model_path = os.path.join(self.models_dir, "facial_emotion_model.h5")
            voice_model_path = os.path.join(self.models_dir, "voice_emotion_model.h5")
            
            if os.path.exists(facial_model_path):
                self.facial_model = load_model(facial_model_path)
                logger.info("Loaded facial emotion model")
            else:
                self.facial_model = self._create_dummy_facial_model()
                logger.warning("Using dummy facial emotion model")
            
            if os.path.exists(voice_model_path):
                self.voice_model = load_model(voice_model_path)
                logger.info("Loaded voice emotion model")
            else:
                self.voice_model = self._create_dummy_voice_model()
                logger.warning("Using dummy voice emotion model")
            
            # Initialize face detection
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.facial_model = self._create_dummy_facial_model()
            self.voice_model = self._create_dummy_voice_model()
    
    def _create_dummy_facial_model(self):
        """Create a dummy facial emotion model for development"""
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_shape=(48, 48, 1)),
            tf.keras.layers.Dropout(0.5),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(7, activation='softmax')
        ])
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        return model
    
    def _create_dummy_voice_model(self):
        """Create a dummy voice emotion model for development"""
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_shape=(26,)),
            tf.keras.layers.Dropout(0.5),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(7, activation='softmax')
        ])
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        return model
    
    def _init_ai_companion(self):
        """Initialize the AI companion system"""
        try:
            # Import the AI companion module
            sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ai'))
            from ai_companion import AISpaceCompanion
            
            self.ai_companion = AISpaceCompanion()
            logger.info("AI companion system initialized")
        except Exception as e:
            logger.error(f"Error initializing AI companion: {e}")
            self.ai_companion = None
    
    def start_monitoring(self, crew_member_id: int, monitoring_type: str = "continuous"):
        """
        Start monitoring a crew member
        
        Args:
            crew_member_id: ID of the crew member to monitor
            monitoring_type: Type of monitoring (continuous, periodic, on-demand)
        """
        try:
            self.monitoring_active = True
            self.crew_members[crew_member_id] = {
                'monitoring_type': monitoring_type,
                'start_time': datetime.now(),
                'last_analysis': None,
                'status': 'active'
            }
            
            logger.info(f"Started monitoring crew member {crew_member_id}")
            
            # Start monitoring thread
            monitoring_thread = threading.Thread(
                target=self._monitoring_loop,
                args=(crew_member_id,),
                daemon=True
            )
            monitoring_thread.start()
            
            return True
            
        except Exception as e:
            logger.error(f"Error starting monitoring: {e}")
            return False
    
    def stop_monitoring(self, crew_member_id: int):
        """Stop monitoring a crew member"""
        try:
            if crew_member_id in self.crew_members:
                self.crew_members[crew_member_id]['status'] = 'stopped'
                del self.crew_members[crew_member_id]
                logger.info(f"Stopped monitoring crew member {crew_member_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error stopping monitoring: {e}")
            return False
    
    def analyze_media(self, file_path: str, crew_member_id: int, 
                     analysis_type: str = "auto") -> Dict:
        """
        Analyze media file for emotions
        
        Args:
            file_path: Path to the media file
            crew_member_id: ID of the crew member
            analysis_type: Type of analysis (facial, voice, auto)
            
        Returns:
            Dictionary containing analysis results
        """
        try:
            # Determine analysis type based on file extension
            if analysis_type == "auto":
                file_ext = os.path.splitext(file_path)[1].lower()
                if file_ext in ['.jpg', '.jpeg', '.png']:
                    analysis_type = "facial"
                elif file_ext in ['.wav', '.mp3', '.m4a']:
                    analysis_type = "voice"
                elif file_ext in ['.mp4', '.avi', '.mov']:
                    analysis_type = "multimodal"
                else:
                    return {"error": "Unsupported file type"}
            
            # Perform analysis based on type
            if analysis_type == "facial":
                result = self._analyze_facial_emotion(file_path)
            elif analysis_type == "voice":
                result = self._analyze_voice_emotion(file_path)
            elif analysis_type == "multimodal":
                result = self._analyze_multimodal_emotion(file_path)
            else:
                return {"error": "Invalid analysis type"}
            
            # Store results in database
            self._store_analysis_result(crew_member_id, result, file_path)
            
            # Check for critical issues
            critical_issues = self._check_critical_issues(crew_member_id, result)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(result)
            
            return {
                "success": True,
                "analysis": result,
                "critical_issues": critical_issues,
                "recommendations": recommendations,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing media: {e}")
            return {"error": str(e)}
    
    def _analyze_facial_emotion(self, image_path: str) -> Dict:
        """Analyze facial emotions in an image"""
        try:
            # Load and preprocess image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
            )
            
            if len(faces) == 0:
                return self._create_empty_emotion_result("facial")
            
            # Process first detected face
            x, y, w, h = faces[0]
            face_roi = gray[y:y+h, x:x+w]
            face_resized = cv2.resize(face_roi, (48, 48))
            
            # Normalize and reshape for model
            face_normalized = face_resized.astype('float32') / 255.0
            face_input = np.expand_dims(face_normalized, axis=0)
            face_input = np.expand_dims(face_input, axis=-1)
            
            # Predict emotions
            predictions = self.facial_model.predict(face_input, verbose=0)
            emotion_scores = predictions[0]
            
            # Get primary emotion
            emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
            primary_emotion_idx = np.argmax(emotion_scores)
            primary_emotion = emotion_labels[primary_emotion_idx]
            confidence = float(emotion_scores[primary_emotion_idx])
            
            return {
                "type": "facial",
                "primary_emotion": primary_emotion,
                "confidence": confidence,
                "emotion_scores": dict(zip(emotion_labels, emotion_scores.tolist())),
                "face_count": len(faces),
                "face_region": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)}
            }
            
        except Exception as e:
            logger.error(f"Error in facial emotion analysis: {e}")
            return self._create_empty_emotion_result("facial")
    
    def _analyze_voice_emotion(self, audio_path: str) -> Dict:
        """Analyze voice emotions in an audio file"""
        try:
            # Load audio file
            y, sr = librosa.load(audio_path, sr=22050)
            
            # Extract audio features
            features = self._extract_audio_features(y, sr)
            
            # Predict emotions
            predictions = self.voice_model.predict(features.reshape(1, -1), verbose=0)
            emotion_scores = predictions[0]
            
            # Get primary emotion
            emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
            primary_emotion_idx = np.argmax(emotion_scores)
            primary_emotion = emotion_labels[primary_emotion_idx]
            confidence = float(emotion_scores[primary_emotion_idx])
            
            # Analyze voice characteristics
            voice_analysis = self._analyze_voice_characteristics(y, sr)
            
            return {
                "type": "voice",
                "primary_emotion": primary_emotion,
                "confidence": confidence,
                "emotion_scores": dict(zip(emotion_labels, emotion_scores.tolist())),
                "voice_characteristics": voice_analysis,
                "audio_metadata": {
                    "duration": len(y) / sr,
                    "sample_rate": sr,
                    "channels": 1
                }
            }
            
        except Exception as e:
            logger.error(f"Error in voice emotion analysis: {e}")
            return self._create_empty_emotion_result("voice")
    
    def _analyze_multimodal_emotion(self, video_path: str) -> Dict:
        """Analyze emotions from video (both visual and audio)"""
        try:
            # Extract frames from video
            cap = cv2.VideoCapture(video_path)
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # Sample frames for analysis
            frames = []
            for i in range(0, frame_count, int(fps)):  # Sample every second
                cap.set(cv2.CAP_PROP_POS_FRAMES, i)
                ret, frame = cap.read()
                if ret:
                    frames.append(frame)
            
            cap.release()
            
            # Analyze frames
            frame_emotions = []
            for frame in frames:
                # Save temporary frame
                temp_path = f"temp_frame_{datetime.now().timestamp()}.jpg"
                cv2.imwrite(temp_path, frame)
                
                # Analyze frame
                frame_result = self._analyze_facial_emotion(temp_path)
                frame_emotions.append(frame_result)
                
                # Clean up
                os.remove(temp_path)
            
            # Extract audio from video
            audio_path = f"temp_audio_{datetime.now().timestamp()}.wav"
            os.system(f"ffmpeg -i {video_path} -vn -acodec pcm_s16le -ar 22050 -ac 1 {audio_path}")
            
            # Analyze audio
            audio_result = self._analyze_voice_emotion(audio_path)
            
            # Clean up
            os.remove(audio_path)
            
            # Fuse results
            return self._fuse_multimodal_results(frame_emotions, audio_result)
            
        except Exception as e:
            logger.error(f"Error in multimodal emotion analysis: {e}")
            return self._create_empty_emotion_result("multimodal")
    
    def _extract_audio_features(self, y, sr):
        """Extract audio features for emotion detection"""
        # Extract MFCC features
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfccs_mean = np.mean(mfccs, axis=1)
        
        # Extract spectral features
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)
        spectral_centroids_mean = np.mean(spectral_centroids)
        
        # Extract zero crossing rate
        zcr = librosa.feature.zero_crossing_rate(y)
        zcr_mean = np.mean(zcr)
        
        # Extract chroma features
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)
        
        # Combine features
        features = np.concatenate([
            mfccs_mean,
            [spectral_centroids_mean],
            [zcr_mean],
            chroma_mean
        ])
        
        return features
    
    def _analyze_voice_characteristics(self, y, sr):
        """Analyze voice characteristics"""
        # Calculate pitch
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        pitch_values = []
        for t in range(pitches.shape[1]):
            index = magnitudes[:, t].argmax()
            pitch = pitches[index, t]
            if pitch > 0:
                pitch_values.append(pitch)
        
        avg_pitch = np.mean(pitch_values) if pitch_values else 0
        
        # Calculate energy
        energy = np.sum(y**2) / len(y)
        
        # Calculate speaking rate
        speaking_rate = len(y) / sr
        
        return {
            "average_pitch": float(avg_pitch),
            "energy": float(energy),
            "speaking_rate": float(speaking_rate)
        }
    
    def _fuse_multimodal_results(self, frame_emotions, audio_result):
        """Fuse results from multiple modalities"""
        # Average emotions across frames
        frame_emotion_avg = {}
        emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
        
        for emotion in emotion_labels:
            frame_emotion_avg[emotion] = np.mean([
                frame.get('emotion_scores', {}).get(emotion, 0) for frame in frame_emotions
            ])
        
        # Combine with audio results
        if 'emotion_scores' in audio_result:
            combined_emotions = {}
            for emotion in emotion_labels:
                combined_emotions[emotion] = (
                    frame_emotion_avg.get(emotion, 0) * 0.6 +  # Visual weight
                    audio_result['emotion_scores'].get(emotion, 0) * 0.4  # Audio weight
                )
        else:
            combined_emotions = frame_emotion_avg
        
        # Get primary emotion
        primary_emotion = max(combined_emotions, key=combined_emotions.get)
        confidence = combined_emotions[primary_emotion]
        
        return {
            "type": "multimodal",
            "primary_emotion": primary_emotion,
            "confidence": float(confidence),
            "emotion_scores": combined_emotions,
            "visual_emotions": frame_emotion_avg,
            "audio_emotions": audio_result.get('emotion_scores', {}),
            "frame_count": len(frame_emotions),
            "audio_characteristics": audio_result.get('voice_characteristics', {})
        }
    
    def _create_empty_emotion_result(self, analysis_type: str) -> Dict:
        """Create empty emotion result for error cases"""
        emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
        return {
            "type": analysis_type,
            "primary_emotion": "neutral",
            "confidence": 0.0,
            "emotion_scores": {emotion: 0.0 for emotion in emotion_labels},
            "error": True
        }
    
    def _store_analysis_result(self, crew_member_id: int, result: Dict, file_path: str):
        """Store analysis result in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO emotion_analysis 
            (crew_member_id, timestamp, emotion_type, primary_emotion, confidence, 
             emotion_scores, analysis_data, file_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            crew_member_id,
            datetime.now().isoformat(),
            result.get('type', 'unknown'),
            result.get('primary_emotion', 'neutral'),
            result.get('confidence', 0.0),
            json.dumps(result.get('emotion_scores', {})),
            json.dumps(result),
            file_path
        ))
        
        conn.commit()
        conn.close()
    
    def _check_critical_issues(self, crew_member_id: int, result: Dict) -> List[Dict]:
        """Check for critical issues based on analysis result"""
        critical_issues = []
        
        emotion_scores = result.get('emotion_scores', {})
        primary_emotion = result.get('primary_emotion', 'neutral')
        confidence = result.get('confidence', 0.0)
        
        # Check for high stress indicators
        if (emotion_scores.get('angry', 0) > self.critical_thresholds['stress'] or 
            emotion_scores.get('fear', 0) > self.critical_thresholds['anxiety']):
            critical_issues.append({
                'crew_member_id': crew_member_id,
                'issue_type': 'emotional_distress',
                'severity': 'high' if confidence > 0.8 else 'medium',
                'description': f'Detected high levels of {primary_emotion} in crew member',
                'timestamp': datetime.now().isoformat(),
                'auto_detected': True
            })
        
        # Check for depression indicators
        if emotion_scores.get('sad', 0) > self.critical_thresholds['depression']:
            critical_issues.append({
                'crew_member_id': crew_member_id,
                'issue_type': 'depression',
                'severity': 'medium',
                'description': 'Detected signs of sadness or depression',
                'timestamp': datetime.now().isoformat(),
                'auto_detected': True
            })
        
        # Store critical issues in database
        if critical_issues:
            self._store_critical_issues(critical_issues)
        
        return critical_issues
    
    def _store_critical_issues(self, critical_issues: List[Dict]):
        """Store critical issues in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for issue in critical_issues:
            cursor.execute('''
                INSERT INTO critical_issues 
                (crew_member_id, issue_type, severity, description, timestamp, auto_detected)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                issue['crew_member_id'],
                issue['issue_type'],
                issue['severity'],
                issue['description'],
                issue['timestamp'],
                issue['auto_detected']
            ))
        
        conn.commit()
        conn.close()
    
    def _generate_recommendations(self, result: Dict) -> List[Dict]:
        """Generate recommendations based on analysis result"""
        recommendations = []
        
        emotion_scores = result.get('emotion_scores', {})
        primary_emotion = result.get('primary_emotion', 'neutral')
        
        if emotion_scores.get('angry', 0) > 0.6 or emotion_scores.get('fear', 0) > 0.6:
            recommendations.append({
                'type': 'stress_management',
                'priority': 'high',
                'action': 'Implement stress reduction techniques',
                'techniques': ['breathing_exercises', 'mindfulness', 'physical_exercise'],
                'duration': '15-30 minutes'
            })
        
        if emotion_scores.get('sad', 0) > 0.5:
            recommendations.append({
                'type': 'emotional_support',
                'priority': 'medium',
                'action': 'Provide emotional support and companionship',
                'techniques': ['ai_companion', 'crew_interaction', 'ground_communication'],
                'duration': '30-60 minutes'
            })
        
        return recommendations
    
    def _monitoring_loop(self, crew_member_id: int):
        """Main monitoring loop for continuous monitoring"""
        while (self.monitoring_active and 
               crew_member_id in self.crew_members and 
               self.crew_members[crew_member_id]['status'] == 'active'):
            
            try:
                # Check for new media files to analyze
                # This would typically involve checking a directory or queue
                # For now, we'll just log the monitoring status
                logger.info(f"Monitoring crew member {crew_member_id}")
                
                # Sleep for monitoring interval
                time.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(60)
    
    def get_crew_status(self) -> Dict:
        """Get current status of all crew members"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get crew members with their latest analysis
        cursor.execute('''
            SELECT 
                cm.id,
                cm.name,
                cm.role,
                cm.status,
                ea.timestamp as last_analysis,
                ea.primary_emotion,
                ea.confidence,
                COUNT(ci.id) as critical_issues_count
            FROM crew_members cm
            LEFT JOIN emotion_analysis ea ON cm.id = ea.crew_member_id
            LEFT JOIN critical_issues ci ON cm.id = ci.crew_member_id 
                AND ci.timestamp >= datetime('now', '-24 hours')
                AND ci.resolved = 0
            GROUP BY cm.id
            ORDER BY ea.timestamp DESC
        ''')
        
        crew_status = cursor.fetchall()
        
        # Get recent critical issues
        cursor.execute('''
            SELECT 
                ci.*,
                cm.name as crew_member_name
            FROM critical_issues ci
            JOIN crew_members cm ON ci.crew_member_id = cm.id
            WHERE ci.timestamp >= datetime('now', '-24 hours')
            ORDER BY ci.timestamp DESC
        ''')
        
        critical_issues = cursor.fetchall()
        
        conn.close()
        
        return {
            'crew_status': crew_status,
            'critical_issues': critical_issues,
            'monitoring_active': self.monitoring_active,
            'timestamp': datetime.now().isoformat()
        }
    
    def generate_report(self, days: int = 7) -> Dict:
        """Generate a comprehensive report for ground control"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get emotional trends
        cursor.execute('''
            SELECT 
                DATE(timestamp) as date,
                primary_emotion,
                COUNT(*) as count
            FROM emotion_analysis 
            WHERE timestamp >= datetime('now', '-{} days')
            GROUP BY DATE(timestamp), primary_emotion
            ORDER BY date DESC
        '''.format(days))
        
        emotional_trends = cursor.fetchall()
        
        # Get critical issues summary
        cursor.execute('''
            SELECT 
                issue_type,
                severity,
                COUNT(*) as count
            FROM critical_issues 
            WHERE timestamp >= datetime('now', '-{} days')
            GROUP BY issue_type, severity
        '''.format(days))
        
        critical_issues_summary = cursor.fetchall()
        
        # Get crew performance metrics
        cursor.execute('''
            SELECT 
                cm.name,
                cm.role,
                COUNT(ea.id) as total_analyses,
                AVG(ea.confidence) as avg_confidence,
                COUNT(ci.id) as critical_issues
            FROM crew_members cm
            LEFT JOIN emotion_analysis ea ON cm.id = ea.crew_member_id 
                AND ea.timestamp >= datetime('now', '-{} days')
            LEFT JOIN critical_issues ci ON cm.id = ci.crew_member_id 
                AND ci.timestamp >= datetime('now', '-{} days')
            GROUP BY cm.id, cm.name, cm.role
        '''.format(days, days))
        
        crew_performance = cursor.fetchall()
        
        conn.close()
        
        return {
            'report_period': f'{days} days',
            'emotional_trends': emotional_trends,
            'critical_issues_summary': critical_issues_summary,
            'crew_performance': crew_performance,
            'generated_at': datetime.now().isoformat()
        }

def main():
    """Main function for running the offline system"""
    if len(sys.argv) < 2:
        print("Usage: python offline-system.py <command> [options]")
        print("Commands: start, stop, analyze, status, report")
        sys.exit(1)
    
    command = sys.argv[1]
    system = OfflineSpaceStationSystem()
    
    if command == "start":
        if len(sys.argv) < 3:
            print("Usage: python offline-system.py start <crew_member_id>")
            sys.exit(1)
        
        crew_member_id = int(sys.argv[2])
        success = system.start_monitoring(crew_member_id)
        print(f"Monitoring started: {success}")
        
    elif command == "stop":
        if len(sys.argv) < 3:
            print("Usage: python offline-system.py stop <crew_member_id>")
            sys.exit(1)
        
        crew_member_id = int(sys.argv[2])
        success = system.stop_monitoring(crew_member_id)
        print(f"Monitoring stopped: {success}")
        
    elif command == "analyze":
        if len(sys.argv) < 4:
            print("Usage: python offline-system.py analyze <file_path> <crew_member_id>")
            sys.exit(1)
        
        file_path = sys.argv[2]
        crew_member_id = int(sys.argv[3])
        result = system.analyze_media(file_path, crew_member_id)
        print(json.dumps(result, indent=2))
        
    elif command == "status":
        status = system.get_crew_status()
        print(json.dumps(status, indent=2))
        
    elif command == "report":
        days = int(sys.argv[2]) if len(sys.argv) > 2 else 7
        report = system.generate_report(days)
        print(json.dumps(report, indent=2))
        
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
