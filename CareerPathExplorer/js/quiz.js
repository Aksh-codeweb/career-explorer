/*********************************
 * QUIZ QUESTIONS (unchanged)
 *********************************/
const quizQuestions = [
  {
    id: 1,
    question: "What type of work environment do you prefer?",
    type: "single",
    answers: [
      { text: "Structured office with clear routines", value: "structured" },
      { text: "Creative and flexible workspace", value: "creative" },
      { text: "Fast-paced, dynamic environment", value: "dynamic" },
      { text: "Working independently or remotely", value: "independent" }
    ]
  },
  {
    id: 2,
    question: "Which activities energize you the most?",
    type: "multiple",
    answers: [
      { text: "Solving complex problems", value: "problem_solving" },
      { text: "Helping and teaching others", value: "helping" },
      { text: "Creating art or designs", value: "creating" },
      { text: "Analyzing data and patterns", value: "analyzing" },
      { text: "Leading teams or projects", value: "leading" }
    ]
  },
  {
    id: 3,
    question: "What are your strongest skills?",
    type: "multiple",
    answers: [
      { text: "Technical and logical thinking", value: "technical" },
      { text: "Communication and empathy", value: "communication" },
      { text: "Creativity and imagination", value: "creativity" },
      { text: "Organization and planning", value: "organization" },
      { text: "Critical thinking and analysis", value: "analysis" }
    ]
  },
  {
    id: 4,
    question: "How do you prefer to learn new things?",
    type: "single",
    answers: [
      { text: "Through hands-on practice", value: "practical" },
      { text: "By reading and researching", value: "theoretical" },
      { text: "Through collaboration with others", value: "collaborative" },
      { text: "By watching tutorials and examples", value: "visual" }
    ]
  },
  {
    id: 5,
    question: "What kind of impact do you want to make?",
    type: "single",
    answers: [
      { text: "Create innovative products or services", value: "innovation" },
      { text: "Help improve people's lives", value: "helping" },
      { text: "Solve important global challenges", value: "global" },
      { text: "Build successful businesses", value: "business" }
    ]
  },
  {
    id: 6,
    question: "Which subjects did you enjoy most in school?",
    type: "multiple",
    answers: [
      { text: "Math and Science", value: "technical" },
      { text: "Arts and Design", value: "creativity" },
      { text: "Business Studies", value: "business" },
      { text: "Psychology / Social Studies", value: "helping" }
    ]
  },
  {
    id: 7,
    question: "Do you enjoy leading others?",
    type: "single",
    answers: [
      { text: "Yes", value: "leading" },
      { text: "Sometimes", value: "business" },
      { text: "No", value: "technical" }
    ]
  },
  {
    id: 8,
    question: "What motivates you the most?",
    type: "single",
    answers: [
      { text: "Problem solving", value: "technical" },
      { text: "Helping people", value: "helping" },
      { text: "Creating new things", value: "creativity" },
      { text: "Managing projects", value: "business" }
    ]
  },
  {
    id: 9,
    question: "Do you prefer working alone or in a team?",
    type: "single",
    answers: [
      { text: "Alone", value: "technical" },
      { text: "Team", value: "helping" },
      { text: "Leading a team", value: "leading" }
    ]
  },
  {
    id: 10,
    question: "What kind of career growth do you want?",
    type: "single",
    answers: [
      { text: "Technical expert", value: "technical" },
      { text: "Creative professional", value: "creativity" },
      { text: "Leader / Manager", value: "business" }
    ]
  }
];

/*********************************
 * CAREER MATCH LOGIC
 *********************************/
const careerMatches = {
  technical_analytical: { careers: ["Software Developer"], match: 0 },
  creative_artistic: { careers: ["UI/UX Designer"], match: 0 },
  helping_people: { careers: ["Career Counselor"], match: 0 },
  business_leadership: { careers: ["Project Manager"], match: 0 }
};

