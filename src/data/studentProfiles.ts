// Mock Student Profiles for Testing
// Anonymized student data with mental health indicators

export interface StudentProfile {
  id: string;
  demographics: {
    age: number;
    gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
    year: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate';
    major: string;
    residency: 'on-campus' | 'off-campus' | 'commuter';
    financialAid: boolean;
    internationalStudent: boolean;
  };
  academic: {
    gpa: number;
    creditHours: number;
    academicProbation: boolean;
    majorChanges: number;
    extracurriculars: string[];
    workStudy: boolean;
    partTimeJob: boolean;
  };
  mentalHealth: {
    previousCounseling: boolean;
    currentMedication: boolean;
    familyHistoryMentalHealth: boolean;
    previousAssessments: {
      date: string;
      phq9Score: number;
      gad7Score: number;
      ghq12Score: number;
      riskLevel: 'low' | 'medium' | 'high';
    }[];
  };
  support: {
    familySupport: 'strong' | 'moderate' | 'limited' | 'none';
    friendSupport: 'strong' | 'moderate' | 'limited' | 'none';
    campusInvolvement: 'high' | 'moderate' | 'low' | 'none';
    religiousAffiliation: boolean;
    culturalCommunity: boolean;
  };
  riskFactors: {
    substanceUse: boolean;
    sleepIssues: boolean;
    eatingConcerns: boolean;
    relationshipIssues: boolean;
    financialStress: boolean;
    academicStress: boolean;
    familyStress: boolean;
    healthIssues: boolean;
  };
  engagement: {
    lastLogin: string;
    sessionsCompleted: number;
    journalEntries: number;
    activitiesParticipated: string[];
    peerSupportParticipation: boolean;
    counselingSessionsAttended: number;
  };
  anonymizedId: string; // For research purposes
}

