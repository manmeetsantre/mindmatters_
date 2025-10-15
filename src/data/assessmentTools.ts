// Standardized Mental Health Assessment Tools
// PHQ-9, GAD-7, and GHQ-12 with proper scoring algorithms

export interface AssessmentQuestion {
  id: string;
  text: string;
  options: { value: number; label: string }[];
  category: 'phq9' | 'gad7' | 'ghq12';
}

export interface AssessmentResult {
  toolName: string;
  category: string;
  score: number;
  maxScore: number;
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
  description: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  requiresFollowUp: boolean;
}

// PHQ-9 Questions (Patient Health Questionnaire - Depression)
export const phq9Questions: AssessmentQuestion[] = [
  {
    id: 'phq9_1',
    text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
    category: 'phq9',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_2',
    text: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
    category: 'phq9',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_3',
    text: 'Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?',
    category: 'phq9',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_4',
    text: 'Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?',
    category: 'phq9',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_5',
    text: 'Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?',
    category: 'phq9',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_6',
    text: 'Over the last 2 weeks, how often have you been bothered by feeling bad about yourself or that you are a failure or have let yourself or your family down?',
    category: 'phq9',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_7',
    text: 'Over the last 2 weeks, how often have you been bothered by trouble concentrating on things, such as reading the newspaper or watching television?',
    category: 'phq9',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_8',
    text: 'Over the last 2 weeks, how often have you been bothered by moving or speaking so slowly that other people could have noticed? Or the opposite being so fidgety or restless that you have been moving around a lot more than usual?',
    category: 'phq9',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_9',
    text: 'Over the last 2 weeks, how often have you been bothered by thoughts that you would be better off dead, or of hurting yourself?',
    category: 'phq9',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  }
];

// GAD-7 Questions (Generalized Anxiety Disorder)
export const gad7Questions: AssessmentQuestion[] = [
  {
    id: 'gad7_1',
    text: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
    category: 'gad7',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7_2',
    text: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
    category: 'gad7',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7_3',
    text: 'Over the last 2 weeks, how often have you been bothered by worrying too much about different things?',
    category: 'gad7',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7_4',
    text: 'Over the last 2 weeks, how often have you been bothered by trouble relaxing?',
    category: 'gad7',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7_5',
    text: 'Over the last 2 weeks, how often have you been bothered by being so restless that it is hard to sit still?',
    category: 'gad7',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7_6',
    text: 'Over the last 2 weeks, how often have you been bothered by becoming easily annoyed or irritable?',
    category: 'gad7',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7_7',
    text: 'Over the last 2 weeks, how often have you been bothered by feeling afraid, as if something awful might happen?',
    category: 'gad7',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  }
];

// GHQ-12 Questions (General Health Questionnaire)
export const ghq12Questions: AssessmentQuestion[] = [
  {
    id: 'ghq12_1',
    text: 'Over the past few weeks, have you been able to concentrate on whatever you are doing?',
    category: 'ghq12',
    options: [
      { value: 0, label: 'Better than usual' },
      { value: 0, label: 'Same as usual' },
      { value: 1, label: 'Less than usual' },
      { value: 1, label: 'Much less than usual' }
    ]
  },
  {
    id: 'ghq12_2',
    text: 'Over the past few weeks, have you lost much sleep over worry?',
    category: 'ghq12',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 0, label: 'No more than usual' },
      { value: 1, label: 'Rather more than usual' },
      { value: 1, label: 'Much more than usual' }
    ]
  },
  {
    id: 'ghq12_3',
    text: 'Over the past few weeks, have you felt that you are playing a useful part in things?',
    category: 'ghq12',
    options: [
      { value: 0, label: 'More so than usual' },
      { value: 0, label: 'Same as usual' },
      { value: 1, label: 'Less so than usual' },
      { value: 1, label: 'Much less than usual' }
    ]
  },
  {
    id: 'ghq12_4',
    text: 'Over the past few weeks, have you felt capable of making decisions about things?',
    category: 'ghq12',
    options: [
      { value: 0, label: 'More so than usual' },
      { value: 0, label: 'Same as usual' },
      { value: 1, label: 'Less so than usual' },
      { value: 1, label: 'Much less than usual' }
    ]
  },
  {
    id: 'ghq12_5',
    text: 'Over the past few weeks, have you felt constantly under strain?',
    category: 'ghq12',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 0, label: 'No more than usual' },
      { value: 1, label: 'Rather more than usual' },
      { value: 1, label: 'Much more than usual' }
    ]
  },
  {
    id: 'ghq12_6',
    text: 'Over the past few weeks, have you felt you could not overcome your difficulties?',
    category: 'ghq12',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 0, label: 'No more than usual' },
      { value: 1, label: 'Rather more than usual' },
      { value: 1, label: 'Much more than usual' }
    ]
  },
  {
    id: 'ghq12_7',
    text: 'Over the past few weeks, have you been able to enjoy your normal day-to-day activities?',
    category: 'ghq12',
    options: [
      { value: 0, label: 'More so than usual' },
      { value: 0, label: 'Same as usual' },
      { value: 1, label: 'Less so than usual' },
      { value: 1, label: 'Much less than usual' }
    ]
  },
  {
    id: 'ghq12_8',
    text: 'Over the past few weeks, have you been able to face up to your problems?',
    category: 'ghq12',
    options: [
      { value: 0, label: 'More so than usual' },
      { value: 0, label: 'Same as usual' },
      { value: 1, label: 'Less so than usual' },
      { value: 1, label: 'Much less than usual' }
    ]
  },
  {
    id: 'ghq12_9',
    text: 'Over the past few weeks, have you been feeling unhappy and depressed?',
    category: 'ghq12',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 0, label: 'No more than usual' },
      { value: 1, label: 'Rather more than usual' },
      { value: 1, label: 'Much more than usual' }
    ]
  },
  {
    id: 'ghq12_10',
    text: 'Over the past few weeks, have you been losing confidence in yourself?',
    category: 'ghq12',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 0, label: 'No more than usual' },
      { value: 1, label: 'Rather more than usual' },
      { value: 1, label: 'Much more than usual' }
    ]
  },
  {
    id: 'ghq12_11',
    text: 'Over the past few weeks, have you been thinking of yourself as a worthless person?',
    category: 'ghq12',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 0, label: 'No more than usual' },
      { value: 1, label: 'Rather more than usual' },
      { value: 1, label: 'Much more than usual' }
    ]
  },
  {
    id: 'ghq12_12',
    text: 'Over the past few weeks, have you been feeling reasonably happy, all things considered?',
    category: 'ghq12',
    options: [
      { value: 0, label: 'More so than usual' },
      { value: 0, label: 'About same as usual' },
      { value: 1, label: 'Less so than usual' },
      { value: 1, label: 'Much less than usual' }
    ]
  }
];

