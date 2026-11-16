import type {
  AchievementItem,
  EducationItem,
  ExperienceItem,
  PortfolioDataBundle,
  PortfolioProfile,
  ProjectItem,
  ResumeMeta,
  SkillCategory,
  SkillItem,
  CertificationItem,
} from '../types/portfolio';

export const SKILL_CATEGORIES: SkillCategory[] = [
  'Programming',
  'Frontend',
  'Backend',
  'Database',
  'AI and Machine Learning',
  'Tools',
  'Computer Science',
];

export const DEFAULT_PROFILE: PortfolioProfile = {
  name: 'Omkar Sathe',
  title: 'Aspiring Software Developer | AI & ML Enthusiast | Full Stack Developer',
  headline:
    'Passionate about building innovative software solutions, exploring Artificial Intelligence, and developing impactful real-world applications.',
  educationSummary: 'T.Y. B.Sc. Computer Science',
  college:
    'Bharati Vidyapeeth (Deemed University), Yashwantrao Mohite College of Arts, Science & Commerce, Pune.',
  careerGoal: 'Software Engineer at Microsoft or another leading product-based technology company.',
  bio: 'I am a passionate Computer Science student interested in Software Development, Artificial Intelligence, Machine Learning and Full-Stack Engineering. I enjoy solving problems, developing practical applications and continuously learning emerging technologies. My goal is to build scalable, useful and impactful software products.',
  aboutEducation:
    'Currently pursuing my Third Year Bachelor of Science in Computer Science (T.Y. B.Sc. CS) at Bharati Vidyapeeth (Deemed University), Yashwantrao Mohite College of Arts, Science & Commerce, Pune. My academic foundation spans core systems, database management, data structures, and object-oriented engineering.',
  aboutInterests:
    'My primary technical interests sit at the intersection of Full-Stack Software Engineering, Applied Generative AI, Browser Test Automation, and clean backend API architecture using React, TypeScript, Node.js, Python, Django, and PostgreSQL.',
  aboutObjectives:
    'I am preparing for Software Development Engineer (SDE) internships and entry-level engineering roles at Microsoft and other product-first engineering organizations where craft, reliability, and user impact matter.',
  aboutProblemSolving:
    'I approach engineering problems by breaking requirements down into clear data models, verifiable edge cases, and modular interfaces—writing readable code backed by automated browser or API validation rather than guesswork.',
  aboutAiApproach:
    'In AI engineering, I focus on practical utility over hype: grounding LLM assistants in real workflows such as eldercare accessibility, voice interaction, and automated QA testing using Gemini AI, RAG concepts, and structured prompting.',
  availabilityStatus: 'Open to SDE Internships & Entry-Level Roles',
  location: 'Pune, Maharashtra, India',
  email: 'omkarsathe3103@gmail.com',
  githubUrl: 'https://github.com/OM2356',
  linkedinUrl: 'https://www.linkedin.com/in/omkar-sathe-1173b3319/',
  githubUsername: 'OM2356',
  avatarUrl: '/src/assets/images/omkar_portrait_1794833302772.jpg',
};

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'buddy-elder-ai',
    title: 'Buddy Elder AI',
    slug: 'buddy-elder-ai',
    category: 'AI & ML',
    summary:
      'AI-powered eldercare and digital education assistant built for accessible voice interaction and safety.',
    description:
      'An AI-powered eldercare and digital education assistant designed to help elderly users access technology and educational information through accessible interfaces, voice interaction and simplified explanations.',
    features: [
      'AI conversational assistant',
      'Voice input and spoken responses',
      'Elder-friendly accessibility',
      'Digital learning',
      'Caregiver dashboard',
      'Scam awareness and safety assistance',
      'Educational knowledge hub',
    ],
    technologies: ['React', 'Tailwind CSS', 'Node.js', 'Express.js', 'Gemini AI', 'Firebase'],
    imageUrl: '/src/assets/images/project_buddy_elder_1794833300010.jpg',
    githubUrl: '',
    liveUrl: 'https://buddy-elder-ai-3103-gkno.vercel.app/',
    featured: true,
    sortOrder: 1,
    status: 'Deployed Live',
  },
  {
    id: 'ai-test-automation',
    title: 'AI Test Automation',
    slug: 'ai-test-automation',
    category: 'Automation',
    summary:
      'AI-assisted browser testing workflow automating web interactions, form validation, and reporting.',
    description:
      'An AI-assisted browser testing project focused on automating website interactions and validating form elements.',
    features: [
      'Playwright browser automation',
      'Automated form interaction',
      'AI-assisted test generation',
      'Screenshot capture',
      'Test reporting',
      'Error handling',
    ],
    technologies: ['Python', 'Playwright', 'Gemini AI', 'Selenium concepts'],
    imageUrl: '/src/assets/images/project_ai_testing_1794833300929.jpg',
    githubUrl: '',
    liveUrl: '',
    featured: true,
    sortOrder: 2,
    status: 'Active Engineering Project',
  },
  {
    id: 'flowstate-yoga',
    title: 'FlowState Yoga',
    slug: 'flowstate-yoga',
    category: 'Frontend',
    summary:
      'Modern wellness and yoga web application focused on calm navigation and accessible content.',
    description:
      'A modern wellness and yoga web application focused on a smooth user experience and accessible wellness content.',
    features: [
      'Responsive yoga flow browsing',
      'Accessible typography and calm layout',
      'Structured session routines',
      'Component-driven React architecture',
    ],
    technologies: ['React', 'Tailwind CSS', 'JavaScript'],
    imageUrl: '/src/assets/images/project_flowstate_yoga_1794833301983.jpg',
    githubUrl: '',
    liveUrl: '',
    featured: false,
    sortOrder: 3,
    status: 'Completed Build',
  },
  {
    id: 'rooted-in-india-vedaverse',
    title: 'Rooted in India / VedaVerse',
    slug: 'rooted-in-india-vedaverse',
    category: 'Full-Stack',
    summary:
      'Full-stack digital wellness and educational platform exploring Indian Vedic knowledge concepts.',
    description:
      'A digital wellness and educational platform exploring Indian Vedic knowledge and wellness concepts.',
    features: [
      'Structured knowledge exploration interface',
      'RESTful Express.js backend integration',
      'Relational PostgreSQL data modeling',
      'Fast Vite + React frontend delivery',
    ],
    technologies: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express.js', 'PostgreSQL'],
    imageUrl: '/src/assets/images/project_vedaverse_1794833301920.jpg',
    githubUrl: '',
    liveUrl: '',
    featured: true,
    sortOrder: 4,
    status: 'Full-Stack Project',
  },
  {
    id: 'django-rest-api',
    title: 'Django REST API',
    slug: 'django-rest-api',
    category: 'Backend',
    summary:
      'Backend engineering project demonstrating RESTful API architecture, serializers, and CRUD workflows.',
    description:
      'A backend development project demonstrating REST API development and backend programming fundamentals.',
    features: [
      'RESTful endpoint design and routing',
      'Django REST Framework serializers and viewsets',
      'Request validation and status handling',
      'Modular Python backend structure',
    ],
    technologies: ['Python', 'Django', 'Django REST Framework'],
    imageUrl: '/src/assets/images/project_django_api_1794833302798.jpg',
    githubUrl: '',
    liveUrl: '',
    featured: false,
    sortOrder: 5,
    status: 'Backend Architecture',
  },
];

