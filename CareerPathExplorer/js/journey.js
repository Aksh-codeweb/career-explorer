/*********************************
 * My Journey page (Saved Careers, Quiz Results, Progress)
 * Backend: API Gateway + Lambda
 * Storage:
 *  - Quiz results → DynamoDB (via Lambda)
 *  - Saved careers & progress → localStorage
 *********************************/

// ================ ADD THIS AT THE VERY TOP OF journey.js ================
(function() {
    console.log('🔧 Journey.js initializing...');
    
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

const Journey = {
  userId: null,
  savedCareers: [],
  quizResults: [],

  init() {
    console.log("Journey page initializing...");
    
    // Get userId from multiple sources
    this.userId = localStorage.getItem("userId") || this.getUserIdFromToken();

    if (!this.userId) {
      console.error("No user ID found, redirecting to login");
      window.location.href = "login.html";
      return;
    }

    console.log("User ID:", this.userId);
    
    this.bindTabs();
    this.loadSavedCareers();
    this.loadQuizResults();
    this.loadProgress();
    
    // Listen for language changes
    document.addEventListener('languageChanged', (e) => {
      console.log('Language changed to:', e.detail.language);
      this.refreshAllContent();
    });
  },

  /* ---------------- HELPER: Get userId from token ---------------- */
  getUserIdFromToken() {
    try {
      const token = localStorage.getItem("idToken");
      if (!token) return null;
      
      // Decode JWT payload
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      return payload.sub || payload.email || null;
    } catch (error) {
      console.error("Failed to parse token:", error);
      return null;
    }
  },

  /* ---------------- TABS ---------------- */
  bindTabs() {
    const tabs = document.querySelectorAll(".journey-tab");
    if (!tabs.length) {
      console.warn("No journey tabs found");
      return;
    }

    tabs.forEach(btn => {
      btn.addEventListener("click", () => {
        // Remove active class from all tabs and content
        document.querySelectorAll(".journey-tab").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".journey-content").forEach(c => c.classList.remove("active"));

        // Add active class to clicked tab
        btn.classList.add("active");
        
        // Show corresponding content
        const tabId = btn.dataset.tab + "-tab";
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
          tabContent.classList.add("active");
        } else {
          console.warn(`Tab content not found: ${tabId}`);
        }
      });
    });
    
    // Activate first tab by default
    if (tabs.length > 0) {
      tabs[0].click();
    }
  },

  /* ---------------- SAVED CAREERS ---------------- */
  async loadSavedCareers() {
    const list = document.getElementById("saved-careers-list");
    const empty = document.getElementById("no-careers");

    if (!list || !empty) {
      console.warn("Saved careers elements not found");
      return;
    }

    list.innerHTML = '<div class="loading-spinner">Loading saved careers...</div>';
    empty.style.display = "none";

    try {
      let careers = [];
      
      // Try to load from AWS first
      if (window.apiService) {
        try {
          const response = await window.apiService.getSavedCareerPaths();
          careers = response.journeys || [];
          console.log("Loaded careers from AWS:", careers);
        } catch (awsError) {
          console.warn("Failed to load from AWS, checking localStorage:", awsError);
        }
      }
      
      // Fallback to localStorage if AWS fails or no data
      if (!careers.length) {
        const data = JSON.parse(localStorage.getItem("savedCareers") || "{}");
        careers = data[this.userId] || [];
        console.log("Loaded careers from localStorage:", careers);
      }

      this.savedCareers = careers;
      list.innerHTML = "";

      if (!careers.length) {
        empty.style.display = "block";
        return;
      }

      empty.style.display = "none";

      // Translate careers if needed
      let displayCareers = careers;
      if (window.TranslationService && TranslationService.currentLanguage !== 'en') {
        console.log(`Translating careers to ${TranslationService.currentLanguage}...`);
        displayCareers = await TranslationService.translateCareers(careers);
      }

      // Load progress from localStorage for each career
      displayCareers.forEach(career => {
        // Load saved progress
        const careerId = career.careerId || career.id || career.journeyId;
        const progressKey = `career-progress-${careerId}`;
        const savedProgress = JSON.parse(localStorage.getItem(progressKey) || '{}');
        
        // Update milestones with saved progress
        if (career.milestones && career.milestones.length > 0) {
          career.milestones = career.milestones.map((milestone, index) => {
            if (typeof milestone === 'string') {
              return {
                title: milestone,
                completed: savedProgress.completedSteps?.includes(index) || false
              };
            } else {
              return {
                ...milestone,
                completed: savedProgress.completedSteps?.includes(index) || milestone.completed || false
              };
            }
          });
        }
        
        const card = this.createSavedCareerCard(career);
        list.appendChild(card);
      });
      
    } catch (error) {
      console.error("Error loading saved careers:", error);
      list.innerHTML = "";
      empty.style.display = "block";
      empty.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load saved careers. Please try again.</p>
        <button onclick="Journey.loadSavedCareers()" class="btn btn-outline">Retry</button>
      `;
    }
  },

  /* ---------------- CREATE SAVED CAREER CARD ---------------- */
  createSavedCareerCard(career) {
    const card = document.createElement("div");
    card.className = "saved-career-card";
    
    const savedDate = career.savedAt || career.timestamp || new Date().toISOString();
    const formattedDate = new Date(savedDate).toLocaleDateString();
    
    // Calculate progress if milestones exist
    const milestones = career.milestones || [];
    const completed = milestones.filter(m => m && m.completed).length;
    const total = milestones.length;
    const progress = total ? Math.round((completed / total) * 100) : 0;
    
    // Get skills for display
    const skills = career.skills || [];
    const careerId = career.careerId || career.id || career.journeyId;
    
    card.innerHTML = `
      <div class="saved-career-header">
        <h3>${career.careerTitle || career.title || career.career || "Career"}</h3>
        <span class="career-category">${career.category || ''}</span>
        <span class="saved-date">Saved: ${formattedDate}</span>
        <div class="saved-career-actions">
          <button class="action-btn view-btn" title="View Details" data-career-id="${careerId}">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn delete-btn" title="Remove" data-career-id="${careerId}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="saved-career-body">
        <p class="career-description">${career.description || "Start your journey in this career path"}</p>
        
        ${skills.length ? `
        <div class="skills-section">
          <h4>Key Skills:</h4>
          <div class="skills-list">
            ${skills.slice(0, 5).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
        ` : ''}
        
        ${milestones.length ? `
        <div class="progress-section">
          <div class="progress-label">
            <span>Progress</span>
            <span>${completed}/${total} milestones (${progress}%)</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>
        
        <div class="milestones">
          <h4><i class="fas fa-tasks"></i> Milestones</h4>
          <div class="milestones-list">
            ${milestones.map((milestone, index) => {
              const title = milestone.title || milestone;
              const isCompleted = milestone.completed || false;
              return `
                <div class="milestone ${isCompleted ? 'completed' : ''}" data-milestone-index="${index}" data-career-id="${careerId}">
                  <div class="milestone-checkbox">
                    <i class="fas ${isCompleted ? 'fa-check' : ''}"></i>
                  </div>
                  <span class="milestone-title">${title}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        ` : `
        <div class="progress-section">
          <div class="progress-label">
            <span>No milestones yet</span>
          </div>
        </div>
        `}
      </div>
    `;
    
    // Add event listeners
    this.addSavedCareerEventListeners(card, career);
    
    return card;
  },

  /* ---------------- ADD EVENT LISTENERS TO SAVED CAREER CARD ---------------- */
  addSavedCareerEventListeners(card, career) {
    const careerId = career.careerId || career.id || career.journeyId;
    
    // View details button
    const viewBtn = card.querySelector('.view-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.viewCareerDetails(careerId);
      });
    }
    
    // Delete button
    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteSavedCareer(careerId);
      });
    }
    
    // Milestone checkboxes
    const milestones = card.querySelectorAll('.milestone');
    milestones.forEach(milestone => {
      milestone.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(milestone.dataset.milestoneIndex);
        const completed = milestone.classList.contains('completed');
        this.toggleMilestone(career, index, !completed);
      });
    });
  },

  /* ---------------- TOGGLE MILESTONE ---------------- */
  async toggleMilestone(career, index, completed) {
    try {
      const careerId = career.careerId || career.id || career.journeyId;
      
      // Update local career object
      if (career.milestones && career.milestones[index]) {
        if (typeof career.milestones[index] === 'object') {
          career.milestones[index].completed = completed;
        } else {
          career.milestones[index] = {
            title: career.milestones[index],
            completed: completed
          };
        }
      }
      
      // Save to localStorage
      const progressKey = `career-progress-${careerId}`;
      const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
      
      if (!progress.completedSteps) {
        progress.completedSteps = [];
      }
      
      if (completed) {
        if (!progress.completedSteps.includes(index)) {
          progress.completedSteps.push(index);
        }
      } else {
        progress.completedSteps = progress.completedSteps.filter(i => i !== index);
      }
      
      // Save to localStorage
      localStorage.setItem(progressKey, JSON.stringify(progress));
      console.log(`✅ Progress saved for ${careerId}:`, progress);
      
      // Update in AWS if available
      if (window.apiService) {
        try {
          await window.apiService.updateMilestoneProgress(careerId, index, completed);
          console.log('✅ Milestone updated in AWS');
        } catch (error) {
          console.warn('Failed to update milestone in AWS:', error);
        }
      }
      
      // Reload saved careers to reflect changes
      await this.loadSavedCareers();
      
      // Also reload progress tab
      this.loadProgress();
      
      // Show success notification
      this.showNotification(
        completed ? '✅ Milestone completed!' : '📝 Milestone updated',
        'success'
      );
      
    } catch (error) {
      console.error('Error toggling milestone:', error);
      this.showNotification('Failed to update milestone', 'error');
    }
  },

  /* ---------------- DELETE SAVED CAREER ---------------- */
  async deleteSavedCareer(careerId) {
    if (!confirm("Remove this career from your saved list?")) return;
    
    try {
      // Remove from AWS
      if (window.apiService) {
        try {
          await window.apiService.deleteJourneyItem(careerId);
          console.log('Deleted from AWS:', careerId);
        } catch (awsError) {
          console.warn('Failed to delete from AWS:', awsError);
        }
      }
      
      // Remove from localStorage
      const savedCareers = JSON.parse(localStorage.getItem("savedCareers") || "{}");
      if (savedCareers[this.userId]) {
        savedCareers[this.userId] = savedCareers[this.userId].filter(
          c => (c.id !== careerId && c.careerId !== careerId && c.journeyId !== careerId)
        );
        localStorage.setItem("savedCareers", JSON.stringify(savedCareers));
      }
      
      // Remove progress data
      localStorage.removeItem(`career-progress-${careerId}`);
      
      // Reload the list
      await this.loadSavedCareers();
      this.loadProgress();
      
      // Show success notification
      this.showNotification('Career removed successfully', 'success');
      
    } catch (error) {
      console.error("Failed to delete career:", error);
      this.showNotification('Failed to remove career', 'error');
    }
  },

  /* ---------------- VIEW CAREER DETAILS ---------------- */
  viewCareerDetails(careerId) {
    window.location.href = `explorer.html?careerId=${careerId}`;
  },

  /* ---------------- QUIZ RESULTS (LAMBDA) ---------------- */
  async loadQuizResults() {
    const container = document.getElementById("quiz-results-list");
    const empty = document.getElementById("no-quiz-results");

    if (!container || !empty) {
      console.warn("Quiz results elements not found");
      return;
    }

    container.innerHTML = "";
    empty.style.display = "none";

    // Show loading state
    container.innerHTML = '<div class="loading-spinner">Loading your results...</div>';

    try {
      const token = localStorage.getItem("idToken");
      if (!token) {
        throw new Error("No authentication token");
      }

      // Get API base URL from config or use default
      const apiBaseUrl = window.API_ENDPOINTS?.JOURNEY || 'https://z8rr97nn06.execute-api.ap-south-1.amazonaws.com';
      
      // IMPORTANT: Use the correct endpoint with /myJourney path
      const url = `${apiBaseUrl}/myJourney?userId=${encodeURIComponent(this.userId)}`;
      
      console.log("Fetching quiz results from:", url);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Session expired - please login again");
        }
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      console.log("Quiz results received:", data);

      // Handle different response formats
      let items = [];
      if (data.journeys) {
        items = data.journeys.filter(item => item.type === 'QUIZ_RESULT' || item.source === 'career_quiz');
      } else if (Array.isArray(data)) {
        items = data.filter(item => item.type === 'QUIZ_RESULT' || item.source === 'career_quiz');
      } else if (data.items) {
        items = data.items.filter(item => item.type === 'QUIZ_RESULT' || item.source === 'career_quiz');
      }

      this.quizResults = items;

      container.innerHTML = ""; // Clear loading spinner

      if (!items.length) {
        empty.style.display = "block";
        return;
      }

      // Sort by timestamp (newest first)
      items.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.createdAt || 0);
        const dateB = new Date(b.timestamp || b.createdAt || 0);
        return dateB - dateA;
      });

      // Translate quiz results if needed
      let displayItems = items;
      if (window.TranslationService && TranslationService.currentLanguage !== 'en') {
        console.log(`Translating quiz results to ${TranslationService.currentLanguage}...`);
        displayItems = await this.translateQuizResults(items);
      }

      displayItems.forEach((item, index) => {
        const card = this.createQuizResultCard(item, index);
        container.appendChild(card);
      });

    } catch (err) {
      console.error("Quiz load failed:", err);
      container.innerHTML = ""; // Clear loading spinner
      empty.style.display = "block";
      
      // Show specific error message
      if (err.message.includes("401") || err.message.includes("Session expired")) {
        empty.innerHTML = `
          <i class="fas fa-exclamation-circle"></i>
          <p>Your session has expired. Please login again.</p>
          <button onclick="window.location.href='login.html'" class="btn btn-primary">Login</button>
        `;
      } else if (err.message.includes("Failed to fetch")) {
        empty.innerHTML = `
          <i class="fas fa-exclamation-circle"></i>
          <p>Network error. Please check your connection.</p>
          <button onclick="Journey.loadQuizResults()" class="btn btn-outline">Retry</button>
        `;
      } else {
        empty.innerHTML = `
          <i class="fas fa-exclamation-circle"></i>
          <p>Error: ${err.message}</p>
          <button onclick="Journey.loadQuizResults()" class="btn btn-outline">Retry</button>
        `;
      }
    }
  },

  /* ---------------- TRANSLATE QUIZ RESULTS ---------------- */
  async translateQuizResults(items) {
    if (!window.TranslationService) return items;
    
    const translatedItems = [];
    for (const item of items) {
      const translatedItem = { ...item };
      
      // Translate career name
      if (item.career) {
        translatedItem.career = await TranslationService.translateText(item.career);
      }
      
      // Translate allResults if present
      if (item.allResults && Array.isArray(item.allResults)) {
        translatedItem.allResults = [];
        for (const result of item.allResults) {
          const translatedResult = { ...result };
          if (result.career) {
            translatedResult.career = await TranslationService.translateText(result.career);
          }
          translatedItem.allResults.push(translatedResult);
        }
      }
      
      translatedItems.push(translatedItem);
    }
    
    return translatedItems;
  },

  /* ---------------- CREATE QUIZ RESULT CARD ---------------- */
  createQuizResultCard(item, index) {
    const career = item.career || "Career";
    const score = item.score || 0;
    const timestamp = item.timestamp || item.createdAt || new Date().toISOString();
    
    // Get all results if available
    const allResults = item.allResults || [];
    
    const card = document.createElement("div");
    card.className = "quiz-result-card";
    
    let otherCareersHtml = '';
    if (allResults.length > 1) {
      otherCareersHtml = `
        <div class="other-recommendations">
          <h5>Other matches:</h5>
          <ul>
            ${allResults.slice(1, 4).map(r => `
              <li>
                <span>${r.career}</span>
                <span class="match-score-small">${r.score}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="result-header">
        <h3>${career}</h3>
        <span class="result-date">${new Date(timestamp).toLocaleDateString()}</span>
      </div>
      <div class="match-score">Match Score: ${score}</div>
      ${otherCareersHtml}
      <div class="result-actions">
        <button class="btn btn-outline btn-small view-quiz-btn" data-index="${index}">
          <i class="fas fa-chart-bar"></i> View Details
        </button>
        <button class="btn btn-outline btn-small delete-quiz-btn" data-journey-id="${item.journeyId}">
          <i class="fas fa-trash"></i> Remove
        </button>
      </div>
    `;
    
    // Add event listeners
    const viewBtn = card.querySelector('.view-quiz-btn');
    viewBtn.addEventListener('click', () => {
      this.showQuizDetails(item);
    });
    
    const deleteBtn = card.querySelector('.delete-quiz-btn');
    deleteBtn.addEventListener('click', () => {
      this.deleteQuizResult(item.journeyId);
    });
    
    return card;
  },

  /* ---------------- SHOW QUIZ DETAILS ---------------- */
  showQuizDetails(quizResult) {
    // Create a simple modal or alert with quiz details
    const allResults = quizResult.allResults || [];
    let details = `Quiz Results:\n\nTop Match: ${quizResult.career} (Score: ${quizResult.score})\n\n`;
    
    if (allResults.length > 1) {
      details += "All Matches:\n";
      allResults.forEach((r, i) => {
        details += `${i+1}. ${r.career} - Score: ${r.score}\n`;
      });
    }
    
    alert(details);
  },

  /* ---------------- DELETE QUIZ RESULT ---------------- */
  async deleteQuizResult(journeyId) {
    if (!journeyId || !confirm("Remove this quiz result?")) return;
    
    try {
      if (window.apiService) {
        await window.apiService.deleteJourneyItem(journeyId);
        console.log('Deleted quiz result:', journeyId);
      }
      
      // Reload quiz results
      await this.loadQuizResults();
      this.loadProgress();
      
      this.showNotification('Quiz result removed', 'success');
      
    } catch (error) {
      console.error('Failed to delete quiz result:', error);
      this.showNotification('Failed to delete quiz result', 'error');
    }
  },

  /* ---------------- PROGRESS ---------------- */
  loadProgress() {
    const list = document.getElementById("progress-list");
    const empty = document.getElementById("no-progress");
    const totalCourses = document.getElementById("total-courses");
    const completedMilestones = document.getElementById("completed-milestones");
    const progressPercentage = document.getElementById("progress-percentage");
    const daysActive = document.getElementById("days-active");

    if (!list || !empty) {
      console.warn("Progress elements not found");
      return;
    }

    list.innerHTML = "";

    if (!this.savedCareers.length && !this.quizResults.length) {
      empty.style.display = "block";
      
      // Update stats
      if (totalCourses) totalCourses.textContent = "0";
      if (completedMilestones) completedMilestones.textContent = "0";
      if (progressPercentage) progressPercentage.textContent = "0%";
      if (daysActive) daysActive.textContent = "0";
      return;
    }

    empty.style.display = "none";

    let totalSteps = 0;
    let completedSteps = 0;
    let careerCount = 0;

    // Calculate progress from saved careers
    this.savedCareers.forEach(c => {
      const careerId = c.careerId || c.id || c.journeyId;
      const progress = JSON.parse(
        localStorage.getItem(`career-progress-${careerId}`) || '{}'
      );

      const done = progress.completedSteps?.length || 0;
      const milestones = c.milestones || [];
      const total = milestones.length || 1;

      completedSteps += done;
      totalSteps += total;
      
      if (milestones.length > 0) {
        careerCount++;
      }

      const percent = total ? Math.round((done / total) * 100) : 0;

      const card = document.createElement("div");
      card.className = "progress-card";
      card.innerHTML = `
        <h3>${c.title || c.career || "Career"}</h3>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percent}%"></div>
        </div>
        <p>${percent}% complete (${done}/${total} steps)</p>
        <button class="btn btn-outline btn-small view-progress-btn" data-career-id="${careerId}">
          View Details
        </button>
      `;
      list.appendChild(card);
      
      // Add event listener to view button
      const viewBtn = card.querySelector('.view-progress-btn');
      viewBtn.addEventListener('click', () => {
        this.viewCareerDetails(careerId);
      });
    });

    // If no saved careers but have quiz results, show quiz stats
    if (!this.savedCareers.length && this.quizResults.length) {
      const card = document.createElement("div");
      card.className = "progress-card";
      card.innerHTML = `
        <h3>Quiz Completed</h3>
        <p>${this.quizResults.length} quiz attempts</p>
        <p>Last attempt: ${new Date(this.quizResults[0]?.timestamp || Date.now()).toLocaleDateString()}</p>
        <button class="btn btn-outline btn-small view-quiz-progress-btn">View Results</button>
      `;
      list.appendChild(card);
      
      // Add event listener
      const viewBtn = card.querySelector('.view-quiz-progress-btn');
      viewBtn.addEventListener('click', () => {
        document.querySelector('[data-tab="quiz"]')?.click();
      });
      
      careerCount = this.quizResults.length;
    }

    // Update stats
    if (totalCourses) totalCourses.textContent = careerCount || this.savedCareers.length || this.quizResults.length || 0;
    if (completedMilestones) completedMilestones.textContent = completedSteps;
    if (progressPercentage) {
      const percent = totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0;
      progressPercentage.textContent = percent + "%";
    }
    if (daysActive) daysActive.textContent = this.daysActive();
  },

  daysActive() {
    if (!this.savedCareers.length && !this.quizResults.length) return 0;
    
    // Get earliest date from saved careers or quiz results
    let earliest = Date.now();
    
    if (this.savedCareers.length) {
      const careerDate = new Date(this.savedCareers[0].savedAt || Date.now()).getTime();
      earliest = Math.min(earliest, careerDate);
    }
    
    if (this.quizResults.length) {
      const quizDate = new Date(this.quizResults[0].timestamp || Date.now()).getTime();
      earliest = Math.min(earliest, quizDate);
    }
    
    return Math.ceil((Date.now() - earliest) / 86400000);
  },

  /* ---------------- SHOW NOTIFICATION ---------------- */
  showNotification(message, type = 'info') {
    // Check if notification container exists
    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    container.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  },

  // Manual refresh method
  async refreshQuizResults() {
    console.log("Refreshing quiz results...");
    await this.loadQuizResults();
  },
  
  // Refresh all content (for language change)
  async refreshAllContent() {
    console.log("Refreshing all content...");
    await this.loadSavedCareers();
    await this.loadQuizResults();
    this.loadProgress();
  }
};

/* ---------------- ADD NOTIFICATION STYLES ---------------- */
(function addNotificationStyles() {
  if (document.getElementById('notification-styles')) return;
  
  const styles = `
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
    }
    
    .notification {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 1rem 1.5rem;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      animation: slideIn 0.3s ease;
      border-left: 4px solid #6b7280;
      min-width: 300px;
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
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .loading-spinner {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }
    
    .loading-spinner i {
      font-size: 2rem;
      margin-bottom: 1rem;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .saved-career-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 1.5rem;
      overflow: hidden;
    }
    
    .saved-career-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      position: relative;
    }
    
    .saved-career-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
    }
    
    .career-category {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.85rem;
    }
    
    .saved-date {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 0.85rem;
      background: rgba(255,255,255,0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
    }
    
    .saved-career-actions {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      display: flex;
      gap: 0.5rem;
    }
    
    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: rgba(255,255,255,0.2);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .action-btn:hover {
      background: white;
      color: #764ba2;
      transform: scale(1.1);
    }
    
    .delete-btn:hover {
      background: #ef4444;
      color: white;
    }
    
    .saved-career-body {
      padding: 1.5rem;
    }
    
    .career-description {
      color: #4b5563;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
    
    .skills-section h4 {
      margin-bottom: 0.75rem;
      font-size: 1rem;
    }
    
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .skill-tag {
      background: #f3f4f6;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.85rem;
      color: #374151;
    }
    
    .progress-section {
      margin: 1.5rem 0;
    }
    
    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .progress-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 999px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }
    
    .milestones {
      margin-top: 1.5rem;
    }
    
    .milestones h4 {
      margin-bottom: 1rem;
    }
    
    .milestones-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .milestone {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .milestone:hover {
      background: #f3f4f6;
    }
    
    .milestone.completed {
      background: #ecfdf5;
    }
    
    .milestone-checkbox {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #9ca3af;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .milestone.completed .milestone-checkbox {
      background: #10b981;
      border-color: #10b981;
      color: white;
    }
    
    .milestone-title {
      flex: 1;
    }
    
    .quiz-result-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .result-header h3 {
      margin: 0;
      color: #1f2937;
    }
    
    .result-date {
      color: #6b7280;
      font-size: 0.85rem;
    }
    
    .match-score {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 0.25rem 1rem;
      border-radius: 999px;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    
    .other-recommendations {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
    }
    
    .other-recommendations h5 {
      margin: 0 0 0.5rem 0;
      color: #4b5563;
    }
    
    .other-recommendations ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .other-recommendations li {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .other-recommendations li:last-child {
      border-bottom: none;
    }
    
    .result-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    
    .progress-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    
    .progress-card h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
    }
    
    .btn-small {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }
    
    .btn-outline {
      background: white;
      border: 1px solid #d1d5db;
      color: #374151;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
    }
    
    .btn-outline:hover {
      background: #f3f4f6;
    }
    
    .empty-state {
      text-align: center;
      padding: 3rem;
      background: #f9fafb;
      border-radius: 8px;
      color: #6b7280;
    }
    
    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .empty-state h3 {
      color: #374151;
      margin-bottom: 0.5rem;
    }
  `;
  
  const styleSheet = document.createElement('style');
  styleSheet.id = 'notification-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
})();

/* ---------------- START ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Small delay to ensure DOM is fully loaded
  setTimeout(() => Journey.init(), 100);
});

// Make Journey available globally for debugging
window.Journey = Journey;