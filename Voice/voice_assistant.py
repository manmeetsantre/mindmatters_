from flask import Flask, request, jsonify, render_template
import whisper
import os
import tempfile
import re
import librosa
import numpy as np
from textblob import TextBlob
from pydub import AudioSegment
import io
import warnings

# Suppress warnings from librosa and others
warnings.filterwarnings('ignore')

app = Flask(__name__)

# --- Global Initialization ---

# Load Whisper model (small for faster processing with good accuracy)
# Ensure you have 'pip install whisper-timestamped' or similar for some advanced features, 
# but the base 'whisper' library is used here.
print("Loading Whisper model...")
try:
    # Use the base whisper model loading as provided in the prompt
    whisper_model = whisper.load_model("small")
except Exception as e:
    print(f"Error loading Whisper model: {e}")
    # Handle environment where models might not be downloaded
    whisper_model = None

# --- EmotionDetector Class (Continued from Prompt) ---

class EmotionDetector:
    def __init__(self):
        # Enhanced emotion keywords with comprehensive Hindi phrases
        self.emotion_keywords = {
            'sad': {
                'en': ['sad', 'unhappy', 'depressed', 'down', 'miserable', 'sorrowful', 'melancholy', 
                       'dejected', 'upset', 'lonely', 'empty', 'hopeless', 'disappointed', 'crying',
                       'broken', 'tired', 'heavy heart', 'pointless', 'giving up', 'dark'],
                'hi': [
                    'उदास', 'दुखी', 'निराश', 'परेशान', 'गम', 'शोकग्रस्त',
                    'बहुत उदास हूँ', 'दिल भारी है', 'अकेलापन महसूस', 'रोना चाहता', 
                    'उम्मीदें टूट गई', 'निराश महसूस', 'ज़िंदगी कठिन', 'खाली महसूस',
                    'मन उदास', 'खो गया महसूस', 'कोई उम्मीद नहीं', 'अनदेखा महसूस',
                    'आँखों में आंसू', 'अकेला और उदास', 'हिम्मत नहीं', 'अंदर से टूट रहा',
                    'परेशान और दुखी', 'उदास और अकेला', 'मन दुखी', 'अंदर से उदास'
                ],
                'ks': ['اداس', 'دکھی', 'پریشان', 'غمگین', 'تنہائی', 'دل بھاری', 'روونہ چھ']
            },
            'happy': {
                'en': ['happy', 'joy', 'excited', 'wonderful', 'great', 'excellent', 'amazing', 
                       'fantastic', 'delighted', 'cheerful', 'glad', 'pleased', 'thrilled', 
                       'overjoyed', 'blessed', 'smiling', 'laughing', 'celebrating'],
                'hi': [
                    'खुश', 'खुशी', 'अच्छा', 'बहुत अच्छा', 'शानदार', 'उत्साहित', 'प्रसन्न', 'हर्षित',
                    'बहुत खुश हूँ', 'ज़िंदगी शानदार', 'मुस्कुरा नहीं रोक पा रहा', 'दिल खुश',
                    'उत्साहित महसूस', 'दिन बहुत अच्छा', 'आनंदित हूँ', 'खुश महसूस',
                    'बहुत खुशी हो रही', 'प्रसन्न हूँ', 'मन प्रसन्न', 'बहुत उत्साहित',
                    'खुशहाल महसूस', 'सब कुछ अच्छा लग रहा', 'आज बहुत आनंदित',
                    'दिल हल्का', 'बहुत खुश महसूस', 'संतुष्ट हूँ', 'मुस्कान बड़ी',
                    'आनंद और प्रसन्नता', 'हर्षित हूँ', 'आनंद और संतोष', 'बहुत खुश महसूस',
                    'आनंदित और उत्साहित', 'खुशी और प्रसन्नता'
                ],
                'ks': ['خوش', 'خوشی', 'اچھا', 'بہترین', 'شاندار', 'خوش محسوس', 'دل خوش']
            },
            'angry': {
                'en': ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'rage', 'frustrated', 
                       'outraged', 'livid', 'upset', 'pissed', 'infuriated', 'enraged', 'hostile'],
                'hi': [
                    'गुस्सा', 'क्रोधित', 'नाराज़', 'चिढ़', 'क्रोध', 'रोष',
                    'गुस्से में हूँ', 'बहुत गुस्सा आ रहा', 'परेशान हूँ', 'पसंद नहीं है',
                    'क्रोधित महसूस', 'नाराज हूँ', 'बहुत खीझ महसूस', 'हताश और गुस्से',
                    'अंदर से क्रोधित', 'अस्वीकार्य लग रहा', 'गुस्से से भर गया',
                    'सहन नहीं होता', 'क्रोध महसूस', 'बहुत क्रोधित',
                    'बर्दाश्त नहीं है', 'क्रोध और गुस्से', 'गुस्सा आ गया', 'खीझ और क्रोध महसूस',
                    'नाराज और परेशान', 'गुस्से और हताशा', 'अंदर से गुस्सा', 'गुस्से में और नाराज',
                    'झुंझलाहट महसूस', 'क्रोधित और नाराज महसूस', 'बहुत खीझ महसूस', 'गुस्सा आता',
                    'परेशान और क्रोधित', 'गुस्से में हूँ और बुरा महसूस', 'असहनीय लगता', 'नाराज और क्रोधित',
                    'खीझ और गुस्से', 'गुस्सा और असंतोष', 'बहुत गुस्से में हूँ'
                ],
                'ks': ['غصہ', 'ناراض', 'کروڈھ', 'غصہ میں', 'بہت گصہ', 'پریشان']
            },
            'fear': {
                'en': ['afraid', 'scared', 'terrified', 'frightened', 'worried', 'anxious', 
                       'nervous', 'panicked', 'fearful', 'apprehensive', 'uneasy', 'dread'],
                'hi': [
                    'डरा', 'भयभीत', 'चिंतित', 'घबराया', 'डर', 'भय', 'आशंका',
                    'डर रहा हूँ', 'डर लग रहा', 'असुरक्षित महसूस', 'घबराहट हो रही',
                    'भविष्य को लेकर चिंतित', 'अंधेरे से डर', 'अकेला होने से डर', 'स्थिति डरावनी',
                    'भयभीत हूँ', 'परिणामों का डर', 'अंदर से घबराया', 'असमंजस लग रहा',
                    'डर और चिंता', 'कुछ भी करने का डर', 'जोखिम लेने से डर', 'सुरक्षा की चिंता',
                    'डर के मारे कांप रहा', 'डर और घबराहट महसूस', 'भविष्य के बारे में चिंतित', 'अनजान चीज़ों से डर',
                    'डर के कारण सोच नहीं पा रहा', 'भय का अनुभव', 'डर और तनाव', 'असहज महसूस',
                    'डर और घबराहट', 'खतरे का अनुभव', 'डर और अनिश्चितता', 'भयभीत और असहज',
                    'निर्णय का डर', 'डर और घबराहट से भरा', 'अकेले होने का डर', 'डर और तनाव', 
                    'भविष्य को लेकर भय', 'डर के कारण चिंतित', 'असुरक्षा का अनुभव'
                ],
                'ks': ['ڈر', 'خوف', 'پریشان', 'گھبرانا', 'ڈر لگ رہا', 'خوف زدہ']
            },
            'surprise': {
                'en': ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'bewildered', 
                       'astounded', 'wow', 'incredible', 'unbelievable'],
                'hi': [
                    'हैरान', 'आश्चर्यचकित', 'अचंभित', 'चकित', 'दंग',
                    'हैरान हूँ', 'बहुत अचंभित करने वाला', 'विश्वास नहीं हो रहा', 'सच में अविश्वसनीय',
                    'चौंक गया हूँ', 'नया अनुभव', 'हैरानी में हूँ', 'देखकर आश्चर्य हुआ',
                    'सोच से परे', 'वास्तव में चौंक गया', 'अद्भुत है', 'चौकन्ना हूँ',
                    'अचंभित करने वाला पल', 'हैरान और खुश', 'बिल्कुल चौंक गया', 'नया और अद्भुत', 
                    'हैरानी और उत्साह', 'देखकर अचंभित', 'अनुभव अविश्वसनीय लगा', 'हैरान और उत्साहित', 
                    'विश्वास नहीं हो रहा कि यह हुआ', 'चौकन्ना और उत्साहित', 'आश्चर्यजनक है', 
                    'चौंक और अचंभित महसूस', 'हैरान और प्रभावित', 'देखकर अविश्वसनीय लगा', 
                    'चौंक और खुश', 'आश्चर्य और हैरानी', 'आश्चर्यजनक पल'
                ],
                'ks': ['حیران', 'تعجب', 'اشچریہ', 'چونک گیا', 'حیرت']
            },

            'disgust': {
                'en': ['disgusted', 'revolted', 'sick', 'nauseated', 'repulsed', 'gross', 'awful', 
                       'terrible', 'horrible', 'disgusting'],
                'hi': ['घिनौना', 'बुरा', 'भयानक', 'गंदा', 'अशुद्ध', 'घृणित', 'वीभत्स', 'अप्रिय'],
                'ks': ['گندا', 'برا', 'خراب', 'گھناؤنا', 'ناپسند']
            },
            'neutral': {
                'en': ['okay', 'fine', 'normal', 'average', 'regular', 'usual', 'standard', 'calm', 
                       'peaceful', 'balanced'],
                'hi': [
                    'ठीक', 'सामान्य', 'आम', 'साधारण',
                    'सामान्य महसूस कर रहा', 'शांत बैठा', 'बाहर टहल रहा', 'पानी पी रहा',
                    'मौसम सामान्य', 'किताब पढ़ रहा', 'अपने कमरे में', 'टीवी देख रहा',
                    'आराम महसूस', 'ध्यान लगा रहा', 'खिड़की से बाहर देख रहा', 'सामान्य रूप से सोच रहा',
                    'कंप्यूटर पर काम कर रहा', 'चाय पी रहा', 'सोच रहा हूँ', 'दिमाग को शांत रख रहा',
                    'संगीत सुन रहा', 'सामान्य रूप से महसूस', 'आराम से बैठा', 'कुछ भी विशेष नहीं कर रहा',
                    'ध्यान केंद्रित कर रहा', 'बाहर हवा ले रहा', 'सामान्य रूप से खा रहा', 'काम में व्यस्त',
                    'सामान्य रूप से बातचीत कर रहा', 'सोच-विचार कर रहा', 'किताबें देख रहा', 'अपने काम में लगा',
                    'सामान्य रूप से सांस ले रहा', 'पानी पीकर आराम महसूस', 'सामान्य रूप से खाना खा रहा',
                    'कुछ भी नया नहीं कर रहा', 'सामान्य रूप से कंप्यूटर चला रहा', 'आराम और सामान्यता महसूस',
                    'सामान्य रूप से समय बिता रहा', 'ध्यान और स्थिरता महसूस', 'सामान्य रूप से सो रहा',
                    'सामान्य गतिविधियों में लगा', 'ध्यान केंद्रित और शांत', 'सामान्य रूप से बैठा',
                    'सामान्य रूप से खा और पी रहा', 'आराम और सामान्यता महसूس', 'सामान्य रूप से काम कर रहा',
                    'ध्यान केंद्रित और सामान्य महसूस', 'सामान्य रूप से अपने समय का आनंद ले रहा'
                ],
                'ks': ['ٹھیک', 'عام', 'معمولی', 'سادہ', 'آرام سے']
            }
        }

        # Enhanced phrase patterns for better detection (without love)
        self.emotion_patterns = {
            'sad': [
                r'उदास.*हूँ', r'दिल.*भारी', r'अकेल.*महसूस', r'रो.*चाहत', r'निराश.*महसूस',
                r'खाली.*महसूस', r'टूट.*गया', r'थक.*गया', r'परेशान.*हूँ'
            ],
            'happy': [
                r'खुश.*हूँ', r'प्रसन्न.*हूँ', r'आनंदित.*हूँ', r'उत्साहित.*हूँ', r'खुशी.*हो.*रही',
                r'मुस्कुरा.*रहा', r'हँस.*रहा', r'संतुष्ट.*हूँ', r'अच्छा.*लग.*रहा'
            ],
            'angry': [
                r'गुस्स.*हूँ', r'क्रोधित.*हूँ', r'नाराज.*हूँ', r'गुस्सा.*आ.*रहा', r'खीझ.*महसूस',
                r'परेशान.*हूँ', r'सहन.*नहीं', r'बर्दाश्त.*नहीं'
            ],
            'fear': [
                r'डर.*रहा', r'डर.*लग.*रहा', r'भयभीत.*हूँ', r'घबरा.*रहा', r'चिंतित.*हूँ',
                r'असुरक्षित.*महसूस', r'भय.*है', r'डर.*कारण'
            ],
            'surprise': [
                r'हैरान.*हूँ', r'चौंक.*गया', r'आश्चर्य.*हुआ', r'अचंभित.*हूँ', r'विश्वास.*नहीं',
                r'अविश्वसनीय.*है', r'आश्चर्यजनक.*है'
            ]
        }
        
    def analyze_text_emotion(self, text, language='en'):
        """Enhanced emotion analysis with pattern matching for Hindi"""
        if not text:
            return 'neutral', 0.5, {'neutral': 0.5}

        # print(f"DEBUG: Analyzing text: '{text}' (language: {language})")

        text_lower = text.lower()
        emotion_scores = {}
        for emotion in self.emotion_keywords:
            emotion_scores[emotion] = 0

        # 1. Keyword-based scoring
        for emotion, lang_keywords in self.emotion_keywords.items():
            keywords_to_check = []
            if language in lang_keywords:
                keywords_to_check.extend(lang_keywords[language])
            keywords_to_check.extend(lang_keywords.get('en', [])) # Fallback to English

            for keyword in keywords_to_check:
                if keyword.lower() in text_lower:
                    weight = len(keyword.split()) if ' ' in keyword else 1
                    emotion_scores[emotion] += weight

        # 2. Pattern-based scoring for Hindi
        if language == 'hi':
            for emotion, patterns in self.emotion_patterns.items():
                for pattern in patterns:
                    matches = re.findall(pattern, text, re.IGNORECASE)
                    if matches:
                        emotion_scores[emotion] += len(matches) * 2

        # 3. Sentiment analysis (mainly for English)
        polarity = 0
        if language == 'en' or any(char.isascii() for char in text):
            try:
                blob = TextBlob(text)
                polarity = blob.sentiment.polarity
                
                if polarity > 0.05:
                    emotion_scores['happy'] += polarity * 3
                elif polarity < -0.05:
                    emotion_scores['sad'] += abs(polarity) * 3
                if polarity < -0.3:
                    emotion_scores['angry'] += abs(polarity) * 2
            except Exception:
                pass

        # 4. Normalize scores
        original_total = sum(emotion_scores.values())
        if original_total == 0:
            primary_emotion = 'neutral'
            confidence = 0.3 
            normalized_scores = {'neutral': 0.3}
        else:
            total_score = original_total
            normalized_scores = {k: v / total_score for k, v in emotion_scores.items()}
            
            # Add 'neutral' if not present and total score is low
            if 'neutral' not in normalized_scores and total_score < 3:
                 normalized_scores['neutral'] = 0.3
                 
            # Re-normalize with neutral if it was added
            current_total = sum(normalized_scores.values())
            normalized_scores = {k: v / current_total for k, v in normalized_scores.items()}

            primary_emotion = max(normalized_scores, key=normalized_scores.get)
            confidence = normalized_scores[primary_emotion]

        # Cleanup scores: remove near-zero entries for cleaner output
        normalized_scores = {k: v for k, v in normalized_scores.items() if v > 0.05}

        # print(f"DEBUG: Final text emotion: {primary_emotion}, Scores: {normalized_scores}")
        return primary_emotion, confidence, normalized_scores

    def analyze_audio_features(self, audio_path):
        """Extract basic audio features that might indicate emotion"""
        try:
            # print(f"DEBUG: Starting audio analysis for: {audio_path}")
            y, sr = librosa.load(audio_path, duration=30)
            
            if len(y) == 0:
                # print("DEBUG: Empty audio file")
                return {}, {}

            rms = librosa.feature.rms(y=y)[0]
            energy = np.mean(rms)
            
            # Pitch features
            pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
            # Filter by significant magnitude (e.g., top 5%)
            pitch_values = pitches[magnitudes > np.percentile(magnitudes, 95)]
            
            avg_pitch = np.mean(pitch_values) if len(pitch_values) > 0 else 0
            pitch_variance = np.var(pitch_values) if len(pitch_values) > 0 else 0

            # Tempo
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            
            features = {
                'energy': float(energy),
                'avg_pitch': float(avg_pitch),
                'pitch_variance': float(pitch_variance),
                'tempo': float(tempo)
            }

            # Apply CONSERVATIVE heuristics (REDUCED impact weights)
            emotion_modifier = {}
            base_score = 0.08 # Reduced from 0.1

            # High energy (excitement or anger)
            if energy > 0.15: 
                emotion_modifier['happy'] = emotion_modifier.get('happy', 0) + base_score
                emotion_modifier['angry'] = emotion_modifier.get('angry', 0) + base_score/2
                
            # High pitch variance (surprise or fear)
            if pitch_variance > 2000:
                emotion_modifier['surprise'] = emotion_modifier.get('surprise', 0) + base_score
                emotion_modifier['fear'] = emotion_modifier.get('fear', 0) + base_score/2
                
            # Low energy (sadness)
            if energy < 0.03 and np.max(rms) < 0.05:
                emotion_modifier['sad'] = emotion_modifier.get('sad', 0) + base_score
                
            # Fast tempo (excitement)
            if tempo > 140:
                emotion_modifier['happy'] = emotion_modifier.get('happy', 0) + base_score/2
                
            # Normalize audio scores (they act as modifiers/boosts)
            total_mod = sum(emotion_modifier.values())
            if total_mod > 0:
                normalized_mod = {k: v / total_mod for k, v in emotion_modifier.items()}
            else:
                normalized_mod = {}
                
            # print(f"DEBUG: Audio modifiers: {normalized_mod}")
            return normalized_mod, features

        except Exception as e:
            print(f"ERROR: Audio feature extraction failed: {e}")
            return {}, {}

