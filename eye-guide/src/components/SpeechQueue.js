class SpeechQueue {
    constructor() {
        this.queue = [];
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.voiceSettings =  {
            rate: 0.9,
            pitch: 1.0,
            volume: 1.0,
            voice: null
        };


        this.priorityLevels = {
            EMERGENCY: 0,
            WARNING: 1,
            INFO: 2,
            DEBUG: 3
        };
        this.recentMessage = new Map();
        this.initialVoice();
    }

    updateVoiceSetting(settings) {
        if(settings && settings.speechRate()) {
            this.voiceSettings.rate = settings.speechRate;
        }

        if (settings && settings.speechEnabled !== undefined) {
            if (settings.speechEnabled) {
                this.voiceSettings.volume = 1.0;
            } else {
                this.voiceSettings.volume = 0.0;
            }
        }
    }


    async initialVoice() {
        try {
            const voices = window.speechSynthesis.getVoices();
            if(voices.length > 0) {
                const preferred = voices.find(voice =>
                    voice.lang.includes('en') &&
                    (voice.name.includes('Google') || voice.name.includes('Samantha'))
                ) || voices[0];
                this.voiceSettings.voice = preferred;
            }
        } catch (error) {
            console.warn("Could not initialize voice settings", error);
        }
    }


    isDuplicate(text, priority) {
        const now = Date.now();
        const messageKey = text.toLowerCase().trim();

        for(const [key, timestamp] of this.recentMessage.entries()) {
            if(now - timestamp > 30000) {
                this.recentMessage.delete(key);
            }

            if(this.recentMessage.has(messageKey)) {
                return true;
            }

            if(priority > this.priorityLevels.EMERGENCY) {
                for(const [key] of this.recentMessage.entries()) {
                    if(this.calculateSimilarity(messageKey, key) > 0.7) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
}