const mapping = {
  structured: ["technical_analytical"],
  creative: ["creative_artistic"],
  dynamic: ["technical_analytical", "business_leadership"],
  independent: ["technical_analytical", "creative_artistic"],
  problem_solving: ["technical_analytical"],
  helping: ["helping_people"],
  creating: ["creative_artistic"],
  analyzing: ["technical_analytical"],
  leading: ["business_leadership"],
  technical: ["technical_analytical"],
  communication: ["helping_people"],
  creativity: ["creative_artistic"],
  organization: ["business_leadership"],
  analysis: ["technical_analytical"],
  practical: ["technical_analytical"],
  theoretical: ["technical_analytical"],
  collaborative: ["helping_people"],
  visual: ["creative_artistic"],
  innovation: ["technical_analytical", "creative_artistic"],
  global: ["helping_people", "business_leadership"],
  business: ["business_leadership"]
};

/*********************************
 * STATE
 *********************************/
let currentQuestion = 0;
let userAnswers = {};

/*********************************
 * INIT
 *********************************/
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const token = localStorage.getItem("idToken");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Initialize quiz elements
  const startBtn = document.getElementById("start-quiz");
  const nextBtn = document.getElementById("next-question");
  const prevBtn = document.getElementById("prev-question");
  const saveBtn = document.getElementById("save-results");
  const retakeBtn = document.getElementById("retake-quiz");

  if (startBtn) startBtn.onclick = startQuiz;
  if (nextBtn) nextBtn.onclick = nextQuestion;
  if (prevBtn) prevBtn.onclick = prevQuestion;
  if (saveBtn) saveBtn.onclick = saveQuizResults;
  if (retakeBtn) retakeBtn.onclick = () => window.location.reload();

  // Check API service availability
  if (!window.apiService) {
    console.warn("API Service not loaded yet, waiting...");
    const checkAPI = setInterval(() => {
      if (window.apiService) {
        console.log("API Service loaded");
        clearInterval(checkAPI);
      }
    }, 100);
  }
  
  // Translate page if needed
  if (window.TranslationService && TranslationService.currentLanguage !== 'en') {
    translateQuizPage();
  }
  
  // Listen for language changes
  document.addEventListener('languageChanged', () => {
    translateQuizPage();
  });
});

/*********************************
 * TRANSLATE QUIZ PAGE
 *********************************/
async function translateQuizPage() {
  if (!window.TranslationService) return;
  
  try {
    // Translate questions
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (currentQuestion === i) {
        // Translate current question if visible
        const questionHeader = document.querySelector('.question-header h3');
        if (questionHeader) {
          questionHeader.textContent = await TranslationService.translateText(q.question);
        }
        
        // Translate answer options
        const answerLabels = document.querySelectorAll('.answer-option .option-text');
        for (let j = 0; j < answerLabels.length && j < q.answers.length; j++) {
          answerLabels[j].textContent = await TranslationService.translateText(q.answers[j].text);
        }
      }
    }
    
    // Translate results if visible
    if (document.getElementById("quiz-results").style.display === "block") {
      const results = calculateResults();
      await translateResults(results);
    }
    
  } catch (error) {
    console.error('Translation error:', error);
  }
}

/*********************************
 * TRANSLATE RESULTS
 *********************************/
async function translateResults(results) {
  if (!window.TranslationService) return;
  
  const content = document.getElementById("results-content");
  
  // Translate top career
  const topCareerElement = content.querySelector('h2');
  if (topCareerElement && results[0]) {
    topCareerElement.textContent = await TranslationService.translateText(results[0].career);
  }
  
  // Translate other careers
  const otherCareerElements = content.querySelectorAll('.career-match-card h4');
  for (let i = 0; i < otherCareerElements.length && i < results.slice(1).length; i++) {
    otherCareerElements[i].textContent = await TranslationService.translateText(results.slice(1)[i].career);
  }
}

/*********************************
 * QUIZ FLOW
 *********************************/
function startQuiz() {
  document.getElementById("quiz-intro").style.display = "none";
  document.getElementById("quiz-questions").style.display = "block";
  updateProgress();
  loadQuestion();
}

function updateProgress() {
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const progressBar = document.getElementById("quiz-progress");
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
}

