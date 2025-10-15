import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import CircleGauge from "@/components/ui/CircleGauge";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AssessmentPieChart, 
  AnimatedCircleProgress, 
  ChatBubbleResult,
  getSeverityColor
} from "@/components/ui/AssessmentCharts";
import { 
  ClipboardCheck, 
  Brain, 
  Heart, 
  AlertCircle, 
  CheckCircle, 
  Info,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Phone,
  Shield,
  Calendar
} from "lucide-react";
import { 
  allAssessmentQuestions, 
  calculateAllScores, 
  AssessmentResult 
} from "@/data/assessmentTools";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/utils";

// Use standardized assessment questions
const questions = allAssessmentQuestions;

export default function Assessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<'all' | 'phq9' | 'gad7' | 'ghq12'>('all');
  const { toast } = useToast();

  const getFilteredQuestions = () => {
    if (selectedAssessment === 'all') return questions;
    return questions.filter(q => q.category === selectedAssessment);
  };

  const filteredQuestions = getFilteredQuestions();
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const progress = (Object.keys(answers).filter(key => 
    filteredQuestions.some(q => q.id === key)
  ).length / filteredQuestions.length) * 100;

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const results = calculateResults();
      const hasHighRisk = results.some(r => r.riskLevel === 'high');
      const hasFollowUp = results.some(r => r.requiresFollowUp);
      
      // Save full assessment to backend
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const assessmentData = {
            assessment_type: selectedAssessment,
            answers,
            results
          };
          
          await fetch(`${API_URL}/assessment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(assessmentData),
          });
          
          // Also update profile scores
          const scores = {
            gad7_score: results.find(r => r.toolName === 'GAD-7')?.score || null,
            phq9_score: results.find(r => r.toolName === 'PHQ-9')?.score || null,
            ghq12_score: results.find(r => r.toolName === 'GHQ-12')?.score || null,
          };
          
          await fetch(`${API_URL}/profile/me`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(scores),
          });
          
          toast({
            title: "Results Saved",
            description: "Your assessment results have been saved.",
          });
        }
      } catch (error) {
        console.error('Failed to save assessment results:', error);
        toast({
          title: "Save Failed",
          description: "Results calculated but not saved. You can retake or contact support.",
          variant: "destructive",
        });
      }
      
      if (hasHighRisk) {
        toast({
          title: "Assessment Complete",
          description: "Your results indicate you may benefit from professional support. Please review your recommendations carefully.",
          variant: "destructive",
        });
      } else if (hasFollowUp) {
        toast({
          title: "Assessment Complete", 
          description: "Consider speaking with a counselor about your results.",
        });
      } else {
        toast({
          title: "Assessment Complete",
          description: "Great job taking care of your mental health!",
        });
      }
      
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateResults = (): AssessmentResult[] => {
    const results = calculateAllScores(answers);
    
    // Filter results based on selected assessment
    if (selectedAssessment === 'phq9') {
      return results.filter(r => r.toolName === 'PHQ-9');
    } else if (selectedAssessment === 'gad7') {
      return results.filter(r => r.toolName === 'GAD-7');
    } else if (selectedAssessment === 'ghq12') {
      return results.filter(r => r.toolName === 'GHQ-12');
    }
    
    return results;
  };

  const results = showResults ? calculateResults() : [];
  const overallRisk = results.length > 0 
    ? results.some(r => r.severity === 'severe' || r.severity === 'moderately-severe') ? 'high'
    : results.some(r => r.severity === 'moderate') ? 'medium' 
    : 'low'
    : 'low';

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'minimal': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'mild': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'moderate': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'moderately-severe': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'severe': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Use the imported getSeverityColor function for consistency

  const resetAssessment = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setAssessmentStarted(false);
    setSelectedAssessment('all');
  };

  if (!assessmentStarted) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <ClipboardCheck className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-3xl font-bold">Mental Health Assessment</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Take this confidential assessment to better understand your current mental health status. 
              This tool is based on validated screening instruments.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={selectedAssessment} onValueChange={(value: any) => setSelectedAssessment(value)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Complete</TabsTrigger>
                  <TabsTrigger value="phq9">PHQ-9</TabsTrigger>
                  <TabsTrigger value="gad7">GAD-7</TabsTrigger>
                  <TabsTrigger value="ghq12">GHQ-12</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Complete Assessment:</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 28 standardized questions (PHQ-9 + GAD-7 + GHQ-12)</li>
                      <li>• Takes approximately 10-15 minutes to complete</li>
                      <li>• Comprehensive mental health screening</li>
                      <li>• Professional-grade assessment tools</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="phq9" className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">PHQ-9 (Depression Screening):</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 9 questions about depression symptoms</li>
                      <li>• Takes approximately 5 minutes</li>
                      <li>• Widely used clinical screening tool</li>
                      <li>• Assesses depression severity</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="gad7" className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">GAD-7 (Anxiety Screening):</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 7 questions about anxiety symptoms</li>
                      <li>• Takes approximately 3-5 minutes</li>
                      <li>• Gold standard for anxiety screening</li>
                      <li>• Measures generalized anxiety disorder</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="ghq12" className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">GHQ-12 (General Health):</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 12 questions about psychological distress</li>
                      <li>• Takes approximately 5 minutes</li>
                      <li>• Measures overall psychological well-being</li>
                      <li>• Identifies general mental health concerns</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Please Note:</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This assessment is a screening tool and not a substitute for professional diagnosis. 
                  If you're experiencing thoughts of self-harm, please seek immediate professional help.
                </p>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                <Button onClick={() => setAssessmentStarted(true)} size="lg">
                  Start Assessment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-3xl font-bold">Your Assessment Results</h1>
            </div>
            <p className="text-muted-foreground">
              Based on your responses, here's your current mental health profile.
            </p>
          </div>

          {/* Overall Risk Card */}
          <Card className={`mb-6 ${overallRisk === 'high' ? 'border-red-200 bg-red-50 dark:bg-red-900/10' : 
                           overallRisk === 'medium' ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/10' : 
                           'border-green-200 bg-green-50 dark:bg-green-900/10'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${overallRisk === 'high' ? 'text-red-700 dark:text-red-400' : 
                                    overallRisk === 'medium' ? 'text-orange-700 dark:text-orange-400' : 
                                    'text-green-700 dark:text-green-400'}`}>
                {overallRisk === 'high' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                Overall Assessment: {overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)} Risk
              </CardTitle>
              <CardDescription>
                Assessment completed using standardized screening tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overallRisk === 'high' && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    <p className="font-medium text-red-800 dark:text-red-200">Immediate Support Recommended</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your responses indicate significant symptoms that would benefit from professional support.
                  </p>
                  <div className="flex gap-2">
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Crisis Line
                    </Button>
                    <Button variant="outline" className="border-red-200">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Counseling
                    </Button>
                  </div>
                </div>
              )}
              
              {results.some(r => r.requiresFollowUp) && overallRisk !== 'high' && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-5 w-5 text-orange-600" />
                    <p className="font-medium text-orange-800 dark:text-orange-200">Follow-up Recommended</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Consider discussing your results with a mental health professional.
                  </p>
                  <Button variant="outline" className="border-orange-200">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Consultation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Individual Results - Centered and expanded */}
          <div className="mb-8 flex justify-center">
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
              {results.map((result) => (
                <Card key={result.toolName} className={result.riskLevel === 'high' ? 'border-red-200' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{result.category}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          {result.toolName}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge className={getLevelColor(result.severity)}>
                          {result.severity}
                        </Badge>
                        {result.requiresFollowUp && (
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs">
                              Follow-up
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      Score: {result.score}/{result.maxScore}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-center py-2">
                      {/* Using the same AnimatedCircleProgress as the main center circle */}
                      <div className="w-full flex justify-center">
                        <AnimatedCircleProgress
                          score={result.score}
                          maxScore={result.maxScore}
                          severity={result.severity}
                          toolName={result.toolName}
                          color={getSeverityColor(result.severity)}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">{result.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {results.map((result) => (
                  <div key={result.category}>
                    <h3 className="font-semibold mb-3">For {result.category}:</h3>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                    {result !== results[results.length - 1] && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="justify-start h-auto p-4" variant="outline">
                  <div className="text-left">
                    <div className="font-medium">Book a Counseling Session</div>
                    <div className="text-sm text-muted-foreground">Connect with a professional</div>
                  </div>
                </Button>
                <Button className="justify-start h-auto p-4" variant="outline">
                  <div className="text-left">
                    <div className="font-medium">Explore Wellness Activities</div>
                    <div className="text-sm text-muted-foreground">Find activities that help</div>
                  </div>
                </Button>
                <Button className="justify-start h-auto p-4" variant="outline">
                  <div className="text-left">
                    <div className="font-medium">Join Peer Support</div>
                    <div className="text-sm text-muted-foreground">Connect with others</div>
                  </div>
                </Button>
                <Button onClick={resetAssessment} className="justify-start h-auto p-4" variant="outline">
                  <div className="text-left">
                    <div className="font-medium">Retake Assessment</div>
                    <div className="text-sm text-muted-foreground">Track your progress</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {filteredQuestions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg leading-relaxed">
              {currentQuestion.text}
            </CardTitle>
            <CardDescription>
              Select the option that best describes your recent experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup 
              value={answers[currentQuestion.id]?.toString() || ""}
              onValueChange={(value) => handleAnswer(currentQuestion.id, parseInt(value))}
            >
              {currentQuestion.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={option.value.toString()} id={`${currentQuestion.id}-${option.value}`} />
                  <Label 
                    htmlFor={`${currentQuestion.id}-${option.value}`} 
                    className="flex-1 cursor-pointer text-sm leading-relaxed"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-4">
              <Button 
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button 
                onClick={nextQuestion}
                disabled={answers[currentQuestion.id] === undefined}
              >
                {currentQuestionIndex === filteredQuestions.length - 1 ? 'View Results' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button 
                onClick={resetAssessment}
                variant="secondary"
                className="w-full py-6 text-lg"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Assessment Selection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Note */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>🔒 Your responses are completely confidential and stored only on your device.</p>
        </div>
      </div>
    </div>
  );
}