// Scoring algorithms
export function calculatePHQ9Score(answers: { [key: string]: number }): AssessmentResult {
  const score = phq9Questions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
  const maxScore = 27;
  
  let severity: AssessmentResult['severity'];
  let description: string;
  let recommendations: string[];
  let riskLevel: AssessmentResult['riskLevel'];
  let requiresFollowUp: boolean;

  // Check for suicidal ideation (question 9)
  const suicidalIdeation = answers['phq9_9'] > 0;
  
  if (score >= 20) {
    severity = 'severe';
    description = 'Severe depression symptoms detected. Immediate professional intervention recommended.';
    riskLevel = 'high';
    requiresFollowUp = true;
    recommendations = [
      'Seek immediate professional mental health support',
      'Contact emergency services if having thoughts of self-harm',
      'Reach out to a trusted friend or family member',
      'Consider psychiatric evaluation for medication management'
    ];
  } else if (score >= 15) {
    severity = 'moderately-severe';
    description = 'Moderately severe depression symptoms. Professional treatment strongly recommended.';
    riskLevel = 'high';
    requiresFollowUp = true;
    recommendations = [
      'Schedule appointment with mental health professional',
      'Consider therapy (CBT, IPT, or other evidence-based treatments)',
      'Discuss medication options with healthcare provider',
      'Engage in regular physical activity and maintain sleep schedule'
    ];
  } else if (score >= 10) {
    severity = 'moderate';
    description = 'Moderate depression symptoms. Professional support recommended.';
    riskLevel = 'medium';
    requiresFollowUp = true;
    recommendations = [
      'Consider counseling or therapy',
      'Practice stress management techniques',
      'Maintain regular exercise and healthy diet',
      'Stay connected with supportive friends and family'
    ];
  } else if (score >= 5) {
    severity = 'mild';
    description = 'Mild depression symptoms. Self-care and monitoring recommended.';
    riskLevel = 'medium';
    requiresFollowUp = false;
    recommendations = [
      'Practice regular self-care activities',
      'Maintain healthy lifestyle habits',
      'Consider mindfulness or meditation',
      'Monitor symptoms and retake assessment in 2 weeks'
    ];
  } else {
    severity = 'minimal';
    description = 'Minimal depression symptoms. Continue current wellness practices.';
    riskLevel = 'low';
    requiresFollowUp = false;
    recommendations = [
      'Continue current healthy habits',
      'Practice preventive self-care',
      'Stay connected with support network',
      'Regular physical activity and adequate sleep'
    ];
  }

  // Override risk level if suicidal ideation is present
  if (suicidalIdeation) {
    riskLevel = 'high';
    requiresFollowUp = true;
    recommendations.unshift('URGENT: If having thoughts of self-harm, contact crisis hotline immediately');
  }

  return {
    toolName: 'PHQ-9',
    category: 'Depression',
    score,
    maxScore,
    severity,
    description,
    recommendations,
    riskLevel,
    requiresFollowUp
  };
}