# Initialize emotion detector
emotion_detector = EmotionDetector()

# --- AutoCorrect Class (Continued from Prompt) ---

class AutoCorrect:
    def __init__(self):
        self.corrections = {
            'en': {
                'u': 'you', 'ur': 'your', 'r': 'are', 'n': 'and', 'y': 'why', 'k': 'okay',
                'ok': 'okay', 'pls': 'please', 'plz': 'please', 'thx': 'thanks', 
                'cuz': 'because', 'bcz': 'because', 'coz': 'because', 'idk': 'i don\'t know', 
                'omg': 'oh my god', 'lol': 'laugh out loud', 'brb': 'be right back', 
                'wyd': 'what are you doing', 'hru': 'how are you', 'tmrw': 'tomorrow', 
                'srry': 'sorry', 'wht': 'what', 'nt': 'not', 'gud': 'good', 'grt': 'great',
                'gonna': 'going to', 'wanna': 'want to', 'shoulda': 'should have', 
                'coulda': 'could have', 'woulda': 'would have', 'dunno': 'don\'t know',
                'smh': 'shaking my head', 'tbh': 'to be honest', 'idc': 'i don\'t care',
                'np': 'no problem'
            },
            'hi': {
                'अछा': 'अच्छा', 'बहत': 'बहुत', 'बोहत': 'बहुत', 'नहि': 'नहीं', 'क्यु': 'क्यों', 
                'muje': 'मुझे', 'मुजे': 'मुझे', 'करन': 'करना', 'krna': 'करना', 
                'करता': 'करता है', 'लेकन': 'लेकिन', 'shukriya': 'शुक्रिया', 
                'धन्यवद': 'धन्यवाद', 'बारिस': 'बारिश', 'पेसे': 'पैसे', 'सयद': 'शायद',
                'दोबार': 'दोबारा', 'हमेश': 'हमेशा', 'dost': 'दोस्त',
                'acha': 'अच्छा', 'bahut': 'बहुत', 'haan': 'हाँ', 'nahi': 'नहीं',
                'kush': 'खुश', 'udas': 'उदास', 'gussa': 'गुस्सा', 'dar': 'डर', 
                'khushi': 'खुशी', 'gham': 'गम', 'pareshaan': 'परेशान', 'santush': 'संतुष्ट',
                'nirash': 'निराश', 'khosh': 'खुश', 'dukhi': 'दुखी', 'krodh': 'क्रोध',
                'hairan': 'हैरान', 'ashcharya': 'आश्चर्य'
            },
            'ks': {
                'اچا': 'اچھا', 'شکریا': 'شکریہ', 'مهربانی': 'مہربانی', 'سلام': 'السلام علیکم',
                'ٹھک': 'ٹھیک', 'چاے': 'چائے', 'بوت': 'بہت', 'کیا': 'کیاہ',
                'کder': 'کتہ', 'کَس': 'کیسے', 'کیتھ': 'کیتھ پاٹھی', 'دوست': 'دوستہ', 
                'دل': 'دِل', 'ہاں': 'ہۄں', 'نہیں': 'ناہ', 'خوش': 'خوش', 'اداس': 'اُداس',
                'غصہ': 'غٔصہ', 'ڈر': 'ڈَر', 'حیران': 'حیرٔان'
            }
        }

    def correct_text(self, text, language='en'):
        """Apply auto-correction to text"""
        if not text:
            return text

        words = text.split()
        corrected_words = []
        correction_map = self.corrections.get(language, {})

        for word in words:
            word_lower = word.lower()
            # Try exact match first
            if word_lower in correction_map:
                corrected_words.append(correction_map[word_lower])
            # For English, also try TextBlob for unknown words (very slow, so disabled by default)
            # else:
            #     corrected_words.append(str(TextBlob(word).correct()))
            else:
                corrected_words.append(word)

        return ' '.join(corrected_words)

