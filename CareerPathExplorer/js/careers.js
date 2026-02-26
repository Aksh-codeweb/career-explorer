// Career data - in production, this comes from DynamoDB
const careerData = {
    'software-developer': {
        id: 'software-developer',
        title: 'Software Developer',
        category: 'Technology',
        description: 'Design, develop, and maintain software applications.',
        salary: '$70,000 - $120,000',
        demand: 'High',
        path: [
            { step: 1, title: 'Learn Programming Basics', duration: '3 months' },
            { step: 2, title: 'Choose a Specialization', duration: '6 months' },
            { step: 3, title: 'Build Projects', duration: '6 months' },
            { step: 4, title: 'Apply for Internships', duration: '3 months' },
            { step: 5, title: 'Get Certified', duration: '2 months' },
            { step: 6, title: 'Apply for Jobs', duration: '3 months' }
        ],
        skills: ['JavaScript', 'Python', 'Git', 'Database Design', 'Problem Solving'],
        resources: [
            { name: 'freeCodeCamp', url: 'https://freecodecamp.org' },
            { name: 'Codecademy', url: 'https://codecademy.com' },
            { name: 'AWS Training', url: 'https://aws.amazon.com/training/' }
        ]
    },
    'data-analyst': {
        id: 'data-analyst',
        title: 'Data Analyst',
        category: 'Technology',
        description: 'Collect, process, and analyze data to help make business decisions.',
        salary: '$60,000 - $100,000',
        demand: 'High',
        path: [
            { step: 1, title: 'Learn Statistics', duration: '2 months' },
            { step: 2, title: 'Master Excel & SQL', duration: '3 months' },
            { step: 3, title: 'Learn Python/R', duration: '4 months' },
            { step: 4, title: 'Data Visualization', duration: '2 months' },
            { step: 5, title: 'Build Portfolio', duration: '3 months' },
            { step: 6, title: 'Get Certified', duration: '1 month' }
        ],
        skills: ['Excel', 'SQL', 'Python', 'Statistics', 'Data Visualization'],
        resources: [
            { name: 'Kaggle', url: 'https://kaggle.com' },
            { name: 'DataCamp', url: 'https://datacamp.com' },
            { name: 'Google Data Analytics Certificate', url: 'https://grow.google' }
        ]
    }
};

// Display career cards
function displayCareerCards(filter = 'all') {
    const container = document.getElementById('career-cards');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.values(careerData).forEach(career => {
        if (filter === 'all' || career.category.toLowerCase() === filter.toLowerCase()) {
            const card = createCareerCard(career);
            container.appendChild(card);
        }
    });
}

// Create career card HTML
function createCareerCard(career) {
    const card = document.createElement('div');
    card.className = 'career-card';
    card.innerHTML = `
        <div class="career-card-header">
            <h3>${career.title}</h3>
            <span class="career-category">${career.category}</span>
        </div>
        <div class="career-card-body">
            <p>${career.description}</p>
            <div class="career-details">
                <div class="detail">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>${career.salary}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-chart-line"></i>
                    <span>Demand: ${career.demand}</span>
                </div>
            </div>
            <div class="career-skills">
                ${career.skills.slice(0, 3).map(skill => 
                    `<span class="skill-tag">${skill}</span>`
                ).join('')}
                ${career.skills.length > 3 ? 
                    `<span class="skill-tag">+${career.skills.length - 3} more</span>` : ''
                }
            </div>
        </div>
        <div class="career-card-footer">
            <button class="btn btn-outline view-details" data-career-id="${career.id}">
                <i class="fas fa-info-circle"></i> View Details
            </button>
            <button class="btn btn-primary save-career" data-career-id="${career.id}">
                <i class="fas fa-bookmark"></i> Save Path
            </button>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.view-details').addEventListener('click', () => {
        showCareerDetails(career.id);
    });
    
    card.querySelector('.save-career').addEventListener('click', () => {
        saveCareerPath(career.id);
    });
    
    return card;
}

// Show career details modal
function showCareerDetails(careerId) {
    const career = careerData[careerId];
    if (!career) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${career.title} Career Path</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="path-timeline">
                    ${career.path.map(step => `
                        <div class="path-step">
                            <div class="step-number">Step ${step.step}</div>
                            <div class="step-content">
                                <h4>${step.title}</h4>
                                <p>Duration: ${step.duration}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="resources-section">
                    <h3>Learning Resources</h3>
                    <div class="resources-grid">
                        ${career.resources.map(resource => `
                            <a href="${resource.url}" target="_blank" class="resource-card">
                                <i class="fas fa-external-link-alt"></i>
                                <span>${resource.name}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary save-career-from-modal" data-career-id="${careerId}">
                    <i class="fas fa-bookmark"></i> Save This Career Path
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.querySelector('.save-career-from-modal').addEventListener('click', () => {
        saveCareerPath(careerId);
        modal.remove();
    });
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Save career path to backend
async function saveCareerPath(careerId) {
    if (!requireAuth()) return;
    
    const career = careerData[careerId];
    if (!career) {
        alert('Career not found!');
        return;
    }
    
    try {
        const userId = getCurrentUserId();
        const token = getAuthToken();
        
        const response = await fetch(API_ENDPOINTS.SAVE_CAREER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                userId: userId,
                careerData: career
            })
        });
        
        if (response.ok) {
            alert('Career path saved to your journey!');
        } else {
            throw new Error('Failed to save career path');
        }
    } catch (error) {
        console.error('Error saving career:', error);
        alert('Failed to save career path. Please try again.');
    }
}

// Initialize career explorer page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('explorer.html')) {
        displayCareerCards();
        
        // Add filter functionality
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                displayCareerCards(filter);
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
});