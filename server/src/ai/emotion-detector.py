#!/usr/bin/env python3
"""
Advanced Multimodal Emotion Detection System for Space Station Crew Monitoring
"""

import cv2
import numpy as np
import librosa
import tensorflow as tf
from tensorflow.keras.models import load_model
import json
import os
import sys
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MultimodalEmotionDetector:
    def __init__(self, model_paths=None):
        """
        Initialize the multimodal emotion detection system
        
        Args:
            model_paths: Dictionary containing paths to pre-trained models
        """
        self.model_paths = model_paths or {
            'facial_emotion': 'models/facial_emotion_model.h5',
            'voice_emotion': 'models/voice_emotion_model.h5',
            'multimodal_fusion': 'models/multimodal_fusion_model.h5'
        }
        
        self.emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
        self.crew_stress_indicators = {
            'high_stress': ['angry', 'fear'],
            'depression': ['sad'],
            'anxiety': ['fear', 'surprise'],
            'fatigue': ['neutral', 'sad'],
            'alert': ['happy', 'surprise']
        }
        
        # Initialize models
        self.models = {}
        self._load_models()
        
        # Initialize face detection
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
    def _load_models(self):
        """Load pre-trained emotion detection models"""
        try:
            for model_name, model_path in self.model_paths.items():
                if os.path.exists(model_path):
                    self.models[model_name] = load_model(model_path)
                    logger.info(f"Loaded {model_name} model from {model_path}")
                else:
                    logger.warning(f"Model file not found: {model_path}")
                    # Create a dummy model for development
                    self.models[model_name] = self._create_dummy_model()
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            # Create dummy models for development
            for model_name in self.model_paths.keys():
                self.models[model_name] = self._create_dummy_model()
    
    def _create_dummy_model(self):
        """Create a dummy model for development/testing"""
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_shape=(48, 48, 1)),
            tf.keras.layers.Dropout(0.5),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(7, activation='softmax')
        ])
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        return model
    
    def detect_facial_emotions(self, image_path):
        """
        Detect emotions from facial expressions in an image
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary containing emotion analysis results
        """
        try:
            # Load and preprocess image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image from {image_path}")
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
            )
            
            if len(faces) == 0:
                logger.warning("No faces detected in image")
                return self._create_empty_emotion_result()
            
            # Process each detected face
            face_emotions = []
            for (x, y, w, h) in faces:
                face_roi = gray[y:y+h, x:x+w]
                face_resized = cv2.resize(face_roi, (48, 48))
                
                # Normalize and reshape for model
                face_normalized = face_resized.astype('float32') / 255.0
                face_input = np.expand_dims(face_normalized, axis=0)
                face_input = np.expand_dims(face_input, axis=-1)
                
                # Predict emotions
                predictions = self.models['facial_emotion'].predict(face_input, verbose=0)
                emotion_scores = predictions[0]
                
                # Get primary emotion
                primary_emotion_idx = np.argmax(emotion_scores)
                primary_emotion = self.emotion_labels[primary_emotion_idx]
                confidence = float(emotion_scores[primary_emotion_idx])
                
                face_emotions.append({
                    'face_id': len(face_emotions),
                    'primary_emotion': primary_emotion,
                    'confidence': confidence,
                    'all_emotions': dict(zip(self.emotion_labels, emotion_scores.tolist())),
                    'face_region': {'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h)}
                })
            
            # Aggregate results
            return self._aggregate_face_emotions(face_emotions)
            
        except Exception as e:
            logger.error(f"Error in facial emotion detection: {e}")
            return self._create_empty_emotion_result()
    
    def detect_voice_emotions(self, audio_path):
        """
        Detect emotions from voice characteristics in an audio file
        
        Args:
            audio_path: Path to the audio file
            
        Returns:
            Dictionary containing voice emotion analysis results
        """
        try:
            # Load audio file
            y, sr = librosa.load(audio_path, sr=22050)
            
            # Extract audio features
            features = self._extract_audio_features(y, sr)
            
            # Predict emotions
            predictions = self.models['voice_emotion'].predict(features.reshape(1, -1), verbose=0)
            emotion_scores = predictions[0]
            
            # Get primary emotion
            primary_emotion_idx = np.argmax(emotion_scores)
            primary_emotion = self.emotion_labels[primary_emotion_idx]
            confidence = float(emotion_scores[primary_emotion_idx])
            
            # Analyze voice characteristics
            voice_analysis = self._analyze_voice_characteristics(y, sr)
            
            return {
                'type': 'voice',
                'primary_emotion': primary_emotion,
                'confidence': confidence,
                'all_emotions': dict(zip(self.emotion_labels, emotion_scores.tolist())),
                'voice_characteristics': voice_analysis,
                'audio_metadata': {
                    'duration': len(y) / sr,
                    'sample_rate': sr,
                    'channels': 1
                }
            }
            
        except Exception as e:
            logger.error(f"Error in voice emotion detection: {e}")
            return self._create_empty_emotion_result()
    
    def detect_multimodal_emotions(self, video_path):
        """
        Detect emotions from both visual and audio components of a video
        
        Args:
            video_path: Path to the video file
            
        Returns:
            Dictionary containing multimodal emotion analysis results
        """
        try:
            cap = cv2.VideoCapture(video_path)
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # Extract frames and audio
            frames = []
            frame_timestamps = []
            
            for i in range(0, frame_count, int(fps)):  # Sample every second
                cap.set(cv2.CAP_PROP_POS_FRAMES, i)
                ret, frame = cap.read()
                if ret:
                    frames.append(frame)
                    frame_timestamps.append(i / fps)
            
            cap.release()
            
            # Analyze frames
            frame_emotions = []
            for frame, timestamp in zip(frames, frame_timestamps):
                # Save temporary frame
                temp_path = f"temp_frame_{timestamp}.jpg"
                cv2.imwrite(temp_path, frame)
                
                # Analyze frame
                frame_result = self.detect_facial_emotions(temp_path)
                frame_result['timestamp'] = timestamp
                frame_emotions.append(frame_result)
                
                # Clean up
                os.remove(temp_path)
            
            # Extract audio from video
            audio_path = f"temp_audio_{datetime.now().timestamp()}.wav"
            os.system(f"ffmpeg -i {video_path} -vn -acodec pcm_s16le -ar 22050 -ac 1 {audio_path}")
            
            # Analyze audio
            audio_result = self.detect_voice_emotions(audio_path)
            
            # Clean up
            os.remove(audio_path)
            
            # Fuse multimodal results
            fused_result = self._fuse_multimodal_results(frame_emotions, audio_result)
            
            return fused_result
            
        except Exception as e:
            logger.error(f"Error in multimodal emotion detection: {e}")
            return self._create_empty_emotion_result()
    
    def analyze_crew_stress_levels(self, emotion_data):
        """
        Analyze crew stress levels based on emotion data
        
        Args:
            emotion_data: Dictionary containing emotion analysis results
            
        Returns:
            Dictionary containing stress analysis and recommendations
        """
        try:
            stress_indicators = {
                'high_stress': 0,
                'depression': 0,
                'anxiety': 0,
                'fatigue': 0,
                'alert': 0
            }
            
            # Analyze emotion patterns
            if 'all_emotions' in emotion_data:
                emotions = emotion_data['all_emotions']
                
                for indicator, emotion_list in self.crew_stress_indicators.items():
                    for emotion in emotion_list:
                        if emotion in emotions:
                            stress_indicators[indicator] += emotions[emotion]
            
            # Determine overall stress level
            total_stress = sum(stress_indicators.values())
            stress_level = 'low'
            
            if total_stress > 0.7:
                stress_level = 'critical'
            elif total_stress > 0.5:
                stress_level = 'high'
            elif total_stress > 0.3:
                stress_level = 'medium'
            
            # Generate recommendations
            recommendations = self._generate_stress_recommendations(stress_indicators, stress_level)
            
            return {
                'stress_level': stress_level,
                'stress_indicators': stress_indicators,
                'recommendations': recommendations,
                'timestamp': datetime.now().isoformat(),
                'analysis_confidence': emotion_data.get('confidence', 0.0)
            }
            
        except Exception as e:
            logger.error(f"Error in stress analysis: {e}")
            return {
                'stress_level': 'unknown',
                'stress_indicators': {},
                'recommendations': [],
                'timestamp': datetime.now().isoformat(),
                'analysis_confidence': 0.0
            }
    
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
        """Analyze voice characteristics for additional context"""
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
        
        # Calculate speaking rate (approximate)
        speaking_rate = len(y) / sr
        
        return {
            'average_pitch': float(avg_pitch),
            'energy': float(energy),
            'speaking_rate': float(speaking_rate),
            'voice_quality': 'normal'  # Could be enhanced with more sophisticated analysis
        }
    
    def _aggregate_face_emotions(self, face_emotions):
        """Aggregate emotions from multiple faces"""
        if not face_emotions:
            return self._create_empty_emotion_result()
        
        # Average emotions across all faces
        all_emotions = {}
        for emotion in self.emotion_labels:
            all_emotions[emotion] = np.mean([
                face['all_emotions'][emotion] for face in face_emotions
            ])
        
        # Get primary emotion
        primary_emotion = max(all_emotions, key=all_emotions.get)
        confidence = all_emotions[primary_emotion]
        
        return {
            'type': 'facial',
            'primary_emotion': primary_emotion,
            'confidence': float(confidence),
            'all_emotions': all_emotions,
            'face_count': len(face_emotions),
            'individual_faces': face_emotions
        }
    
    def _fuse_multimodal_results(self, frame_emotions, audio_result):
        """Fuse results from multiple modalities"""
        # Average emotions across frames
        frame_emotion_avg = {}
        for emotion in self.emotion_labels:
            frame_emotion_avg[emotion] = np.mean([
                frame['all_emotions'][emotion] for frame in frame_emotions
                if 'all_emotions' in frame
            ])
        
        # Combine with audio results
        if 'all_emotions' in audio_result:
            combined_emotions = {}
            for emotion in self.emotion_labels:
                combined_emotions[emotion] = (
                    frame_emotion_avg.get(emotion, 0) * 0.6 +  # Visual weight
                    audio_result['all_emotions'][emotion] * 0.4  # Audio weight
                )
        else:
            combined_emotions = frame_emotion_avg
        
        # Get primary emotion
        primary_emotion = max(combined_emotions, key=combined_emotions.get)
        confidence = combined_emotions[primary_emotion]
        
        return {
            'type': 'multimodal',
            'primary_emotion': primary_emotion,
            'confidence': float(confidence),
            'all_emotions': combined_emotions,
            'visual_emotions': frame_emotion_avg,
            'audio_emotions': audio_result.get('all_emotions', {}),
            'frame_count': len(frame_emotions),
            'audio_characteristics': audio_result.get('voice_characteristics', {})
        }
    
    def _create_empty_emotion_result(self):
        """Create empty emotion result for error cases"""
        return {
            'type': 'unknown',
            'primary_emotion': 'neutral',
            'confidence': 0.0,
            'all_emotions': {emotion: 0.0 for emotion in self.emotion_labels},
            'error': True
        }
    
    def _generate_stress_recommendations(self, stress_indicators, stress_level):
        """Generate recommendations based on stress analysis"""
        recommendations = []
        
        if stress_indicators['high_stress'] > 0.5:
            recommendations.append({
                'type': 'stress_management',
                'priority': 'high',
                'action': 'Implement immediate stress reduction techniques',
                'techniques': ['breathing_exercises', 'mindfulness', 'physical_exercise'],
                'duration': '15-30 minutes'
            })
        
        if stress_indicators['depression'] > 0.4:
            recommendations.append({
                'type': 'emotional_support',
                'priority': 'high',
                'action': 'Provide emotional support and companionship',
                'techniques': ['ai_companion', 'crew_interaction', 'ground_communication'],
                'duration': '30-60 minutes'
            })
        
        if stress_indicators['anxiety'] > 0.4:
            recommendations.append({
                'type': 'anxiety_management',
                'priority': 'medium',
                'action': 'Address anxiety through relaxation techniques',
                'techniques': ['progressive_muscle_relaxation', 'meditation', 'music_therapy'],
                'duration': '20-40 minutes'
            })
        
        if stress_indicators['fatigue'] > 0.5:
            recommendations.append({
                'type': 'fatigue_management',
                'priority': 'medium',
                'action': 'Address fatigue and energy levels',
                'techniques': ['sleep_optimization', 'light_therapy', 'nutrition_guidance'],
                'duration': 'ongoing'
            })
        
        return recommendations

def main():
    """Main function for testing the emotion detection system"""
    if len(sys.argv) < 2:
        print("Usage: python emotion-detector.py <file_path> [analysis_type]")
        print("Analysis types: facial, voice, multimodal")
        sys.exit(1)
    
    file_path = sys.argv[1]
    analysis_type = sys.argv[2] if len(sys.argv) > 2 else 'facial'
    
    detector = MultimodalEmotionDetector()
    
    try:
        if analysis_type == 'facial':
            result = detector.detect_facial_emotions(file_path)
        elif analysis_type == 'voice':
            result = detector.detect_voice_emotions(file_path)
        elif analysis_type == 'multimodal':
            result = detector.detect_multimodal_emotions(file_path)
        else:
            print(f"Unknown analysis type: {analysis_type}")
            sys.exit(1)
        
        # Analyze stress levels
        stress_analysis = detector.analyze_crew_stress_levels(result)
        
        # Output results
        print(json.dumps({
            'emotion_analysis': result,
            'stress_analysis': stress_analysis
        }, indent=2))
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
