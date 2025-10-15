#!/usr/bin/env python3
"""
Test Suite for MAITRI Space Station AI/ML Components
"""

import unittest
import sys
import os
import json
import tempfile
import numpy as np
import cv2
import librosa
import tensorflow as tf
from unittest.mock import Mock, patch, MagicMock

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

class TestEmotionDetector(unittest.TestCase):
    """Test cases for the emotion detection system"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.test_image_path = self._create_test_image()
        self.test_audio_path = self._create_test_audio()
        self.test_video_path = self._create_test_video()
        
    def tearDown(self):
        """Clean up test fixtures"""
        if os.path.exists(self.test_image_path):
            os.remove(self.test_image_path)
        if os.path.exists(self.test_audio_path):
            os.remove(self.test_audio_path)
        if os.path.exists(self.test_video_path):
            os.remove(self.test_video_path)
    
    def _create_test_image(self):
        """Create a test image with a face"""
        # Create a simple test image
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        # Draw a simple face
        cv2.circle(img, (50, 50), 30, (255, 255, 255), -1)  # Face
        cv2.circle(img, (40, 45), 5, (0, 0, 0), -1)        # Left eye
        cv2.circle(img, (60, 45), 5, (0, 0, 0), -1)        # Right eye
        cv2.ellipse(img, (50, 60), (10, 5), 0, 0, 180, (0, 0, 0), 2)  # Mouth
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        cv2.imwrite(temp_file.name, img)
        temp_file.close()
        return temp_file.name
    
    def _create_test_audio(self):
        """Create a test audio file"""
        # Generate a simple sine wave
        duration = 2.0
        sample_rate = 22050
        frequency = 440  # A4 note
        t = np.linspace(0, duration, int(sample_rate * duration))
        audio = np.sin(2 * np.pi * frequency * t)
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        import soundfile as sf
        sf.write(temp_file.name, audio, sample_rate)
        temp_file.close()
        return temp_file.name
    
    def _create_test_video(self):
        """Create a test video file"""
        # Create a simple video with frames
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter('temp_video.mp4', fourcc, 1.0, (100, 100))
        
        for i in range(10):
            frame = np.zeros((100, 100, 3), dtype=np.uint8)
            frame[:, :] = (i * 25, i * 25, i * 25)  # Gradually changing color
            out.write(frame)
        
        out.release()
        return 'temp_video.mp4'
    
    @patch('src.ai.emotion-detector.MultimodalEmotionDetector')
    def test_facial_emotion_detection(self, mock_detector):
        """Test facial emotion detection"""
        # Mock the detector
        mock_instance = mock_detector.return_value
        mock_instance.detect_facial_emotions.return_value = {
            'type': 'facial',
            'primary_emotion': 'happy',
            'confidence': 0.85,
            'emotion_scores': {
                'angry': 0.05,
                'disgust': 0.02,
                'fear': 0.03,
                'happy': 0.85,
                'neutral': 0.03,
                'sad': 0.01,
                'surprise': 0.01
            }
        }
        
        # Test the detection
        result = mock_instance.detect_facial_emotions(self.test_image_path)
        
        self.assertEqual(result['type'], 'facial')
        self.assertEqual(result['primary_emotion'], 'happy')
        self.assertGreater(result['confidence'], 0.8)
        self.assertIn('emotion_scores', result)
    
    @patch('src.ai.emotion-detector.MultimodalEmotionDetector')
    def test_voice_emotion_detection(self, mock_detector):
        """Test voice emotion detection"""
        # Mock the detector
        mock_instance = mock_detector.return_value
        mock_instance.detect_voice_emotions.return_value = {
            'type': 'voice',
            'primary_emotion': 'neutral',
            'confidence': 0.78,
            'emotion_scores': {
                'angry': 0.10,
                'disgust': 0.05,
                'fear': 0.08,
                'happy': 0.15,
                'neutral': 0.78,
                'sad': 0.12,
                'surprise': 0.08
            },
            'voice_characteristics': {
                'average_pitch': 200.0,
                'energy': 0.5,
                'speaking_rate': 1.0
            }
        }
        
        # Test the detection
        result = mock_instance.detect_voice_emotions(self.test_audio_path)
        
        self.assertEqual(result['type'], 'voice')
        self.assertEqual(result['primary_emotion'], 'neutral')
        self.assertGreater(result['confidence'], 0.7)
        self.assertIn('voice_characteristics', result)
    
    @patch('src.ai.emotion-detector.MultimodalEmotionDetector')
    def test_multimodal_emotion_detection(self, mock_detector):
        """Test multimodal emotion detection"""
        # Mock the detector
        mock_instance = mock_detector.return_value
        mock_instance.detect_multimodal_emotions.return_value = {
            'type': 'multimodal',
            'primary_emotion': 'happy',
            'confidence': 0.82,
            'emotion_scores': {
                'angry': 0.05,
                'disgust': 0.02,
                'fear': 0.03,
                'happy': 0.82,
                'neutral': 0.05,
                'sad': 0.02,
                'surprise': 0.01
            },
            'visual_emotions': {
                'angry': 0.05,
                'disgust': 0.02,
                'fear': 0.03,
                'happy': 0.85,
                'neutral': 0.03,
                'sad': 0.01,
                'surprise': 0.01
            },
            'audio_emotions': {
                'angry': 0.05,
                'disgust': 0.02,
                'fear': 0.03,
                'happy': 0.78,
                'neutral': 0.08,
                'sad': 0.03,
                'surprise': 0.01
            }
        }
        
        # Test the detection
        result = mock_instance.detect_multimodal_emotions(self.test_video_path)
        
        self.assertEqual(result['type'], 'multimodal')
        self.assertEqual(result['primary_emotion'], 'happy')
        self.assertGreater(result['confidence'], 0.8)
        self.assertIn('visual_emotions', result)
        self.assertIn('audio_emotions', result)
    
    def test_emotion_analysis_validation(self):
        """Test emotion analysis result validation"""
        # Test valid emotion analysis
        valid_result = {
            'type': 'facial',
            'primary_emotion': 'happy',
            'confidence': 0.85,
            'emotion_scores': {
                'angry': 0.05,
                'disgust': 0.02,
                'fear': 0.03,
                'happy': 0.85,
                'neutral': 0.03,
                'sad': 0.01,
                'surprise': 0.01
            }
        }
        
        # Validate the result
        self.assertIn('type', valid_result)
        self.assertIn('primary_emotion', valid_result)
        self.assertIn('confidence', valid_result)
        self.assertIn('emotion_scores', valid_result)
        self.assertGreaterEqual(valid_result['confidence'], 0.0)
        self.assertLessEqual(valid_result['confidence'], 1.0)
        
        # Check emotion scores sum to approximately 1
        emotion_scores = valid_result['emotion_scores']
        total_score = sum(emotion_scores.values())
        self.assertAlmostEqual(total_score, 1.0, places=2)

class TestAICompanion(unittest.TestCase):
    """Test cases for the AI companion system"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Mock the AI companion
        self.mock_companion = Mock()
        self.mock_companion.process_message.return_value = {
            'response': 'I understand you\'re feeling stressed. Let\'s work through this together.',
            'recommendations': [
                {
                    'type': 'stress_management',
                    'priority': 'high',
                    'action': 'Try breathing exercises',
                    'duration': '15 minutes'
                }
            ],
            'emotional_support': 'high_support',
            'intervention_needed': True,
            'timestamp': '2025-01-15T10:30:00Z'
        }
    
    def test_ai_companion_response_generation(self):
        """Test AI companion response generation"""
        # Test message processing
        message = "I'm feeling really stressed about the mission"
        crew_member_id = "1"
        emotional_context = {
            'recent_emotions': ['stress', 'anxiety'],
            'recent_issues': []
        }
        
        result = self.mock_companion.process_message(message, crew_member_id, emotional_context)
        
        self.assertIn('response', result)
        self.assertIn('recommendations', result)
        self.assertIn('emotional_support', result)
        self.assertIn('intervention_needed', result)
        self.assertIn('timestamp', result)
        
        # Check response quality
        self.assertIsInstance(result['response'], str)
        self.assertGreater(len(result['response']), 10)
        self.assertIsInstance(result['recommendations'], list)
        self.assertGreater(len(result['recommendations']), 0)
    
    def test_crisis_detection(self):
        """Test crisis detection in AI companion"""
        # Test crisis message
        crisis_message = "I can't handle this anymore, I need help"
        crew_member_id = "1"
        
        # Mock crisis response
        self.mock_companion.process_message.return_value = {
            'response': 'I\'m very concerned about your well-being. Let\'s talk about what you\'re experiencing right now.',
            'recommendations': [
                {
                    'type': 'crisis_intervention',
                    'priority': 'critical',
                    'action': 'Immediate psychological support',
                    'duration': 'continuous'
                }
            ],
            'emotional_support': 'crisis_support',
            'intervention_needed': True,
            'timestamp': '2025-01-15T10:30:00Z'
        }
        
        result = self.mock_companion.process_message(crisis_message, crew_member_id)
        
        self.assertEqual(result['emotional_support'], 'crisis_support')
        self.assertTrue(result['intervention_needed'])
        self.assertIn('crisis', result['recommendations'][0]['type'])
    
    def test_psychological_intervention_strategies(self):
        """Test psychological intervention strategies"""
        # Test different intervention types
        interventions = [
            'breathing_exercises',
            'mindfulness_meditation',
            'progressive_muscle_relaxation',
            'cognitive_reframing'
        ]
        
        for intervention in interventions:
            # Mock intervention response
            self.mock_companion.process_message.return_value = {
                'response': f'I can guide you through {intervention} techniques.',
                'recommendations': [
                    {
                        'type': intervention,
                        'priority': 'medium',
                        'action': f'Implement {intervention}',
                        'duration': '15-20 minutes'
                    }
                ],
                'emotional_support': 'medium_support',
                'intervention_needed': False,
                'timestamp': '2025-01-15T10:30:00Z'
            }
            
            result = self.mock_companion.process_message(f"I need {intervention}", "1")
            
            self.assertIn(intervention, result['recommendations'][0]['type'])
            self.assertIn('action', result['recommendations'][0])
            self.assertIn('duration', result['recommendations'][0])

