// Institutional Support Structure Data
// Counselor availability, resources, and helpline information

export interface Counselor {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  availableHours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    office: string;
  };
  isAvailable: boolean;
  nextAvailableSlot?: string;
  appointmentTypes: ('individual' | 'group' | 'crisis' | 'walk-in')[];
  languages: string[];
  photo?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'crisis' | 'counseling' | 'wellness' | 'academic' | 'peer-support' | 'external';
  type: 'helpline' | 'website' | 'app' | 'in-person' | 'online-service';
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  availability: string;
  cost: 'free' | 'covered' | 'sliding-scale' | 'paid';
  targetAudience: string[];
  emergencyResource: boolean;
}

export interface CrisisContact {
  id: string;
  name: string;
  phone: string;
  description: string;
  availability: string;
  isEmergency: boolean;
  textSupport?: string;
  website?: string;
}

// Counseling Staff
export const counselingStaff: Counselor[] = [
  {
    id: 'counselor_001',
    name: 'Dr. Sarah Martinez',
    title: 'Director of Counseling Services',
    specializations: ['Depression', 'Anxiety', 'Crisis Intervention', 'Trauma'],
    availableHours: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 3:00 PM'
    },
    contactInfo: {
      email: 'smartinez@university.edu',
      phone: '(555) 123-4567',
      office: 'Student Services Building, Room 201'
    },
    isAvailable: true,
    nextAvailableSlot: '2024-09-06T10:00:00',
    appointmentTypes: ['individual', 'crisis'],
    languages: ['English', 'Spanish']
  },
  {
    id: 'counselor_002',
    name: 'Dr. Michael Chen',
    title: 'Licensed Clinical Psychologist',
    specializations: ['Academic Stress', 'Perfectionism', 'Social Anxiety', 'Cultural Issues'],
    availableHours: {
      monday: '10:00 AM - 6:00 PM',
      tuesday: '10:00 AM - 6:00 PM',
      wednesday: '10:00 AM - 6:00 PM',
      thursday: '10:00 AM - 6:00 PM'
    },
    contactInfo: {
      email: 'mchen@university.edu',
      phone: '(555) 123-4568',
      office: 'Student Services Building, Room 203'
    },
    isAvailable: false,
    nextAvailableSlot: '2024-09-10T11:00:00',
    appointmentTypes: ['individual', 'group'],
    languages: ['English', 'Mandarin', 'Cantonese']
  },
  {
    id: 'counselor_003',
    name: 'Dr. Amanda Johnson',
    title: 'Counseling Psychologist',
    specializations: ['LGBTQ+ Issues', 'Relationship Counseling', 'Self-Esteem', 'Body Image'],
    availableHours: {
      tuesday: '12:00 PM - 8:00 PM',
      wednesday: '12:00 PM - 8:00 PM',
      thursday: '12:00 PM - 8:00 PM',
      friday: '9:00 AM - 5:00 PM'
    },
    contactInfo: {
      email: 'ajohnson@university.edu',
      phone: '(555) 123-4569',
      office: 'Student Services Building, Room 205'
    },
    isAvailable: true,
    nextAvailableSlot: '2024-09-05T14:00:00',
    appointmentTypes: ['individual', 'group'],
    languages: ['English']
  },
  {
    id: 'counselor_004',
    name: 'Maria Rodriguez, LCSW',
    title: 'Licensed Clinical Social Worker',
    specializations: ['Substance Abuse', 'Family Issues', 'Grief and Loss', 'Financial Stress'],
    availableHours: {
      monday: '8:00 AM - 4:00 PM',
      wednesday: '8:00 AM - 4:00 PM',
      friday: '8:00 AM - 4:00 PM'
    },
    contactInfo: {
      email: 'mrodriguez@university.edu',
      phone: '(555) 123-4570',
      office: 'Student Services Building, Room 207'
    },
    isAvailable: true,
    nextAvailableSlot: '2024-09-06T09:00:00',
    appointmentTypes: ['individual', 'walk-in'],
    languages: ['English', 'Spanish']
  },
  {
    id: 'counselor_005',
    name: 'Dr. James Wilson',
    title: 'Crisis Intervention Specialist',
    specializations: ['Crisis Intervention', 'Suicide Prevention', 'Emergency Response', 'Risk Assessment'],
    availableHours: {
      monday: '24/7 On-call',
      tuesday: '24/7 On-call',
      wednesday: '24/7 On-call',
      thursday: '24/7 On-call',
      friday: '24/7 On-call',
      saturday: '24/7 On-call',
      sunday: '24/7 On-call'
    },
    contactInfo: {
      email: 'jwilson@university.edu',
      phone: '(555) 123-HELP',
      office: 'Student Services Building, Emergency Response Center'
    },
    isAvailable: true,
    appointmentTypes: ['crisis', 'walk-in'],
    languages: ['English']
  }
];

