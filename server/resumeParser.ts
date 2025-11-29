/**
 * ORBIT Staffing OS - Resume Parser
 * 
 * Extracts structured data from resumes:
 * - Contact information (name, email, phone)
 * - Skills and certifications
 * - Work experience
 * - Education
 * - Auto-populates worker profiles
 */

// ========================
// TYPES
// ========================

export interface ParsedResume {
  success: boolean;
  confidence: number; // 0-100
  data: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
    skills: string[];
    certifications: string[];
    experience: WorkExperience[];
    education: Education[];
    summary?: string;
    yearsOfExperience?: number;
  };
  rawText?: string;
  errors?: string[];
}

interface WorkExperience {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  skills?: string[];
}

interface Education {
  institution: string;
  degree?: string;
  field?: string;
  graduationDate?: string;
}

// ========================
// SKILL KEYWORDS DATABASE
// ========================

const SKILL_KEYWORDS: Record<string, string[]> = {
  // Trades
  'electrician': ['electrical', 'wiring', 'circuits', 'voltage', 'conduit', 'nec', 'journeyman electrician', 'master electrician'],
  'plumber': ['plumbing', 'pipes', 'fixtures', 'drainage', 'water heater', 'journeyman plumber', 'master plumber'],
  'hvac': ['hvac', 'heating', 'cooling', 'air conditioning', 'refrigeration', 'ductwork', 'epa certified'],
  'carpenter': ['carpentry', 'framing', 'cabinetry', 'woodwork', 'trim', 'finish carpenter'],
  'welder': ['welding', 'mig', 'tig', 'stick', 'arc welding', 'fabrication', 'aws certified'],
  'forklift': ['forklift', 'forklift operator', 'forklift certified', 'pallet jack', 'warehouse equipment'],
  
  // General Labor
  'warehouse': ['warehouse', 'inventory', 'picking', 'packing', 'shipping', 'receiving', 'logistics'],
  'construction': ['construction', 'general labor', 'demolition', 'site work', 'concrete', 'masonry'],
  'landscaping': ['landscaping', 'lawn care', 'groundskeeping', 'irrigation', 'tree trimming'],
  'cleaning': ['cleaning', 'janitorial', 'custodial', 'housekeeping', 'sanitation'],
  'painting': ['painting', 'primer', 'spray painting', 'industrial coating'],
  
  // Industrial
  'manufacturing': ['manufacturing', 'assembly', 'production', 'machine operator', 'cnc', 'quality control'],
  'maintenance': ['maintenance', 'preventive maintenance', 'equipment repair', 'troubleshooting'],
  
  // Hospitality
  'food service': ['food service', 'kitchen', 'cooking', 'food prep', 'line cook', 'dishwasher', 'servsafe'],
  'hospitality': ['hospitality', 'hotel', 'front desk', 'guest services', 'concierge'],
  
  // Driving
  'driving': ['cdl', 'class a', 'class b', 'truck driving', 'delivery', 'dot', 'hazmat'],
  
  // Certifications
  'osha': ['osha', 'osha 10', 'osha 30', 'safety certified'],
  'cpr': ['cpr', 'first aid', 'aed', 'bls'],
};

const CERTIFICATION_PATTERNS = [
  /osha\s*10/i,
  /osha\s*30/i,
  /osha\s*certified/i,
  /cdl\s*(class\s*)?[abc]/i,
  /forklift\s*certif/i,
  /epa\s*(608|section\s*608)/i,
  /aws\s*certif/i,
  /journeyman/i,
  /master\s*(electrician|plumber|hvac)/i,
  /servsafe/i,
  /food\s*handler/i,
  /cpr\s*certif/i,
  /first\s*aid/i,
  /hazmat/i,
  /dot\s*medical/i,
];

// ========================
// TEXT EXTRACTION PATTERNS
// ========================

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_PATTERN = /(?:\+1[-.\s]?)?(?:\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}/;
const ZIP_PATTERN = /\b\d{5}(?:-\d{4})?\b/;
const STATE_PATTERN = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/i;

// ========================
// PARSER FUNCTIONS
// ========================

function extractEmail(text: string): string | undefined {
  const match = text.match(EMAIL_PATTERN);
  return match ? match[0].toLowerCase() : undefined;
}

function extractPhone(text: string): string | undefined {
  const match = text.match(PHONE_PATTERN);
  if (!match) return undefined;
  
  // Normalize phone number
  const digits = match[0].replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  }
  return match[0];
}

function extractName(text: string): string | undefined {
  // Usually the name is at the top of the resume
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length === 0) return undefined;
  
  // First non-empty line that's not an email or phone
  for (const line of lines.slice(0, 5)) {
    const cleaned = line.trim();
    if (cleaned.length < 3 || cleaned.length > 50) continue;
    if (EMAIL_PATTERN.test(cleaned)) continue;
    if (PHONE_PATTERN.test(cleaned)) continue;
    if (/^\d+/.test(cleaned)) continue; // Address
    
    // Check if it looks like a name (2-4 words, capitalized)
    const words = cleaned.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      const looksLikeName = words.every(word => 
        /^[A-Z][a-z]+$/.test(word) || /^[A-Z]+$/.test(word)
      );
      if (looksLikeName || words.every(w => w[0] === w[0].toUpperCase())) {
        return cleaned;
      }
    }
  }
  
  return undefined;
}

function extractAddress(text: string): ParsedResume['data']['address'] {
  const address: ParsedResume['data']['address'] = {};
  
  // Extract zip code
  const zipMatch = text.match(ZIP_PATTERN);
  if (zipMatch) {
    address.zipCode = zipMatch[0];
  }
  
  // Extract state
  const stateMatch = text.match(STATE_PATTERN);
  if (stateMatch) {
    address.state = stateMatch[0].toUpperCase();
  }
  
  return address;
}

