/**
 * Explorer.js - Career Explorer Page Functionality
 * With 50+ Career Options and AWS Integration
 */

// ================ ADD THIS AT THE VERY TOP OF explorer.js ================
(function() {
    console.log('🔧 Explorer.js initializing...');
    
    // If API service doesn't exist but the class is available, create it
    if (!window.apiService && window.APIService) {
        console.log('📦 Creating new API Service instance...');
        window.apiService = new APIService();
    }
    
    // Check if API service is available
    if (window.apiService) {
        console.log('✅ API Service is available');
        // Test the connection
        window.apiService.testConnection().then(result => {
            console.log('🔌 API Connection test:', result);
        }).catch(err => {
            console.warn('⚠️ API Connection test failed:', err);
        });
    } else {
        console.error('❌ API Service is NOT available!');
        console.log('  - API_ENDPOINTS:', window.API_ENDPOINTS);
        console.log('  - APIService class:', !!window.APIService);
    }
})();
// ================ END OF ADDED CODE ================

const ExplorerModule = {
    // Configuration
    config: {
        careersPerPage: 12,
        currentPage: 1,
        currentFilter: 'all',
        currentSearch: ''
    },
    
    // State
    state: {
        allCareers: [],
        filteredCareers: [],
        isLoading: false,
        isModalOpen: false,
        currentCareer: null
    },
    
    // DOM Elements
    elements: {},
    
    // Initialize the explorer
    init: function() {
        console.log('Initializing Career Explorer with 50+ careers and AWS integration...');
        
        // Initialize DOM elements
        this.initElements();
        
        // Load career data
        this.loadCareerData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update UI for authentication
        this.updateAuthUI();
        
        // Check API connection
        this.checkAPIConnection();
        
        // Listen for language changes
        document.addEventListener('languageChanged', () => {
            console.log('Language changed, reloading careers...');
            this.loadCareerData();
        });
    },
    
    // Initialize DOM elements
    initElements: function() {
        this.elements = {
            // Main containers
            careersGrid: document.getElementById('careers-grid'),
            emptyState: document.getElementById('empty-state'),
            
            // Search
            searchInput: document.getElementById('career-search'),
            searchBtn: document.getElementById('search-btn'),
            clearSearchBtn: document.getElementById('clear-search'),
            
            // Filters
            filterButtons: document.querySelectorAll('.filter-btn'),
            
            // Modal
            modal: document.getElementById('career-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalBody: document.getElementById('modal-body'),
            closeModalBtn: document.getElementById('close-modal'),
            saveCareerModalBtn: document.getElementById('save-career-modal'),
            
            // Loading state
            loadingElement: document.querySelector('.loading')
        };
    },
    
    // Check API connection
    checkAPIConnection: function() {
        if (window.apiService) {
            window.apiService.testConnection().then(result => {
                if (result.success) {
                    console.log('✅ AWS API connected successfully');
                } else {
                    console.warn('⚠️ AWS API connection failed - using localStorage only');
                }
            });
        } else {
            console.warn('⚠️ API Service not available - using localStorage only');
        }
    },
    
    // Load career data
    async loadCareerData() {
        this.showLoading(true);
        
        try {
            // Try to load from localStorage cache first
            const cached = localStorage.getItem('careerData');
            if (cached) {
                this.state.allCareers = JSON.parse(cached);
                console.log(`Loaded ${this.state.allCareers.length} careers from cache`);
            } else {
                // Load local career data
                await this.loadLocalCareerData();
            }
            
            // Translate careers if current language is not English
            if (window.TranslationService && TranslationService.currentLanguage !== 'en') {
                console.log(`Translating careers to ${TranslationService.currentLanguage}...`);
                this.state.allCareers = await TranslationService.translateCareers(
                    this.state.allCareers, 
                    TranslationService.currentLanguage
                );
            }
            
        } catch (error) {
            console.log('Error loading from cache, using local data:', error);
            await this.loadLocalCareerData();
        }
        
        // Apply filters and display
        this.applyFilters();
        await this.displayCareers();
        this.showLoading(false);
    },
    
    // Load local career data with 50+ careers
    async loadLocalCareerData() {
        this.state.allCareers = this.getCareerDatabase();
        
        // Store in localStorage for other pages to use
        localStorage.setItem('careerData', JSON.stringify(this.state.allCareers));
        console.log(`Loaded ${this.state.allCareers.length} careers locally`);
    },
    
    // Get comprehensive career database
    getCareerDatabase: function() {
        return [
            // ===== TECHNOLOGY CAREERS =====
            {
                id: 'software-developer',
                title: 'Software Developer',
                category: 'Technology',
                description: 'Design, develop, and maintain software applications and systems. Create solutions for web, mobile, and desktop platforms.',
                salary: '$70,000 - $150,000',
                demand: 'Very High',
                growth: '22% (Much faster than average)',
                education: "Bachelor's degree in Computer Science",
                skills: ['JavaScript', 'Python', 'Java', 'Git', 'Problem Solving', 'Algorithms', 'System Design'],
                icon: 'fa-code',
                featured: true,
                path: [
                    { step: 1, title: 'Learn Programming Fundamentals', duration: '3-6 months', description: 'Start with basic programming concepts using Python or JavaScript' },
                    { step: 2, title: 'Choose a Specialization', duration: '6-12 months', description: 'Focus on frontend, backend, mobile, or full-stack development' },
                    { step: 3, title: 'Build Portfolio Projects', duration: '6 months', description: 'Create 3-5 substantial projects to showcase your skills' },
                    { step: 4, title: 'Learn Version Control', duration: '1-2 months', description: 'Master Git, GitHub, and collaborative workflows' },
                    { step: 5, title: 'Practice Algorithms', duration: '3-6 months', description: 'Prepare for technical interviews with coding challenges' }
                ],
                resources: [
                    { name: 'freeCodeCamp', url: 'https://freecodecamp.org', type: 'Learning Platform', description: 'Free coding challenges and projects' },
                    { name: 'AWS Training', url: 'https://aws.amazon.com/training/', type: 'Cloud Certification', description: 'Free and paid cloud computing courses' }
                ],
                milestones: [
                    { title: 'Complete first programming course', completed: false },
                    { title: 'Build first web application', completed: false },
                    { title: 'Learn version control (Git)', completed: false },
                    { title: 'Complete portfolio project', completed: false },
                    { title: 'Practice 50+ coding challenges', completed: false }
                ]
            },
            {
                id: 'data-scientist',
                title: 'Data Scientist',
                category: 'Technology',
                description: 'Analyze complex data to extract insights and build predictive models. Use machine learning and statistical techniques.',
                salary: '$95,000 - $165,000',
                demand: 'Very High',
                growth: '36% (Much faster than average)',
                education: "Master's degree in Data Science or related field",
                skills: ['Python', 'R', 'Machine Learning', 'Statistics', 'Big Data', 'SQL', 'Data Visualization'],
                icon: 'fa-brain',
                featured: true,
                path: [
                    { step: 1, title: 'Learn Advanced Statistics', duration: '4-6 months', description: 'Master probability, inferential statistics, and linear algebra' },
                    { step: 2, title: 'Master Python & Libraries', duration: '6-8 months', description: 'Learn NumPy, Pandas, Scikit-learn, TensorFlow' },
                    { step: 3, title: 'Study Machine Learning', duration: '6-8 months', description: 'Learn algorithms and model building' },
                    { step: 4, title: 'Big Data Technologies', duration: '4-6 months', description: 'Learn Hadoop, Spark, and cloud platforms' }
                ],
                resources: [
                    { name: 'Kaggle', url: 'https://kaggle.com', type: 'Data Science Community', description: 'Competitions and datasets' },
                    { name: 'Fast.ai', url: 'https://fast.ai', type: 'Learning Platform', description: 'Practical deep learning courses' }
                ],
                milestones: [
                    { title: 'Complete statistics fundamentals', completed: false },
                    { title: 'Master Python data libraries', completed: false },
                    { title: 'Build first ML model', completed: false },
                    { title: 'Participate in Kaggle competition', completed: false },
                    { title: 'Complete end-to-end data project', completed: false }
                ]
            },
            {
                id: 'cybersecurity-analyst',
                title: 'Cybersecurity Analyst',
                category: 'Technology',
                description: 'Protect computer systems and networks from cyber threats. Monitor for security breaches and implement protective measures.',
                salary: '$75,000 - $130,000',
                demand: 'Very High',
                growth: '33% (Much faster than average)',
                education: "Bachelor's degree in Cybersecurity or related field",
                skills: ['Network Security', 'Ethical Hacking', 'Risk Assessment', 'Incident Response', 'Cryptography'],
                icon: 'fa-shield-alt',
                featured: true,
                path: [
                    { step: 1, title: 'Learn Networking Basics', duration: '3-4 months', description: 'Understand network protocols and architecture' },
                    { step: 2, title: 'Study Security Fundamentals', duration: '3-4 months', description: 'Learn about threats, vulnerabilities, and countermeasures' },
                    { step: 3, title: 'Learn Ethical Hacking', duration: '4-6 months', description: 'Study penetration testing and vulnerability assessment' },
                    { step: 4, title: 'Get Certified', duration: '3-4 months', description: 'Pursue Security+, CEH, or CISSP certification' }
                ],
                resources: [
                    { name: 'Cybrary', url: 'https://cybrary.it', type: 'Learning Platform', description: 'Free cybersecurity training' },
                    { name: 'TryHackMe', url: 'https://tryhackme.com', type: 'Learning Platform', description: 'Hands-on cybersecurity training' }
                ],
                milestones: [
                    { title: 'Complete networking fundamentals', completed: false },
                    { title: 'Learn security basics', completed: false },
                    { title: 'Complete ethical hacking course', completed: false },
                    { title: 'Earn first security certification', completed: false },
                    { title: 'Participate in CTF competition', completed: false }
                ]
            },
            {
                id: 'data-analyst',
                title: 'Data Analyst',
                category: 'Technology',
                description: 'Collect, process, and analyze data to help organizations make informed decisions. Work with statistical tools and visualization software.',
                salary: '$60,000 - $110,000',
                demand: 'High',
                growth: '25% (Much faster than average)',
                education: "Bachelor's degree in Statistics or related field",
                skills: ['Excel', 'SQL', 'Python', 'Tableau', 'Statistics', 'Data Visualization'],
                icon: 'fa-chart-bar',
                featured: true,
                path: [
                    { step: 1, title: 'Learn Statistics & Mathematics', duration: '3-4 months', description: 'Master basic statistics, probability, and algebra' },
                    { step: 2, title: 'Master Excel & SQL', duration: '2-3 months', description: 'Learn advanced Excel functions and database querying' },
                    { step: 3, title: 'Learn Python for Data Analysis', duration: '4-6 months', description: 'Master data manipulation libraries like Pandas' },
                    { step: 4, title: 'Data Visualization Tools', duration: '2-3 months', description: 'Learn Tableau, Power BI for creating dashboards' }
                ],
                resources: [
                    { name: 'Kaggle', url: 'https://kaggle.com', type: 'Data Science Community', description: 'Datasets, competitions, and learning resources' },
                    { name: 'Google Data Analytics Certificate', url: 'https://grow.google/certificates/data-analytics/', type: 'Professional Certificate', description: 'Beginner-friendly data analytics certification' }
                ],
                milestones: [
                    { title: 'Complete statistics basics', completed: false },
                    { title: 'Master SQL queries', completed: false },
                    { title: 'Complete Python data analysis', completed: false },
                    { title: 'Create first dashboard', completed: false },
                    { title: 'Complete end-to-end analysis project', completed: false }
                ]
            },
            {
                id: 'devops-engineer',
                title: 'DevOps Engineer',
                category: 'Technology',
                description: 'Bridge development and operations teams. Automate deployment processes and maintain cloud infrastructure.',
                salary: '$85,000 - $140,000',
                demand: 'High',
                growth: '21% (Much faster than average)',
                education: "Bachelor's degree in Computer Science",
                skills: ['AWS/Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Scripting'],
                icon: 'fa-server',
                path: [
                    { step: 1, title: 'Learn Linux & Command Line', duration: '2-3 months', description: 'Master Linux administration and shell scripting' },
                    { step: 2, title: 'Study Cloud Platforms', duration: '3-4 months', description: 'Learn AWS, Azure, or Google Cloud fundamentals' },
                    { step: 3, title: 'Containerization & Orchestration', duration: '3-4 months', description: 'Learn Docker and Kubernetes' },
                    { step: 4, title: 'CI/CD Pipelines', duration: '2-3 months', description: 'Master Jenkins, GitLab CI, or GitHub Actions' }
                ],
                resources: [
                    { name: 'AWS Free Tier', url: 'https://aws.amazon.com/free/', type: 'Cloud Platform', description: 'Free access to AWS services' },
                    { name: 'Docker Documentation', url: 'https://docs.docker.com/', type: 'Documentation', description: 'Official Docker learning resources' }
                ],
                milestones: [
                    { title: 'Master Linux basics', completed: false },
                    { title: 'Learn Docker containers', completed: false },
                    { title: 'Set up CI/CD pipeline', completed: false },
                    { title: 'Get cloud certification', completed: false },
                    { title: 'Deploy production application', completed: false }
                ]
            },
            {
                id: 'ai-engineer',
                title: 'AI Engineer',
                category: 'Technology',
                description: 'Design and implement artificial intelligence systems. Develop machine learning models and AI applications.',
                salary: '$100,000 - $180,000',
                demand: 'Very High',
                growth: '40% (Much faster than average)',
                education: "Master's degree in AI or Computer Science",
                skills: ['Python', 'TensorFlow', 'PyTorch', 'Deep Learning', 'NLP', 'Computer Vision'],
                icon: 'fa-robot',
                featured: true,
                path: [
                    { step: 1, title: 'Advanced Python Programming', duration: '3-4 months', description: 'Master Python for AI/ML development' },
                    { step: 2, title: 'Mathematics for AI', duration: '4-6 months', description: 'Study linear algebra, calculus, and statistics' },
                    { step: 3, title: 'Deep Learning Fundamentals', duration: '5-7 months', description: 'Learn neural networks and deep learning architectures' },
                    { step: 4, title: 'Specialize in AI Domain', duration: '4-6 months', description: 'Focus on NLP, Computer Vision, or Reinforcement Learning' }
                ],
                resources: [
                    { name: 'Coursera Deep Learning', url: 'https://coursera.org/specializations/deep-learning', type: 'Online Course', description: 'Deep Learning Specialization by Andrew Ng' },
                    { name: 'TensorFlow', url: 'https://tensorflow.org', type: 'Framework', description: 'Official TensorFlow documentation and tutorials' }
                ],
                milestones: [
                    { title: 'Master Python for AI', completed: false },
                    { title: 'Complete math fundamentals', completed: false },
                    { title: 'Build first neural network', completed: false },
                    { title: 'Complete deep learning specialization', completed: false },
                    { title: 'Deploy AI model to production', completed: false }
                ]
            },
            {
                id: 'cloud-architect',
                title: 'Cloud Architect',
                category: 'Technology',
                description: 'Design cloud computing strategies and solutions. Plan and manage cloud infrastructure for organizations.',
                salary: '$120,000 - $200,000',
                demand: 'High',
                growth: '24% (Much faster than average)',
                education: "Bachelor's degree in Computer Science",
                skills: ['AWS', 'Azure', 'GCP', 'Cloud Security', 'Infrastructure as Code', 'Networking'],
                icon: 'fa-cloud',
                path: [
                    { step: 1, title: 'Learn Cloud Fundamentals', duration: '2-3 months', description: 'Understand cloud computing concepts and models' },
                    { step: 2, title: 'Master a Cloud Platform', duration: '4-6 months', description: 'Get certified in AWS, Azure, or Google Cloud' },
                    { step: 3, title: 'Study Cloud Architecture', duration: '3-4 months', description: 'Learn cloud design patterns and best practices' },
                    { step: 4, title: 'Infrastructure as Code', duration: '2-3 months', description: 'Master Terraform or CloudFormation' }
                ],
                resources: [
                    { name: 'AWS Certified Solutions Architect', url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/', type: 'Certification', description: 'AWS certification path' },
                    { name: 'Microsoft Learn', url: 'https://learn.microsoft.com', type: 'Learning Platform', description: 'Free Azure training and certification' }
                ],
                milestones: [
                    { title: 'Learn cloud fundamentals', completed: false },
                    { title: 'Get cloud certification', completed: false },
                    { title: 'Master infrastructure as code', completed: false },
                    { title: 'Design cloud architecture', completed: false },
                    { title: 'Complete cloud migration project', completed: false }
                ]
            },
            {
                id: 'mobile-developer',
                title: 'Mobile App Developer',
                category: 'Technology',
                description: 'Create applications for mobile devices. Develop for iOS, Android, or cross-platform frameworks.',
                salary: '$70,000 - $130,000',
                demand: 'High',
                growth: '19% (Much faster than average)',
                education: "Bachelor's degree in Computer Science",
                skills: ['Swift', 'Kotlin', 'React Native', 'Flutter', 'UI/UX Design', 'APIs'],
                icon: 'fa-mobile-alt',
                path: [
                    { step: 1, title: 'Choose Platform', duration: '1-2 months', description: 'Decide between iOS, Android, or cross-platform development' },
                    { step: 2, title: 'Learn Programming Language', duration: '3-5 months', description: 'Master Swift for iOS or Kotlin for Android' },
                    { step: 3, title: 'Study Mobile Development', duration: '4-6 months', description: 'Learn mobile frameworks and development patterns' },
                    { step: 4, title: 'Build Portfolio Apps', duration: '4-6 months', description: 'Create and publish apps to app stores' }
                ],
                resources: [
                    { name: 'Apple Developer Academy', url: 'https://developer.apple.com/', type: 'Developer Portal', description: 'iOS development resources' },
                    { name: 'Android Developers', url: 'https://developer.android.com', type: 'Developer Portal', description: 'Android development resources' }
                ],
                milestones: [
                    { title: 'Choose mobile platform', completed: false },
                    { title: 'Learn programming language', completed: false },
                    { title: 'Build first mobile app', completed: false },
                    { title: 'Publish app to store', completed: false },
                    { title: 'Build portfolio of 3+ apps', completed: false }
                ]
            },
            {
                id: 'fullstack-developer',
                title: 'Full Stack Developer',
                category: 'Technology',
                description: 'Develop both frontend and backend of web applications. Handle everything from database to user interface.',
                salary: '$75,000 - $140,000',
                demand: 'Very High',
                growth: '23% (Much faster than average)',
                education: "Bachelor's degree in Computer Science",
                skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'APIs', 'HTML/CSS'],
                icon: 'fa-layer-group',
                path: [
                    { step: 1, title: 'Frontend Fundamentals', duration: '3-4 months', description: 'Master HTML, CSS, and JavaScript' },
                    { step: 2, title: 'Frontend Framework', duration: '3-4 months', description: 'Learn React, Angular, or Vue.js' },
                    { step: 3, title: 'Backend Development', duration: '4-5 months', description: 'Master Node.js, Express, and databases' },
                    { step: 4, title: 'Full Stack Integration', duration: '3-4 months', description: 'Connect frontend and backend, deploy applications' }
                ],
                resources: [
                    { name: 'The Odin Project', url: 'https://theodinproject.com', type: 'Learning Platform', description: 'Free full stack curriculum' },
                    { name: 'Full Stack Open', url: 'https://fullstackopen.com', type: 'Course', description: 'Modern web development course' }
                ],
                milestones: [
                    { title: 'Master frontend basics', completed: false },
                    { title: 'Learn frontend framework', completed: false },
                    { title: 'Master backend development', completed: false },
                    { title: 'Build full stack application', completed: false },
                    { title: 'Deploy application to cloud', completed: false }
                ]
            },
            {
                id: 'qa-engineer',
                title: 'QA Engineer',
                category: 'Technology',
                description: 'Ensure software quality through testing. Develop test plans, automate tests, and identify bugs.',
                salary: '$65,000 - $110,000',
                demand: 'High',
                growth: '18% (Faster than average)',
                education: "Bachelor's degree in Computer Science",
                skills: ['Test Automation', 'Selenium', 'JUnit', 'Test Planning', 'Bug Tracking', 'CI/CD'],
                icon: 'fa-vial',
                path: [
                    { step: 1, title: 'Software Testing Fundamentals', duration: '2-3 months', description: 'Learn testing methodologies and types' },
                    { step: 2, title: 'Manual Testing', duration: '2-3 months', description: 'Master test case design and execution' },
                    { step: 3, title: 'Test Automation', duration: '3-4 months', description: 'Learn Selenium, Cypress, or Playwright' },
                    { step: 4, title: 'Advanced Testing', duration: '3-4 months', description: 'Study performance, security, and mobile testing' }
                ],
                resources: [
                    { name: 'Ministry of Testing', url: 'https://ministryoftesting.com', type: 'Community', description: 'Software testing community and resources' },
                    { name: 'Test Automation University', url: 'https://testautomationu.applitools.com', type: 'Learning Platform', description: 'Free test automation courses' }
                ],
                milestones: [
                    { title: 'Learn testing fundamentals', completed: false },
                    { title: 'Master manual testing', completed: false },
                    { title: 'Learn test automation', completed: false },
                    { title: 'Build automation framework', completed: false },
                    { title: 'Get ISTQB certification', completed: false }
                ]
            },

            // ===== BUSINESS CAREERS =====
            {
                id: 'project-manager',
                title: 'Project Manager',
                category: 'Business',
                description: 'Plan, execute, and oversee projects to ensure they are completed on time and within budget. Coordinate teams and resources.',
                salary: '$65,000 - $120,000',
                demand: 'High',
                growth: '7% (As fast as average)',
                education: "Bachelor's degree in Business or related field",
                skills: ['Leadership', 'Communication', 'Planning', 'Risk Management', 'Agile', 'Scrum'],
                icon: 'fa-tasks',
                path: [
                    { step: 1, title: 'Learn Project Management Basics', duration: '2-3 months', description: 'Understand project lifecycle and methodologies' },
                    { step: 2, title: 'Master Planning Tools', duration: '2-3 months', description: 'Learn to use tools like MS Project, Jira, Trello' },
                    { step: 3, title: 'Study Agile & Scrum', duration: '2-3 months', description: 'Learn popular project management frameworks' },
                    { step: 4, title: 'Get Certified', duration: '3-4 months', description: 'Pursue PMP or CAPM certification' }
                ],
                resources: [
                    { name: 'Project Management Institute', url: 'https://pmi.org', type: 'Professional Organization', description: 'PM certifications and resources' },
                    { name: 'Coursera Project Management', url: 'https://coursera.org/specializations/project-management', type: 'Online Course', description: 'Project management specialization' }
                ],
                milestones: [
                    { title: 'Learn project management basics', completed: false },
                    { title: 'Master project management tools', completed: false },
                    { title: 'Complete agile training', completed: false },
                    { title: 'Lead first project', completed: false },
                    { title: 'Get PMP certification', completed: false }
                ]
            },
            {
                id: 'digital-marketer',
                title: 'Digital Marketer',
                category: 'Business',
                description: 'Promote brands and products through digital channels. Use SEO, social media, email marketing, and analytics.',
                salary: '$45,000 - $85,000',
                demand: 'High',
                growth: '10% (Faster than average)',
                education: "Bachelor's degree in Marketing or related field",
                skills: ['SEO', 'Social Media', 'Content Marketing', 'Analytics', 'Copywriting', 'Email Marketing'],
                icon: 'fa-bullhorn',
                path: [
                    { step: 1, title: 'Learn Marketing Fundamentals', duration: '2-3 months', description: 'Understand marketing principles and strategies' },
                    { step: 2, title: 'Master Digital Channels', duration: '3-4 months', description: 'Learn SEO, social media, email marketing' },
                    { step: 3, title: 'Study Analytics', duration: '2-3 months', description: 'Learn to measure and analyze campaign performance' },
                    { step: 4, title: 'Content Creation', duration: '3-4 months', description: 'Learn copywriting and content strategy' }
                ],
                resources: [
                    { name: 'Google Digital Garage', url: 'https://learndigital.withgoogle.com/digitalgarage', type: 'Learning Platform', description: 'Free digital marketing courses' },
                    { name: 'HubSpot Academy', url: 'https://academy.hubspot.com', type: 'Learning Platform', description: 'Free marketing and sales courses' }
                ],
                milestones: [
                    { title: 'Learn marketing fundamentals', completed: false },
                    { title: 'Master SEO basics', completed: false },
                    { title: 'Complete digital marketing course', completed: false },
                    { title: 'Run first campaign', completed: false },
                    { title: 'Get Google certification', completed: false }
                ]
            },
            {
                id: 'business-analyst',
                title: 'Business Analyst',
                category: 'Business',
                description: 'Analyze business processes and requirements. Bridge the gap between business stakeholders and IT teams.',
                salary: '$60,000 - $100,000',
                demand: 'High',
                growth: '14% (Faster than average)',
                education: "Bachelor's degree in Business or IT",
                skills: ['Requirements Gathering', 'Process Modeling', 'Data Analysis', 'Stakeholder Management', 'Documentation'],
                icon: 'fa-chart-line',
                path: [
                    { step: 1, title: 'Business Fundamentals', duration: '2-3 months', description: 'Understand business operations and processes' },
                    { step: 2, title: 'Analytical Skills', duration: '3-4 months', description: 'Learn data analysis and process modeling techniques' },
                    { step: 3, title: 'Tools & Methodologies', duration: '2-3 months', description: 'Master tools like Jira, Confluence, and Agile methodologies' },
                    { step: 4, title: 'Get Certified', duration: '3-4 months', description: 'Pursue CBAP or PMI-PBA certification' }
                ],
                resources: [
                    { name: 'International Institute of Business Analysis', url: 'https://iiba.org', type: 'Professional Organization', description: 'Business analysis resources and certifications' },
                    { name: 'Business Analysis for Beginners', url: 'https://coursera.org/learn/business-analysis', type: 'Online Course', description: 'Introduction to business analysis' }
                ],
                milestones: [
                    { title: 'Learn business fundamentals', completed: false },
                    { title: 'Master requirements gathering', completed: false },
                    { title: 'Learn data analysis', completed: false },
                    { title: 'Complete first BA project', completed: false },
                    { title: 'Get CBAP certification', completed: false }
                ]
            },
            {
                id: 'financial-analyst',
                title: 'Financial Analyst',
                category: 'Business',
                description: 'Analyze financial data to guide investment decisions. Prepare reports and forecasts for businesses.',
                salary: '$65,000 - $120,000',
                demand: 'High',
                growth: '9% (As fast as average)',
                education: "Bachelor's degree in Finance or Accounting",
                skills: ['Financial Modeling', 'Excel', 'Data Analysis', 'Accounting', 'Valuation', 'Reporting'],
                icon: 'fa-chart-pie',
                path: [
                    { step: 1, title: 'Finance Fundamentals', duration: '3-4 months', description: 'Learn accounting principles and financial concepts' },
                    { step: 2, title: 'Excel Mastery', duration: '2-3 months', description: 'Master advanced Excel functions and financial modeling' },
                    { step: 3, title: 'Financial Analysis', duration: '4-5 months', description: 'Learn valuation techniques and financial statement analysis' },
                    { step: 4, title: 'Get Certified', duration: '6-12 months', description: 'Pursue CFA or FMVA certification' }
                ],
                resources: [
                    { name: 'CFA Institute', url: 'https://cfainstitute.org', type: 'Professional Organization', description: 'Chartered Financial Analyst program' },
                    { name: 'Corporate Finance Institute', url: 'https://corporatefinanceinstitute.com', type: 'Learning Platform', description: 'Financial modeling and analysis courses' }
                ],
                milestones: [
                    { title: 'Learn finance fundamentals', completed: false },
                    { title: 'Master Excel modeling', completed: false },
                    { title: 'Complete financial analysis course', completed: false },
                    { title: 'Build first financial model', completed: false },
                    { title: 'Pass CFA Level 1', completed: false }
                ]
            },
            {
                id: 'human-resources',
                title: 'HR Specialist',
                category: 'Business',
                description: 'Manage recruitment, employee relations, benefits, and training programs within organizations.',
                salary: '$50,000 - $85,000',
                demand: 'High',
                growth: '10% (Faster than average)',
                education: "Bachelor's degree in HR or Business",
                skills: ['Recruitment', 'Employee Relations', 'Compensation', 'Training', 'HRIS', 'Employment Law'],
                icon: 'fa-users',
                path: [
                    { step: 1, title: 'HR Fundamentals', duration: '2-3 months', description: 'Learn core HR functions and principles' },
                    { step: 2, title: 'Employment Law', duration: '2-3 months', description: 'Study labor laws and regulations' },
                    { step: 3, title: 'Recruitment & Selection', duration: '2-3 months', description: 'Master hiring processes and techniques' },
                    { step: 4, title: 'HR Technology', duration: '2-3 months', description: 'Learn HRIS systems and HR analytics' }
                ],
                resources: [
                    { name: 'SHRM', url: 'https://shrm.org', type: 'Professional Organization', description: 'Society for Human Resource Management' },
                    { name: 'HR University', url: 'https://hru.edu', type: 'Learning Platform', description: 'HR certification and training' }
                ],
                milestones: [
                    { title: 'Learn HR fundamentals', completed: false },
                    { title: 'Study employment law', completed: false },
                    { title: 'Master recruitment process', completed: false },
                    { title: 'Complete HR internship', completed: false },
                    { title: 'Get SHRM certification', completed: false }
                ]
            },
            {
                id: 'sales-manager',
                title: 'Sales Manager',
                category: 'Business',
                description: 'Lead sales teams, develop strategies, and drive revenue growth for businesses.',
                salary: '$70,000 - $130,000',
                demand: 'High',
                growth: '5% (As fast as average)',
                education: "Bachelor's degree in Business or Marketing",
                skills: ['Sales Strategy', 'Team Leadership', 'Negotiation', 'CRM', 'Client Relationship', 'Forecasting'],
                icon: 'fa-handshake',
                path: [
                    { step: 1, title: 'Sales Fundamentals', duration: '2-3 months', description: 'Learn sales techniques and processes' },
                    { step: 2, title: 'CRM Systems', duration: '1-2 months', description: 'Master Salesforce or similar CRM platforms' },
                    { step: 3, title: 'Sales Management', duration: '3-4 months', description: 'Learn to lead and motivate sales teams' },
                    { step: 4, title: 'Strategic Sales', duration: '2-3 months', description: 'Develop sales strategies and forecasts' }
                ],
                resources: [
                    { name: 'Salesforce Trailhead', url: 'https://trailhead.salesforce.com', type: 'Learning Platform', description: 'Free Salesforce training' },
                    { name: 'Miller Heiman Group', url: 'https://millerheimangroup.com', type: 'Training', description: 'Sales methodology training' }
                ],
                milestones: [
                    { title: 'Learn sales fundamentals', completed: false },
                    { title: 'Master CRM platform', completed: false },
                    { title: 'Complete sales training', completed: false },
                    { title: 'Lead sales team', completed: false },
                    { title: 'Exceed sales quota', completed: false }
                ]
            },
            {
                id: 'operations-manager',
                title: 'Operations Manager',
                category: 'Business',
                description: 'Oversee daily operations, improve efficiency, and manage resources in organizations.',
                salary: '$70,000 - $120,000',
                demand: 'High',
                growth: '6% (As fast as average)',
                education: "Bachelor's degree in Business or Operations",
                skills: ['Process Improvement', 'Supply Chain', 'Team Management', 'Budgeting', 'Quality Control', 'Logistics'],
                icon: 'fa-cogs',
                path: [
                    { step: 1, title: 'Operations Fundamentals', duration: '2-3 months', description: 'Learn operations management principles' },
                    { step: 2, title: 'Process Improvement', duration: '2-3 months', description: 'Study Lean, Six Sigma, and Kaizen methodologies' },
                    { step: 3, title: 'Supply Chain Management', duration: '3-4 months', description: 'Learn logistics and supply chain operations' },
                    { step: 4, title: 'Get Certified', duration: '4-6 months', description: 'Pursue Six Sigma certification' }
                ],
                resources: [
                    { name: 'APICS', url: 'https://apics.org', type: 'Professional Organization', description: 'Supply chain and operations management' },
                    { name: 'Six Sigma Global Institute', url: 'https://sixsigmacertification.com', type: 'Certification', description: 'Six Sigma certification programs' }
                ],
                milestones: [
                    { title: 'Learn operations basics', completed: false },
                    { title: 'Study process improvement', completed: false },
                    { title: 'Complete supply chain course', completed: false },
                    { title: 'Lead operations project', completed: false },
                    { title: 'Get Six Sigma certification', completed: false }
                ]
            },
            {
                id: 'entrepreneur',
                title: 'Entrepreneur',
                category: 'Business',
                description: 'Start and grow new businesses. Identify opportunities, develop products, and build companies.',
                salary: 'Varies (Potential for high earnings)',
                demand: 'High',
                growth: 'Self-determined',
                education: 'Varied (Business education helpful)',
                skills: ['Innovation', 'Business Planning', 'Fundraising', 'Marketing', 'Leadership', 'Risk Management'],
                icon: 'fa-lightbulb',
                path: [
                    { step: 1, title: 'Idea Validation', duration: '1-2 months', description: 'Research and validate your business idea' },
                    { step: 2, title: 'Business Planning', duration: '2-3 months', description: 'Develop a comprehensive business plan' },
                    { step: 3, title: 'Funding & Resources', duration: '3-6 months', description: 'Secure funding and gather necessary resources' },
                    { step: 4, title: 'Launch & Growth', duration: 'Ongoing', description: 'Launch your business and focus on growth strategies' }
                ],
                resources: [
                    { name: 'Y Combinator Startup School', url: 'https://startupschool.org', type: 'Course', description: 'Free startup course by Y Combinator' },
                    { name: 'Small Business Administration', url: 'https://sba.gov', type: 'Government Resource', description: 'Resources for small businesses' }
                ],
                milestones: [
                    { title: 'Validate business idea', completed: false },
                    { title: 'Create business plan', completed: false },
                    { title: 'Secure initial funding', completed: false },
                    { title: 'Launch MVP', completed: false },
                    { title: 'Acquire first 100 customers', completed: false }
                ]
            },
            {
                id: 'supply-chain-analyst',
                title: 'Supply Chain Analyst',
                category: 'Business',
                description: 'Analyze and optimize supply chain operations. Improve efficiency in procurement, logistics, and inventory management.',
                salary: '$55,000 - $95,000',
                demand: 'High',
                growth: '8% (As fast as average)',
                education: "Bachelor's degree in Supply Chain or Business",
                skills: ['Data Analysis', 'Logistics', 'Inventory Management', 'ERP Systems', 'Forecasting', 'Process Optimization'],
                icon: 'fa-truck-loading',
                path: [
                    { step: 1, title: 'Supply Chain Fundamentals', duration: '2-3 months', description: 'Learn supply chain concepts and processes' },
                    { step: 2, title: 'Data Analysis Skills', duration: '3-4 months', description: 'Master Excel, SQL, and data visualization tools' },
                    { step: 3, title: 'ERP Systems', duration: '2-3 months', description: 'Learn SAP, Oracle, or similar ERP platforms' },
                    { step: 4, title: 'Specialized Knowledge', duration: '3-4 months', description: 'Focus on logistics, procurement, or inventory optimization' }
                ],
                resources: [
                    { name: 'Coursera Supply Chain', url: 'https://coursera.org/specializations/supply-chain-management', type: 'Online Course', description: 'Supply chain management specialization' },
                    { name: 'APICS Certification', url: 'https://apics.org/certification', type: 'Certification', description: 'Supply chain professional certification' }
                ],
                milestones: [
                    { title: 'Learn supply chain basics', completed: false },
                    { title: 'Master data analysis', completed: false },
                    { title: 'Learn ERP systems', completed: false },
                    { title: 'Complete supply chain project', completed: false },
                    { title: 'Get APICS certification', completed: false }
                ]
            },
            {
                id: 'management-consultant',
                title: 'Management Consultant',
                category: 'Business',
                description: 'Advise organizations on strategy, operations, and management. Help businesses solve complex problems and improve performance.',
                salary: '$85,000 - $200,000',
                demand: 'High',
                growth: '14% (Faster than average)',
                education: "MBA or Master's degree preferred",
                skills: ['Strategy', 'Problem Solving', 'Data Analysis', 'Communication', 'Project Management', 'Industry Knowledge'],
                icon: 'fa-briefcase',
                path: [
                    { step: 1, title: 'Business Fundamentals', duration: '3-4 months', description: 'Master business concepts and frameworks' },
                    { step: 2, title: 'Analytical Skills', duration: '3-4 months', description: 'Develop problem-solving and data analysis capabilities' },
                    { step: 3, title: 'Case Interview Prep', duration: '3-4 months', description: 'Practice case interviews and consulting frameworks' },
                    { step: 4, title: 'Industry Specialization', duration: '6-12 months', description: 'Develop expertise in specific industry or function' }
                ],
                resources: [
                    { name: 'Case Interview.com', url: 'https://caseinterview.com', type: 'Resource', description: 'Case interview preparation resources' },
                    { name: 'Management Consulted', url: 'https://managementconsulted.com', type: 'Training', description: 'Consulting career preparation' }
                ],
                milestones: [
                    { title: 'Master business frameworks', completed: false },
                    { title: 'Complete case interviews', completed: false },
                    { title: 'Network with consultants', completed: false },
                    { title: 'Complete consulting internship', completed: false },
                    { title: 'Get consulting offer', completed: false }
                ]
            },

            // ===== HEALTHCARE CAREERS =====
            {
                id: 'registered-nurse',
                title: 'Registered Nurse',
                category: 'Healthcare',
                description: 'Provide patient care, educate patients and the public, and offer emotional support to patients and families.',
                salary: '$65,000 - $110,000',
                demand: 'Very High',
                growth: '9% (Faster than average)',
                education: "Associate's or Bachelor's degree in Nursing",
                skills: ['Patient Care', 'Medical Knowledge', 'Communication', 'Critical Thinking', 'Compassion', 'Teamwork'],
                icon: 'fa-user-md',
                featured: true,
                path: [
                    { step: 1, title: 'Nursing Prerequisites', duration: '1-2 years', description: 'Complete required science and math courses' },
                    { step: 2, title: 'Nursing Program', duration: '2-4 years', description: 'Complete nursing degree program' },
                    { step: 3, title: 'NCLEX Exam', duration: '2-4 months', description: 'Prepare for and pass nursing licensure exam' },
                    { step: 4, title: 'Clinical Experience', duration: '1-2 years', description: 'Gain experience in clinical settings' }
                ],
                resources: [
                    { name: 'American Nurses Association', url: 'https://nursingworld.org', type: 'Professional Organization', description: 'Nursing resources and advocacy' },
                    { name: 'Khan Academy Nursing', url: 'https://khanacademy.org/science/health-and-medicine', type: 'Learning Platform', description: 'Free medical education resources' }
                ],
                milestones: [
                    { title: 'Complete prerequisites', completed: false },
                    { title: 'Complete nursing program', completed: false },
                    { title: 'Pass NCLEX exam', completed: false },
                    { title: 'Complete clinical orientation', completed: false },
                    { title: 'Get nursing license', completed: false }
                ]
            },
            {
                id: 'physician-assistant',
                title: 'Physician Assistant',
                category: 'Healthcare',
                description: 'Practice medicine under physician supervision. Examine patients, diagnose injuries and illnesses, and provide treatment.',
                salary: '$105,000 - $150,000',
                demand: 'Very High',
                growth: '31% (Much faster than average)',
                education: "Master's degree from accredited PA program",
                skills: ['Patient Assessment', 'Diagnosis', 'Treatment Planning', 'Medical Procedures', 'Communication', 'Team Collaboration'],
                icon: 'fa-stethoscope',
                path: [
                    { step: 1, title: 'Prerequisite Courses', duration: '2-3 years', description: 'Complete required science coursework' },
                    { step: 2, title: 'Healthcare Experience', duration: '1-2 years', description: 'Gain patient care experience' },
                    { step: 3, title: 'PA Program', duration: '2-3 years', description: 'Complete Master\'s degree program' },
                    { step: 4, title: 'Certification & Licensure', duration: '3-6 months', description: 'Pass PANCE exam and obtain state license' }
                ],
                resources: [
                    { name: 'American Academy of PAs', url: 'https://aapa.org', type: 'Professional Organization', description: 'PA professional organization' },
                    { name: 'PAEA', url: 'https://paeaonline.org', type: 'Educational Resource', description: 'Physician Assistant Education Association' }
                ],
                milestones: [
                    { title: 'Complete prerequisites', completed: false },
                    { title: 'Gain healthcare experience', completed: false },
                    { title: 'Complete PA program', completed: false },
                    { title: 'Pass PANCE exam', completed: false },
                    { title: 'Obtain state license', completed: false }
                ]
            },
            {
                id: 'physical-therapist',
                title: 'Physical Therapist',
                category: 'Healthcare',
                description: 'Help patients improve movement and manage pain. Develop treatment plans to restore function and prevent disability.',
                salary: '$75,000 - $100,000',
                demand: 'High',
                growth: '21% (Much faster than average)',
                education: "Doctor of Physical Therapy degree",
                skills: ['Anatomy Knowledge', 'Rehabilitation Techniques', 'Patient Assessment', 'Treatment Planning', 'Communication', 'Exercise Prescription'],
                icon: 'fa-hand-holding-heart',
                path: [
                    { step: 1, title: 'Prerequisite Courses', duration: '3-4 years', description: 'Complete required science coursework' },
                    { step: 2, title: 'DPT Program', duration: '3 years', description: 'Complete Doctor of Physical Therapy program' },
                    { step: 3, title: 'Clinical Internships', duration: '6-12 months', description: 'Gain supervised clinical experience' },
                    { step: 4, title: 'Licensure', duration: '3-6 months', description: 'Pass NPTE exam and obtain state license' }
                ],
                resources: [
                    { name: 'American Physical Therapy Association', url: 'https://apta.org', type: 'Professional Organization', description: 'PT professional resources' },
                    { name: 'PT Progress', url: 'https://ptprogress.com', type: 'Learning Resource', description: 'Physical therapy education resources' }
                ],
                milestones: [
                    { title: 'Complete prerequisites', completed: false },
                    { title: 'Complete DPT program', completed: false },
                    { title: 'Complete clinical internships', completed: false },
                    { title: 'Pass NPTE exam', completed: false },
                    { title: 'Obtain state license', completed: false }
                ]
            },
            {
                id: 'medical-lab-technician',
                title: 'Medical Lab Technician',
                category: 'Healthcare',
                description: 'Perform laboratory tests that aid in diagnosis and treatment of diseases. Analyze body fluids, tissues, and cells.',
                salary: '$45,000 - $70,000',
                demand: 'High',
                growth: '11% (Faster than average)',
                education: "Associate's degree or certificate program",
                skills: ['Laboratory Techniques', 'Microscopy', 'Quality Control', 'Data Analysis', 'Attention to Detail', 'Instrument Operation'],
                icon: 'fa-flask',
                path: [
                    { step: 1, title: 'Science Prerequisites', duration: '1-2 years', description: 'Complete biology and chemistry courses' },
                    { step: 2, title: 'MLT Program', duration: '1-2 years', description: 'Complete accredited MLT program' },
                    { step: 3, title: 'Clinical Training', duration: '3-6 months', description: 'Complete clinical rotations' },
                    { step: 4, title: 'Certification', duration: '2-3 months', description: 'Pass ASCP or AMT certification exam' }
                ],
                resources: [
                    { name: 'American Society for Clinical Pathology', url: 'https://ascp.org', type: 'Professional Organization', description: 'Laboratory professional resources' },
                    { name: 'Lab Tests Online', url: 'https://labtestsonline.org', type: 'Resource', description: 'Patient-centered lab test information' }
                ],
                milestones: [
                    { title: 'Complete prerequisites', completed: false },
                    { title: 'Complete MLT program', completed: false },
                    { title: 'Complete clinical rotations', completed: false },
                    { title: 'Pass certification exam', completed: false },
                    { title: 'Start lab position', completed: false }
                ]
            },
            {
                id: 'health-information-manager',
                title: 'Health Information Manager',
                category: 'Healthcare',
                description: 'Manage patient health information and medical records. Ensure quality, accuracy, accessibility, and security of information.',
                salary: '$60,000 - $100,000',
                demand: 'High',
                growth: '9% (Faster than average)',
                education: "Bachelor's degree in Health Information Management",
                skills: ['Medical Coding', 'Health IT', 'Data Management', 'Privacy Regulations', 'Quality Assurance', 'Analytics'],
                icon: 'fa-file-medical',
                path: [
                    { step: 1, title: 'Health Information Basics', duration: '1-2 years', description: 'Learn medical terminology and healthcare systems' },
                    { step: 2, title: 'Coding & Classification', duration: '1 year', description: 'Master ICD-10, CPT, and HCPCS coding systems' },
                    { step: 3, title: 'Health IT Systems', duration: '1 year', description: 'Learn EHR systems and health information technology' },
                    { step: 4, title: 'Get Certified', duration: '6-12 months', description: 'Obtain RHIA or RHIT certification' }
                ],
                resources: [
                    { name: 'AHIMA', url: 'https://ahima.org', type: 'Professional Organization', description: 'Health information management association' },
                    { name: 'AAPC', url: 'https://aapc.com', type: 'Professional Organization', description: 'Medical coding certification and training' }
                ],
                milestones: [
                    { title: 'Learn health information basics', completed: false },
                    { title: 'Master medical coding', completed: false },
                    { title: 'Learn health IT systems', completed: false },
                    { title: 'Get RHIT certification', completed: false },
                    { title: 'Start HIM position', completed: false }
                ]
            },
            {
                id: 'pharmacist',
                title: 'Pharmacist',
                category: 'Healthcare',
                description: 'Dispense prescription medications and provide expertise on safe medication use. Advise patients and healthcare professionals.',
                salary: '$120,000 - $160,000',
                demand: 'High',
                growth: '2% (Slower than average)',
                education: "Doctor of Pharmacy degree",
                skills: ['Medication Knowledge', 'Patient Counseling', 'Prescription Verification', 'Drug Interactions', 'Inventory Management', 'Regulatory Compliance'],
                icon: 'fa-prescription-bottle',
                path: [
                    { step: 1, title: 'Prerequisite Courses', duration: '2-3 years', description: 'Complete required science coursework' },
                    { step: 2, title: 'Pharmacy School', duration: '4 years', description: 'Complete Doctor of Pharmacy program' },
                    { step: 3, title: 'Clinical Rotations', duration: '1 year', description: 'Complete required pharmacy practice experiences' },
                    { step: 4, title: 'Licensure', duration: '6-12 months', description: 'Pass NAPLEX and MPJE exams' }
                ],
                resources: [
                    { name: 'American Pharmacists Association', url: 'https://pharmacist.com', type: 'Professional Organization', description: 'Pharmacy professional resources' },
                    { name: 'Pharmacy Times', url: 'https://pharmacytimes.com', type: 'Resource', description: 'Pharmacy news and education' }
                ],
                milestones: [
                    { title: 'Complete prerequisites', completed: false },
                    { title: 'Complete pharmacy school', completed: false },
                    { title: 'Complete clinical rotations', completed: false },
                    { title: 'Pass NAPLEX exam', completed: false },
                    { title: 'Obtain state license', completed: false }
                ]
            },
            {
                id: 'occupational-therapist',
                title: 'Occupational Therapist',
                category: 'Healthcare',
                description: 'Help patients develop, recover, and maintain daily living and work skills. Assist people with disabilities or injuries.',
                salary: '$75,000 - $100,000',
                demand: 'High',
                growth: '16% (Much faster than average)',
                education: "Master's or Doctoral degree in OT",
                skills: ['Therapeutic Techniques', 'Patient Assessment', 'Adaptive Equipment', 'Treatment Planning', 'Communication', 'Creativity'],
                icon: 'fa-hands-helping',
                path: [
                    { step: 1, title: 'Prerequisite Courses', duration: '3-4 years', description: 'Complete required science and psychology courses' },
                    { step: 2, title: 'OT Program', duration: '2-3 years', description: 'Complete Master\'s or Doctoral program' },
                    { step: 3, title: 'Fieldwork', duration: '6-12 months', description: 'Complete supervised clinical fieldwork' },
                    { step: 4, title: 'Licensure', duration: '3-6 months', description: 'Pass NBCOT exam and obtain state license' }
                ],
                resources: [
                    { name: 'American Occupational Therapy Association', url: 'https://aota.org', type: 'Professional Organization', description: 'OT professional resources' },
                    { name: 'OT Potential', url: 'https://otpotential.com', type: 'Resource', description: 'Occupational therapy career resources' }
                ],
                milestones: [
                    { title: 'Complete prerequisites', completed: false },
                    { title: 'Complete OT program', completed: false },
                    { title: 'Complete fieldwork', completed: false },
                    { title: 'Pass NBCOT exam', completed: false },
                    { title: 'Obtain state license', completed: false }
                ]
            },
            {
                id: 'dental-hygienist',
                title: 'Dental Hygienist',
                category: 'Healthcare',
                description: 'Clean teeth, examine patients for oral diseases, and provide preventive dental care. Educate patients on oral hygiene.',
                salary: '$70,000 - $100,000',
                demand: 'High',
                growth: '11% (Much faster than average)',
                education: "Associate's degree in Dental Hygiene",
                skills: ['Teeth Cleaning', 'Oral Examination', 'X-ray Imaging', 'Patient Education', 'Infection Control', 'Dental Charting'],
                icon: 'fa-tooth',
                path: [
                    { step: 1, title: 'Prerequisite Courses', duration: '1-2 years', description: 'Complete required science courses' },
                    { step: 2, title: 'Dental Hygiene Program', duration: '2-3 years', description: 'Complete accredited dental hygiene program' },
                    { step: 3, title: 'Clinical Experience', duration: '6-12 months', description: 'Gain hands-on clinical experience' },
                    { step: 4, title: 'Licensure', duration: '3-6 months', description: 'Pass written and clinical board exams' }
                ],
                resources: [
                    { name: 'American Dental Hygienists Association', url: 'https://adha.org', type: 'Professional Organization', description: 'Dental hygiene professional resources' },
                    { name: 'Dental Hygiene Zone', url: 'https://dentalhygienezone.com', type: 'Resource', description: 'Dental hygiene study resources' }
                ],
                milestones: [
                    { title: 'Complete prerequisites', completed: false },
                    { title: 'Complete hygiene program', completed: false },
                    { title: 'Gain clinical experience', completed: false },
                    { title: 'Pass board exams', completed: false },
                    { title: 'Obtain state license', completed: false }
                ]
            },
            {
                id: 'medical-sonographer',
                title: 'Medical Sonographer',
                category: 'Healthcare',
                description: 'Use ultrasound equipment to create images of internal body structures. Assist in diagnosis and monitoring of medical conditions.',
                salary: '$65,000 - $95,000',
                demand: 'High',
                growth: '19% (Much faster than average)',
                education: "Associate's or Bachelor's degree in Sonography",
                skills: ['Ultrasound Operation', 'Anatomy Knowledge', 'Image Analysis', 'Patient Care', 'Equipment Maintenance', 'Quality Control'],
                icon: 'fa-wave-square',
                path: [
                    { step: 1, title: 'Science Prerequisites', duration: '1-2 years', description: 'Complete anatomy, physiology, and physics courses' },
                    { step: 2, title: 'Sonography Program', duration: '2-4 years', description: 'Complete accredited sonography program' },
                    { step: 3, title: 'Clinical Training', duration: '6-12 months', description: 'Gain supervised clinical experience' },
                    { step: 4, title: 'Certification', duration: '3-6 months', description: 'Pass ARDMS or CCI certification exam' }
                ],
                resources: [
                    { name: 'Society of Diagnostic Medical Sonography', url: 'https://sdms.org', type: 'Professional Organization', description: 'Sonography professional resources' },
                    { name: 'ARDMS', url: 'https://ardms.org', type: 'Certification', description: 'Ultrasound certification organization' }
                ],
                milestones: [
                    { title: 'Complete prerequisites', completed: false },
                    { title: 'Complete sonography program', completed: false },
                    { title: 'Complete clinical training', completed: false },
                    { title: 'Pass certification exam', completed: false },
                    { title: 'Start sonographer position', completed: false }
                ]
            },
            {
                id: 'clinical-research-coordinator',
                title: 'Clinical Research Coordinator',
                category: 'Healthcare',
                description: 'Coordinate clinical trials and research studies. Ensure compliance with protocols and regulations, and manage participant data.',
                salary: '$50,000 - $85,000',
                demand: 'High',
                growth: '10% (Faster than average)',
                education: "Bachelor's degree in Life Sciences or related field",
                skills: ['Research Methodology', 'Regulatory Compliance', 'Data Management', 'Participant Recruitment', 'Protocol Adherence', 'Documentation'],
                icon: 'fa-clipboard-check',
                path: [
                    { step: 1, title: 'Science Background', duration: '3-4 years', description: 'Complete degree in life sciences or related field' },
                    { step: 2, title: 'Research Fundamentals', duration: '6-12 months', description: 'Learn research methodology and ethics' },
                    { step: 3, title: 'Regulatory Knowledge', duration: '3-6 months', description: 'Study GCP guidelines and regulatory requirements' },
                    { step: 4, title: 'Get Certified', duration: '6-12 months', description: 'Obtain CCRP or CCRC certification' }
                ],
                resources: [
                    { name: 'Society of Clinical Research Associates', url: 'https://socra.org', type: 'Professional Organization', description: 'Clinical research professional resources' },
                    { name: 'CITI Program', url: 'https://citiprogram.org', type: 'Training', description: 'Research ethics and compliance training' }
                ],
                milestones: [
                    { title: 'Complete science degree', completed: false },
                    { title: 'Learn research methodology', completed: false },
                    { title: 'Study regulatory requirements', completed: false },
                    { title: 'Get certification', completed: false },
                    { title: 'Start CRC position', completed: false }
                ]
            },

            // ===== CREATIVE ARTS CAREERS =====
            {
                id: 'graphic-designer',
                title: 'Graphic Designer',
                category: 'Creative',
                description: 'Create visual concepts to communicate ideas. Design layouts for advertisements, websites, magazines, and other media.',
                salary: '$45,000 - $80,000',
                demand: 'High',
                growth: '3% (Slower than average)',
                education: "Bachelor's degree in Graphic Design or related field",
                skills: ['Adobe Creative Suite', 'Typography', 'Layout Design', 'Color Theory', 'Branding', 'Visual Communication'],
                icon: 'fa-paint-brush',
                path: [
                    { step: 1, title: 'Design Fundamentals', duration: '6-12 months', description: 'Learn principles of design, color theory, and typography' },
                    { step: 2, title: 'Master Design Software', duration: '6-12 months', description: 'Become proficient in Adobe Creative Suite' },
                    { step: 3, title: 'Build Portfolio', duration: '6-12 months', description: 'Create diverse design projects for portfolio' },
                    { step: 4, title: 'Specialize', duration: '6-12 months', description: 'Focus on print, web, or motion design' }
                ],
                resources: [
                    { name: 'Adobe Creative Cloud', url: 'https://adobe.com/creativecloud', type: 'Software', description: 'Industry-standard design tools' },
                    { name: 'Behance', url: 'https://behance.net', type: 'Portfolio Platform', description: 'Showcase and discover creative work' }
                ],
                milestones: [
                    { title: 'Learn design fundamentals', completed: false },
                    { title: 'Master Adobe Creative Suite', completed: false },
                    { title: 'Build portfolio website', completed: false },
                    { title: 'Complete 5 design projects', completed: false },
                    { title: 'Get first design job', completed: false }
                ]
            },
            {
                id: 'ui-ux-designer',
                title: 'UI/UX Designer',
                category: 'Creative',
                description: 'Design user interfaces and experiences for digital products. Focus on usability, accessibility, and user satisfaction.',
                salary: '$65,000 - $110,000',
                demand: 'High',
                growth: '13% (Faster than average)',
                education: "Bachelor's degree in Design or related field",
                skills: ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Figma', 'Information Architecture'],
                icon: 'fa-pen-fancy',
                path: [
                    { step: 1, title: 'Learn Design Fundamentals', duration: '2-3 months', description: 'Study color, typography, and layout principles' },
                    { step: 2, title: 'Master Design Tools', duration: '2-3 months', description: 'Learn Figma, Sketch, or Adobe XD' },
                    { step: 3, title: 'Study User Research', duration: '3-4 months', description: 'Learn user interviews, personas, and journey mapping' },
                    { step: 4, title: 'Prototyping & Testing', duration: '2-3 months', description: 'Create interactive prototypes and conduct usability tests' }
                ],
                resources: [
                    { name: 'Figma', url: 'https://figma.com', type: 'Design Tool', description: 'Collaborative interface design' },
                    { name: 'Nielsen Norman Group', url: 'https://nngroup.com', type: 'Research & Training', description: 'UX research and best practices' }
                ],
                milestones: [
                    { title: 'Learn design fundamentals', completed: false },
                    { title: 'Master Figma', completed: false },
                    { title: 'Complete user research project', completed: false },
                    { title: 'Build portfolio with 3 case studies', completed: false },
                    { title: 'Get first UX job', completed: false }
                ]
            },
            {
                id: 'video-editor',
                title: 'Video Editor',
                category: 'Creative',
                description: 'Edit raw video footage to create compelling stories. Add effects, sound, and graphics to produce final videos.',
                salary: '$45,000 - $85,000',
                demand: 'High',
                growth: '12% (Faster than average)',
                education: "Bachelor's degree in Film or related field",
                skills: ['Video Editing Software', 'Storytelling', 'Color Grading', 'Audio Editing', 'Motion Graphics', 'File Management'],
                icon: 'fa-video',
                path: [
                    { step: 1, title: 'Editing Fundamentals', duration: '3-6 months', description: 'Learn basic editing principles and techniques' },
                    { step: 2, title: 'Master Editing Software', duration: '6-12 months', description: 'Become proficient in Adobe Premiere, Final Cut, or DaVinci Resolve' },
                    { step: 3, title: 'Advanced Techniques', duration: '6-12 months', description: 'Learn color grading, sound design, and motion graphics' },
                    { step: 4, title: 'Build Portfolio', duration: '6-12 months', description: 'Create diverse editing samples for portfolio' }
                ],
                resources: [
                    { name: 'Adobe Premiere Pro', url: 'https://adobe.com/products/premiere', type: 'Software', description: 'Professional video editing software' },
                    { name: 'Frame.io', url: 'https://frame.io', type: 'Collaboration Tool', description: 'Video review and collaboration platform' }
                ],
                milestones: [
                    { title: 'Learn editing basics', completed: false },
                    { title: 'Master editing software', completed: false },
                    { title: 'Learn color grading', completed: false },
                    { title: 'Edit 5 video projects', completed: false },
                    { title: 'Build professional reel', completed: false }
                ]
            },
            {
                id: 'photographer',
                title: 'Photographer',
                category: 'Creative',
                description: 'Capture images using technical expertise and artistic ability. Specialize in various genres like portrait, wedding, or commercial photography.',
                salary: '$35,000 - $75,000',
                demand: 'Moderate',
                growth: '9% (As fast as average)',
                education: "Varied (Formal training helpful)",
                skills: ['Camera Operation', 'Lighting', 'Composition', 'Photo Editing', 'Client Management', 'Business Skills'],
                icon: 'fa-camera',
                path: [
                    { step: 1, title: 'Camera Fundamentals', duration: '3-6 months', description: 'Master camera settings, exposure, and composition' },
                    { step: 2, title: 'Lighting Techniques', duration: '3-6 months', description: 'Learn natural and artificial lighting techniques' },
                    { step: 3, title: 'Photo Editing', duration: '3-6 months', description: 'Master Adobe Lightroom and Photoshop' },
                    { step: 4, title: 'Business Development', duration: '6-12 months', description: 'Learn marketing, pricing, and client management' }
                ],
                resources: [
                    { name: 'Adobe Lightroom', url: 'https://adobe.com/products/photoshop-lightroom', type: 'Software', description: 'Photo editing and organization software' },
                    { name: 'CreativeLive', url: 'https://creativelive.com', type: 'Learning Platform', description: 'Creative skills courses' }
                ],
                milestones: [
                    { title: 'Master camera basics', completed: false },
                    { title: 'Learn lighting techniques', completed: false },
                    { title: 'Master photo editing', completed: false },
                    { title: 'Build photography portfolio', completed: false },
                    { title: 'Get first paid client', completed: false }
                ]
            },
            {
                id: 'animator',
                title: 'Animator',
                category: 'Creative',
                description: 'Create animated images and visual effects for films, games, and other media. Bring characters and stories to life.',
                salary: '$55,000 - $100,000',
                demand: 'High',
                growth: '8% (As fast as average)',
                education: "Bachelor's degree in Animation or related field",
                skills: ['3D Modeling', 'Character Animation', 'Rigging', 'Texturing', 'Storyboarding', 'Motion Graphics'],
                icon: 'fa-film',
                path: [
                    { step: 1, title: 'Animation Principles', duration: '6-12 months', description: 'Learn fundamental animation principles and techniques' },
                    { step: 2, title: '3D Software', duration: '6-12 months', description: 'Master Maya, Blender, or Cinema 4D' },
                    { step: 3, title: 'Character Animation', duration: '6-12 months', description: 'Learn character rigging, posing, and movement' },
                    { step: 4, title: 'Specialization', duration: '6-12 months', description: 'Focus on VFX, game animation, or film animation' }
                ],
                resources: [
                    { name: 'Blender', url: 'https://blender.org', type: 'Software', description: 'Free and open-source 3D creation suite' },
                    { name: 'Animation Mentor', url: 'https://animationmentor.com', type: 'Learning Platform', description: 'Online animation school' }
                ],
                milestones: [
                    { title: 'Learn animation principles', completed: false },
                    { title: 'Master 3D software', completed: false },
                    { title: 'Create character animation', completed: false },
                    { title: 'Build animation reel', completed: false },
                    { title: 'Get animation job', completed: false }
                ]
            },
            {
                id: 'content-creator',
                title: 'Content Creator',
                category: 'Creative',
                description: 'Produce engaging content for digital platforms. Create videos, articles, social media posts, and other content formats.',
                salary: '$40,000 - $90,000',
                demand: 'High',
                growth: '12% (Faster than average)',
                education: 'Varied (Communications or Marketing helpful)',
                skills: ['Content Strategy', 'Video Production', 'Writing', 'Social Media', 'SEO', 'Analytics'],
                icon: 'fa-pencil-alt',
                path: [
                    { step: 1, title: 'Content Fundamentals', duration: '3-6 months', description: 'Learn content strategy and storytelling' },
                    { step: 2, title: 'Content Creation Tools', duration: '3-6 months', description: 'Master video, writing, and design tools' },
                    { step: 3, title: 'Platform Expertise', duration: '3-6 months', description: 'Learn specific platform algorithms and best practices' },
                    { step: 4, title: 'Analytics & Growth', duration: '3-6 months', description: 'Learn to analyze performance and grow audience' }
                ],
                resources: [
                    { name: 'YouTube Creator Academy', url: 'https://creatoracademy.youtube.com', type: 'Learning Platform', description: 'YouTube content creation resources' },
                    { name: 'HubSpot Content Marketing', url: 'https://academy.hubspot.com/courses/content-marketing', type: 'Course', description: 'Free content marketing course' }
                ],
                milestones: [
                    { title: 'Learn content strategy', completed: false },
                    { title: 'Master content tools', completed: false },
                    { title: 'Create first 10 posts', completed: false },
                    { title: 'Grow to 1000 followers', completed: false },
                    { title: 'Monetize content', completed: false }
                ]
            },
            {
                id: 'game-designer',
                title: 'Game Designer',
                category: 'Creative',
                description: 'Design gameplay, rules, and storylines for video games. Create engaging player experiences and game mechanics.',
                salary: '$60,000 - $110,000',
                demand: 'High',
                growth: '16% (Much faster than average)',
                education: "Bachelor's degree in Game Design or related field",
                skills: ['Game Mechanics', 'Level Design', 'Storytelling', 'Prototyping', 'Game Engines', 'Player Psychology'],
                icon: 'fa-gamepad',
                path: [
                    { step: 1, title: 'Game Design Fundamentals', duration: '6-12 months', description: 'Learn game mechanics, storytelling, and player psychology' },
                    { step: 2, title: 'Game Engines', duration: '6-12 months', description: 'Master Unity or Unreal Engine basics' },
                    { step: 3, title: 'Prototyping', duration: '6-12 months', description: 'Learn to create game prototypes and test gameplay' },
                    { step: 4, title: 'Portfolio Development', duration: '6-12 months', description: 'Build portfolio of game design projects' }
                ],
                resources: [
                    { name: 'Unity Learn', url: 'https://learn.unity.com', type: 'Learning Platform', description: 'Free Unity game development courses' },
                    { name: 'Unreal Engine Learning', url: 'https://unrealengine.com/learn', type: 'Learning Platform', description: 'Unreal Engine tutorials and resources' }
                ],
                milestones: [
                    { title: 'Learn game design fundamentals', completed: false },
                    { title: 'Master game engine', completed: false },
                    { title: 'Create game prototype', completed: false },
                    { title: 'Build game design portfolio', completed: false },
                    { title: 'Get game design job', completed: false }
                ]
            },
            {
                id: 'interior-designer',
                title: 'Interior Designer',
                category: 'Creative',
                description: 'Plan and design interior spaces for homes, offices, and commercial establishments. Create functional and aesthetically pleasing environments.',
                salary: '$50,000 - $85,000',
                demand: 'Moderate',
                growth: '5% (As fast as average)',
                education: "Bachelor's degree in Interior Design",
                skills: ['Space Planning', 'Color Schemes', 'Materials Selection', '3D Modeling', 'Building Codes', 'Client Presentation'],
                icon: 'fa-couch',
                path: [
                    { step: 1, title: 'Design Fundamentals', duration: '1-2 years', description: 'Learn design principles, color theory, and space planning' },
                    { step: 2, title: 'Technical Skills', duration: '1-2 years', description: 'Master AutoCAD, SketchUp, and 3D modeling software' },
                    { step: 3, title: 'Materials & Building', duration: '1 year', description: 'Learn about materials, finishes, and building systems' },
                    { step: 4, title: 'Licensure', duration: '1-2 years', description: 'Complete required experience and pass NCIDQ exam' }
                ],
                resources: [
                    { name: 'American Society of Interior Designers', url: 'https://asid.org', type: 'Professional Organization', description: 'Interior design professional resources' },
                    { name: 'SketchUp', url: 'https://sketchup.com', type: 'Software', description: '3D modeling software for design' }
                ],
                milestones: [
                    { title: 'Learn design fundamentals', completed: false },
                    { title: 'Master design software', completed: false },
                    { title: 'Complete design projects', completed: false },
                    { title: 'Build portfolio', completed: false },
                    { title: 'Get NCIDQ certification', completed: false }
                ]
            },
            {
                id: 'music-producer',
                title: 'Music Producer',
                category: 'Creative',
                description: 'Oversee and manage the recording and production of music. Work with artists to develop their sound and create final recordings.',
                salary: '$40,000 - $100,000',
                demand: 'Moderate',
                growth: '6% (As fast as average)',
                education: 'Varied (Music production training helpful)',
                skills: ['Audio Engineering', 'Mixing', 'Mastering', 'Music Theory', 'DAW Software', 'Artist Collaboration'],
                icon: 'fa-music',
                path: [
                    { step: 1, title: 'Music Fundamentals', duration: '6-12 months', description: 'Learn music theory, composition, and arrangement' },
                    { step: 2, title: 'Audio Engineering', duration: '6-12 months', description: 'Master recording techniques and equipment' },
                    { step: 3, title: 'DAW Software', duration: '6-12 months', description: 'Become proficient in Pro Tools, Logic Pro, or Ableton Live' },
                    { step: 4, title: 'Mixing & Mastering', duration: '6-12 months', description: 'Learn professional mixing and mastering techniques' }
                ],
                resources: [
                    { name: 'Ableton', url: 'https://ableton.com', type: 'Software', description: 'Music production software and learning resources' },
                    { name: 'Berklee Online', url: 'https://online.berklee.edu', type: 'Learning Platform', description: 'Online music production courses' }
                ],
                milestones: [
                    { title: 'Learn music theory', completed: false },
                    { title: 'Master audio engineering', completed: false },
                    { title: 'Learn DAW software', completed: false },
                    { title: 'Produce first track', completed: false },
                    { title: 'Release music', completed: false }
                ]
            },
            {
                id: 'creative-director',
                title: 'Creative Director',
                category: 'Creative',
                description: 'Lead creative teams and oversee the visual and conceptual direction of projects. Ensure brand consistency and creative excellence.',
                salary: '$80,000 - $150,000',
                demand: 'Moderate',
                growth: '4% (Slower than average)',
                education: "Bachelor's degree in Design, Advertising, or related field",
                skills: ['Creative Leadership', 'Art Direction', 'Brand Strategy', 'Team Management', 'Client Relations', 'Concept Development'],
                icon: 'fa-palette',
                path: [
                    { step: 1, title: 'Creative Foundation', duration: '4-6 years', description: 'Gain experience as designer, copywriter, or art director' },
                    { step: 2, title: 'Leadership Skills', duration: '2-3 years', description: 'Develop team management and leadership abilities' },
                    { step: 3, title: 'Strategic Thinking', duration: '2-3 years', description: 'Learn brand strategy and business objectives' },
                    { step: 4, title: 'Portfolio Building', duration: 'Ongoing', description: 'Build strong portfolio of creative leadership work' }
                ],
                resources: [
                    { name: 'The One Club for Creativity', url: 'https://oneclub.org', type: 'Professional Organization', description: 'Creative professional organization' },
                    { name: 'Communication Arts', url: 'https://commarts.com', type: 'Resource', description: 'Creative industry publication' }
                ],
                milestones: [
                    { title: 'Build creative skills', completed: false },
                    { title: 'Lead creative projects', completed: false },
                    { title: 'Manage creative team', completed: false },
                    { title: 'Develop brand strategy', completed: false },
                    { title: 'Build leadership portfolio', completed: false }
                ]
            },

            // ===== EDUCATION CAREERS =====
            {
                id: 'teacher',
                title: 'Teacher',
                category: 'Education',
                description: 'Educate students in various subjects and grade levels. Develop lesson plans, assess student progress, and create engaging learning environments.',
                salary: '$45,000 - $75,000',
                demand: 'High',
                growth: '4% (As fast as average)',
                education: "Bachelor's degree + teaching certification",
                skills: ['Lesson Planning', 'Classroom Management', 'Student Assessment', 'Differentiated Instruction', 'Communication', 'Patience'],
                icon: 'fa-chalkboard-teacher',
                path: [
                    { step: 1, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Complete degree in education or subject area' },
                    { step: 2, title: 'Teacher Preparation Program', duration: '1-2 years', description: 'Complete teacher education program' },
                    { step: 3, title: 'Student Teaching', duration: '1 semester', description: 'Complete supervised teaching experience' },
                    { step: 4, title: 'Certification', duration: '3-6 months', description: 'Pass state certification exams' }
                ],
                resources: [
                    { name: 'Teach.org', url: 'https://teach.org', type: 'Resource', description: 'Teaching career information and resources' },
                    { name: 'Edutopia', url: 'https://edutopia.org', type: 'Resource', description: 'Teaching strategies and classroom innovations' }
                ],
                milestones: [
                    { title: 'Complete bachelor\'s degree', completed: false },
                    { title: 'Complete teacher preparation', completed: false },
                    { title: 'Complete student teaching', completed: false },
                    { title: 'Pass certification exams', completed: false },
                    { title: 'Get first teaching job', completed: false }
                ]
            },
            {
                id: 'school-counselor',
                title: 'School Counselor',
                category: 'Education',
                description: 'Help students develop academic and social skills. Provide guidance on educational, career, and personal development.',
                salary: '$55,000 - $85,000',
                demand: 'High',
                growth: '10% (Faster than average)',
                education: "Master's degree in School Counseling",
                skills: ['Counseling Techniques', 'Academic Advising', 'Career Guidance', 'Crisis Intervention', 'Communication', 'Empathy'],
                icon: 'fa-comments',
                path: [
                    { step: 1, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Complete degree in psychology, education, or related field' },
                    { step: 2, title: 'Master\'s Program', duration: '2-3 years', description: 'Complete school counseling graduate program' },
                    { step: 3, title: 'Internship', duration: '1 year', description: 'Complete supervised counseling internship' },
                    { step: 4, title: 'Licensure', duration: '3-6 months', description: 'Pass state licensure exams and requirements' }
                ],
                resources: [
                    { name: 'American School Counselor Association', url: 'https://schoolcounselor.org', type: 'Professional Organization', description: 'School counseling resources' },
                    { name: 'Counselor Education', url: 'https://counseloreducation.com', type: 'Resource', description: 'Counseling education information' }
                ],
                milestones: [
                    { title: 'Complete bachelor\'s degree', completed: false },
                    { title: 'Complete master\'s program', completed: false },
                    { title: 'Complete counseling internship', completed: false },
                    { title: 'Pass licensure exams', completed: false },
                    { title: 'Get school counselor position', completed: false }
                ]
            },
            {
                id: 'instructional-designer',
                title: 'Instructional Designer',
                category: 'Education',
                description: 'Design and develop educational materials and experiences. Create effective learning solutions using technology and pedagogy.',
                salary: '$60,000 - $95,000',
                demand: 'High',
                growth: '10% (Faster than average)',
                education: "Master's degree in Instructional Design or related field",
                skills: ['Learning Theory', 'Course Development', 'eLearning Tools', 'Assessment Design', 'Multimedia Production', 'Project Management'],
                icon: 'fa-laptop-code',
                path: [
                    { step: 1, title: 'Education Foundation', duration: '4 years', description: 'Complete degree in education, psychology, or related field' },
                    { step: 2, title: 'Instructional Design Theory', duration: '1-2 years', description: 'Learn learning theories and instructional design models' },
                    { step: 3, title: 'Technology Skills', duration: '6-12 months', description: 'Master eLearning authoring tools and LMS platforms' },
                    { step: 4, title: 'Portfolio Development', duration: '6-12 months', description: 'Build portfolio of instructional design projects' }
                ],
                resources: [
                    { name: 'ATD', url: 'https://td.org', type: 'Professional Organization', description: 'Association for Talent Development' },
                    { name: 'Articulate 360', url: 'https://articulate.com', type: 'Software', description: 'eLearning authoring tools' }
                ],
                milestones: [
                    { title: 'Complete education foundation', completed: false },
                    { title: 'Learn instructional design', completed: false },
                    { title: 'Master eLearning tools', completed: false },
                    { title: 'Build ID portfolio', completed: false },
                    { title: 'Get instructional designer job', completed: false }
                ]
            },
            {
                id: 'librarian',
                title: 'Librarian',
                category: 'Education',
                description: 'Manage library collections and services. Help patrons find information, conduct research, and access educational resources.',
                salary: '$50,000 - $80,000',
                demand: 'Moderate',
                growth: '9% (As fast as average)',
                education: "Master's degree in Library Science",
                skills: ['Information Organization', 'Research Assistance', 'Collection Development', 'Technology Integration', 'Community Outreach', 'Cataloging'],
                icon: 'fa-book',
                path: [
                    { step: 1, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Complete degree in any field (humanities preferred)' },
                    { step: 2, title: 'MLIS Program', duration: '1-2 years', description: 'Complete Master of Library and Information Science program' },
                    { step: 3, title: 'Library Experience', duration: '1-2 years', description: 'Gain experience through internships or paraprofessional work' },
                    { step: 4, title: 'Specialization', duration: '1-2 years', description: 'Focus on academic, public, school, or special librarianship' }
                ],
                resources: [
                    { name: 'American Library Association', url: 'https://ala.org', type: 'Professional Organization', description: 'Library professional association' },
                    { name: 'Library Journal', url: 'https://libraryjournal.com', type: 'Resource', description: 'Library industry news and resources' }
                ],
                milestones: [
                    { title: 'Complete bachelor\'s degree', completed: false },
                    { title: 'Complete MLIS program', completed: false },
                    { title: 'Gain library experience', completed: false },
                    { title: 'Get librarian position', completed: false },
                    { title: 'Develop specialty', completed: false }
                ]
            },
            {
                id: 'educational-technologist',
                title: 'Educational Technologist',
                category: 'Education',
                description: 'Integrate technology into educational settings. Support teachers and students in using technology effectively for learning.',
                salary: '$55,000 - $90,000',
                demand: 'High',
                growth: '11% (Faster than average)',
                education: "Master's degree in Educational Technology or related field",
                skills: ['EdTech Tools', 'Technology Integration', 'Teacher Training', 'Digital Literacy', 'Learning Management Systems', 'Technical Support'],
                icon: 'fa-tablet-alt',
                path: [
                    { step: 1, title: 'Education Background', duration: '4 years', description: 'Complete degree in education or related field' },
                    { step: 2, title: 'Technology Skills', duration: '1-2 years', description: 'Master educational technologies and platforms' },
                    { step: 3, title: 'Integration Strategies', duration: '1 year', description: 'Learn effective technology integration methods' },
                    { step: 4, title: 'Leadership Development', duration: '1-2 years', description: 'Develop skills in training and supporting educators' }
                ],
                resources: [
                    { name: 'International Society for Technology in Education', url: 'https://iste.org', type: 'Professional Organization', description: 'EdTech professional association' },
                    { name: 'EdSurge', url: 'https://edsurge.com', type: 'Resource', description: 'EdTech news and product reviews' }
                ],
                milestones: [
                    { title: 'Complete education degree', completed: false },
                    { title: 'Master edtech tools', completed: false },
                    { title: 'Learn integration strategies', completed: false },
                    { title: 'Train educators', completed: false },
                    { title: 'Get edtech specialist job', completed: false }
                ]
            },
            {
                id: 'college-professor',
                title: 'College Professor',
                category: 'Education',
                description: 'Teach courses at the college level, conduct research, and publish scholarly work. Mentor students and contribute to academic communities.',
                salary: '$70,000 - $150,000',
                demand: 'Moderate',
                growth: '9% (As fast as average)',
                education: "Doctoral degree in specialized field",
                skills: ['Subject Expertise', 'Research Methodology', 'Academic Writing', 'Course Design', 'Student Mentoring', 'Public Speaking'],
                icon: 'fa-graduation-cap',
                path: [
                    { step: 1, title: 'Bachelor\'s Degree', duration: '4 years', description: 'Complete undergraduate degree in chosen field' },
                    { step: 2, title: 'Master\'s Degree', duration: '2-3 years', description: 'Complete Master\'s degree in specialized area' },
                    { step: 3, title: 'Doctoral Program', duration: '4-6 years', description: 'Complete PhD program and dissertation' },
                    { step: 4, title: 'Academic Career', duration: '2-4 years', description: 'Complete postdoctoral work or begin as assistant professor' }
                ],
                resources: [
                    { name: 'Chronicle of Higher Education', url: 'https://chronicle.com', type: 'Resource', description: 'Higher education news and jobs' },
                    { name: 'Academic Jobs Wiki', url: 'https://academicjobs.wikia.org', type: 'Resource', description: 'Academic job market information' }
                ],
                milestones: [
                    { title: 'Complete bachelor\'s degree', completed: false },
                    { title: 'Complete master\'s degree', completed: false },
                    { title: 'Complete PhD program', completed: false },
                    { title: 'Publish research', completed: false },
                    { title: 'Get tenure-track position', completed: false }
                ]
            },
            {
                id: 'special-education-teacher',
                title: 'Special Education Teacher',
                category: 'Education',
                description: 'Work with students who have disabilities. Develop individualized education plans and adapt teaching methods to meet diverse needs.',
                salary: '$50,000 - $80,000',
                demand: 'High',
                growth: '8% (As fast as average)',
                education: "Bachelor's degree + special education certification",
                skills: ['Individualized Instruction', 'Behavior Management', 'Assessment', 'Collaboration', 'Adaptive Technology', 'Patience'],
                icon: 'fa-heart',
                path: [
                    { step: 1, title: 'Education Degree', duration: '4 years', description: 'Complete degree in special education or related field' },
                    { step: 2, title: 'Specialized Training', duration: '1-2 years', description: 'Complete special education certification program' },
                    { step: 3, title: 'Field Experience', duration: '1 semester', description: 'Complete supervised teaching in special education setting' },
                    { step: 4, title: 'Certification', duration: '3-6 months', description: 'Pass state special education certification exams' }
                ],
                resources: [
                    { name: 'Council for Exceptional Children', url: 'https://cec.sped.org', type: 'Professional Organization', description: 'Special education professional association' },
                    { name: 'Understood', url: 'https://understood.org', type: 'Resource', description: 'Resources for learning and attention issues' }
                ],
                milestones: [
                    { title: 'Complete education degree', completed: false },
                    { title: 'Complete special education training', completed: false },
                    { title: 'Complete field experience', completed: false },
                    { title: 'Pass certification exams', completed: false },
                    { title: 'Get special education position', completed: false }
                ]
            },
            {
                id: 'tutor',
                title: 'Tutor',
                category: 'Education',
                description: 'Provide one-on-one or small group instruction to help students improve academic performance. Specialize in specific subjects or test preparation.',
                salary: '$30,000 - $70,000',
                demand: 'High',
                growth: '12% (Faster than average)',
                education: 'Varied (Subject expertise required)',
                skills: ['Subject Knowledge', 'Teaching Methods', 'Patience', 'Communication', 'Assessment', 'Lesson Planning'],
                icon: 'fa-user-graduate',
                path: [
                    { step: 1, title: 'Subject Mastery', duration: '2-4 years', description: 'Develop expertise in subject area(s) to tutor' },
                    { step: 2, title: 'Teaching Skills', duration: '3-6 months', description: 'Learn effective tutoring techniques and strategies' },
                    { step: 3, title: 'Business Setup', duration: '1-3 months', description: 'Set up tutoring business or join tutoring company' },
                    { step: 4, title: 'Client Development', duration: '3-6 months', description: 'Build client base and develop teaching materials' }
                ],
                resources: [
                    { name: 'Tutor.com', url: 'https://tutor.com', type: 'Platform', description: 'Online tutoring platform and resources' },
                    { name: 'Khan Academy', url: 'https://khanacademy.org', type: 'Resource', description: 'Free educational resources for tutors' }
                ],
                milestones: [
                    { title: 'Master subject area', completed: false },
                    { title: 'Learn tutoring techniques', completed: false },
                    { title: 'Set up tutoring business', completed: false },
                    { title: 'Get first 5 students', completed: false },
                    { title: 'Build referral network', completed: false }
                ]
            },
            {
                id: 'education-administrator',
                title: 'Education Administrator',
                category: 'Education',
                description: 'Manage schools, colleges, or educational programs. Oversee operations, budgets, staff, and educational quality.',
                salary: '$80,000 - $130,000',
                demand: 'Moderate',
                growth: '8% (As fast as average)',
                education: "Master's or Doctoral degree in Educational Leadership",
                skills: ['Leadership', 'Budget Management', 'Policy Development', 'Staff Supervision', 'Strategic Planning', 'Community Relations'],
                icon: 'fa-user-tie',
                path: [
                    { step: 1, title: 'Teaching Experience', duration: '3-5 years', description: 'Gain classroom teaching experience' },
                    { step: 2, title: 'Advanced Degree', duration: '2-3 years', description: 'Complete Master\'s or Doctoral degree in educational leadership' },
                    { step: 3, title: 'Administrative Experience', duration: '2-3 years', description: 'Gain experience in administrative roles' },
                    { step: 4, title: 'Certification', duration: '1-2 years', description: 'Obtain administrative certification if required' }
                ],
                resources: [
                    { name: 'National Association of Secondary School Principals', url: 'https://nassp.org', type: 'Professional Organization', description: 'School leadership resources' },
                    { name: 'Education Week', url: 'https://edweek.org', type: 'Resource', description: 'Education news and leadership resources' }
                ],
                milestones: [
                    { title: 'Gain teaching experience', completed: false },
                    { title: 'Complete advanced degree', completed: false },
                    { title: 'Gain administrative experience', completed: false },
                    { title: 'Get administrative certification', completed: false },
                    { title: 'Become school administrator', completed: false }
                ]
            },
            {
                id: 'corporate-trainer',
                title: 'Corporate Trainer',
                category: 'Education',
                description: 'Develop and deliver training programs for employees in business settings. Help improve skills, knowledge, and job performance.',
                salary: '$55,000 - $95,000',
                demand: 'High',
                growth: '11% (Faster than average)',
                education: "Bachelor's degree in HR, Education, or related field",
                skills: ['Training Design', 'Facilitation', 'Needs Assessment', 'Instructional Technology', 'Evaluation', 'Communication'],
                icon: 'fa-chalkboard',
                path: [
                    { step: 1, title: 'Education Foundation', duration: '4 years', description: 'Complete degree in education, HR, or related field' },
                    { step: 2, title: 'Training Skills', duration: '1-2 years', description: 'Learn adult learning principles and training methodologies' },
                    { step: 3, title: 'Industry Knowledge', duration: '2-3 years', description: 'Gain experience in specific industry or business function' },
                    { step: 4, title: 'Certification', duration: '6-12 months', description: 'Obtain training certification (CPLP, CTDP)' }
                ],
                resources: [
                    { name: 'ATD Certification', url: 'https://td.org/certification', type: 'Certification', description: 'Training and development certification' },
                    { name: 'Training Industry', url: 'https://trainingindustry.com', type: 'Resource', description: 'Corporate training resources and research' }
                ],
                milestones: [
                    { title: 'Complete education degree', completed: false },
                    { title: 'Learn training skills', completed: false },
                    { title: 'Gain industry experience', completed: false },
                    { title: 'Get training certification', completed: false },
                    { title: 'Become corporate trainer', completed: false }
                ]
            }
        ];
    },
    
    // Setup event listeners
    setupEventListeners: function() {
        // Filter buttons
        this.elements.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleFilterClick(e.target);
            });
        });
        
        // Search functionality
        if (this.elements.searchBtn) {
            this.elements.searchBtn.addEventListener('click', () => {
                this.handleSearch();
            });
        }
        
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }
        
        // Clear search
        if (this.elements.clearSearchBtn) {
            this.elements.clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }
        
        // Modal close
        if (this.elements.closeModalBtn) {
            this.elements.closeModalBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        // Save career from modal
        if (this.elements.saveCareerModalBtn) {
            this.elements.saveCareerModalBtn.addEventListener('click', () => {
                this.saveCurrentCareer();
            });
        }
        
        // Close modal on background click
        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) {
                    this.closeModal();
                }
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isModalOpen) {
                this.closeModal();
            }
        });
    },
    
    // Update UI based on authentication status
    updateAuthUI: function() {
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const usernameSpan = document.getElementById('username');
        
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        
        if (userId && userEmail) {
            // User is logged in
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
            if (usernameSpan) {
                usernameSpan.textContent = userEmail.split('@')[0];
            }
        } else {
            // User is not logged in
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    },
    
    // Handle filter click
    handleFilterClick: function(button) {
        // Update active button
        this.elements.filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Update filter
        this.config.currentFilter = button.getAttribute('data-filter');
        this.config.currentPage = 1;
        
        // Apply filter and display
        this.applyFilters();
        this.displayCareers();
    },
    
    // Handle search
    handleSearch: function() {
        this.config.currentSearch = this.elements.searchInput.value.trim().toLowerCase();
        this.config.currentPage = 1;
        
        this.applyFilters();
        this.displayCareers();
    },
    
    // Clear search
    clearSearch: function() {
        this.elements.searchInput.value = '';
        this.config.currentSearch = '';
        
        this.applyFilters();
        this.displayCareers();
        
        // Hide empty state
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 'none';
        }
    },
    
    // Apply filters and search
    applyFilters: function() {
        let filtered = [...this.state.allCareers];
        
        // Apply category filter
        if (this.config.currentFilter !== 'all') {
            filtered = filtered.filter(career => 
                career.category.toLowerCase() === this.config.currentFilter.toLowerCase()
            );
        }
        
        // Apply search filter
        if (this.config.currentSearch) {
            filtered = filtered.filter(career => 
                career.title.toLowerCase().includes(this.config.currentSearch) ||
                career.description.toLowerCase().includes(this.config.currentSearch) ||
                career.skills.some(skill => skill.toLowerCase().includes(this.config.currentSearch)) ||
                career.category.toLowerCase().includes(this.config.currentSearch)
            );
        }
        
        this.state.filteredCareers = filtered;
        
        // Show/hide empty state
        if (this.elements.emptyState) {
            if (filtered.length === 0) {
                this.elements.emptyState.style.display = 'block';
            } else {
                this.elements.emptyState.style.display = 'none';
            }
        }
    },
    
    // Display careers in grid
    async displayCareers() {
        const container = this.elements.careersGrid;
        if (!container) return;
        
        // Clear current content
        container.innerHTML = '';
        
        // Check if we have careers to display
        if (this.state.filteredCareers.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-state';
            emptyMessage.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No Careers Found</h3>
                <p>No careers match your current filters. Try a different search or filter.</p>
                <button id="reset-filters" class="btn btn-primary">
                    <i class="fas fa-redo"></i> Reset Filters
                </button>
            `;
            container.appendChild(emptyMessage);
            
            // Add event listener to reset button
            document.getElementById('reset-filters')?.addEventListener('click', () => {
                this.resetFilters();
            });
            
            return;
        }
        
        // Calculate pagination
        const startIndex = (this.config.currentPage - 1) * this.config.careersPerPage;
        const endIndex = startIndex + this.config.careersPerPage;
        const careersToShow = this.state.filteredCareers.slice(startIndex, endIndex);
        
        // Translate careers if needed before displaying
        let displayCareers = careersToShow;
        if (window.TranslationService && TranslationService.currentLanguage !== 'en') {
            console.log(`Translating ${careersToShow.length} careers for display...`);
            displayCareers = await TranslationService.translateCareers(careersToShow);
        }
        
        // Create career cards
        displayCareers.forEach(career => {
            const card = this.createCareerCard(career);
            container.appendChild(card);
        });
        
        // Add pagination if needed
        if (this.state.filteredCareers.length > this.config.careersPerPage) {
            this.addPagination();
        }
    },
    
    // Create career card element
    createCareerCard: function(career) {
        const card = document.createElement('div');
        card.className = 'career-card';
        card.setAttribute('data-career-id', career.id);
        
        // Format salary for display
        const salary = career.salary || '$50,000 - $100,000';
        
        card.innerHTML = `
            <div class="career-card-header">
                ${career.featured ? '<span class="featured-badge">Featured</span>' : ''}
                <h3>${career.title}</h3>
                <span class="career-category">${career.category}</span>
            </div>
            <div class="career-card-body">
                <p class="career-description">${career.description}</p>
                
                <div class="career-details">
                    <div class="detail">
                        <i class="fas fa-money-bill-wave"></i>
                        <div class="detail-value">${salary}</div>
                        <div class="detail-label">Salary</div>
                    </div>
                    <div class="detail">
                        <i class="fas fa-chart-line"></i>
                        <div class="detail-value">${career.demand || 'High'}</div>
                        <div class="detail-label">Demand</div>
                    </div>
                    <div class="detail">
                        <i class="fas fa-graduation-cap"></i>
                        <div class="detail-value">${career.education ? 'Degree' : 'Varies'}</div>
                        <div class="detail-label">Education</div>
                    </div>
                </div>
                
                <div class="career-skills">
                    ${career.skills.slice(0, 4).map(skill => 
                        `<span class="skill-tag">${skill}</span>`
                    ).join('')}
                    ${career.skills.length > 4 ? 
                        `<span class="skill-tag">+${career.skills.length - 4} more</span>` : 
                        ''
                    }
                </div>
            </div>
            <div class="career-card-footer">
                <button class="btn btn-outline btn-block view-details-btn" data-career-id="${career.id}">
                    <i class="fas fa-info-circle"></i> View Details
                </button>
                <button class="btn btn-primary btn-block save-career-btn" data-career-id="${career.id}">
                    <i class="fas fa-bookmark"></i> Save Path
                </button>
            </div>
        `;
        
        // Add event listeners
        this.addCardEventListeners(card, career);
        
        return card;
    },
    
    // Add event listeners to career card
    addCardEventListeners: function(card, career) {
        // View details button
        const viewBtn = card.querySelector('.view-details-btn');
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showCareerDetails(career.id);
        });
        
        // Save career button
        const saveBtn = card.querySelector('.save-career-btn');
        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.saveCareer(career.id);
        });
        
        // Also make the entire card clickable (except buttons)
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on buttons
            if (!e.target.closest('button')) {
                this.showCareerDetails(career.id);
            }
        });
    },
    
    // Show career details in modal
    async showCareerDetails(careerId) {
        const career = this.state.allCareers.find(c => c.id === careerId);
        if (!career) return;
        
        this.state.currentCareer = career;
        
        // Translate career details if needed
        let displayCareer = career;
        if (window.TranslationService && TranslationService.currentLanguage !== 'en') {
            displayCareer = await TranslationService.translateCareer(career);
        }
        
        // Update modal title
        if (this.elements.modalTitle) {
            this.elements.modalTitle.textContent = `${displayCareer.title} Career Path`;
        }
        
        // Build modal content
        let modalContent = `
            <div class="career-overview">
                <h3>${displayCareer.title}</h3>
                <p>${displayCareer.description}</p>
                
                <div class="career-stats">
                    <div class="stat">
                        <strong>Category:</strong> ${displayCareer.category}
                    </div>
                    <div class="stat">
                        <strong>Salary Range:</strong> ${displayCareer.salary || '$50,000 - $100,000'}
                    </div>
                    <div class="stat">
                        <strong>Job Demand:</strong> ${displayCareer.demand || 'High'}
                    </div>
                    <div class="stat">
                        <strong>Education Required:</strong> ${displayCareer.education || "Bachelor's degree"}
                    </div>
                </div>
                
                <div class="skills-section">
                    <h4>Key Skills:</h4>
                    <div class="skills-list">
                        ${displayCareer.skills.map(skill => 
                            `<span class="skill-tag">${skill}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Add learning path if available
        if (displayCareer.path && displayCareer.path.length > 0) {
            modalContent += `
                <div class="path-section">
                    <h3><i class="fas fa-road"></i> Learning Path</h3>
                    <div class="path-timeline">
                        ${displayCareer.path.map((step, index) => `
                            <div class="path-step">
                                <div class="step-number">${index + 1}</div>
                                <div class="step-content">
                                    <h4>${step.title}</h4>
                                    <p>${step.description}</p>
                                    <p class="step-duration">
                                        <i class="fas fa-clock"></i> ${step.duration}
                                    </p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Add milestones if available
        if (displayCareer.milestones && displayCareer.milestones.length > 0) {
            modalContent += `
                <div class="milestones-section">
                    <h3><i class="fas fa-tasks"></i> Key Milestones</h3>
                    <ul class="milestones-list">
                        ${displayCareer.milestones.map(milestone => {
                            const title = milestone.title || milestone;
                            return `<li><i class="far fa-circle"></i> ${title}</li>`;
                        }).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Add resources if available
        if (displayCareer.resources && displayCareer.resources.length > 0) {
            modalContent += `
                <div class="resources-section">
                    <h3><i class="fas fa-link"></i> Learning Resources</h3>
                    <div class="resources-grid">
                        ${displayCareer.resources.map(resource => `
                            <a href="${resource.url}" target="_blank" class="resource-card">
                                <div class="resource-icon">
                                    <i class="fas fa-external-link-alt"></i>
                                </div>
                                <div class="resource-info">
                                    <h5>${resource.name}</h5>
                                    <p>${resource.description}</p>
                                    <small>${resource.type}</small>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Update modal body
        if (this.elements.modalBody) {
            this.elements.modalBody.innerHTML = modalContent;
        }
        
        // Store current career ID for saving
        if (this.elements.saveCareerModalBtn) {
            this.elements.saveCareerModalBtn.setAttribute('data-career-id', careerId);
        }
        
        // Show modal
        this.openModal();
    },
    
    // Open modal
    openModal: function() {
        if (this.elements.modal) {
            this.elements.modal.classList.add('active');
            this.state.isModalOpen = true;
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    },
    
    // Close modal
    closeModal: function() {
        if (this.elements.modal) {
            this.elements.modal.classList.remove('active');
            this.state.isModalOpen = false;
            document.body.style.overflow = ''; // Restore scrolling
            this.state.currentCareer = null;
        }
    },
    
    // Save career from modal
    saveCurrentCareer: function() {
        const careerId = this.elements.saveCareerModalBtn.getAttribute('data-career-id');
        if (careerId) {
            this.saveCareer(careerId);
        }
    },
    
    // ================ FIXED SAVE CAREER METHOD ================
    async saveCareer(careerId) {
        // Check if user is logged in
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('idToken');
        const userEmail = localStorage.getItem('userEmail');
        
        if (!userId || !token) {
            this.showNotification('Please login to save career paths!', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        const career = this.state.allCareers.find(c => c.id === careerId);
        if (!career) {
            this.showNotification('Career not found!', 'error');
            return;
        }
        
        // Find the save button (could be in modal or card)
        const modalSaveBtn = this.elements.saveCareerModalBtn;
        const cardSaveBtn = document.querySelector(`.save-career-btn[data-career-id="${careerId}"]`);
        const saveButton = modalSaveBtn || cardSaveBtn;
        
        if (!saveButton) return;
        
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveButton.disabled = true;
        
        try {
            // Check if already saved in localStorage (quick check)
            const savedCareers = JSON.parse(localStorage.getItem('savedCareers') || '{}');
            const userSaved = savedCareers[userId] || [];
            
            const alreadySaved = userSaved.some(saved => saved.id === careerId || saved.careerId === careerId);
            
            // Prepare career data for DynamoDB - CRITICAL: Must match Lambda expected format
            const careerData = {
                // Primary fields - these are REQUIRED by DynamoDB
                career: career.title,
                careerTitle: career.title,
                careerId: career.id,
                
                // Source and type - CRITICAL for filtering in Journey page
                source: "career_explorer",
                type: "SAVED_CAREER",
                
                // Career details
                category: career.category,
                description: career.description,
                salary: career.salary,
                demand: career.demand,
                education: career.education,
                skills: career.skills || [],
                
                // Learning path
                path: career.path || [],
                resources: career.resources || [],
                milestones: career.milestones || [],
                
                // Timestamps
                savedAt: new Date().toISOString(),
                timestamp: new Date().toISOString()
            };
            
            console.log('🚀 Saving career to AWS:', careerData);
            
            // Save to AWS using apiService
            let awsSaved = false;
            if (window.apiService) {
                try {
                    // Call the saveCareerPath method
                    const response = await window.apiService.saveCareerPath(careerData);
                    console.log('✅ AWS Response:', response);
                    
                    if (response && (response.message || response.journeyId)) {
                        awsSaved = true;
                    }
                } catch (awsError) {
                    console.error('❌ AWS Save Error:', awsError);
                    // Don't throw - we'll still save to localStorage
                }
            } else {
                console.error('❌ API Service not available');
            }
            
            // Always save to localStorage as backup (so it appears immediately)
            if (!alreadySaved) {
                userSaved.push({
                    ...careerData,
                    id: career.id,
                    savedAt: new Date().toISOString()
                });
                savedCareers[userId] = userSaved;
                localStorage.setItem('savedCareers', JSON.stringify(savedCareers));
            }
            
            // Show appropriate message
            if (awsSaved) {
                this.showNotification(`✅ ${career.title} saved to your journey!`, 'success');
            } else if (window.apiService) {
                this.showNotification(`⚠️ ${career.title} saved locally (AWS unavailable)`, 'warning');
            } else {
                this.showNotification(`ℹ️ ${career.title} saved locally`, 'info');
            }
            
            // Update button to show success
            saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
            saveButton.classList.add('saved');
            
            setTimeout(() => {
                saveButton.innerHTML = originalText;
                saveButton.classList.remove('saved');
                saveButton.disabled = false;
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error saving career:', error);
            this.showNotification('Failed to save career. Please try again.', 'error');
            
            // Reset button
            saveButton.innerHTML = originalText;
            saveButton.disabled = false;
        }
    },
    // ================ END OF FIXED METHOD ================
    
    // Show loading state
    showLoading: function(show) {
        if (this.elements.loadingElement) {
            this.elements.loadingElement.style.display = show ? 'block' : 'none';
        }
        this.state.isLoading = show;
    },
    
    // Reset all filters
    resetFilters: function() {
        // Reset filter buttons
        this.elements.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === 'all') {
                btn.classList.add('active');
            }
        });
        
        // Reset search
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
        }
        
        // Reset config
        this.config.currentFilter = 'all';
        this.config.currentSearch = '';
        this.config.currentPage = 1;
        
        // Apply filters and display
        this.applyFilters();
        this.displayCareers();
    },
    
    // Add pagination
    addPagination: function() {
        const totalPages = Math.ceil(this.state.filteredCareers.length / this.config.careersPerPage);
        
        if (totalPages <= 1) return;
        
        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        pagination.innerHTML = `
            <div class="pagination-controls">
                <button class="btn btn-outline prev-page" ${this.config.currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
                <span class="page-info">
                    Page ${this.config.currentPage} of ${totalPages}
                </span>
                <button class="btn btn-outline next-page" ${this.config.currentPage === totalPages ? 'disabled' : ''}>
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        this.elements.careersGrid.appendChild(pagination);
        
        // Add event listeners
        const prevBtn = pagination.querySelector('.prev-page');
        const nextBtn = pagination.querySelector('.next-page');
        
        prevBtn.addEventListener('click', () => {
            if (this.config.currentPage > 1) {
                this.config.currentPage--;
                this.displayCareers();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (this.config.currentPage < totalPages) {
                this.config.currentPage++;
                this.displayCareers();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        
        // Add pagination styles if not present
        this.addPaginationStyles();
    },
    
    // Add pagination styles
    addPaginationStyles: function() {
        // Only add once
        if (document.getElementById('pagination-styles')) return;
        
        const styles = `
            .pagination {
                grid-column: 1 / -1;
                text-align: center;
                margin-top: 3rem;
                padding-top: 2rem;
                border-top: 1px solid #eee;
            }
            
            .pagination-controls {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 2rem;
            }
            
            .page-info {
                font-weight: 600;
                color: var(--dark-color);
            }
            
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'pagination-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    },
    
    // Show notification
    showNotification: function(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Add notification styles if not present
        this.addNotificationStyles();
    },
    
    // Get notification icon
    getNotificationIcon: function(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    },
    
    // Add notification styles
    addNotificationStyles: function() {
        // Only add once
        if (document.getElementById('notification-styles')) return;
        
        const styles = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 400px;
                border-left: 4px solid #6b7280;
            }
            
            .notification-success {
                border-left-color: #10b981;
            }
            
            .notification-error {
                border-left-color: #ef4444;
            }
            
            .notification-warning {
                border-left-color: #f59e0b;
            }
            
            .notification-info {
                border-left-color: #3b82f6;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .btn.saved {
                background-color: #10b981 !important;
                color: white !important;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    ExplorerModule.init();
});

// Make available globally for debugging
window.ExplorerModule = ExplorerModule;

// Helper function for logout (if needed)
function logout() {
    if (window.apiService) {
        window.apiService.handleLogout();
    } else {
        // Clear localStorage and redirect
        localStorage.removeItem('idToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        window.location.href = 'index.html';
    }
}

// Helper function for language change (if needed)
function changeLanguage(lang) {
    if (window.TranslationService) {
        window.TranslationService.changeLanguage(lang);
    }
}