// Campus and External Resources
export const mentalHealthResources: Resource[] = [
  {
    id: 'resource_001',
    title: 'Campus Counseling Center',
    description: 'Free individual and group counseling services for all enrolled students',
    category: 'counseling',
    type: 'in-person',
    contactInfo: {
      phone: '(555) 123-4567',
      email: 'counseling@university.edu',
      address: 'Student Services Building, 2nd Floor'
    },
    availability: 'Monday-Friday 8:00 AM - 5:00 PM',
    cost: 'free',
    targetAudience: ['All Students'],
    emergencyResource: false
  },
  {
    id: 'resource_002',
    title: '24/7 Crisis Hotline',
    description: 'Immediate support for students in crisis or emotional distress',
    category: 'crisis',
    type: 'helpline',
    contactInfo: {
      phone: '(555) 123-HELP'
    },
    availability: '24/7',
    cost: 'free',
    targetAudience: ['All Students'],
    emergencyResource: true
  },
  {
    id: 'resource_003',
    title: 'Peer Support Groups',
    description: 'Student-led support groups for various mental health topics',
    category: 'peer-support',
    type: 'in-person',
    contactInfo: {
      email: 'peersupport@university.edu',
      address: 'Student Union Building, Meeting Rooms'
    },
    availability: 'Various times throughout the week',
    cost: 'free',
    targetAudience: ['All Students'],
    emergencyResource: false
  },
  {
    id: 'resource_004',
    title: 'Mindfulness and Wellness Center',
    description: 'Meditation classes, yoga, and wellness workshops',
    category: 'wellness',
    type: 'in-person',
    contactInfo: {
      phone: '(555) 123-4580',
      email: 'wellness@university.edu',
      address: 'Recreation Center, Room 150'
    },
    availability: 'Monday-Friday 6:00 AM - 10:00 PM',
    cost: 'free',
    targetAudience: ['All Students', 'Faculty', 'Staff'],
    emergencyResource: false
  },
  {
    id: 'resource_005',
    title: 'Academic Success Coaching',
    description: 'Support for academic stress, time management, and study skills',
    category: 'academic',
    type: 'in-person',
    contactInfo: {
      phone: '(555) 123-4590',
      email: 'academicsupport@university.edu',
      address: 'Library, 3rd Floor'
    },
    availability: 'Monday-Thursday 9:00 AM - 7:00 PM, Friday 9:00 AM - 5:00 PM',
    cost: 'free',
    targetAudience: ['All Students'],
    emergencyResource: false
  },
  {
    id: 'resource_006',
    title: 'NAMI Support Line',
    description: 'National Alliance on Mental Illness support and information',
    category: 'external',
    type: 'helpline',
    contactInfo: {
      phone: '1-800-950-NAMI',
      website: 'https://nami.org'
    },
    availability: 'Monday-Friday 10:00 AM - 10:00 PM ET',
    cost: 'free',
    targetAudience: ['All Students', 'Families'],
    emergencyResource: false
  },
  {
    id: 'resource_007',
    title: 'Crisis Text Line',
    description: 'Free, 24/7 crisis support via text message',
    category: 'crisis',
    type: 'helpline',
    contactInfo: {
      phone: 'Text HOME to 741741',
      website: 'https://crisistextline.org'
    },
    availability: '24/7',
    cost: 'free',
    targetAudience: ['All Students'],
    emergencyResource: true
  },
  {
    id: 'resource_008',
    title: 'Headspace for Students',
    description: 'Free meditation and mindfulness app for students',
    category: 'wellness',
    type: 'app',
    contactInfo: {
      website: 'https://headspace.com/students'
    },
    availability: '24/7',
    cost: 'free',
    targetAudience: ['All Students'],
    emergencyResource: false
  }
];