function loadQuestion() {
  const q = quizQuestions[currentQuestion];
  const form = document.getElementById("quiz-form");

  // Build HTML
  form.innerHTML = `
    <div class="question-header">
      <span class="question-number">Question ${currentQuestion + 1} of ${quizQuestions.length}</span>
      <h3>${q.question}</h3>
    </div>
    <div class="answers-container">
      ${q.answers
        .map(
          a => `
        <label class="answer-option">
          <input type="${q.type === "multiple" ? "checkbox" : "radio"}"
                 name="q${q.id}"
                 value="${a.value}">
          <span class="option-marker"></span>
          <span class="option-text">${a.text}</span>
        </label>
      `
        )
        .join("")}
    </div>
  `;

  // Restore previously selected answers
  const saved = userAnswers[q.id];
  if (saved) {
    if (q.type === "multiple" && Array.isArray(saved)) {
      saved.forEach(val => {
        const input = form.querySelector(`input[value="${val}"]`);
        if (input) {
          input.checked = true;
          input.closest('.answer-option').classList.add('selected');
        }
      });
    } else if (q.type === "single") {
      const input = form.querySelector(`input[value="${saved}"]`);
      if (input) {
        input.checked = true;
        input.closest('.answer-option').classList.add('selected');
      }
    }
  }

  // Attach change handler
  form.querySelectorAll("input").forEach(input => {
    input.addEventListener("change", function() {
      const questionId = q.id;
      const parentLabel = this.closest('.answer-option');

      if (q.type === "multiple") {
        if (this.checked) {
          parentLabel.classList.add('selected');
        } else {
          parentLabel.classList.remove('selected');
        }
        const checked = Array.from(form.querySelectorAll('input:checked')).map(i => i.value);
        userAnswers[questionId] = checked;
      } else {
        form.querySelectorAll('.answer-option').forEach(label => label.classList.remove('selected'));
        if (this.checked) {
          parentLabel.classList.add('selected');
          userAnswers[questionId] = this.value;
        }
      }
    });
  });
  
  // Translate the loaded question if needed
  if (window.TranslationService && TranslationService.currentLanguage !== 'en') {
    translateQuizPage();
  }

  updateProgress();
}

