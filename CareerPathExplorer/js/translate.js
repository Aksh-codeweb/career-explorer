/**
 * Translation Service using Amazon Translate
 */

const TranslationService = {
    currentLanguage: 'en',
    supportedLanguages: [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
        { code: 'zh', name: '中文' },
        { code: 'ja', name: '日本語' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'ar', name: 'العربية' }
    ],
    
    // Cache for translated content
    cache: {},
    
    // Initialize translation service
    init: function() {
        // Load saved language preference
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && this.supportedLanguages.some(l => l.code === savedLang)) {
            this.currentLanguage = savedLang;
        }
        
        // Update UI to show current language
        this.updateLanguageUI();
        
        console.log('🌐 Translation Service initialized, language:', this.currentLanguage);
    },
    
    // Update language in UI
    updateLanguageUI: function() {
        const langButtons = document.querySelectorAll('.lang-btn, [data-language]');
        langButtons.forEach(btn => {
            if (btn.getAttribute('data-language') === this.currentLanguage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update language dropdown text
        const langDisplay = document.querySelector('.current-language');
        if (langDisplay) {
            const lang = this.supportedLanguages.find(l => l.code === this.currentLanguage);
            langDisplay.textContent = lang ? lang.name : 'English';
        }
    },
    
    // Change language
    changeLanguage: async function(langCode) {
        if (!this.supportedLanguages.some(l => l.code === langCode)) {
            console.error('Unsupported language:', langCode);
            return false;
        }
        
        if (langCode === this.currentLanguage) {
            return true; // Already set
        }
        
        console.log(`🌐 Changing language from ${this.currentLanguage} to ${langCode}`);
        
        // Save preference
        localStorage.setItem('preferredLanguage', langCode);
        this.currentLanguage = langCode;
        
        // Update UI
        this.updateLanguageUI();
        
        // Trigger language change event for components to update
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: langCode } 
        }));
        
        // Reload page to apply translations (simplest approach)
        window.location.reload();
        
        return true;
    },
    
    // Translate text
    async translateText(text, targetLanguage = null) {
        if (!text) return text;
        
        const targetLang = targetLanguage || this.currentLanguage;
        if (targetLang === 'en') return text; // No translation needed
        
        // Check cache
        const cacheKey = `${text}_${targetLang}`;
        if (this.cache[cacheKey]) {
            return this.cache[cacheKey];
        }
        
        try {
            const response = await fetch('https://z8rr97nn06.execute-api.ap-south-1.amazonaws.com/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('idToken')
                },
                body: JSON.stringify({
                    text: text,
                    targetLanguage: targetLang
                })
            });
            
            if (!response.ok) {
                throw new Error(`Translation failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache the result
            this.cache[cacheKey] = data.translatedText;
            
            return data.translatedText;
            
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Return original on error
        }
    },
    
    // Translate a career object
    async translateCareer(career, targetLanguage = null) {
        if (!career) return career;
        
        const targetLang = targetLanguage || this.currentLanguage;
        if (targetLang === 'en') return career; // No translation needed
        
        // Check cache
        const cacheKey = `career_${career.id}_${targetLang}`;
        if (this.cache[cacheKey]) {
            return this.cache[cacheKey];
        }
        
        try {
            const response = await fetch('https://z8rr97nn06.execute-api.ap-south-1.amazonaws.com/translateCareer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('idToken')
                },
                body: JSON.stringify({
                    career: career,
                    targetLanguage: targetLang
                })
            });
            
            if (!response.ok) {
                throw new Error(`Career translation failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache the result
            this.cache[cacheKey] = data.career;
            
            return data.career;
            
        } catch (error) {
            console.error('Career translation error:', error);
            return career; // Return original on error
        }
    },
    
    // Translate multiple careers
    async translateCareers(careers, targetLanguage = null) {
        if (!careers || careers.length === 0) return careers;
        
        const targetLang = targetLanguage || this.currentLanguage;
        if (targetLang === 'en') return careers;
        
        const translatedCareers = [];
        for (const career of careers) {
            const translated = await this.translateCareer(career, targetLang);
            translatedCareers.push(translated);
        }
        
        return translatedCareers;
    },
    
    // Get language name from code
    getLanguageName: function(langCode) {
        const lang = this.supportedLanguages.find(l => l.code === langCode);
        return lang ? lang.name : langCode;
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    TranslationService.init();
});

// Make globally available
window.TranslationService = TranslationService;