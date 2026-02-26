/*********************************
 * API Service – AWS Backend Only
 * Complete working version with CORS support
 * Handles both Quiz Results and Career Path saves
 *********************************/

class APIService {

    constructor() {
        // API Gateway base URL from config.js
        this.baseURL = window.API_ENDPOINTS?.JOURNEY || '';
        
        if (!this.baseURL) {
            console.error("❌ API_ENDPOINTS.JOURNEY not found in config.js");
            console.warn("Please check that config.js is loaded before api.js");
        } else {
            console.log("✅ API Service initialized with baseURL:", this.baseURL);
        }
        
        // Retry configuration
        this.maxRetries = 3;
        this.retryDelay = 1000;
    }

    /*********************************
     * GENERIC REQUEST WITH PROPER CORS HANDLING
     *********************************/
    async request(path, options = {}, retryCount = 0) {

        const token = localStorage.getItem("idToken");

        if (!token) {
            throw new Error("No authentication token found - please login again");
        }

        // Clean the path to ensure proper URL construction
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        const url = `${this.baseURL}${cleanPath}`;
        
        console.log(`🌐 Making ${options.method || 'GET'} request to:`, url);

        // Default fetch options with proper CORS settings
        const defaultOptions = {
            mode: 'cors',
            credentials: 'omit',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "Origin": window.location.origin
            }
        };

