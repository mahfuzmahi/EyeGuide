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

    calculateSimilarity(s1, s2) {
        const w1 = s1.split(' ');
        const w2 = s2.split(' ');
        const common =  w1.filter(word => w2.includes(word));

        return common.length / Math.max(w1.length, w2.length); 
    }

    addToQueue(text, priority = this.priorityLevels.INFO) {
        if(!text || text.trim() === '') {
            return;
        }

        if(this.isDuplicate(text, priority)) {
            return;
        }

        const sItem = {
            text: text.trim(),
            priority: priority,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        };

        this.recentMessage.set(text.toLowerCase().trim, Date.now());

        const insertIndex = this.queue.findIndex(item => item.priority > priority);

        if(insertIndex === -1) {
            this.queue.push(sItem);
        } else {
            this.queue.splice(insertIndex, 0, sItem);
        }

        if(this.queue.length > 10) {
            this.queue = this.queue.slice(0, 10);
        }
        
        this.processQueue();
    }

    async processQueue() {
        if(this.isSpeaking || this.queue.length === 0) {
            return;
        }

        this.isSpeaking = true;

        while(this.queue.length > 0) {
            const sItem = this.queue.shift();
            await this.speak(sItem);

            if(this.queue.length > 0 && sItem.priority > this.priorityLevels.EMERGENCY) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        this.isSpeaking = false;
    }

    async speak(sItem) {
        return new Promise(resolve => {
            try {
                if(sItem.priority === this.priorityLevels.EMERGENCY) {
                    window.speechSynthesis.cancel();
                }

                const utter = new SpeechSynthesisUtterance(sItem.text);

                utter.rate = this.voiceSettings.rate;
                utter.pitch = this.voiceSettings.pitch;
                utter.volume = this.voiceSettings.volume;

                switch(sItem.priority) {
                    case this.priorityLevels.EMERGENCY:
                        utter.rate = 0.8;
                        utter.volume = 1.0;
                        break;
                    case this.priorityLevels.WARNING:
                        utter.rate = 0.85;
                        utter.volume = 0.9;
                        break;
                    case this.priorityLevels.INFO:
                        utter.rate = 0.9;
                        utter.rate = 0.8;
                        break;
                    case this.priorityLevels.DEBUG:
                        utter.rate = 1.0;
                        utter.volume = 0.7;
                        break;
                }

                utter.onend = () => {
                    this.currentUtterance = null;
                    resolve();
                }

                utter.onerror = (error) => {
                    console.error("SpeechSynth error", error);
                    this.currentUtterance = null;
                    resolve();
                };

                this.currentUtterance = utter;
                window.speechSynthesis.speak(utter);
            } catch (error) {
                console.error("Error creating speech utterance", error);
                resolve();
            }
        });
    }

    clearQueue() {
        this.queue = [];
        
        if(this.currentUtterance) {
            window.speechSynthesis.cancel();
            this.currentUtterance = null;
        }
        this.isSpeaking = false;
    }

    pause() {
       if (this.currentUtterance) {
           window.speechSynthesis.pause();
       }
   }

   resume() {
       if (this.currentUtterance) {
           window.speechSynthesis.resume();
       }
   }

   stop() {
       window.speechSynthesis.cancel();
       this.clearQueue();
   }

   mute() {
       this.voiceSettings.volume = 0;
   }

   unmute() {
       this.voiceSettings.volume = 1.0;
   }

   getStatus() {
       return {
            isSpeaking: this.isSpeaking,
            queueLength: this.queue.length,
            currentText: this.currentUtterance && this.currentUtterance.text
       };
    }
}