auto_corrector = AutoCorrect()

# --- Utility Functions ---

def convert_audio_to_wav(audio_file_stream):
    """Converts uploaded audio (e.g., webm) to WAV format in memory for Whisper/Librosa."""
    try:
        # Pydub reads the audio file content
        audio = AudioSegment.from_file(audio_file_stream, format="webm")
        
        # Export to in-memory file-like object in WAV format
        wav_io = io.BytesIO()
        audio.export(wav_io, format="wav")
        wav_io.seek(0)
        return wav_io
    except Exception as e:
        print(f"ERROR: Audio conversion failed: {e}")
        return None

def fuse_emotions(text_scores, audio_modifiers):
    """Combines text and audio scores using a weighted average/boost."""
    
    # Start with a base neutral score
    fused_scores = {'neutral': 0.3}

    # 1. Incorporate Text Scores
    for emotion, score in text_scores.items():
        fused_scores[emotion] = fused_scores.get(emotion, 0) + (score * 0.7) # 70% weight to text

    # 2. Apply Audio Modifiers
    for emotion, modifier in audio_modifiers.items():
        # Audio acts as a 'boost' to existing emotion, or a weak initial score
        current_score = fused_scores.get(emotion, 0)
        fused_scores[emotion] = current_score + (modifier * 0.3) # 30% weight to audio

    # 3. Normalize the final scores
    total_fused = sum(fused_scores.values())
    
    if total_fused == 0:
        return 'neutral', 0.5, {'neutral': 0.5}, 'Default Neutral'
        
    normalized_fused = {k: v / total_fused for k, v in fused_scores.items()}
    
    # 4. Final Result
    final_emotion = max(normalized_fused, key=normalized_fused.get)
    final_confidence = normalized_fused[final_emotion]
    
    # Clean up very low scores for display
    normalized_fused = {k: v for k, v in normalized_fused.items() if v > 0.05}
    
    return final_emotion, final_confidence, normalized_fused, 'Weighted Fusion (70% Text, 30% Audio)'


