#!/usr/bin/env python3
"""
AI Companion System for Space Station Crew Psychological Support
"""

import json
import random
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AISpaceCompanion:
    def __init__(self):
        """Initialize the AI companion system"""
        self.conversation_history = []
        self.crew_context = {}
        self.mission_phase = "mission_operations"
        self.psychological_profiles = {}
        
        # Load psychological support templates
        self.support_templates = self._load_support_templates()
        self.intervention_strategies = self._load_intervention_strategies()
        
    def _load_support_templates(self) -> Dict:
        """Load psychological support conversation templates"""
        return {
            'greeting': [
                "Hello! I'm here to support you during your mission. How are you feeling today?",
                "Good to see you! I'm your AI companion for this mission. What's on your mind?",
                "Welcome back! I'm here to listen and help. How can I assist you today?"
            ],
            'stress_support': [
                "I can sense you might be feeling some stress. That's completely normal in space missions.",
                "It sounds like you're dealing with some challenging emotions. Let's work through this together.",
                "I understand this is a difficult time. Remember, you're not alone in this mission."
            ],
            'isolation_support': [
                "I know isolation can be challenging. Let's talk about ways to stay connected.",
                "Feeling isolated is common in space missions. I'm here to provide companionship.",
                "You're not alone, even in the vastness of space. I'm here to support you."
            ],
            'mission_encouragement': [
                "You're doing incredible work up here. Your mission is important and meaningful.",
                "Remember why you're here - you're contributing to humanity's future in space.",
                "Your dedication to this mission is inspiring. Keep up the great work!"
            ],
            'relaxation_guidance': [
                "Let's try some breathing exercises to help you relax.",
                "Would you like to try a mindfulness technique? It can help with stress.",
                "I can guide you through a relaxation exercise if you'd like."
            ],
            'crisis_support': [
                "I'm concerned about your well-being. Let's talk about what you're experiencing.",
                "It sounds like you're going through a very difficult time. I'm here to help.",
                "Your safety and well-being are my top priority. Let's address this together."
            ]
        }
    
    def _load_intervention_strategies(self) -> Dict:
        """Load psychological intervention strategies"""
        return {
            'breathing_exercises': {
                'name': '4-7-8 Breathing Technique',
                'description': 'A calming breathing exercise for stress relief',
                'steps': [
                    'Breathe in through your nose for 4 counts',
                    'Hold your breath for 7 counts',
                    'Exhale through your mouth for 8 counts',
                    'Repeat 3-4 times'
                ],
                'duration': '5-10 minutes'
            },
            'mindfulness_meditation': {
                'name': 'Space Mindfulness',
                'description': 'A mindfulness exercise adapted for space environment',
                'steps': [
                    'Find a comfortable position in your quarters',
                    'Close your eyes and focus on your breathing',
                    'Notice the sensation of weightlessness',
                    'Acknowledge any thoughts without judgment',
                    'Return focus to your breathing'
                ],
                'duration': '10-15 minutes'
            },
            'progressive_muscle_relaxation': {
                'name': 'Microgravity Relaxation',
                'description': 'Adapted relaxation technique for space',
                'steps': [
                    'Start with your facial muscles - tense and release',
                    'Move to your neck and shoulders',
                    'Focus on your arms and hands',
                    'Continue with your torso',
                    'Finish with your legs and feet'
                ],
                'duration': '15-20 minutes'
            },
            'cognitive_reframing': {
                'name': 'Mission Perspective',
                'description': 'Help reframe negative thoughts about the mission',
                'techniques': [
                    'Identify negative thought patterns',
                    'Challenge unrealistic expectations',
                    'Focus on mission accomplishments',
                    'Remember the bigger picture of space exploration'
                ],
                'duration': '10-15 minutes'
            }
        }
    
    def process_message(self, message: str, crew_member_id: str, 
                       emotional_context: Optional[Dict] = None) -> Dict:
        """
        Process a message from a crew member and generate an appropriate response
        
        Args:
            message: The crew member's message
            crew_member_id: ID of the crew member
            emotional_context: Optional emotional context from monitoring system
            
        Returns:
            Dictionary containing AI response and recommendations
        """
        try:
            # Analyze the message for emotional content
            emotional_analysis = self._analyze_message_emotion(message)
            
            # Update crew context
            self._update_crew_context(crew_member_id, emotional_analysis, emotional_context)
            
            # Determine appropriate response strategy
            response_strategy = self._determine_response_strategy(
                message, emotional_analysis, crew_member_id
            )
            
            # Generate response
            response = self._generate_response(message, response_strategy, crew_member_id)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                emotional_analysis, response_strategy, crew_member_id
            )
            
            # Store conversation
            self._store_conversation(crew_member_id, message, response, emotional_analysis)
            
            return {
                'response': response,
                'recommendations': recommendations,
                'emotional_support': self._determine_emotional_support_level(emotional_analysis),
                'intervention_needed': self._assess_intervention_need(emotional_analysis),
                'timestamp': datetime.now().isoformat(),
                'crew_member_id': crew_member_id
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return self._generate_error_response()
    
    def _analyze_message_emotion(self, message: str) -> Dict:
        """Analyze the emotional content of a message"""
        message_lower = message.lower()
        
        # Emotional keywords and patterns
        emotion_indicators = {
            'stress': ['stressed', 'overwhelmed', 'pressure', 'difficult', 'hard', 'struggling'],
            'anxiety': ['worried', 'anxious', 'nervous', 'scared', 'afraid', 'concerned'],
            'sadness': ['sad', 'depressed', 'down', 'blue', 'miserable', 'hopeless'],
            'anger': ['angry', 'mad', 'frustrated', 'irritated', 'annoyed', 'furious'],
            'loneliness': ['alone', 'lonely', 'isolated', 'disconnected', 'separated'],
            'fatigue': ['tired', 'exhausted', 'drained', 'fatigued', 'weary'],
            'happiness': ['happy', 'joyful', 'excited', 'pleased', 'content', 'satisfied'],
            'fear': ['fear', 'terrified', 'panic', 'alarm', 'dread']
        }
        
        detected_emotions = {}
        for emotion, keywords in emotion_indicators.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            if score > 0:
                detected_emotions[emotion] = min(score / len(keywords), 1.0)
        
        # Determine primary emotion
        primary_emotion = max(detected_emotions, key=detected_emotions.get) if detected_emotions else 'neutral'
        
        # Assess urgency
        urgent_keywords = ['help', 'emergency', 'crisis', 'can\'t', 'unable', 'desperate']
        is_urgent = any(keyword in message_lower for keyword in urgent_keywords)
        
        return {
            'primary_emotion': primary_emotion,
            'emotion_scores': detected_emotions,
            'urgency': is_urgent,
            'message_length': len(message),
            'complexity': len(message.split())
        }
    
    def _determine_response_strategy(self, message: str, emotional_analysis: Dict, 
                                   crew_member_id: str) -> str:
        """Determine the appropriate response strategy"""
        primary_emotion = emotional_analysis['primary_emotion']
        urgency = emotional_analysis['urgency']
        
        if urgency or primary_emotion in ['fear', 'anger']:
            return 'crisis_support'
        elif primary_emotion in ['stress', 'anxiety']:
            return 'stress_support'
        elif primary_emotion in ['loneliness', 'sadness']:
            return 'isolation_support'
        elif primary_emotion == 'fatigue':
            return 'relaxation_guidance'
        elif primary_emotion == 'happiness':
            return 'mission_encouragement'
        else:
            return 'general_support'
    
    def _generate_response(self, message: str, strategy: str, crew_member_id: str) -> str:
        """Generate an appropriate response based on the strategy"""
        templates = self.support_templates.get(strategy, self.support_templates['greeting'])
        
        # Get base response
        base_response = random.choice(templates)
        
        # Customize based on crew member context
        crew_context = self.crew_context.get(crew_member_id, {})
        
        # Add personalized elements
        if crew_context.get('mission_phase'):
            base_response += f" I know you're in the {crew_context['mission_phase']} phase of your mission."
        
        if crew_context.get('recent_emotions'):
            recent_emotion = crew_context['recent_emotions'][-1] if crew_context['recent_emotions'] else None
            if recent_emotion and recent_emotion != 'neutral':
                base_response += f" I've noticed you've been feeling {recent_emotion} recently."
        
        # Add specific guidance based on strategy
        if strategy == 'crisis_support':
            base_response += " Let's talk about what's happening and how I can help you right now."
        elif strategy == 'stress_support':
            base_response += " Would you like to try some stress management techniques?"
        elif strategy == 'isolation_support':
            base_response += " I'm here to provide companionship and support."
        elif strategy == 'relaxation_guidance':
            base_response += " I can guide you through some relaxation exercises."
        
        return base_response
    
    def _generate_recommendations(self, emotional_analysis: Dict, strategy: str, 
                                crew_member_id: str) -> List[Dict]:
        """Generate recommendations based on emotional analysis"""
        recommendations = []
        primary_emotion = emotional_analysis['primary_emotion']
        
        # Immediate recommendations based on emotion
        if primary_emotion in ['stress', 'anxiety']:
            recommendations.append({
                'type': 'breathing_exercise',
                'priority': 'high',
                'technique': self.intervention_strategies['breathing_exercises'],
                'reason': 'To help manage stress and anxiety'
            })
        
        if primary_emotion in ['sadness', 'loneliness']:
            recommendations.append({
                'type': 'social_connection',
                'priority': 'high',
                'action': 'Encourage crew interaction or ground communication',
                'reason': 'To address feelings of loneliness and isolation'
            })
        
        if primary_emotion == 'fatigue':
            recommendations.append({
                'type': 'rest_optimization',
                'priority': 'medium',
                'action': 'Review sleep schedule and rest patterns',
                'reason': 'To address fatigue and improve energy levels'
            })
        
        # Add general wellness recommendations
        recommendations.append({
            'type': 'mindfulness',
            'priority': 'medium',
            'technique': self.intervention_strategies['mindfulness_meditation'],
            'reason': 'To promote overall well-being and stress resilience'
        })
        
        return recommendations
    
    def _determine_emotional_support_level(self, emotional_analysis: Dict) -> str:
        """Determine the level of emotional support needed"""
        primary_emotion = emotional_analysis['primary_emotion']
        urgency = emotional_analysis['urgency']
        
        if urgency or primary_emotion in ['fear', 'anger']:
            return 'crisis_support'
        elif primary_emotion in ['stress', 'anxiety', 'sadness']:
            return 'high_support'
        elif primary_emotion in ['loneliness', 'fatigue']:
            return 'medium_support'
        else:
            return 'general_support'
    
    def _assess_intervention_need(self, emotional_analysis: Dict) -> bool:
        """Assess whether psychological intervention is needed"""
        primary_emotion = emotional_analysis['primary_emotion']
        urgency = emotional_analysis['urgency']
        
        # High-risk emotions that require intervention
        high_risk_emotions = ['fear', 'anger', 'sadness']
        
        return urgency or primary_emotion in high_risk_emotions
    
    def _update_crew_context(self, crew_member_id: str, emotional_analysis: Dict, 
                           external_context: Optional[Dict] = None):
        """Update the psychological context for a crew member"""
        if crew_member_id not in self.crew_context:
            self.crew_context[crew_member_id] = {
                'recent_emotions': [],
                'conversation_count': 0,
                'last_interaction': None,
                'psychological_profile': 'baseline'
            }
        
        # Update recent emotions
        self.crew_context[crew_member_id]['recent_emotions'].append(
            emotional_analysis['primary_emotion']
        )
        
        # Keep only last 10 emotions
        if len(self.crew_context[crew_member_id]['recent_emotions']) > 10:
            self.crew_context[crew_member_id]['recent_emotions'] = \
                self.crew_context[crew_member_id]['recent_emotions'][-10:]
        
        # Update interaction count
        self.crew_context[crew_member_id]['conversation_count'] += 1
        self.crew_context[crew_member_id]['last_interaction'] = datetime.now().isoformat()
        
        # Update psychological profile based on patterns
        self._update_psychological_profile(crew_member_id)
        
        # Integrate external context if provided
        if external_context:
            self.crew_context[crew_member_id].update(external_context)
    
    def _update_psychological_profile(self, crew_member_id: str):
        """Update the psychological profile based on emotional patterns"""
        recent_emotions = self.crew_context[crew_member_id]['recent_emotions']
        
        if not recent_emotions:
            return
        
        # Analyze emotional patterns
        stress_count = recent_emotions.count('stress') + recent_emotions.count('anxiety')
        negative_count = recent_emotions.count('sadness') + recent_emotions.count('anger')
        
        if stress_count > len(recent_emotions) * 0.5:
            self.crew_context[crew_member_id]['psychological_profile'] = 'high_stress'
        elif negative_count > len(recent_emotions) * 0.4:
            self.crew_context[crew_member_id]['psychological_profile'] = 'emotional_distress'
        elif recent_emotions.count('loneliness') > len(recent_emotions) * 0.3:
            self.crew_context[crew_member_id]['psychological_profile'] = 'isolation_risk'
        else:
            self.crew_context[crew_member_id]['psychological_profile'] = 'stable'
    
    def _store_conversation(self, crew_member_id: str, message: str, response: str, 
                          emotional_analysis: Dict):
        """Store conversation for analysis and improvement"""
        conversation = {
            'crew_member_id': crew_member_id,
            'timestamp': datetime.now().isoformat(),
            'user_message': message,
            'ai_response': response,
            'emotional_analysis': emotional_analysis,
            'conversation_id': f"{crew_member_id}_{datetime.now().timestamp()}"
        }
        
        self.conversation_history.append(conversation)
        
        # Keep only last 100 conversations per crew member
        crew_conversations = [c for c in self.conversation_history if c['crew_member_id'] == crew_member_id]
        if len(crew_conversations) > 100:
            self.conversation_history = [c for c in self.conversation_history if c not in crew_conversations[:-100]]
    
    def _generate_error_response(self) -> Dict:
        """Generate a response for error cases"""
        return {
            'response': "I'm experiencing some technical difficulties, but I'm still here to support you. Please try again, or if you need immediate assistance, please contact ground control.",
            'recommendations': [{
                'type': 'technical_support',
                'priority': 'high',
                'action': 'Contact ground control for technical assistance',
                'reason': 'AI companion system experiencing issues'
            }],
            'emotional_support': 'general_support',
            'intervention_needed': False,
            'timestamp': datetime.now().isoformat(),
            'error': True
        }
    
    def get_crew_psychological_summary(self, crew_member_id: str) -> Dict:
        """Get a psychological summary for a crew member"""
        if crew_member_id not in self.crew_context:
            return {'error': 'Crew member not found'}
        
        context = self.crew_context[crew_member_id]
        recent_emotions = context.get('recent_emotions', [])
        
        # Analyze emotional trends
        emotion_counts = {}
        for emotion in recent_emotions:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        # Determine dominant emotions
        dominant_emotions = sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            'crew_member_id': crew_member_id,
            'psychological_profile': context.get('psychological_profile', 'unknown'),
            'conversation_count': context.get('conversation_count', 0),
            'last_interaction': context.get('last_interaction'),
            'dominant_emotions': dominant_emotions,
            'emotional_trend': 'stable' if len(set(recent_emotions)) <= 2 else 'variable',
            'recommendations': self._generate_psychological_recommendations(context)
        }
    
    def _generate_psychological_recommendations(self, context: Dict) -> List[Dict]:
        """Generate psychological recommendations based on crew member context"""
        profile = context.get('psychological_profile', 'baseline')
        recommendations = []
        
        if profile == 'high_stress':
            recommendations.append({
                'type': 'stress_management',
                'priority': 'high',
                'action': 'Implement regular stress management techniques',
                'frequency': 'daily'
            })
        elif profile == 'emotional_distress':
            recommendations.append({
                'type': 'emotional_support',
                'priority': 'high',
                'action': 'Increase emotional support and monitoring',
                'frequency': 'multiple times daily'
            })
        elif profile == 'isolation_risk':
            recommendations.append({
                'type': 'social_connection',
                'priority': 'medium',
                'action': 'Encourage crew interaction and ground communication',
                'frequency': 'daily'
            })
        
        return recommendations

def main():
    """Main function for testing the AI companion system"""
    companion = AISpaceCompanion()
    
    # Test scenarios
    test_messages = [
        "I'm feeling really stressed about the mission",
        "I miss my family and feel so alone up here",
        "I can't sleep and I'm exhausted",
        "I'm worried about the docking procedure tomorrow",
        "I'm feeling great today! The experiments are going well"
    ]
    
    for message in test_messages:
        print(f"\nCrew Member: {message}")
        response = companion.process_message(message, "test_crew_member")
        print(f"AI Companion: {response['response']}")
        print(f"Recommendations: {response['recommendations']}")
        print(f"Support Level: {response['emotional_support']}")

if __name__ == "__main__":
    main()
