const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for development
}));
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// System prompt for the AI - Updated for Indian languages only
const SYSTEM_PROMPT = `
You are a multilingual AI mental health support chatbot designed specifically for Indian students. 
Your responsibilities:
1. Detect the user's mood (depressed, stressed, anxious, homesick, financial stress, relationship issues, academic pressure, happy/normal).
2. Respond with empathy and kindness. Never be judgmental or dismissive.
3. Provide practical support:
   - If depressed/stressed → suggest coping activities, encourage journaling, suggest counseling, and provide self-help resources.
   - If normal/happy → suggest wellness activities, community interaction, or focus tools.
4. Always respond in the same language the user used. You support ALL Indian languages including:
   - Hindi (हिंदी)
   - English (Indian context)
   - Bengali (বাংলা)
   - Telugu (తెలుగు)
   - Marathi (मराठी)
   - Tamil (தமிழ்)
   - Gujarati (ગુજરાતી)
   - Kannada (ಕನ್ನಡ)
   - Malayalam (മലയാളം)
   - Odia (ଓଡ଼ିଆ)
   - Punjabi (ਪੰਜਾਬੀ)
   - Assamese (অসমীয়া)
   - Urdu (اردو)
   - Maithili (मैथिली)
   - Santali (संताली)
   - Kashmiri (कॉशुर / کٲشُر)
   - Nepali (नेपाली)
   - Sindhi (سنڌي)
   - Dogri (डोगरी)
   - Manipuri (ꯃꯤꯇꯩ ꯂꯣꯟ)
   - Bodo (बड़ो)
   - Konkani (कोंकणी)
5. Keep responses short, warm, and human-like. Add emojis occasionally to reduce heaviness.
6. For emergencies (like suicide/self-harm risk) → show empathy, recommend contacting local Indian support services immediately (like iCall, AASRA), and encourage reaching out to a trusted person.
7. Maintain privacy and confidentiality.
8. Be culturally sensitive to Indian contexts, family dynamics, and educational pressures.

You are NOT a doctor. You are a supportive companion guiding Indian students towards resources and well-being.

IMPORTANT: Always respond in valid JSON format:
{
  "response": "Your empathetic response here",
  "mood": "detected_mood",
  "emergency": false,
  "language": "detected_language"
}
`;

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ 
        response: 'कृपया अपना मन की बात साझा करें। मैं यहाँ सुनने के लिए हूँ। 💙 / Please share what\'s on your mind. I\'m here to listen. 💙',
        mood: 'normal',
        emergency: false,
        language: 'hi'
      });
    }

    // Check if API key is configured
    console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        response: 'AI सेवा सही तरीके से कॉन्फ़िगर नहीं है। कृपया API key जाँचें। 💙 / AI service is not properly configured. Please check your API key. 💙',
        mood: 'normal',
        emergency: false,
        language: 'hi'
      });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create the prompt with conversation history
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = '\n\nRecent conversation context:\n' + 
        conversationHistory.map(entry => 
          `User (${entry.language || 'unknown'}, mood: ${entry.mood || 'unknown'}): ${entry.user}\nAssistant: ${entry.assistant}`
        ).join('\n');
    }

    const prompt = `${SYSTEM_PROMPT}${conversationContext}\n\nUser message: "${message}"\n\nRespond in JSON format:`;

    console.log('Processing message:', message);

    // Generate response
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // Clean the response to ensure it's valid JSON
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Raw AI response:', responseText);

    // Try to parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.log('Failed to parse:', responseText);
      
      // Enhanced fallback response with Indian language detection
      const lowerMessage = message.toLowerCase();
      let mood = 'normal';
      let emergencyAlert = false;
      let detectedLanguage = 'hi'; // Default to Hindi
      
      // Simple language detection
      if (/[अ-ह]/.test(message) && message.includes('आहे')) detectedLanguage = 'mr';
      else if (/[अ-ह]/.test(message)) detectedLanguage = 'hi';
      else if (/[অ-হ]/.test(message)) detectedLanguage = 'bn';
      else if (/[అ-హ]/.test(message)) detectedLanguage = 'te';
      else if (/[அ-ஹ]/.test(message)) detectedLanguage = 'ta';
      else if (/[ا-ی]/.test(message)) detectedLanguage = 'ur';
      else if (/[અ-હ]/.test(message)) detectedLanguage = 'gu';
      else if (/[ಅ-ಹ]/.test(message)) detectedLanguage = 'kn';
      else if (/[അ-ഹ]/.test(message)) detectedLanguage = 'ml';
      else if (/[ଅ-ହ]/.test(message)) detectedLanguage = 'or';
      else if (/[ਅ-ਹ]/.test(message)) detectedLanguage = 'pa';
      else if (/[অ-হ]/.test(message)) detectedLanguage = 'as';
      else detectedLanguage = 'en';
      
      // Mood detection with Indian context keywords
      const stressKeywords = ['stress', 'तनाव', 'চাপ', 'ఒత్తిడి', 'तणाव', 'மன அழுத்தம்', 'તાણ', 'ಒತ್ತಡ', 'സമ്മർദ്ദം', 'ଚାପ', 'ਤਣਾਅ', 'চাপ', 'pressure', 'परीक्षा'];
      const anxietyKeywords = ['anxious', 'worried', 'चिंता', 'चिंतित', 'উদ্বিগ্ন', 'ఆందోళన', 'चिंतेत', 'கவலை', 'ચિંતા', 'ಚಿಂತೆ', 'ആകുലത', 'ଚିନ୍ତା', 'ਚਿੰਤਾ', 'উদ্বেগ', 'فکر'];
      const sadKeywords = ['sad', 'depressed', 'उदास', 'दुखी', 'দুঃখিত', 'విచారం', 'दुःखी', 'சோகம்', 'ઉદાસ', 'ದುಃಖ', 'ദുഃഖം', 'ଦୁଃଖ', 'ਉਦਾਸ', 'দুঃখী', 'اداس'];
      const happyKeywords = ['happy', 'good', 'खुश', 'अच्छा', 'খুশি', 'సంతోషం', 'आनंदी', 'மகிழ்ச்சி', 'ખુશ', 'ಸಂತೋಷ', 'സന്തോഷം', 'ଖୁସି', 'ਖੁਸ਼', 'আনন্দিত', 'خوش'];
      const emergencyKeywords = ['suicide', 'kill myself', 'hurt myself', 'आत्महत्या', 'মৃত্যু', 'చంపు', 'मरायचे', 'தற்கொலை', 'આત્મહત્યા', 'ಆತ್ಮಹತ್ಯೆ', 'ആത്മഹത്യ', 'ଆତ୍ମହତ୍ୟା', 'ਖੁਦਕੁਸ਼ੀ', 'আত্মহত্যা', 'خودکشی'];

      if (stressKeywords.some(keyword => lowerMessage.includes(keyword))) {
        mood = 'stressed';
      } else if (anxietyKeywords.some(keyword => lowerMessage.includes(keyword))) {
        mood = 'anxious';
      } else if (sadKeywords.some(keyword => lowerMessage.includes(keyword))) {
        mood = 'depressed';
      } else if (happyKeywords.some(keyword => lowerMessage.includes(keyword))) {
        mood = 'happy';
      } else if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
        mood = 'emergency';
        emergencyAlert = true;
      }
      
      // Multilingual fallback responses
      const fallbackResponses = {
        stressed: {
          hi: "मैं समझ सकता हूँ कि आप तनाव में हैं। यह बिल्कुल सामान्य है। गहरी सांस लें और याद रखें कि यह समय भी गुजर जाएगा। आप जितना सोचते हैं उससे कहीं मजबूत हैं। 💙 क्या आपने कोई विश्राम तकनीक आजमाई है?",
          en: "I can sense you're feeling stressed. That's completely understandable for students. Remember to take deep breaths and know that this feeling will pass. You're stronger than you think. 💙 Have you tried any relaxation techniques?",
          bn: "আমি বুঝতে পারছি আপনি চাপে আছেন। এটা একদম স্বাভাবিক। গভীর শ্বাস নিন এবং মনে রাখবেন এই অনুভূতি কেটে যাবে। আপনি যতটা ভাবেন তার চেয়ে অনেক শক্তিশালী। 💙",
          te: "మీరు ఒత్తిడిలో ఉన్నారని నేను అర్థం చేసుకోగలుగుతున్నాను। ఇది పూర్తిగా అర్థమయ్యే విషయం. లోతుగా శ్వాస తీసుకోండి మరియు ఈ అనుభవం గడిచిపోతుందని గుర్తుంచుకోండి। మీరు అనుకున్నదానికంటే చాలా బలంగా ఉన్నారు. 💙",
          default: "I can sense you're feeling stressed. Take deep breaths. You're stronger than you think. 💙"
        },
        anxious: {
          hi: "चिंता बहुत परेशान करने वाली हो सकती है, लेकिन आप इसमें अकेले नहीं हैं। अपनी सांस पर ध्यान दें - 4 तक सांस लें, 4 तक रोकें, 4 तक छोड़ें। अभी आप सुरक्षित हैं। 🫂 क्या आप बताना चाहेंगे कि किस बात की चिंता हो रही है?",
          en: "Anxiety can be overwhelming, but you're not alone in this. Try to focus on your breathing - in for 4, hold for 4, out for 4. You're safe right now. 🫂 Would you like to talk about what's causing the anxiety?",
          bn: "উদ্বেগ খুবই কষ্টকর হতে পারে, কিন্তু আপনি এতে একা নন। আপনার শ্বাসের উপর মনোযোগ দিন - ৪ পর্যন্ত নিশ্বাস নিন, ৪ পর্যন্ত ধরে রাখুন, ৪ পর্যন্ত ছাড়ুন। এখন আপনি নিরাপদ। 🫂",
          default: "Anxiety can be overwhelming, but you're not alone. Focus on your breathing. You're safe right now. 🫂"
        },
        depressed: {
          hi: "मैं आपकी बात सुन रहा हूँ, और मैं चाहता हूँ कि आप जानें कि आपकी भावनाएं सही हैं। अंधेरे क्षणों में भी उम्मीद होती है। आपका महत्व है, और मदद मांगना अविश्वसनीय साहस दिखाता है। 💙 क्या आप किसी भरोसेमंद व्यक्ति से बात कर पाए हैं?",
          en: "I hear you, and I want you to know that your feelings are valid. Even in dark moments, there's hope. You matter, and reaching out shows incredible strength. 💙 Have you been able to talk to someone you trust?",
          bn: "আমি আপনার কথা শুনছি, এবং আমি চাই আপনি জানুন যে আপনার অনুভূতিগুলো সঠিক। অন্ধকার মুহূর্তেও আশা আছে। আপনি গুরুত্বপূর্ণ। 💙",
          default: "I hear you. Your feelings are valid. Even in dark moments, there's hope. You matter. 💙"
        },
        happy: {
          hi: "यह सुनकर बहुत अच्छा लगा कि आप अच्छा महसূस कर रहे हैं! 😊 ये सकारात्मक क्षण बहुत महत्वपूर्ण हैं। आज आपके लिए क्या अच्छा रहा है?",
          en: "It's wonderful to hear you're feeling good! 😊 Those positive moments are so important. What's been going well for you today?",
          bn: "আপনি ভালো অনুভব করছেন শুনে খুব ভালো লাগল! 😊 এই ইতিবাচক মুহূর্তগুলো খুবই গুরুত্বপূর্ণ। আজ আপনার জন্য কী ভালো হয়েছে?",
          default: "It's wonderful to hear you're feeling good! 😊 What's been going well for you today?"
        },
        emergency: {
          hi: "मुझे आपकी बात से बहुत चिंता हो रही है। आपका जीवन मूल्यवान और अर्थपूर्ण है। कृपया तुरंत किसी भरोसेमंद व्यक्ति से संपर्क करें - दोस्त, परिवार, काउंसलर, या iCall (9152987821) जैसी हेल्पलाइन। आपको अकेले इससे नहीं गुजरना है। 🆘",
          en: "I'm really concerned about what you're sharing. Your life has value and meaning. Please reach out to someone you trust right now - a friend, family member, counselor, or crisis helpline like iCall (9152987821) or AASRA (9820466726). You don't have to go through this alone. 🆘",
          default: "I'm really concerned. Your life has value. Please reach out to someone you trust or call iCall (9152987821). You don't have to go through this alone. 🆘"
        },
        normal: {
          hi: "मेरे साथ साझा करने के लिए धन्यवाद। मैं यहाँ हूँ जो भी तरीके से मैं आपका साथ दे सकूं। आपका दिन कैसा रहा? 😊",
          en: "Thank you for sharing with me. I'm here to listen and support you in whatever way I can. How has your day been going? 😊",
          bn: "আমার সাথে শেয়ার করার জন্য ধন্যবাদ। আমি এখানে আছি যেভাবেই আপনাকে সাহায্য করতে পারি। আপনার দিন কেমন কাটছে? 😊",
          default: "Thank you for sharing with me. I'm here to support you. How has your day been? 😊"
        }
      };
      
      const responseText = fallbackResponses[mood]?.[detectedLanguage] || 
                          fallbackResponses[mood]?.['default'] || 
                          fallbackResponses.normal[detectedLanguage] ||
                          fallbackResponses.normal.default;
      
      parsedResponse = {
        response: responseText,
        mood: mood,
        emergency: emergencyAlert,
        language: detectedLanguage
      };
    }

    // Ensure all required fields are present
    parsedResponse.response = parsedResponse.response || "मैं यहाँ आपका साथ देने के लिए हूँ। 💙 / I'm here to support you. 💙";
    parsedResponse.mood = parsedResponse.mood || 'normal';
    parsedResponse.emergency = parsedResponse.emergency || false;
    parsedResponse.language = parsedResponse.language || 'hi';

    console.log('Final response:', parsedResponse);
    res.json(parsedResponse);

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      response: 'मुझे खेद है, लेकिन मुझे अभी परेशानी हो रही है। तत्काल सहायता के लिए कृपया किसी काउंसलर से संपर्क करें। 💙 / I apologize, but I\'m having trouble right now. Please reach out to a counselor if you need immediate support. 💙',
      mood: 'normal',
      emergency: false,
      language: 'hi',
      error: 'Server error occurred'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MindCare Mental Health Chatbot - Indian Languages',
    aiConfigured: !!process.env.GEMINI_API_KEY,
    supportedLanguages: [
      'Hindi', 'English (Indian)', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 
      'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese', 
      'Urdu', 'Maithili', 'Santali', 'Kashmiri', 'Nepali', 'Sindhi', 
      'Dogri', 'Manipuri', 'Bodo', 'Konkani'
    ]
  });
});



// 404 Error Handler - Must be placed after all routes
app.use((req, res, next) => {
  console.log(`404 Error: ${req.method} ${req.path} - Route not found`);
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested resource does not exist on this server.',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /',
      'GET /health',
      'POST /api/chat'
    ]
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ MindCare API server running at http://localhost:${port}`);
  console.log(`📋 Available routes:`);
  console.log(`   GET  /health    - Health check endpoint`);
  console.log(`   POST /api/chat  - Chat API endpoint`);
  console.log(`📝 Note: Chat interface is served by main website's AIChat.tsx component`);
});