export const mockStudentProfiles: StudentProfile[] = [
  {
    id: 'student_001',
    demographics: {
      age: 19,
      gender: 'female',
      year: 'sophomore',
      major: 'Psychology',
      residency: 'on-campus',
      financialAid: true,
      internationalStudent: false
    },
    academic: {
      gpa: 3.2,
      creditHours: 15,
      academicProbation: false,
      majorChanges: 1,
      extracurriculars: ['Student Government', 'Psychology Club'],
      workStudy: true,
      partTimeJob: false
    },
    mentalHealth: {
      previousCounseling: true,
      currentMedication: false,
      familyHistoryMentalHealth: true,
      previousAssessments: [
        {
          date: '2024-08-15',
          phq9Score: 12,
          gad7Score: 8,
          ghq12Score: 5,
          riskLevel: 'medium'
        },
        {
          date: '2024-06-20',
          phq9Score: 15,
          gad7Score: 11,
          ghq12Score: 7,
          riskLevel: 'high'
        }
      ]
    },
    support: {
      familySupport: 'moderate',
      friendSupport: 'strong',
      campusInvolvement: 'moderate',
      religiousAffiliation: false,
      culturalCommunity: true
    },
    riskFactors: {
      substanceUse: false,
      sleepIssues: true,
      eatingConcerns: false,
      relationshipIssues: true,
      financialStress: true,
      academicStress: true,
      familyStress: false,
      healthIssues: false
    },
    engagement: {
      lastLogin: '2024-09-01',
      sessionsCompleted: 8,
      journalEntries: 15,
      activitiesParticipated: ['Mindfulness', 'Stress Management', 'Sleep Hygiene'],
      peerSupportParticipation: true,
      counselingSessionsAttended: 4
    },
    anonymizedId: 'ANON_001'
  },
  {
    id: 'student_002',
    demographics: {
      age: 21,
      gender: 'male',
      year: 'senior',
      major: 'Computer Science',
      residency: 'off-campus',
      financialAid: false,
      internationalStudent: true
    },
    academic: {
      gpa: 3.8,
      creditHours: 18,
      academicProbation: false,
      majorChanges: 0,
      extracurriculars: ['Coding Club', 'International Student Association'],
      workStudy: false,
      partTimeJob: true
    },
    mentalHealth: {
      previousCounseling: false,
      currentMedication: true,
      familyHistoryMentalHealth: false,
      previousAssessments: [
        {
          date: '2024-08-20',
          phq9Score: 6,
          gad7Score: 14,
          ghq12Score: 4,
          riskLevel: 'medium'
        }
      ]
    },
    support: {
      familySupport: 'limited',
      friendSupport: 'moderate',
      campusInvolvement: 'low',
      religiousAffiliation: false,
      culturalCommunity: true
    },
    riskFactors: {
      substanceUse: false,
      sleepIssues: true,
      eatingConcerns: false,
      relationshipIssues: false,
      financialStress: false,
      academicStress: true,
      familyStress: true,
      healthIssues: false
    },
    engagement: {
      lastLogin: '2024-09-03',
      sessionsCompleted: 3,
      journalEntries: 7,
      activitiesParticipated: ['Breathing Exercises', 'Academic Success'],
      peerSupportParticipation: false,
      counselingSessionsAttended: 1
    },
    anonymizedId: 'ANON_002'
  },
  {
    id: 'student_003',
    demographics: {
      age: 18,
      gender: 'non-binary',
      year: 'freshman',
      major: 'Art',
      residency: 'on-campus',
      financialAid: true,
      internationalStudent: false
    },
    academic: {
      gpa: 2.8,
      creditHours: 12,
      academicProbation: true,
      majorChanges: 0,
      extracurriculars: ['Art Club', 'LGBTQ+ Alliance'],
      workStudy: true,
      partTimeJob: false
    },
    mentalHealth: {
      previousCounseling: true,
      currentMedication: true,
      familyHistoryMentalHealth: true,
      previousAssessments: [
        {
          date: '2024-08-25',
          phq9Score: 18,
          gad7Score: 16,
          ghq12Score: 9,
          riskLevel: 'high'
        },
        {
          date: '2024-07-10',
          phq9Score: 21,
          gad7Score: 18,
          ghq12Score: 11,
          riskLevel: 'high'
        }
      ]
    },
    support: {
      familySupport: 'limited',
      friendSupport: 'moderate',
      campusInvolvement: 'moderate',
      religiousAffiliation: false,
      culturalCommunity: true
    },
    riskFactors: {
      substanceUse: true,
      sleepIssues: true,
      eatingConcerns: true,
      relationshipIssues: true,
      financialStress: true,
      academicStress: true,
      familyStress: true,
      healthIssues: false
    },
    engagement: {
      lastLogin: '2024-08-30',
      sessionsCompleted: 12,
      journalEntries: 25,
      activitiesParticipated: ['Art Therapy', 'Support Groups', 'Crisis Planning'],
      peerSupportParticipation: true,
      counselingSessionsAttended: 8
    },
    anonymizedId: 'ANON_003'
  },
  {
    id: 'student_004',
    demographics: {
      age: 20,
      gender: 'female',
      year: 'junior',
      major: 'Business',
      residency: 'commuter',
      financialAid: true,
      internationalStudent: false
    },
    academic: {
      gpa: 3.5,
      creditHours: 16,
      academicProbation: false,
      majorChanges: 1,
      extracurriculars: ['Business Society', 'Volunteer Club'],
      workStudy: false,
      partTimeJob: true
    },
    mentalHealth: {
      previousCounseling: false,
      currentMedication: false,
      familyHistoryMentalHealth: false,
      previousAssessments: [
        {
          date: '2024-08-28',
          phq9Score: 4,
          gad7Score: 6,
          ghq12Score: 2,
          riskLevel: 'low'
        }
      ]
    },
    support: {
      familySupport: 'strong',
      friendSupport: 'strong',
      campusInvolvement: 'high',
      religiousAffiliation: true,
      culturalCommunity: false
    },
    riskFactors: {
      substanceUse: false,
      sleepIssues: false,
      eatingConcerns: false,
      relationshipIssues: false,
      financialStress: true,
      academicStress: false,
      familyStress: false,
      healthIssues: false
    },
    engagement: {
      lastLogin: '2024-09-02',
      sessionsCompleted: 2,
      journalEntries: 5,
      activitiesParticipated: ['Time Management', 'Goal Setting'],
      peerSupportParticipation: false,
      counselingSessionsAttended: 0
    },
    anonymizedId: 'ANON_004'
  },
  {
    id: 'student_005',
    demographics: {
      age: 22,
      gender: 'male',
      year: 'senior',
      major: 'Engineering',
      residency: 'off-campus',
      financialAid: false,
      internationalStudent: false
    },
    academic: {
      gpa: 3.9,
      creditHours: 19,
      academicProbation: false,
      majorChanges: 0,
      extracurriculars: ['Engineering Society', 'Robotics Club', 'Tutoring'],
      workStudy: false,
      partTimeJob: false
    },
    mentalHealth: {
      previousCounseling: true,
      currentMedication: false,
      familyHistoryMentalHealth: false,
      previousAssessments: [
        {
          date: '2024-08-30',
          phq9Score: 8,
          gad7Score: 12,
          ghq12Score: 3,
          riskLevel: 'medium'
        },
        {
          date: '2024-05-15',
          phq9Score: 11,
          gad7Score: 15,
          ghq12Score: 6,
          riskLevel: 'high'
        }
      ]
    },
    support: {
      familySupport: 'strong',
      friendSupport: 'moderate',
      campusInvolvement: 'high',
      religiousAffiliation: false,
      culturalCommunity: false
    },
    riskFactors: {
      substanceUse: false,
      sleepIssues: true,
      eatingConcerns: false,
      relationshipIssues: false,
      financialStress: false,
      academicStress: true,
      familyStress: false,
      healthIssues: false
    },
    engagement: {
      lastLogin: '2024-09-04',
      sessionsCompleted: 6,
      journalEntries: 12,
      activitiesParticipated: ['Study Skills', 'Anxiety Management', 'Perfectionism'],
      peerSupportParticipation: true,
      counselingSessionsAttended: 3
    },
    anonymizedId: 'ANON_005'
  }
];