export function calculateGAD7Score(answers: { [key: string]: number }): AssessmentResult {
  const score = gad7Questions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
  const maxScore = 21;
  
  let severity: AssessmentResult['severity'];
  let description: string;
  let recommendations: string[];
  let riskLevel: AssessmentResult['riskLevel'];
  let requiresFollowUp: boolean;
  
  if (score >= 15) {
    severity = 'severe';
    description = 'Severe anxiety symptoms detected. Professional treatment recommended.';
    riskLevel = 'high';
    requiresFollowUp = true;
    recommendations = [
      'Seek professional mental health support',
      'Consider anxiety-specific therapy (CBT, exposure therapy)',
      'Discuss medication options with healthcare provider',
      'Practice relaxation techniques daily'
    ];
  } else if (score >= 10) {
    severity = 'moderate';
    description = 'Moderate anxiety symptoms. Professional support recommended.';
    riskLevel = 'medium';
    requiresFollowUp = true;
    recommendations = [
      'Consider counseling or therapy',
      'Practice breathing exercises and mindfulness',
      'Regular physical exercise to reduce anxiety',
      'Limit caffeine and alcohol consumption'
    ];
  } else if (score >= 5) {
    severity = 'mild';
    description = 'Mild anxiety symptoms. Self-management strategies recommended.';
    riskLevel = 'medium';
    requiresFollowUp = false;
    recommendations = [
      'Practice stress management techniques',
      'Regular relaxation and mindfulness exercises',
      'Maintain consistent sleep schedule',
      'Consider anxiety management apps or resources'
    ];
  } else {
    severity = 'minimal';
    description = 'Minimal anxiety symptoms. Continue current wellness practices.';
    riskLevel = 'low';
    requiresFollowUp = false;
    recommendations = [
      'Continue current stress management practices',
      'Maintain healthy lifestyle habits',
      'Practice preventive relaxation techniques',
      'Stay physically active'
    ];
  }

  return {
    toolName: 'GAD-7',
    category: 'Anxiety',
    score,
    maxScore,
    severity,
    description,
    recommendations,
    riskLevel,
    requiresFollowUp
  };
}

export function calculateGHQ12Score(answers: { [key: string]: number }): AssessmentResult {
  const score = ghq12Questions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
  const maxScore = 12;
  
  let severity: AssessmentResult['severity'];
  let description: string;
  let recommendations: string[];
  let riskLevel: AssessmentResult['riskLevel'];
  let requiresFollowUp: boolean;
  
  if (score >= 9) {
    severity = 'severe';
    description = 'Significant psychological distress detected. Professional support recommended.';
    riskLevel = 'high';
    requiresFollowUp = true;
    recommendations = [
      'Seek professional mental health evaluation',
      'Consider comprehensive psychological assessment',
      'Discuss current stressors with healthcare provider',
      'Implement immediate stress reduction strategies'
    ];
  } else if (score >= 6) {
    severity = 'moderate';
    description = 'Moderate psychological distress. Support and monitoring recommended.';
    riskLevel = 'medium';
    requiresFollowUp = true;
    recommendations = [
      'Consider counseling or mental health support',
      'Practice stress management and coping strategies',
      'Evaluate current life stressors and support systems',
      'Regular self-monitoring of mental health'
    ];
  } else if (score >= 3) {
    severity = 'mild';
    description = 'Mild psychological distress. Self-care and monitoring recommended.';
    riskLevel = 'medium';
    requiresFollowUp = false;
    recommendations = [
      'Practice regular self-care activities',
      'Monitor stress levels and coping strategies',
      'Maintain social connections and support',
      'Consider stress reduction techniques'
    ];
  } else {
    severity = 'minimal';
    description = 'Minimal psychological distress. Good overall mental health.';
    riskLevel = 'low';
    requiresFollowUp = false;
    recommendations = [
      'Continue current wellness practices',
      'Maintain healthy work-life balance',
      'Stay connected with support network',
      'Practice preventive mental health care'
    ];
  }

  return {
    toolName: 'GHQ-12',
    category: 'General Psychological Distress',
    score,
    maxScore,
    severity,
    description,
    recommendations,
    riskLevel,
    requiresFollowUp
  };
}

// Combined assessment data
export const allAssessmentQuestions = [
  ...phq9Questions,
  ...gad7Questions,
  ...ghq12Questions
];

export function calculateAllScores(answers: { [key: string]: number }): AssessmentResult[] {
  return [
    calculatePHQ9Score(answers),
    calculateGAD7Score(answers),
    calculateGHQ12Score(answers)
  ];
}