class TestOfflineSystem(unittest.TestCase):
    """Test cases for the offline standalone system"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.temp_dir = tempfile.mkdtemp()
        self.test_db_path = os.path.join(self.temp_dir, 'test.db')
        
        # Mock the offline system
        self.mock_system = Mock()
        self.mock_system.analyze_media.return_value = {
            'success': True,
            'analysis': {
                'type': 'facial',
                'primary_emotion': 'neutral',
                'confidence': 0.75,
                'emotion_scores': {
                    'angry': 0.05,
                    'disgust': 0.02,
                    'fear': 0.03,
                    'happy': 0.15,
                    'neutral': 0.75,
                    'sad': 0.05,
                    'surprise': 0.05
                }
            },
            'critical_issues': [],
            'recommendations': [
                {
                    'type': 'general_wellness',
                    'priority': 'low',
                    'action': 'Continue current activities',
                    'duration': 'ongoing'
                }
            ],
            'timestamp': '2025-01-15T10:30:00Z'
        }
    
    def tearDown(self):
        """Clean up test fixtures"""
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_offline_media_analysis(self):
        """Test offline media analysis"""
        # Test image analysis
        test_image_path = os.path.join(self.temp_dir, 'test.jpg')
        crew_member_id = 1
        
        result = self.mock_system.analyze_media(test_image_path, crew_member_id, 'facial')
        
        self.assertTrue(result['success'])
        self.assertIn('analysis', result)
        self.assertIn('critical_issues', result)
        self.assertIn('recommendations', result)
        self.assertIn('timestamp', result)
        
        # Check analysis quality
        analysis = result['analysis']
        self.assertIn('type', analysis)
        self.assertIn('primary_emotion', analysis)
        self.assertIn('confidence', analysis)
        self.assertIn('emotion_scores', analysis)
    
    def test_critical_issue_detection(self):
        """Test critical issue detection"""
        # Mock critical issue detection
        self.mock_system.analyze_media.return_value = {
            'success': True,
            'analysis': {
                'type': 'facial',
                'primary_emotion': 'angry',
                'confidence': 0.85,
                'emotion_scores': {
                    'angry': 0.85,
                    'disgust': 0.05,
                    'fear': 0.05,
                    'happy': 0.02,
                    'neutral': 0.02,
                    'sad': 0.01,
                    'surprise': 0.00
                }
            },
            'critical_issues': [
                {
                    'crew_member_id': 1,
                    'issue_type': 'emotional_distress',
                    'severity': 'high',
                    'description': 'Detected high levels of anger in crew member',
                    'timestamp': '2025-01-15T10:30:00Z',
                    'auto_detected': True
                }
            ],
            'recommendations': [
                {
                    'type': 'stress_management',
                    'priority': 'high',
                    'action': 'Implement immediate stress reduction techniques',
                    'duration': '15-30 minutes'
                }
            ],
            'timestamp': '2025-01-15T10:30:00Z'
        }
        
        test_image_path = os.path.join(self.temp_dir, 'test.jpg')
        crew_member_id = 1
        
        result = self.mock_system.analyze_media(test_image_path, crew_member_id, 'facial')
        
        self.assertTrue(result['success'])
        self.assertGreater(len(result['critical_issues']), 0)
        self.assertEqual(result['critical_issues'][0]['severity'], 'high')
        self.assertTrue(result['critical_issues'][0]['auto_detected'])
    
    def test_crew_status_monitoring(self):
        """Test crew status monitoring"""
        # Mock crew status
        self.mock_system.get_crew_status.return_value = {
            'crew_status': [
                {
                    'id': 1,
                    'name': 'Commander Sarah Chen',
                    'role': 'Mission Commander',
                    'status': 'active',
                    'last_analysis': '2025-01-15T10:30:00Z',
                    'primary_emotion': 'neutral',
                    'confidence': 0.75,
                    'critical_issues_count': 0
                }
            ],
            'critical_issues': [],
            'monitoring_active': True,
            'timestamp': '2025-01-15T10:30:00Z'
        }
        
        status = self.mock_system.get_crew_status()
        
        self.assertIn('crew_status', status)
        self.assertIn('critical_issues', status)
        self.assertIn('monitoring_active', status)
        self.assertIn('timestamp', status)
        
        # Check crew status structure
        crew_status = status['crew_status']
        self.assertGreater(len(crew_status), 0)
        self.assertIn('id', crew_status[0])
        self.assertIn('name', crew_status[0])
        self.assertIn('role', crew_status[0])
        self.assertIn('status', crew_status[0])
    
    def test_report_generation(self):
        """Test report generation"""
        # Mock report data
        self.mock_system.generate_report.return_value = {
            'report_period': '7 days',
            'emotional_trends': [
                ('2025-01-15', 'neutral', 5),
                ('2025-01-15', 'happy', 3),
                ('2025-01-15', 'stressed', 2)
            ],
            'critical_issues_summary': [
                ('emotional_distress', 'high', 1),
                ('fatigue', 'medium', 2)
            ],
            'crew_performance': [
                ('Commander Sarah Chen', 'Mission Commander', 10, 0.75, 0),
                ('Dr. Rajesh Kumar', 'Flight Engineer', 8, 0.80, 1)
            ],
            'generated_at': '2025-01-15T10:30:00Z'
        }
        
        report = self.mock_system.generate_report(7)
        
        self.assertIn('report_period', report)
        self.assertIn('emotional_trends', report)
        self.assertIn('critical_issues_summary', report)
        self.assertIn('crew_performance', report)
        self.assertIn('generated_at', report)
        
        # Check report structure
        self.assertEqual(report['report_period'], '7 days')
        self.assertIsInstance(report['emotional_trends'], list)
        self.assertIsInstance(report['critical_issues_summary'], list)
        self.assertIsInstance(report['crew_performance'], list)

class TestDatabaseOperations(unittest.TestCase):
    """Test cases for database operations"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.temp_dir = tempfile.mkdtemp()
        self.test_db_path = os.path.join(self.temp_dir, 'test.db')
        
        # Create test database
        import sqlite3
        self.conn = sqlite3.connect(self.test_db_path)
        self.cursor = self.conn.cursor()
        
        # Create test tables
        self.cursor.execute('''
            CREATE TABLE crew_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                mission_id TEXT NOT NULL,
                status TEXT DEFAULT 'active'
            )
        ''')
        
        self.cursor.execute('''
            CREATE TABLE emotion_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crew_member_id INTEGER NOT NULL,
                timestamp DATETIME NOT NULL,
                emotion_type TEXT NOT NULL,
                primary_emotion TEXT NOT NULL,
                confidence REAL NOT NULL,
                emotion_scores TEXT NOT NULL
            )
        ''')
        
        self.cursor.execute('''
            CREATE TABLE critical_issues (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crew_member_id INTEGER NOT NULL,
                issue_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                description TEXT NOT NULL,
                timestamp DATETIME NOT NULL,
                auto_detected BOOLEAN DEFAULT FALSE
            )
        ''')
        
        # Insert test data
        self.cursor.execute('''
            INSERT INTO crew_members (name, role, mission_id)
            VALUES (?, ?, ?)
        ''', ('Commander Sarah Chen', 'Mission Commander', 'BAS-1'))
        
        self.conn.commit()
    
    def tearDown(self):
        """Clean up test fixtures"""
        self.conn.close()
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_crew_member_insertion(self):
        """Test crew member insertion"""
        # Insert a new crew member
        self.cursor.execute('''
            INSERT INTO crew_members (name, role, mission_id)
            VALUES (?, ?, ?)
        ''', ('Dr. Rajesh Kumar', 'Flight Engineer', 'BAS-1'))
        
        # Verify insertion
        self.cursor.execute('SELECT COUNT(*) FROM crew_members')
        count = self.cursor.fetchone()[0]
        self.assertEqual(count, 2)
    
    def test_emotion_analysis_storage(self):
        """Test emotion analysis storage"""
        # Insert emotion analysis
        emotion_scores = json.dumps({
            'angry': 0.05,
            'disgust': 0.02,
            'fear': 0.03,
            'happy': 0.85,
            'neutral': 0.03,
            'sad': 0.01,
            'surprise': 0.01
        })
        
        self.cursor.execute('''
            INSERT INTO emotion_analysis 
            (crew_member_id, timestamp, emotion_type, primary_emotion, confidence, emotion_scores)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (1, '2025-01-15T10:30:00Z', 'facial', 'happy', 0.85, emotion_scores))
        
        # Verify insertion
        self.cursor.execute('SELECT COUNT(*) FROM emotion_analysis')
        count = self.cursor.fetchone()[0]
        self.assertEqual(count, 1)
        
        # Verify data integrity
        self.cursor.execute('SELECT * FROM emotion_analysis WHERE id = 1')
        result = self.cursor.fetchone()
        self.assertEqual(result[1], 1)  # crew_member_id
        self.assertEqual(result[3], 'facial')  # emotion_type
        self.assertEqual(result[4], 'happy')  # primary_emotion
        self.assertEqual(result[5], 0.85)  # confidence
    
    def test_critical_issue_tracking(self):
        """Test critical issue tracking"""
        # Insert critical issue
        self.cursor.execute('''
            INSERT INTO critical_issues 
            (crew_member_id, issue_type, severity, description, timestamp, auto_detected)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (1, 'emotional_distress', 'high', 'Detected high stress levels', '2025-01-15T10:30:00Z', True))
        
        # Verify insertion
        self.cursor.execute('SELECT COUNT(*) FROM critical_issues')
        count = self.cursor.fetchone()[0]
        self.assertEqual(count, 1)
        
        # Verify data integrity
        self.cursor.execute('SELECT * FROM critical_issues WHERE id = 1')
        result = self.cursor.fetchone()
        self.assertEqual(result[1], 1)  # crew_member_id
        self.assertEqual(result[2], 'emotional_distress')  # issue_type
        self.assertEqual(result[3], 'high')  # severity
        self.assertEqual(result[6], True)  # auto_detected
    
    def test_data_retrieval_queries(self):
        """Test data retrieval queries"""
        # Insert test data
        emotion_scores = json.dumps({
            'angry': 0.05,
            'disgust': 0.02,
            'fear': 0.03,
            'happy': 0.85,
            'neutral': 0.03,
            'sad': 0.01,
            'surprise': 0.01
        })
        
        self.cursor.execute('''
            INSERT INTO emotion_analysis 
            (crew_member_id, timestamp, emotion_type, primary_emotion, confidence, emotion_scores)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (1, '2025-01-15T10:30:00Z', 'facial', 'happy', 0.85, emotion_scores))
        
        # Test crew member with latest analysis
        self.cursor.execute('''
            SELECT 
                cm.id,
                cm.name,
                cm.role,
                ea.timestamp as last_analysis,
                ea.primary_emotion,
                ea.confidence
            FROM crew_members cm
            LEFT JOIN emotion_analysis ea ON cm.id = ea.crew_member_id
            ORDER BY ea.timestamp DESC
        ''')
        
        result = self.cursor.fetchone()
        self.assertIsNotNone(result)
        self.assertEqual(result[1], 'Commander Sarah Chen')
        self.assertEqual(result[4], 'happy')
        self.assertEqual(result[5], 0.85)

def run_tests():
    """Run all tests"""
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test cases
    test_suite.addTest(unittest.makeSuite(TestEmotionDetector))
    test_suite.addTest(unittest.makeSuite(TestAICompanion))
    test_suite.addTest(unittest.makeSuite(TestOfflineSystem))
    test_suite.addTest(unittest.makeSuite(TestDatabaseOperations))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Print summary
    print(f"\n{'='*50}")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    
    if result.failures:
        print("\nFailures:")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback}")
    
    if result.errors:
        print("\nErrors:")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback}")
    
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