        const fetchOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, fetchOptions);

            // Handle 401 Unauthorized - token expired
            if (response.status === 401) {
                console.log("🔐 Token expired, redirecting to login...");
                this.handleLogout();
                throw new Error("Session expired - please login again");
            }

            // Handle 403 Forbidden
            if (response.status === 403) {
                throw new Error("Access forbidden - insufficient permissions");
            }

            // Handle 404 Not Found
            if (response.status === 404) {
                throw new Error(`API endpoint not found: ${path}`);
            }

            // Handle 500+ server errors with retry
            if (response.status >= 500 && retryCount < this.maxRetries) {
                console.log(`⚠️ Server error (${response.status}), retrying... (${retryCount + 1}/${this.maxRetries})`);
                await this.delay(this.retryDelay * Math.pow(2, retryCount));
                return this.request(path, options, retryCount + 1);
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ API Error Response:", errorText);
                throw new Error(`API Error ${response.status}: ${response.statusText}`);
            }

            // Check if response is empty
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};
            
            console.log("✅ API Response successful:", data);
            return data;

        } catch (error) {
            console.error("❌ API Request Failed:", error);
            
            // Provide more helpful error messages based on error type
            if (error.message.includes('Failed to fetch')) {
                throw new Error(
                    "Network error - please check:\n" +
                    "1. API Gateway URL is correct in config.js\n" +
                    "2. CORS is enabled on API Gateway\n" +
                    "3. Your internet connection is working"
                );
            }
            
            if (error.name === 'TypeError' && error.message.includes('CORS')) {
                throw new Error(
                    "CORS error - API Gateway needs CORS configuration.\n" +
                    "Please enable CORS for your API Gateway endpoints."
                );
            }
            
            throw error;
        }
    }

    /*********************************
     * DELAY UTILITY FOR RETRIES
     *********************************/
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /*********************************
     * HANDLE LOGOUT
     *********************************/
    handleLogout() {
        localStorage.clear();
        // Redirect to Cognito logout
        const clientId = 'no8u3mv9ivnuhj6b0c5e20jfp';
        const logoutUri = encodeURIComponent('https://dzv9jsf7udmwn.cloudfront.net/login.html');
        window.location.href = `https://ap-south-1fzlcxymni.auth.ap-south-1.amazoncognito.com/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
    }

    /*********************************
     * GET USER INFO FROM JWT TOKEN
     *********************************/
    getUserInfoFromToken() {
        try {
            const token = localStorage.getItem("idToken");
            if (!token) return null;
            
            // Decode JWT payload (middle part)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            
            return {
                sub: payload.sub,
                email: payload.email,
                name: payload.name || payload.email,
                exp: payload.exp
            };
        } catch (error) {
            console.error("❌ Failed to parse token:", error);
            return null;
        }
    }

    /*********************************
     * CHECK IF USER IS AUTHENTICATED
     *********************************/
    isAuthenticated() {
        const token = localStorage.getItem("idToken");
        if (!token) return false;
        
        const userInfo = this.getUserInfoFromToken();
        if (!userInfo) return false;
        
        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        return userInfo.exp > now;
    }

    /*********************************
     * TEST BACKEND CONNECTION
     *********************************/
    async testConnection() {
        console.log("🔍 Testing API Gateway connection...");
        
        try {
            const response = await this.request("/hello", { 
                method: "GET",
                signal: AbortSignal.timeout(5000)
            });
            
            console.log("✅ API Gateway connection successful:", response);
            return {
                success: true,
                message: "Connected to API Gateway",
                data: response
            };
        } catch (error) {
            console.error("❌ API Gateway connection failed:", error);
            return {
                success: false,
                message: error.message,
                error: error
            };
        }
    }

    /*********************************
     * GET API STATUS WITH DETAILS
     *********************************/
    async getAPIStatus() {
        const status = {
            authenticated: this.isAuthenticated(),
            baseURL: this.baseURL,
            userInfo: this.getUserInfoFromToken(),
            connectionTest: null
        };
        
        if (status.authenticated && this.baseURL) {
            status.connectionTest = await this.testConnection();
        }
        
        return status;
    }

    /*********************************
     * ===== QUIZ RESULTS METHODS =====
     *********************************/

    /*********************************
     * SAVE QUIZ RESULTS
     *********************************/
    async saveQuizResults(quizData) {
        const token = localStorage.getItem("idToken");
        
        if (!token) {
            throw new Error("No authentication token found");
        }

        const userInfo = this.getUserInfoFromToken();
        
        if (!userInfo) {
            throw new Error("Could not extract user info from token");
        }

        console.log("📝 Saving quiz results for user:", userInfo.email);

        // Format the data properly for DynamoDB
        const payload = {
            userId: userInfo.sub || userInfo.email,
            email: userInfo.email,
            career: quizData.career || (quizData.allResults?.[0]?.career),
            score: quizData.score || (quizData.allResults?.[0]?.score) || 0,
            timestamp: new Date().toISOString(),
            allResults: quizData.allResults || [],
            source: "career_quiz",
            type: "QUIZ_RESULT",  // CRITICAL: This distinguishes from saved careers
            savedAt: new Date().toISOString(),
            completedAt: quizData.completedAt || new Date().toISOString()
        };

        // Add top career info
        if (payload.allResults && payload.allResults.length > 0) {
            payload.topCareer = payload.allResults[0].career;
            payload.topScore = payload.allResults[0].score;
        }

        // Add userAgent if available
        if (navigator.userAgent) {
            payload.userAgent = navigator.userAgent;
        }

        try {
            const response = await this.request("/saveJourney", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            
            console.log("✅ Quiz results saved successfully:", response);
            return response;
            
        } catch (error) {
            console.error("❌ Failed to save quiz results:", error);
            throw error;
        }
    }

    /*********************************
     * GET QUIZ RESULTS
     *********************************/
    async getQuizResults() {
        const userInfo = this.getUserInfoFromToken();

        if (!userInfo) {
            throw new Error("User not authenticated");
        }

        const userId = userInfo.sub || userInfo.email;

        try {
            const response = await this.request(`/myJourney?userId=${encodeURIComponent(userId)}`, {
                method: "GET"
            });
            
            console.log("✅ Retrieved quiz results:", response);
            
            // Filter only quiz results
            if (response.journeys) {
                response.journeys = response.journeys.filter(j => 
                    j.type === "QUIZ_RESULT" || j.source === "career_quiz"
                );
            }
            
            return response;
            
        } catch (error) {
            console.error("❌ Failed to retrieve quiz results:", error);
            throw error;
        }
    }

    /*********************************
     * ===== CAREER PATH METHODS =====
     *********************************/

    /*********************************
     * SAVE CAREER PATH (from explorer)
     *********************************/
    async saveCareerPath(careerData) {
        const token = localStorage.getItem("idToken");
        
        if (!token) {
            throw new Error("No authentication token found");
        }

        const userInfo = this.getUserInfoFromToken();
        
        if (!userInfo) {
            throw new Error("Could not extract user info from token");
        }

        console.log("💾 Saving career path for user:", userInfo.email);

        // Validate career data
        if (!careerData.career && !careerData.title) {
            throw new Error("No career data to save");
        }

        // Format the data properly for DynamoDB
        const payload = {
            userId: userInfo.sub || userInfo.email,
            email: userInfo.email,
            career: careerData.career || careerData.title,
            careerTitle: careerData.careerTitle || careerData.title || careerData.career,
            careerId: careerData.careerId || careerData.id,
            source: "career_explorer",
            type: "SAVED_CAREER",  // CRITICAL: This distinguishes from quiz results
            savedAt: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            category: careerData.category || "",
            description: careerData.description || "",
            salary: careerData.salary || "",
            demand: careerData.demand || "",
            education: careerData.education || "",
            skills: careerData.skills || [],
            path: careerData.path || [],
            resources: careerData.resources || [],
            milestones: careerData.milestones || []
        };

        // Add optional fields
        if (careerData.duration) payload.duration = careerData.duration;
        if (careerData.difficulty) payload.difficulty = careerData.difficulty;

        try {
            const response = await this.request("/saveCareerPath", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            
            console.log("✅ Career path saved successfully:", response);
            return response;
            
        } catch (error) {
            console.error("❌ Failed to save career path:", error);
            throw error;
        }
    }

    /*********************************
     * GET SAVED CAREER PATHS
     *********************************/
    async getSavedCareerPaths() {
        const userInfo = this.getUserInfoFromToken();

        if (!userInfo) {
            throw new Error("User not authenticated");
        }

        const userId = userInfo.sub || userInfo.email;

        try {
            const response = await this.request(`/myJourney?userId=${encodeURIComponent(userId)}`, {
                method: "GET"
            });
            
            console.log("✅ Retrieved saved career paths:", response);
            
            // Filter only career paths (not quiz results)
            if (response.journeys) {
                response.journeys = response.journeys.filter(j => 
                    j.type === "SAVED_CAREER" || j.source === "career_explorer"
                );
            }
            
            return response;
            
        } catch (error) {
            console.error("❌ Failed to retrieve saved career paths:", error);
            throw error;
        }
    }

    /*********************************
     * ===== COMMON METHODS =====
     *********************************/

    /*********************************
     * GET ALL USER JOURNEY ITEMS
     *********************************/
    async getAllJourneyItems() {
        const userInfo = this.getUserInfoFromToken();

        if (!userInfo) {
            throw new Error("User not authenticated");
        }

        const userId = userInfo.sub || userInfo.email;

        try {
            const response = await this.request(`/myJourney?userId=${encodeURIComponent(userId)}`, {
                method: "GET"
            });
            
            console.log("✅ Retrieved all journey items:", response);
            return response;
            
        } catch (error) {
            console.error("❌ Failed to retrieve journey items:", error);
            throw error;
        }
    }

    /*********************************
     * DELETE JOURNEY ITEM
     *********************************/
    async deleteJourneyItem(journeyId) {
        const userInfo = this.getUserInfoFromToken();

        if (!userInfo) {
            throw new Error("User not authenticated");
        }

        const userId = userInfo.sub || userInfo.email;

        if (!journeyId) {
            throw new Error("journeyId is required");
        }

        try {
            const response = await this.request(`/deleteJourney?userId=${encodeURIComponent(userId)}&journeyId=${encodeURIComponent(journeyId)}`, {
                method: "DELETE"
            });
            
            console.log("✅ Journey item deleted successfully:", response);
            return response;
            
        } catch (error) {
            console.error("❌ Failed to delete journey item:", error);
            throw error;
        }
    }

    /*********************************
     * UPDATE MILESTONE PROGRESS
     *********************************/
    async updateMilestoneProgress(careerId, milestoneIndex, completed) {
        const userInfo = this.getUserInfoFromToken();

        if (!userInfo) {
            throw new Error("User not authenticated");
        }

        const userId = userInfo.sub || userInfo.email;

        if (!careerId || milestoneIndex === undefined) {
            throw new Error("careerId and milestoneIndex are required");
        }

        try {
            const response = await this.request("/updateProgress", {
                method: "POST",
                body: JSON.stringify({
                    userId,
                    careerId,
                    milestoneIndex,
                    completed: !!completed,
                    timestamp: new Date().toISOString()
                })
            });
            
            console.log("✅ Milestone progress updated:", response);
            return response;
            
        } catch (error) {
            console.error("❌ Failed to update milestone progress:", error);
            throw error;
        }
    }

    /*********************************
     * ===== TRANSLATION METHODS =====
     *********************************/

    /*********************************
     * TRANSLATE TEXT
     *********************************/
    async translateText(text, targetLanguage = 'es') {
        if (!text) return text;
        
        try {
            const response = await this.request("/translate", {
                method: "POST",
                body: JSON.stringify({
                    text: text,
                    targetLanguage: targetLanguage
                })
            });
            
            return response.translatedText || text;
            
        } catch (error) {
            console.error("❌ Translation failed:", error);
            return text; // Return original on error
        }
    }

    /*********************************
     * TRANSLATE CAREER
     *********************************/
    async translateCareer(career, targetLanguage = 'es') {
        if (!career) return career;
        
        try {
            const response = await this.request("/translateCareer", {
                method: "POST",
                body: JSON.stringify({
                    career: career,
                    targetLanguage: targetLanguage
                })
            });
            
            return response.career || career;
            
        } catch (error) {
            console.error("❌ Career translation failed:", error);
            return career; // Return original on error
        }
    }
}

/*********************************
 * GLOBAL INSTANCE AND INITIALIZATION
 *********************************/

// Create global instance immediately
window.apiService = new APIService();

// Auto-run diagnostics when page loads
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 API Service Diagnostic Report:");
    console.log("=================================");
    
    setTimeout(async () => {
        try {
            const status = await window.apiService.getAPIStatus();
            console.log("Authentication:", status.authenticated ? "✅" : "❌");
            console.log("User:", status.userInfo?.email || "Not logged in");
            console.log("API Base URL:", status.baseURL || "❌ Not configured");
            
            if (status.connectionTest) {
                console.log("API Connection:", status.connectionTest.success ? "✅" : "❌");
                if (!status.connectionTest.success) {
                    console.warn("⚠️ Connection failed:", status.connectionTest.message);
                }
            }
        } catch (error) {
            console.error("❌ API Status check failed:", error);
        }
        console.log("=================================");
    }, 1000);
});

// Also make it available for immediate use
console.log("📦 API Service loaded and ready");