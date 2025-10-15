import { useState, useRef, useEffect, memo } from "react";
import { Send, Bot, User, AlertTriangle, Phone, Heart, Brain, MessageSquare, Lightbulb, Clock, Zap, Target, Shield, Mic, Plus, Upload, Image, Video, FileText, MicOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { sendToMindCare } from "@/lib/mindcareClient";
import { useLanguage } from "@/contexts/LanguageContext";
import SplineBackground from "@/components/SplineBackground";

// Memoized Spline background to prevent re-renders while typing
const MemoizedSplineBackground = memo(SplineBackground);


interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  urgency?: "normal" | "high" | "emergency";
  attachments?: {
    type: "image" | "video" | "file";
    name: string;
    url: string;
    size?: number;
  }[];
}

const quickResponses = [
  "I'm feeling anxious about upcoming exams 📚",
  "Having trouble sleeping properly 😴",
  "Feeling overwhelmed with studies and pressure 😰",
  "Missing home and family deeply 🏠",
  "Struggling with hostel life adjustment 🏢",
  "Need help managing competitive exam stress 📖",
  "Feeling lonely or socially isolated 😔",
  "Worried about future career prospects 💼",
  "Having family expectations pressure 👨‍👩‍👧‍👦",
  "Dealing with financial stress 💰"
];

const aiResponses = {
  anxiety: "मैं समझ सकता हूं कि आप चिंतित महसूस कर रहे हैं। यहां कुछ तत्काल तकनीकें हैं जो मदद कर सकती हैं: 4-7-8 सांस लेने की तकनीक आज़माएं (4 तक सांस लें, 7 तक रोकें, 8 तक छोड़ें)। याद रखें, चिंता अस्थायी है और इसे संभाला जा सकता है। क्या आप चाहेंगे कि मैं आपको एक त्वरित ग्राउंडिंग एक्सरसाइज़ के माध्यम से गाइड करूं? Remember, lakhs of students face similar challenges - you're not alone! 💙",
  sleep: "नींद की समस्याएं छात्रों में आम हैं। एक बेडटाइम रूटीन बनाने की कोशिश करें: सोने से 1 घंटे पहले कोई स्क्रीन नहीं, अपने कमरे को ठंडा और अंधेरा रखें। Many Indian students find that light dinner, avoiding late-night tea/coffee, and reading something positive helps. Guided meditation apps in Hindi can also be very helpful! 😴",
  overwhelmed: "अभिभूत महसूस करना इस बात का संकेत है कि आप बहुत कुछ संभाल रहे हैं। आइए इसे तोड़ते हैं: सबसे जरूरी काम क्या है? क्या हम आपकी जिम्मेदारियों को प्राथमिकता दे सकते हैं? Remember the Indian philosophy - 'योग: कर्मसु कौशलम्' - skill in action. Take one step at a time. घबराना नहीं, सब ठीक हो जाएगा! 🌟",
  homesick: "घर की याद आना बिल्कुल सामान्य है और यह दिखाता है कि आपके प्रेमपूर्ण रिश्ते हैं। Try video calling family during specific times, cook/eat familiar foods, find students from your state/region. Many hostels have regional groups - यह आपको अपनापन देगा। आपकी भावनाएं बिल्कुल सही हैं। 🏠💝",
  pressure: "सामाजिक दबाव चुनौतीपूर्ण हो सकता है। याद रखें, आपकी कीमत दूसरों की मंजूरी से तय नहीं होती। अपने मूल्यों और सीमाओं पर भरोसा करें। 'ना' कहना ठीक है। As our elders say - 'अपना रास्ता खुद बनाओ'। You have the strength to stay true to yourself! 💪",
  stress: "तनाव प्रबंधन एक ऐसा कौशल है जिसे हम मिलकर विकसित कर सकते हैं। Try: प्राणायाम, regular exercise, time management, और mindfulness। बड़े काम को छोटे हिस्सों में बांटें। Remember - 'धैर्य का फल मीठा होता है'। What specific area would you like to focus on? 🧘‍♂️",
  lonely: "अकेलापन महसूस करना इसका मतलब नहीं कि आपमें कुछ गलत है। Consider joining cultural clubs, sports, or volunteering. Sometimes one genuine friendship can change everything. Many successful people felt lonely during college - you're in good company! आप मित्रता और स्नेह के योग्य हैं। 🤝💙",
  career: "Career uncertainty is very common among Indian students due to high competition. Remember, there are multiple paths to success - not just traditional ones। Focus on your strengths, explore internships, talk to seniors in different fields. 'कर्म करो, फल की चिंता मत करो'। Your efforts will bear fruit! 🎯",
  family: "Family expectations can feel overwhelming sometimes. Remember, they want your happiness ultimately। Open communication helps - share your thoughts respectfully। It's okay to have different dreams। Many successful Indians took unconventional paths। Balance respect for family with personal aspirations। 👨‍👩‍👧‍👦💙",
  financial: "Financial stress is real and affects many students। Look into scholarships, part-time opportunities, and campus support services। Remember, temporary financial constraints don't define your future। Many successful people overcame such challenges। Focus on long-term goals while managing present needs। 💰🌟"
};