function extractSkills(text: string): string[] {
  const foundSkills = new Set<string>();
  const lowerText = text.toLowerCase();
  
  // Check for skill keywords
  for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        foundSkills.add(skill);
        break;
      }
    }
  }
  
  return Array.from(foundSkills);
}

function extractCertifications(text: string): string[] {
  const certs = new Set<string>();
  
  for (const pattern of CERTIFICATION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      certs.add(match[0].trim());
    }
  }
  
  return Array.from(certs);
}

function extractExperience(text: string): WorkExperience[] {
  const experiences: WorkExperience[] = [];
  
  // Look for work experience section
  const expSectionMatch = text.match(/(?:work\s*)?experience|employment\s*history|work\s*history/i);
  if (!expSectionMatch) return experiences;
  
  // Extract years of experience mentions
  const yearsMatch = text.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i);
  
  // Simple extraction - look for company-like names followed by dates
  const lines = text.split('\n');
  let currentExp: Partial<WorkExperience> | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check for date range (indicates new position)
    const dateMatch = trimmed.match(/(\d{1,2}\/\d{4}|\d{4})\s*[-–]\s*(present|\d{1,2}\/\d{4}|\d{4})/i);
    
    if (dateMatch) {
      if (currentExp && currentExp.company) {
        experiences.push(currentExp as WorkExperience);
      }
      currentExp = {
        company: '',
        title: '',
        startDate: dateMatch[1],
        endDate: dateMatch[2].toLowerCase() === 'present' ? undefined : dateMatch[2],
        current: dateMatch[2].toLowerCase() === 'present',
      };
    }
  }
  
  if (currentExp && currentExp.company) {
    experiences.push(currentExp as WorkExperience);
  }
  
  return experiences;
}

function calculateYearsOfExperience(text: string): number | undefined {
  // Look for explicit years of experience
  const explicitMatch = text.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i);
  if (explicitMatch) {
    return parseInt(explicitMatch[1], 10);
  }
  
  // Try to calculate from work history dates using global regex
  const datePattern = /(\d{4})\s*[-–]\s*(present|\d{4})/gi;
  let match: RegExpExecArray | null;
  let earliestYear = new Date().getFullYear();
  
  while ((match = datePattern.exec(text)) !== null) {
    const startYear = parseInt(match[1], 10);
    if (startYear < earliestYear && startYear > 1970) {
      earliestYear = startYear;
    }
  }
  
  const currentYear = new Date().getFullYear();
  if (earliestYear < currentYear) {
    return currentYear - earliestYear;
  }
  
  return undefined;
}

// ========================
// MAIN PARSER
// ========================

export function parseResumeText(text: string): ParsedResume {
  const errors: string[] = [];
  
  if (!text || text.trim().length < 50) {
    return {
      success: false,
      confidence: 0,
      data: { skills: [], certifications: [], experience: [], education: [] },
      errors: ['Resume text is too short or empty'],
    };
  }
  
  // Extract all fields
  const fullName = extractName(text);
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const address = extractAddress(text);
  const skills = extractSkills(text);
  const certifications = extractCertifications(text);
  const experience = extractExperience(text);
  const yearsOfExperience = calculateYearsOfExperience(text);
  
  // Calculate confidence score
  let confidence = 0;
  if (fullName) confidence += 20;
  if (email) confidence += 20;
  if (phone) confidence += 15;
  if (address && (address.zipCode || address.state)) confidence += 10;
  if (skills.length > 0) confidence += 20;
  if (certifications.length > 0) confidence += 10;
  if (yearsOfExperience) confidence += 5;
  
  return {
    success: confidence >= 30,
    confidence: Math.min(confidence, 100),
    data: {
      fullName,
      email,
      phone,
      address,
      skills,
      certifications,
      experience,
      education: [], // TODO: Add education extraction
      yearsOfExperience,
    },
    rawText: text,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ========================
// WORKER PROFILE MAPPING
// ========================

export function mapResumeToWorkerProfile(parsed: ParsedResume): Partial<{
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zipCode: string;
  skills: string[];
  yearsExperience: string;
  otherSkills: string;
}> {
  const profile: any = {};
  
  if (parsed.data.fullName) profile.fullName = parsed.data.fullName;
  if (parsed.data.email) profile.email = parsed.data.email;
  if (parsed.data.phone) profile.phone = parsed.data.phone;
  if (parsed.data.address?.city) profile.city = parsed.data.address.city;
  if (parsed.data.address?.state) profile.state = parsed.data.address.state;
  if (parsed.data.address?.zipCode) profile.zipCode = parsed.data.address.zipCode;
  if (parsed.data.skills.length > 0) profile.skills = parsed.data.skills;
  if (parsed.data.yearsOfExperience) {
    profile.yearsExperience = parsed.data.yearsOfExperience.toString();
  }
  if (parsed.data.certifications.length > 0) {
    profile.otherSkills = parsed.data.certifications.join(', ');
  }
  
  return profile;
}

// ========================
// FILE HANDLING (Placeholder)
// ========================

export async function parseResumeFile(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ParsedResume> {
  // For now, we only support plain text
  // TODO: Add PDF and DOCX parsing with external libraries
  
  if (mimeType === 'text/plain') {
    const text = fileBuffer.toString('utf-8');
    return parseResumeText(text);
  }
  
  // For PDF/DOCX, return placeholder
  return {
    success: false,
    confidence: 0,
    data: { skills: [], certifications: [], experience: [], education: [] },
    errors: [`File type ${mimeType} parsing not yet implemented. Please paste resume text directly.`],
  };
}
