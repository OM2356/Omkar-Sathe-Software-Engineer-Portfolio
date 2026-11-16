export type ProjectCategory = 'AI & ML' | 'Full-Stack' | 'Automation' | 'Backend' | 'Frontend';

export type SkillCategory =
  | 'Programming'
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'AI and Machine Learning'
  | 'Tools'
  | 'Computer Science';

export type ExperienceCategory =
  | 'Internship'
  | 'Software Development'
  | 'AI Engineering'
  | 'Automation Testing'
  | 'Hackathons & Events';

export type AchievementCategory =
  | 'Leadership'
  | 'Sports'
  | 'Strategy & Chess'
  | 'Hackathon'
  | 'Technical';

export interface PortfolioProfile {
  name: string;
  title: string;
  headline: string;
  educationSummary: string;
  college: string;
  careerGoal: string;
  bio: string;
  aboutEducation: string;
  aboutInterests: string;
  aboutObjectives: string;
  aboutProblemSolving: string;
  aboutAiApproach: string;
  availabilityStatus: string;
  location: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  githubUsername: string;
  avatarUrl: string;
  updatedAt?: unknown;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  summary: string;
  description: string;
  features: string[];
  technologies: string[];
  imageUrl: string;
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  sortOrder: number;
  status: string;
  updatedAt?: unknown;
}

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  context: string;
  sortOrder: number;
  updatedAt?: unknown;
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  category: ExperienceCategory;
  period: string;
  location: string;
  description: string;
  highlights: string[];
  verifiedStatus: string;
  sortOrder: number;
  updatedAt?: unknown;
}

export interface EducationItem {
  id: string;
  degree: string;
  yearLabel: string;
  institution: string;
  period: string;
  location: string;
  description: string;
  coursework: string[];
  sortOrder: number;
  updatedAt?: unknown;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string;
  certificateFileUrl: string;
  certificateFileName: string;
  certificateFileType: string;
  description: string;
  sortOrder: number;
  updatedAt?: unknown;
}

export interface AchievementItem {
  id: string;
  title: string;
  category: AchievementCategory;
  period: string;
  description: string;
  sortOrder: number;
  updatedAt?: unknown;
}

export interface ResumeMeta {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  summaryNote: string;
  updatedAt?: unknown;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt?: unknown;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

export interface PortfolioDataBundle {
  profile: PortfolioProfile;
  projects: ProjectItem[];
  skills: SkillItem[];
  experiences: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  resumeMeta: ResumeMeta;
}