export default function AIChat() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: t('ai.welcome'),
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<"quick" | "detailed">("quick");
  const [userMood, setUserMood] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  // Removed automatic scrolling to keep page position stable

  const getAIResponse = (userMessage: string): { text: string; urgency: "normal" | "high" | "emergency" } => {
    const message = userMessage.toLowerCase();
    
    // Emergency keywords
    if (message.includes("suicide") || message.includes("kill myself") || message.includes("end it all") || message.includes("harm myself") || message.includes("मरना") || message.includes("आत्महत्या")) {
      return {
        text: "🚨 I'm very concerned about what you've shared. आपकी जिंदगी कीमती है और लोग आपकी मदद करना चाहते हैं। Please reach out immediately: National Suicide Prevention Lifeline: 9152987821 | Campus Emergency: 1800-599-0019 | KIRAN Helpline: 1800-599-0019. आप अकेले नहीं हैं - help is available!",
        urgency: "emergency"
      };
    }

    // High urgency keywords  
    if (message.includes("panic") || message.includes("crisis") || message.includes("emergency") || message.includes("can't cope") || message.includes("बहुत परेशान") || message.includes("panic attack")) {
      return {
        text: "I can hear that you're in distress right now। While I'm here to help, please also consider: 1) Campus crisis line: 1800-599-0019, 2) Going to counseling center, 3) Trusted friend/family member। Right now, try grounding: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste। सांस लें - you will get through this। 🫂",
        urgency: "high"
      };
    }

    // Enhanced keyword matching for Indian context
    if (message.includes("anxious") || message.includes("anxiety") || message.includes("exam") || message.includes("worry") || message.includes("चिंता") || message.includes("परीक्षा")) {
      return { text: aiResponses.anxiety, urgency: "normal" };
    }
    if (message.includes("sleep") || message.includes("tired") || message.includes("insomnia") || message.includes("नींद") || message.includes("सो नहीं")) {
      return { text: aiResponses.sleep, urgency: "normal" };
    }
    if (message.includes("overwhelmed") || message.includes("too much") || message.includes("stressed") || message.includes("तनाव") || message.includes("pressure")) {
      return { text: aiResponses.overwhelmed, urgency: "normal" };
    }
    if (message.includes("home") || message.includes("family") || message.includes("miss") || message.includes("घर") || message.includes("परिवार") || message.includes("homesick")) {
      return { text: aiResponses.homesick, urgency: "normal" };
    }
    if (message.includes("lonely") || message.includes("alone") || message.includes("isolated") || message.includes("अकेला") || message.includes("दोस्त नहीं")) {
      return { text: aiResponses.lonely, urgency: "normal" };
    }
    if (message.includes("future") || message.includes("career") || message.includes("uncertain") || message.includes("placement") || message.includes("job") || message.includes("भविष्य") || message.includes("नौकरी")) {
      return { text: aiResponses.career, urgency: "normal" };
    }
    if (message.includes("parents") || message.includes("expectations") || message.includes("family pressure") || message.includes("माता-पिता") || message.includes("उम्मीदें")) {
      return { text: aiResponses.family, urgency: "normal" };
    }
    if (message.includes("money") || message.includes("financial") || message.includes("fees") || message.includes("पैसे") || message.includes("फीस")) {
      return { text: aiResponses.financial, urgency: "normal" };
    }

    // Default culturally-aware response
    return {
      text: "Thank you for sharing with me। मैं आपकी बात समझना चाहता हूं। Can you tell me more about what you're experiencing? Whether it's academic stress, family expectations, hostel life, or anything else - I'm here to listen and support। याद रखें, help मांगना strength का sign है। If urgent, please contact emergency services। 🤗",
      urgency: "normal"
    };
  };

  const mapMindCareToUrgency = (mood: string, emergency: boolean): "normal" | "high" | "emergency" => {
    if (emergency) return "emergency";
    const highMoods = ["stressed", "anxious", "panic", "crisis"];
    return highMoods.includes(mood?.toLowerCase()) ? "high" : "normal";
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user", 
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const conversationHistory = messages.slice(-6).map(m => ({
        user: m.sender === "user" ? m.text : undefined,
        assistant: m.sender === "ai" ? m.text : undefined,
        mood: m.urgency === "emergency" ? "emergency" : (m.urgency === "high" ? "stressed" : "normal"),
        language: "en"
      })).filter(h => h.user || h.assistant);

      const mc = await sendToMindCare(text, conversationHistory);
      const urgency = mapMindCareToUrgency(mc.mood, mc.emergency);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: mc.response,
        sender: "ai",
        timestamp: new Date(),
        urgency
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      if (urgency === "emergency") {
        toast({
          title: "Emergency Support Available",
          description: "Crisis helplines are ready to help you right now.",
          variant: "destructive"
        });
      }
    } catch (error) {
      // Fallback to local rules if MindCare is unreachable
      const response = getAIResponse(text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: "ai",
        timestamp: new Date(),
        urgency: response.urgency,
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      toast({
        title: "Connected to local assistant",
        description: "MindCare service unavailable. Using local responses.",
      });
    }
  };

  const handleQuickResponse = (text: string) => {
    handleSendMessage(text);
  };

  // Voice to text functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak now... Click the mic again to stop."
      });
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = (audioBlob: Blob) => {
    // Simple mock transcription - in real app you'd use a service like Web Speech API or external service
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => prev + (prev ? ' ' : '') + transcript);
        toast({
          title: "Voice transcribed",
          description: "Your speech has been converted to text."
        });
      };
      
      recognition.onerror = () => {
        toast({
          title: "Speech recognition failed",
          description: "Could not transcribe your voice. Please try typing instead.",
          variant: "destructive"
        });
      };
      
      recognition.start();
    } else {
      // Fallback for demo purposes
      setInputMessage(prev => prev + (prev ? ' ' : '') + "[Voice message recorded - transcription not available in this browser]");
      toast({
        title: "Voice recorded",
        description: "Speech recognition not supported in this browser."
      });
    }
  };

  // File upload functionality
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select files smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }

      const fileUrl = URL.createObjectURL(file);
      const fileType = file.type.startsWith('image/') ? 'image' : 
                      file.type.startsWith('video/') ? 'video' : 'file';

      const messageWithFile: Message = {
        id: Date.now().toString(),
        text: `Shared ${fileType}: ${file.name}`,
        sender: "user",
        timestamp: new Date(),
        attachments: [{
          type: fileType,
          name: file.name,
          url: fileUrl,
          size: file.size
        }]
      };

      setMessages(prev => [...prev, messageWithFile]);
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been shared.`
      });
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsFileDialogOpen(false);
  };

  const triggerFileUpload = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative flex-1 flex flex-col bg-background">
        <MemoizedSplineBackground />
        
        {/* Stable Overlay Effects - Less Dynamic in Light Mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.05),transparent_70%)] pointer-events-none" />
        
        <div className="flex-1 pt-20 px-4 pb-8 max-w-7xl mx-auto w-full relative z-10">
        {/* Emergency Banner - Futuristic */}
        <Alert className="mb-8 bg-gradient-glass backdrop-blur-xl border border-destructive/30 shadow-cyber animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
          <AlertDescription className="flex items-center justify-between">
            <div className="text-destructive font-medium">
              <strong className="text-destructive">{t('ai.emergency.title')}</strong> 
              <span className="text-muted-foreground ml-2">{t('ai.emergency.text')}</span>
            </div>
            <Button variant="emergency" size="sm" className="shadow-neon">
              <Phone className="h-4 w-4 mr-2" />
              {t('ai.emergency.call')}
            </Button>
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Enhanced Futuristic Sidebar - Positioned beside chat */}
           <div className="lg:col-span-4 flex animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {/* Quick Responses */}
            <Card className="flex-1 bg-gradient-glass backdrop-blur-xl border border-primary/20 shadow-cyber hover:shadow-neon transition-all duration-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-gradient-cyber rounded-lg shadow-neon">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-neon bg-clip-text text-transparent font-bold">Quick Start Topics</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground/80">Common challenges Indian students face</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickResponses.map((response, index) => (
                  <Button
                    key={index}
                    variant="glass-primary"
                    size="sm"
                    className="w-full text-left justify-start h-auto p-4 whitespace-normal hover:shadow-cyber hover:scale-[1.02] transition-all duration-300 animate-fade-in text-white"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleQuickResponse(response)}
                  >
                    {response}
                  </Button>
                ))}
              </CardContent>
            </Card>

          </div>

          {/* Main Chat Area - Positioned beside sidebar */}
          <div className="lg:col-span-8 flex animate-fade-in">
            <Card className="h-full flex flex-col bg-gradient-glass backdrop-blur-xl border border-primary/20 shadow-cyber hover:shadow-neon transition-all duration-500">
              {/* Enhanced Futuristic Header */}
              <div className="bg-gradient-cyber text-white p-6 border-b border-primary/30 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-neon" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-glass backdrop-blur-md rounded-full border border-primary-glow/30 shadow-neon animate-float">
                      <Bot className="h-7 w-7 text-primary-glow" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">
                        {t('ai.title')}
                      </h1>
                      <p className="text-sm text-primary-glow/80 font-medium">
                        {t('ai.subtitle')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant={chatMode === "quick" ? "neon" : "glass-primary"}
                      size="sm"
                      onClick={() => setChatMode("quick")}
                      className="hover:scale-105 transition-all duration-300"
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      {t('ai.mode.quick')}
                    </Button>
                    <Button
                      variant={chatMode === "detailed" ? "neon" : "glass-primary"}
                      size="sm"
                      onClick={() => setChatMode("detailed")}
                      className="hover:scale-105 transition-all duration-300"
                    >
                      <Target className="h-4 w-4 mr-1" />
                      {t('ai.mode.detailed')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages with Glassmorphism */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${message.sender === "user" ? "flex-row-reverse" : ""} animate-slide-up`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-cyber transition-all duration-300 hover:scale-110 ${
                        message.sender === "user" 
                          ? "bg-gradient-neon text-background border border-primary-glow/30" 
                          : "bg-gradient-cyber text-white border border-primary-glow/30 animate-pulse-glow"
                      }`}>
                        {message.sender === "user" ? <User className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
                      </div>
                      
                      <div className={`max-w-[75%] ${message.sender === "user" ? "text-right" : ""}`}>
                        <div className={`p-5 rounded-2xl backdrop-blur-lg transition-all duration-300 hover:scale-[1.02] ${
                          message.sender === "user"
                            ? "bg-gradient-neon text-background shadow-neon border border-primary-glow/30"
                            : message.urgency === "emergency"
                            ? "bg-gradient-glass border-2 border-destructive text-destructive animate-pulse shadow-neon"
                            : message.urgency === "high"
                            ? "bg-gradient-glass border border-warning text-warning shadow-cyber"
                            : "bg-gradient-glass border border-primary/20 text-foreground shadow-glass"
                        }`}>
                          <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.text}</div>
                          
                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((attachment, attIndex) => (
                                <div key={attIndex} className="bg-background/20 backdrop-blur-sm rounded-lg p-3 border border-primary/10">
                                  {attachment.type === 'image' && (
                                    <div className="space-y-2">
                                      <img 
                                        src={attachment.url} 
                                        alt={attachment.name}
                                        className="max-w-full h-auto rounded-lg max-h-64 object-cover"
                                      />
                                      <div className="flex items-center gap-2 text-xs opacity-70">
                                        <Image className="h-3 w-3" />
                                        <span>{attachment.name}</span>
                                        {attachment.size && <span>({(attachment.size / 1024 / 1024).toFixed(1)} MB)</span>}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {attachment.type === 'video' && (
                                    <div className="space-y-2">
                                      <video 
                                        src={attachment.url} 
                                        controls
                                        className="max-w-full h-auto rounded-lg max-h-64"
                                      />
                                      <div className="flex items-center gap-2 text-xs opacity-70">
                                        <Video className="h-3 w-3" />
                                        <span>{attachment.name}</span>
                                        {attachment.size && <span>({(attachment.size / 1024 / 1024).toFixed(1)} MB)</span>}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {attachment.type === 'file' && (
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-primary/20 rounded-lg">
                                        <FileText className="h-4 w-4 text-primary" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-sm font-medium">{attachment.name}</div>
                                        {attachment.size && (
                                          <div className="text-xs opacity-70">
                                            {(attachment.size / 1024 / 1024).toFixed(1)} MB
                                          </div>
                                        )}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(attachment.url, '_blank')}
                                        className="text-primary hover:bg-primary/20"
                                      >
                                        <Upload className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2 opacity-70">
                          <Clock className="h-3 w-3" />
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-4 animate-fade-in">
                      <div className="w-12 h-12 rounded-full bg-gradient-cyber text-white flex items-center justify-center shadow-cyber border border-primary-glow/30 animate-pulse-glow">
                        <Bot className="h-6 w-6" />
                      </div>
                      <div className="bg-gradient-glass backdrop-blur-lg p-5 rounded-2xl border border-primary/20 shadow-glass">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-gradient-neon rounded-full animate-bounce" />
                          <div className="w-3 h-3 bg-gradient-neon rounded-full animate-bounce" style={{animationDelay: "0.2s"}} />
                          <div className="w-3 h-3 bg-gradient-neon rounded-full animate-bounce" style={{animationDelay: "0.4s"}} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Futuristic Chat Input */}
              <div className="border-t border-primary/20 p-6 space-y-4 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
                {chatMode === "quick" ? (
                  <div className="flex gap-2">
                    <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="p-2 rounded-xl bg-gradient-glass backdrop-blur-lg border border-primary/20 hover:border-primary-glow hover:shadow-neon transition-all duration-300"
                        >
                          <Plus className="h-4 w-4 text-primary" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gradient-glass backdrop-blur-xl border border-primary/20">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Upload Files</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-4 p-4">
                          <Button
                            variant="outline"
                            className="h-16 flex flex-col gap-2 hover:shadow-neon transition-all duration-300"
                            onClick={() => triggerFileUpload('image/*')}
                          >
                            <Image className="h-6 w-6 text-primary" />
                            <span>Upload Images</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-16 flex flex-col gap-2 hover:shadow-neon transition-all duration-300"
                            onClick={() => triggerFileUpload('video/*')}
                          >
                            <Video className="h-6 w-6 text-primary" />
                            <span>Upload Videos</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-16 flex flex-col gap-2 hover:shadow-neon transition-all duration-300"
                            onClick={() => triggerFileUpload('.pdf,.doc,.docx,.txt')}
                          >
                            <FileText className="h-6 w-6 text-primary" />
                            <span>Upload Documents</span>
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="flex-1 bg-background/95 backdrop-blur-sm border border-primary/30 focus:border-primary focus:shadow-soft transition-colors duration-200 text-foreground placeholder:text-muted-foreground rounded-xl"
                      placeholder="Type your message... (या हिंदी में लिखें)"
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputMessage)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-2 rounded-xl bg-gradient-glass backdrop-blur-lg border transition-all duration-300 ${
                        isRecording 
                          ? 'border-destructive text-destructive shadow-destructive/20' 
                          : 'border-primary/20 hover:border-primary-glow hover:shadow-neon'
                      }`}
                    >
                      {isRecording ? (
                        <MicOff className="h-4 w-4 animate-pulse" />
                      ) : (
                        <Mic className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                    <Button 
                      onClick={() => handleSendMessage(inputMessage)} 
                      variant="cyber" 
                      className="rounded-xl shadow-neon hover:shadow-cyber"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Share your thoughts in detail... Feel free to write in Hindi or English, whatever feels comfortable. मैं आपकी हर बात समझूंगा।"
                        rows={3}
                        className="bg-background/95 backdrop-blur-sm border border-primary/30 focus:border-primary focus:shadow-soft transition-colors duration-200 text-foreground placeholder:text-muted-foreground rounded-xl resize-none pr-20"
                      />
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="p-2 rounded-lg bg-gradient-glass backdrop-blur-lg border border-primary/20 hover:border-primary-glow hover:shadow-neon transition-all duration-300"
                            >
                              <Plus className="h-4 w-4 text-primary" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gradient-glass backdrop-blur-xl border border-primary/20">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">Upload Files</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 gap-4 p-4">
                              <Button
                                variant="outline"
                                className="h-16 flex flex-col gap-2 hover:shadow-neon transition-all duration-300"
                                onClick={() => triggerFileUpload('image/*')}
                              >
                                <Image className="h-6 w-6 text-primary" />
                                <span>Upload Images</span>
                              </Button>
                              <Button
                                variant="outline"
                                className="h-16 flex flex-col gap-2 hover:shadow-neon transition-all duration-300"
                                onClick={() => triggerFileUpload('video/*')}
                              >
                                <Video className="h-6 w-6 text-primary" />
                                <span>Upload Videos</span>
                              </Button>
                              <Button
                                variant="outline"
                                className="h-16 flex flex-col gap-2 hover:shadow-neon transition-all duration-300"
                                onClick={() => triggerFileUpload('.pdf,.doc,.docx,.txt')}
                              >
                                <FileText className="h-6 w-6 text-primary" />
                                <span>Upload Documents</span>
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`p-2 rounded-lg bg-gradient-glass backdrop-blur-lg border transition-all duration-300 ${
                            isRecording 
                              ? 'border-destructive text-destructive shadow-destructive/20' 
                              : 'border-primary/20 hover:border-primary-glow hover:shadow-neon'
                          }`}
                        >
                          {isRecording ? (
                            <MicOff className="h-4 w-4 animate-pulse" />
                          ) : (
                            <Mic className="h-4 w-4 text-primary" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3">
                        <Badge variant="outline" className="text-xs bg-gradient-glass backdrop-blur-lg border-primary/30 text-primary hover:shadow-cyber transition-all duration-300">
                          <Shield className="h-3 w-3 mr-1" />
                          Secure & Private
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-gradient-glass backdrop-blur-lg border-primary/30 text-primary hover:shadow-cyber transition-all duration-300">
                          <Clock className="h-3 w-3 mr-1" />
                          24/7 Available
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => handleSendMessage(inputMessage)} 
                        variant="cyber" 
                        className="rounded-xl shadow-neon hover:shadow-cyber"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
        </div>
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}