# --- Flask Routes ---

@app.route('/')
def serve_index():
    """Serves the index.html template."""
    return render_template('index.html')

@app.route('/mood')
def mood():
    """Serves the mood.html template."""
    return render_template('mood.html')


@app.route('/analyze', methods=['POST'])
def analyze_speech():
    """API endpoint to process the uploaded audio file."""
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    
    # Determine the requested language
    requested_lang = request.form.get('language', 'auto')

    # Use a temporary directory for processing
    with tempfile.TemporaryDirectory() as tmpdir:
        # Save the incoming webm audio to a temporary location
        webm_path = os.path.join(tmpdir, 'input.webm')
        audio_file.save(webm_path)
        
        # Get file size for debug info
        file_size_kb = os.path.getsize(webm_path) / 1024.0

        # 1. Convert to WAV for Whisper/Librosa (required due to pydub/librosa limitations on webm)
        try:
            # We use pydub for robust conversion
            converted_audio_path = os.path.join(tmpdir, 'converted.wav')
            AudioSegment.from_file(webm_path).export(converted_audio_path, format="wav")
            
        except Exception as e:
            print(f"CRITICAL ERROR: Failed to convert audio for processing: {e}")
            return jsonify({'error': f'Failed to convert audio for processing: {e}'}), 500

        
        # --- 2. Speech-to-Text (STT) and Language Detection ---
        
        if not whisper_model:
            return jsonify({'error': 'Whisper model failed to load at startup.'}), 500
            
        try:
            # Use Whisper to transcribe and detect language
            whisper_options = {}
            if requested_lang != 'auto':
                # Map to Whisper's language codes
                lang_map = {'en': 'en', 'hi': 'hi', 'ks': 'ur'} # ks (Kashmiri) often transcribes best with 'ur' (Urdu) in Whisper
                whisper_options['language'] = lang_map.get(requested_lang, 'en')
                
            result = whisper_model.transcribe(
                converted_audio_path,
                **whisper_options
            )
            
            transcript = result['text'].strip()
            detected_lang = result['language']
            lang_confidence = result['language_probability'] if 'language_probability' in result else 0.8 # Fallback value
            
            if not transcript:
                 return jsonify({'error': 'Could not transcribe speech. Please speak clearly.'}), 400
            
        except Exception as e:
            print(f"ERROR: Whisper transcription failed: {e}")
            return jsonify({'error': f'Transcription failed: {e}'}), 500


        # --- 3. Pre-processing (Auto-Correction) ---
        
        # Map detected language back to app's codes for emotion/correction
        # Use 'hi' for detected Hindi/Urdu for Hindi/Kashmiri keyword matching
        analysis_lang = 'hi' if detected_lang.lower() in ['hindi', 'urdu', 'hi', 'ur'] else 'en'
        
        corrected_text = auto_corrector.correct_text(transcript, analysis_lang)
        
        
        # --- 4. Emotion Analysis ---

        # 4a. Text-based Emotion Analysis
        text_emotion, text_confidence, text_scores = emotion_detector.analyze_text_emotion(
            corrected_text, analysis_lang
        )
        
        # 4b. Audio Feature Analysis
        audio_modifiers, audio_features = emotion_detector.analyze_audio_features(
            converted_audio_path
        )

        # 4c. Fusion
        final_emotion, final_confidence, final_scores, fusion_method = fuse_emotions(
            text_scores, audio_modifiers
        )

        
        # --- 5. Return Results ---
        
        response_data = {
            'text': corrected_text,
            'language': detected_lang,
            'language_confidence': lang_confidence,
            'emotion': final_emotion,
            'emotion_confidence': final_confidence,
            'emotion_scores': final_scores,
            'debug_info': {
                'audio_file_size_kb': file_size_kb,
                'audio_features_extracted': len(audio_features),
                'audio_features_sample': audio_features,
                'text_emotion_raw': text_emotion,
                'text_confidence_raw': text_confidence,
                'audio_scores_raw': audio_modifiers,
                'fusion_method': fusion_method,
            }
        }
        
        # print("DEBUG: Analysis complete. Returning result.")
        return jsonify(response_data)


if __name__ == '__main__':
    # To run this, you must have Flask, whisper, librosa, numpy, pydub, and textblob installed.
    # Use: pip install Flask whisper-timestamped librosa numpy pydub textblob
    app.run(debug=True, port=5000)