// Crisis and Emergency Contacts
export const crisisContacts: CrisisContact[] = [
  {
    id: 'crisis_001',
    name: 'Campus Emergency',
    phone: '911',
    description: 'Immediate emergency services for life-threatening situations',
    availability: '24/7',
    isEmergency: true
  },
  {
    id: 'crisis_002',
    name: 'Campus Crisis Hotline',
    phone: '(555) 123-HELP',
    description: 'University mental health crisis support',
    availability: '24/7',
    isEmergency: true
  },
  {
    id: 'crisis_003',
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: 'National crisis support and suicide prevention',
    availability: '24/7',
    isEmergency: true,
    textSupport: 'Text 988',
    website: 'https://suicidepreventionlifeline.org'
  },
  {
    id: 'crisis_004',
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Free crisis support via text',
    availability: '24/7',
    isEmergency: true,
    website: 'https://crisistextline.org'
  },
  {
    id: 'crisis_005',
    name: 'Campus Public Safety',
    phone: '(555) 123-SAFE',
    description: 'Campus security and safety services',
    availability: '24/7',
    isEmergency: false
  }
];

// Utility functions
export function getAvailableCounselors(): Counselor[] {
  return counselingStaff.filter(counselor => counselor.isAvailable);
}

export function getCounselorsBySpecialization(specialization: string): Counselor[] {
  return counselingStaff.filter(counselor => 
    counselor.specializations.some(spec => 
      spec.toLowerCase().includes(specialization.toLowerCase())
    )
  );
}

export function getResourcesByCategory(category: Resource['category']): Resource[] {
  return mentalHealthResources.filter(resource => resource.category === category);
}

export function getEmergencyResources(): Resource[] {
  return mentalHealthResources.filter(resource => resource.emergencyResource);
}

export function getFreeResources(): Resource[] {
  return mentalHealthResources.filter(resource => resource.cost === 'free');
}

export function getNextAvailableAppointment(): { counselor: Counselor; time: string } | null {
  const availableCounselors = getAvailableCounselors()
    .filter(counselor => counselor.nextAvailableSlot)
    .sort((a, b) => 
      new Date(a.nextAvailableSlot!).getTime() - new Date(b.nextAvailableSlot!).getTime()
    );
    
  if (availableCounselors.length > 0) {
    return {
      counselor: availableCounselors[0],
      time: availableCounselors[0].nextAvailableSlot!
    };
  }
  
  return null;
}

// Support metrics for institutional reporting
export function getSupportMetrics() {
  const totalCounselors = counselingStaff.length;
  const availableCounselors = getAvailableCounselors().length;
  const totalResources = mentalHealthResources.length;
  const emergencyResources = getEmergencyResources().length;
  const freeResources = getFreeResources().length;
  
  const specializations = Array.from(
    new Set(counselingStaff.flatMap(counselor => counselor.specializations))
  );
  
  return {
    totalCounselors,
    availableCounselors,
    utilizationRate: Math.round((availableCounselors / totalCounselors) * 100),
    totalResources,
    emergencyResources,
    freeResources,
    specializations: specializations.length,
    languages: Array.from(
      new Set(counselingStaff.flatMap(counselor => counselor.languages))
    ).length
  };
}