const rawSkills: Array<{ name: string; category: SkillCategory; context: string }> = [
  { name: 'Java', category: 'Programming', context: 'Object-Oriented Programming & Core Algorithms' },
  { name: 'Python', category: 'Programming', context: 'AI Automation, Playwright & Django Backend' },
  { name: 'C', category: 'Programming', context: 'Systems Fundamentals & Memory Concepts' },
  { name: 'C++', category: 'Programming', context: 'Data Structures & Problem Solving' },
  { name: 'C#', category: 'Programming', context: 'Structured Application Development' },

  { name: 'HTML', category: 'Frontend', context: 'Semantic & Accessible Web Markup' },
  { name: 'CSS', category: 'Frontend', context: 'Responsive Layouts & Design Systems' },
  { name: 'JavaScript', category: 'Frontend', context: 'Interactive Web Engineering & DOM APIs' },
  { name: 'React', category: 'Frontend', context: 'Buddy Elder AI, FlowState Yoga & VedaVerse' },
  { name: 'Tailwind CSS', category: 'Frontend', context: 'Rapid Component-First Styling' },

  { name: 'Node.js', category: 'Backend', context: 'Server Runtime for Full-Stack Web Apps' },
  { name: 'Express.js', category: 'Backend', context: 'REST APIs & Server Middleware' },
  { name: 'Django', category: 'Backend', context: 'Python Web Framework & ORM' },
  { name: 'REST APIs', category: 'Backend', context: 'Resource Design, Validation & Integration' },

  { name: 'PostgreSQL', category: 'Database', context: 'Relational Schema Design (VedaVerse)' },
  { name: 'SQL', category: 'Database', context: 'Queries, Joins & Normalization' },
  { name: 'Firebase', category: 'Database', context: 'Authentication & Cloud App Hosting' },
  { name: 'Firestore', category: 'Database', context: 'Real-Time Document Persistence' },

  { name: 'Generative AI', category: 'AI and Machine Learning', context: 'Gemini AI Integration in Web Apps' },
  { name: 'AI Agents', category: 'AI and Machine Learning', context: 'Autonomous Test & Assistant Workflows' },
  { name: 'Prompt Engineering', category: 'AI and Machine Learning', context: 'Structured Outputs & Reliable Guardrails' },
  { name: 'RAG', category: 'AI and Machine Learning', context: 'Grounded Knowledge Retrieval Concepts' },
  { name: 'Machine Learning fundamentals', category: 'AI and Machine Learning', context: 'Core Concepts & Model Evaluation' },

  { name: 'Git', category: 'Tools', context: 'Version Control & Branch Workflows' },
  { name: 'GitHub', category: 'Tools', context: 'Repository Collaboration & Code Hosting' },
  { name: 'VS Code', category: 'Tools', context: 'Primary Development Environment' },
  { name: 'Docker', category: 'Tools', context: 'Containerization Fundamentals' },
  { name: 'Figma', category: 'Tools', context: 'UI Wireframing & Design Handoff' },

  { name: 'Data Structures and Algorithms', category: 'Computer Science', context: 'Core Problem Solving & Complexity' },
  { name: 'OOP', category: 'Computer Science', context: 'Modular Design Patterns & Abstraction' },
  { name: 'DBMS', category: 'Computer Science', context: 'Transactions, Indexing & Relational Theory' },
  { name: 'Operating Systems', category: 'Computer Science', context: 'Processes, Threads & Scheduling' },
  { name: 'Computer Networks', category: 'Computer Science', context: 'HTTP, TCP/IP & Application Protocols' },
];