// Analytics functions for student data
export function getStudentsByRiskLevel() {
  const riskCounts = { low: 0, medium: 0, high: 0 };
  
  mockStudentProfiles.forEach(student => {
    const latestAssessment = student.mentalHealth.previousAssessments[0];
    if (latestAssessment) {
      riskCounts[latestAssessment.riskLevel]++;
    }
  });
  
  return riskCounts;
}

export function getAverageScores() {
  const totals = { phq9: 0, gad7: 0, ghq12: 0 };
  let count = 0;
  
  mockStudentProfiles.forEach(student => {
    const latestAssessment = student.mentalHealth.previousAssessments[0];
    if (latestAssessment) {
      totals.phq9 += latestAssessment.phq9Score;
      totals.gad7 += latestAssessment.gad7Score;
      totals.ghq12 += latestAssessment.ghq12Score;
      count++;
    }
  });
  
  return {
    avgPHQ9: count > 0 ? Math.round((totals.phq9 / count) * 10) / 10 : 0,
    avgGAD7: count > 0 ? Math.round((totals.gad7 / count) * 10) / 10 : 0,
    avgGHQ12: count > 0 ? Math.round((totals.ghq12 / count) * 10) / 10 : 0
  };
}

export function getEngagementStats() {
  const totalStudents = mockStudentProfiles.length;
  const activeStudents = mockStudentProfiles.filter(student => {
    const lastLoginDate = new Date(student.engagement.lastLogin);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return lastLoginDate > oneWeekAgo;
  }).length;
  
  const avgJournalEntries = mockStudentProfiles.reduce((sum, student) => 
    sum + student.engagement.journalEntries, 0) / totalStudents;
  
  const avgSessionsCompleted = mockStudentProfiles.reduce((sum, student) => 
    sum + student.engagement.sessionsCompleted, 0) / totalStudents;
  
  return {
    totalStudents,
    activeStudents,
    avgJournalEntries: Math.round(avgJournalEntries * 10) / 10,
    avgSessionsCompleted: Math.round(avgSessionsCompleted * 10) / 10
  };
}

export function getDemographicBreakdown() {
  const genderCounts = { male: 0, female: 0, 'non-binary': 0, 'prefer-not-to-say': 0 };
  const yearCounts = { freshman: 0, sophomore: 0, junior: 0, senior: 0, graduate: 0 };
  const residencyCounts = { 'on-campus': 0, 'off-campus': 0, commuter: 0 };
  
  mockStudentProfiles.forEach(student => {
    genderCounts[student.demographics.gender]++;
    yearCounts[student.demographics.year]++;
    residencyCounts[student.demographics.residency]++;
  });
  
  return { genderCounts, yearCounts, residencyCounts };
}