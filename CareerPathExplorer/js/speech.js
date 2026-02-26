class SpeechRecognitionService {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recognition = null;
        
        this.initSpeechRecognition();
        this.initEventListeners();
    }
    
    initSpeechRecognition() {
        // Check for browser support
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                this.updateTranscript(finalTranscript || interimTranscript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.updateStatus(`Error: ${event.error}`, 'error');
                this.stopRecording();
            };
            
            this.recognition.onend = () => {
                if (this.isRecording) {
                    // Restart recording if it was manually stopped
                    this.recognition.start();
                }
            };
        } else {
            console.warn('Speech recognition not supported in this browser');
        }
    }
    
    initEventListeners() {
        const startBtn = document.getElementById('start-recording');
        const stopBtn = document.getElementById('stop-recording');
        const useTranscriptBtn = document.getElementById('use-transcript');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startRecording());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopRecording());
        }
        
        if (useTranscriptBtn) {
            useTranscriptBtn.addEventListener('click', () => this.useTranscriptForAnswer());
        }
    }
    
    startRecording() {
        if (this.recognition) {
            try {
                this.recognition.start();
                this.isRecording = true;
                this.updateStatus('Recording...', 'recording');
                
                document.getElementById('start-recording').disabled = true;
                document.getElementById('stop-recording').disabled = false;
                document.getElementById('use-transcript').disabled = true;
                
                // Clear previous transcript
                this.updateTranscript('Listening...');
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                this.updateStatus('Error starting recording', 'error');
            }
        } else {
            this.startMediaRecording();
        }
    }
    
    startMediaRecording() {
        // Fallback: Record audio and send to AWS Transcribe
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.mediaRecorder = new MediaRecorder(stream);
                this.audioChunks = [];
                
                this.mediaRecorder.ondataavailable = (event) => {
                    this.audioChunks.push(event.data);
                };
                
                this.mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                    
                    // Convert to base64 for AWS Transcribe
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    
                    reader.onloadend = async () => {
                        const base64Audio = reader.result.split(',')[1];
                        
                        try {
                            // Send to AWS Transcribe via our Lambda
                            const response = await fetch(window.API_ENDPOINTS.TRANSCRIBE, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': localStorage.getItem('idToken') || ''
                                },
                                body: JSON.stringify({
                                    audioData: base64Audio,
                                    language: 'en-US'
                                })
                            });
                            
                            const result = await response.json();
                            this.updateTranscript(result.transcript || 'Transcription not available');
                            this.updateStatus('Transcription complete', 'success');
                            
                            document.getElementById('use-transcript').disabled = false;
                        } catch (error) {
                            console.error('Transcription error:', error);
                            this.updateStatus('Transcription failed', 'error');
                        }
                    };
                };
                
                this.mediaRecorder.start();
                this.isRecording = true;
                this.updateStatus('Recording...', 'recording');
                
                document.getElementById('start-recording').disabled = true;
                document.getElementById('stop-recording').disabled = false;
            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
                this.updateStatus('Microphone access denied', 'error');
            });
    }
    
    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        } else if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        this.isRecording = false;
        this.updateStatus('Processing audio...', 'processing');
        
        document.getElementById('start-recording').disabled = false;
        document.getElementById('stop-recording').disabled = true;
    }
    
    updateTranscript(text) {
        const transcriptBox = document.getElementById('transcript');
        if (transcriptBox) {
            transcriptBox.innerHTML = `<p>${text}</p>`;
        }
        
        // Store the latest transcript
        this.currentTranscript = text;
    }
    
    updateStatus(message, status) {
        const statusElement = document.getElementById('recording-status');
        if (statusElement) {
            const icon = statusElement.querySelector('i');
            const text = statusElement.querySelector('span');
            
            text.textContent = message;
            statusElement.className = 'recording-status';
            
            if (status === 'recording') {
                statusElement.classList.add('recording');
                icon.style.color = '#ef4444'; // Red for recording
            } else if (status === 'success') {
                icon.style.color = '#4ade80'; // Green for success
            } else if (status === 'error') {
                icon.style.color = '#ef4444'; // Red for error
            } else if (status === 'processing') {
                icon.style.color = '#f59e0b'; // Orange for processing
            }
        }
    }
    
    useTranscriptForAnswer() {
        if (!this.currentTranscript || this.currentTranscript === 'Listening...') {
            alert('No speech detected. Please try recording again.');
            return;
        }
        
        // Get the current question
        const currentQuestion = document.querySelector('.question-card');
        if (!currentQuestion) return;
        
        // Find text input or textarea for the question
        const textInput = currentQuestion.querySelector('input[type="text"], textarea');
        if (textInput) {
            textInput.value = this.currentTranscript;
            textInput.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            // For multiple choice, try to find the best matching option
            this.matchTranscriptToOptions();
        }
        
        // Show success message
        this.updateStatus('Answer applied successfully!', 'success');
        
        // Disable the use button
        document.getElementById('use-transcript').disabled = true;
    }
    
    matchTranscriptToOptions() {
        const transcript = this.currentTranscript.toLowerCase();
        const answerOptions = document.querySelectorAll('.answer-option');
        
        let bestMatch = null;
        let highestScore = 0;
        
        answerOptions.forEach(option => {
            const optionText = option.querySelector('.option-text').textContent.toLowerCase();
            const words = optionText.split(' ');
            
            let score = 0;
            words.forEach(word => {
                if (transcript.includes(word) && word.length > 3) {
                    score += word.length;
                }
            });
            
            if (score > highestScore) {
                highestScore = score;
                bestMatch = option;
            }
        });
        
        if (bestMatch && highestScore > 5) {
            bestMatch.click();
        } else {
            alert('Could not match speech to any option. Please select manually.');
        }
    }
}

// Initialize speech recognition when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('quiz.html')) {
        window.speechService = new SpeechRecognitionService();
    }
});