export const DEFAULT_SKILLS: SkillItem[] = rawSkills.map((item, idx) => ({
  id: `skill-${idx + 1}`,
  name: item.name,
  category: item.category,
  context: item.context,
  sortOrder: idx + 1,
}));

export const DEFAULT_EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp-internship-readiness',
    role: 'Aspiring Software Development Engineer Intern',
    organization: 'Seeking Summer / Final-Year Engineering Internship',
    category: 'Internship',
    period: '2026 — Present',
    location: 'Pune / Hybrid / Remote',
    description:
      'Actively preparing for SDE internships at product-based technology companies. No prior commercial internship is claimed unless verified and added via Admin.',
    highlights: [
      'Available for full-stack, backend, and applied AI software engineering internships',
      'Practicing Data Structures, Algorithms, and clean system architecture',
      'Maintaining production-ready academic and independent builds',
    ],
    verifiedStatus: 'Availability Notice (Editable in Admin)',
    sortOrder: 1,
  },
  {
    id: 'exp-software-dev',
    role: 'Full-Stack Application Builder',
    organization: 'Independent & Academic Projects',
    category: 'Software Development',
    period: '2024 — Present',
    location: 'Pune, India',
    description:
      'Designing and implementing full-stack web applications using React, Node.js, Express.js, Django REST Framework, PostgreSQL, and Firebase.',
    highlights: [
      'Shipped Buddy Elder AI live web application on Vercel',
      'Built relational PostgreSQL and Express.js architecture for VedaVerse',
      'Developed modular REST APIs with Django REST Framework',
    ],
    verifiedStatus: 'Independent Project Track',
    sortOrder: 2,
  },
  {
    id: 'exp-ai-eng',
    role: 'Applied AI & Conversational Interface Developer',
    organization: 'Buddy Elder AI & Learning Prototypes',
    category: 'AI Engineering',
    period: '2025 — Present',
    location: 'Pune, India',
    description:
      'Integrating Gemini AI into practical human-centered applications focused on eldercare accessibility, voice interaction, and digital safety education.',
    highlights: [
      'Implemented voice input and spoken output flows for older adult accessibility',
      'Designed scam-awareness guidance and simplified educational prompts',
      'Explored RAG and AI agent patterns for structured workflows',
    ],
    verifiedStatus: 'Project Engineering Track',
    sortOrder: 3,
  },
  {
    id: 'exp-automation',
    role: 'AI-Assisted Browser Automation Developer',
    organization: 'AI Test Automation Initiative',
    category: 'Automation Testing',
    period: '2025 — Present',
    location: 'Pune, India',
    description:
      'Developing automated browser testing scripts with Python and Playwright to validate form elements, capture diagnostic screenshots, and handle runtime errors.',
    highlights: [
      'Automated multi-step form validation and DOM element verification',
      'Integrated AI-assisted test case generation with structured reporting',
      'Applied Selenium and Playwright cross-browser testing fundamentals',
    ],
    verifiedStatus: 'Independent Automation Build',
    sortOrder: 4,
  },
  {
    id: 'exp-hackathons',
    role: 'Hackathon & Technical Event Participant',
    organization: 'Collegiate & Developer Community Events',
    category: 'Hackathons & Events',
    period: '2024 — Present',
    location: 'Pune, India',
    description:
      'Participating in hackathons and campus technical events to prototype software solutions under time constraints and collaborate across engineering roles.',
    highlights: [
      'Collaborated on rapid problem scoping, UI implementation, and API integration',
      'Presented functional prototypes and technical walkthroughs',
    ],
    verifiedStatus: 'Campus & Community Participation',
    sortOrder: 5,
  },
];