function nextQuestion() {
  const q = quizQuestions[currentQuestion];
  const answer = userAnswers[q.id];

  // Validate answer
  if (!answer || (Array.isArray(answer) && answer.length === 0)) {
    alert("Please select at least one answer before continuing.");
    return;
  }

  if (currentQuestion < quizQuestions.length - 1) {
    currentQuestion++;
    loadQuestion();
  } else {
    showResults();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
}

function calculateResults() {
  // Reset scores
  Object.values(careerMatches).forEach(c => (c.match = 0));

  // Tally answers
  Object.values(userAnswers).flat().forEach(answer => {
    (mapping[answer] || []).forEach(type => {
      if (careerMatches[type]) {
        careerMatches[type].match++;
      }
    });
  });

  // Convert to array and sort descending
  return Object.entries(careerMatches)
    .map(([key, value]) => ({
      career: value.careers[0],
      score: value.match,
      category: key
    }))
    .sort((a, b) => b.score - a.score);
}

async function showResults() {
  const results = calculateResults();
  const topCareer = results[0];

  document.getElementById("quiz-questions").style.display = "none";
  document.getElementById("quiz-results").style.display = "block";

  const content = document.getElementById("results-content");
  
  // Get translated career names if needed
  let topCareerName = topCareer.career;
  let otherCareersHtml = '';
  
  if (window.TranslationService && TranslationService.currentLanguage !== 'en') {
    topCareerName = await TranslationService.translateText(topCareer.career);
    
    const otherCareers = await Promise.all(
      results.slice(1).map(async (r) => {
        const translatedName = await TranslationService.translateText(r.career);
        return {
          ...r,
          translatedName
        };
      })
    );
    
    otherCareersHtml = otherCareers.map((r) => `
      <div class="career-match-card">
        <h4>${r.translatedName}</h4>
        <div class="match-score">Match: ${r.score}</div>
      </div>
    `).join('');
  } else {
    otherCareersHtml = results.slice(1).map((r) => `
      <div class="career-match-card">
        <h4>${r.career}</h4>
        <div class="match-score">Match: ${r.score}</div>
      </div>
    `).join('');
  }

  content.innerHTML = `
    <div class="top-career-card">
      <div class="career-icon">
        <i class="fas fa-trophy"></i>
      </div>
      <h2>${topCareerName}</h2>
      <div class="score-badge">Match Score: ${topCareer.score}</div>
      <p class="career-description">
        Based on your answers, you have a strong interest in ${topCareerName}. 
        Keep exploring this path – it could be your perfect fit!
      </p>
    </div>
    
    <h3 class="other-careers-title">Other Careers That Match You:</h3>
    <div class="other-careers-grid">
      ${otherCareersHtml}
    </div>
  `;
}

/*********************************
 * SAVE TO AWS
 *********************************/
async function saveQuizResults() {
  
  if (!window.apiService) {
    console.error("API Service not loaded");
    alert("API service is initializing. Please try again in a moment.");
    return;
  }

  const token = localStorage.getItem("idToken");
  if (!token) {
    alert("Your session has expired. Please login again.");
    window.location.href = "login.html";
    return;
  }

  const saveButton = document.getElementById("save-results");
  const originalText = saveButton.innerHTML;
  
  try {
    // Disable button and show loading
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    // Calculate results
    const quizResults = calculateResults();
    const topCareer = quizResults[0];

    if (!topCareer) {
      throw new Error("No career results to save");
    }

    // Get user info from token
    let userEmail = "User";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userEmail = payload.email || "User";
    } catch (e) {
      console.warn("Could not parse token");
    }

    // Prepare data for API - CRITICAL: Set type to QUIZ_RESULT
    const quizData = {
      career: topCareer.career,
      score: topCareer.score,
      allResults: quizResults,
      source: "career_quiz",
      type: "QUIZ_RESULT",  // THIS IS CRITICAL - must be QUIZ_RESULT
      timestamp: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      userEmail: userEmail
    };

    console.log("Saving quiz results:", quizData);

    // Save to AWS - use saveQuizResults if available, otherwise saveCareerPath
    let response;
    if (window.apiService.saveQuizResults) {
      response = await window.apiService.saveQuizResults(quizData);
    } else {
      // Fallback to saveCareerPath but ensure type is set
      response = await window.apiService.saveCareerPath({
        ...quizData,
        source: "career_quiz",
        type: "QUIZ_RESULT"
      });
    }
    
    console.log("Save successful:", response);
    
    // Show success message
    saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
    saveButton.style.backgroundColor = '#10b981';
    
    // Also save to localStorage as backup
    try {
      const savedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
      savedResults.push({
        ...quizData,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('quizResults', JSON.stringify(savedResults));
    } catch (e) {
      console.warn('Could not save to localStorage');
    }
    
    setTimeout(() => {
      saveButton.innerHTML = originalText;
      saveButton.style.backgroundColor = '';
      saveButton.disabled = false;
      
      // Show success notification
      showNotification('✅ Results saved to your journey!', 'success');
    }, 2000);

  } catch (error) {
    console.error("Save failed:", error);
    
    // Show error message
    saveButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Try Again';
    saveButton.style.backgroundColor = '#ef4444';
    
    // Specific error messages
    if (error.message.includes('401')) {
      showNotification('Your session has expired. Please login again.', 'error');
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else if (error.message.includes('Failed to fetch')) {
      showNotification('Network error. Please check your internet connection.', 'error');
    } else {
      showNotification(`Failed to save: ${error.message}`, 'error');
    }
    
    // Reset button after 2 seconds
    setTimeout(() => {
      saveButton.innerHTML = originalText;
      saveButton.style.backgroundColor = '';
      saveButton.disabled = false;
    }, 2000);
  }
}

/*********************************
 * SHOW NOTIFICATION
 *********************************/
function showNotification(message, type = 'info') {
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
}

/*********************************
 * ADD NOTIFICATION STYLES
 *********************************/
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
  `;
  
  const styleSheet = document.createElement('style');
  styleSheet.id = 'notification-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
})();