export const DEFAULT_EDUCATION: EducationItem[] = [
  {
    id: 'edu-ty-bsc',
    degree: 'Bachelor of Science in Computer Science (T.Y. B.Sc. CS)',
    yearLabel: 'Third Year (Current)',
    institution: 'Bharati Vidyapeeth (Deemed University), Yashwantrao Mohite College of Arts, Science & Commerce',
    period: '2024 — Present',
    location: 'Pune, Maharashtra',
    description:
      'Focused on advanced computer science fundamentals, full-stack software engineering, relational database systems, and applied artificial intelligence projects.',
    coursework: [
      'Data Structures & Algorithms',
      'Database Management Systems (DBMS)',
      'Operating Systems',
      'Computer Networks',
      'Object-Oriented Programming',
      'Web Technologies',
    ],
    sortOrder: 1,
  },
  {
    id: 'edu-sy-fy-bsc',
    degree: 'Bachelor of Science in Computer Science (F.Y. & S.Y. B.Sc. CS)',
    yearLabel: 'First & Second Year Foundation',
    institution: 'Bharati Vidyapeeth (Deemed University), Yashwantrao Mohite College of Arts, Science & Commerce',
    period: '2023 — 2024',
    location: 'Pune, Maharashtra',
    description:
      'Built strong programming fluency across C, C++, Java, Python, and SQL alongside mathematical foundations and software design principles.',
    coursework: ['C Programming', 'C++ & OOP', 'Java Fundamentals', 'SQL & Relational Databases'],
    sortOrder: 2,
  },
];

export const DEFAULT_CERTIFICATIONS: CertificationItem[] = [
  {
    id: 'cert-honeywell-ai',
    title: 'Honeywell AI Course',
    issuer: 'Honeywell',
    issueDate: 'Editable Date',
    credentialUrl: '',
    certificateFileUrl: '',
    certificateFileName: '',
    certificateFileType: '',
    description:
      'Completed foundational Artificial Intelligence coursework covering core AI concepts and practical engineering applications. Upload the official PDF or image certificate via the Admin Dashboard.',
    sortOrder: 1,
  },
];

export const DEFAULT_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'ach-sports-gs',
    title: 'College Sports Club General Secretary',
    category: 'Leadership',
    period: 'Campus Leadership',
    description:
      'Elected/appointed General Secretary of the College Sports Club, coordinating inter-departmental athletics schedules, team logistics, and student participation.',
    sortOrder: 1,
  },
  {
    id: 'ach-volleyball',
    title: 'Volleyball Participation',
    category: 'Sports',
    period: 'Collegiate Athletics',
    description:
      'Active volleyball player representing college squads, building team coordination, quick decision-making, and endurance under competitive pressure.',
    sortOrder: 2,
  },
  {
    id: 'ach-chess',
    title: 'Chess Enthusiast & Strategic Thinker',
    category: 'Strategy & Chess',
    period: 'Ongoing',
    description:
      'Regular chess player cultivating pattern recognition, forward planning, and structured problem solving that directly informs algorithmic thinking.',
    sortOrder: 3,
  },
  {
    id: 'ach-hackathon',
    title: 'Hackathon Participation',
    category: 'Hackathon',
    period: '2024 — Present',
    description:
      'Participated in rapid-prototyping hackathons, shipping end-to-end AI and web interfaces with collaborative engineering teams.',
    sortOrder: 4,
  },
  {
    id: 'ach-tech-projects',
    title: 'Practical Full-Stack & AI Technical Builds',
    category: 'Technical',
    period: '2024 — Present',
    description:
      'Designed and deployed practical software builds including Buddy Elder AI, an AI-assisted Playwright test automation runner, VedaVerse, and a Django REST API.',
    sortOrder: 5,
  },
];

export const DEFAULT_RESUME_META: ResumeMeta = {
  fileName: '',
  fileUrl: '',
  mimeType: 'application/pdf',
  fileSizeBytes: 0,
  summaryNote:
    'No custom PDF uploaded yet. Visitors can download an auto-generated PDF built directly from your live portfolio profile, or you can upload your own PDF resume in the Admin Dashboard.',
};

export const DEFAULT_PORTFOLIO_BUNDLE: PortfolioDataBundle = {
  profile: DEFAULT_PROFILE,
  projects: DEFAULT_PROJECTS,
  skills: DEFAULT_SKILLS,
  experiences: DEFAULT_EXPERIENCES,
  education: DEFAULT_EDUCATION,
  certifications: DEFAULT_CERTIFICATIONS,
  achievements: DEFAULT_ACHIEVEMENTS,
  resumeMeta: DEFAULT_RESUME_META,
};
