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
        if(settings && settings.speechRate) {
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

        this.recentMessage.set(text.toLowerCase().trim(), Date.now());

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

    async speak(sItem) {
        return new Promise((resolve, reject) => {
            try {
                if (this.currentUtterance) {
                    window.speechSynthesis.cancel();
                }

                const utterance = new SpeechSynthesisUtterance(sItem.text);
                utterance.rate = this.voiceSettings.rate;
                utterance.pitch = this.voiceSettings.pitch;
                utterance.volume = this.voiceSettings.volume;
                utterance.voice = this.voiceSettings.voice;

                utterance.onend = () => {
                    this.currentUtterance = null;
                    resolve();
                };

                utterance.onerror = (error) => {
                    this.currentUtterance = null;
                    console.error('Speech synthesis error:', error);
                    reject(error);
                };

                this.currentUtterance = utterance;
                window.speechSynthesis.speak(utterance);
            } catch (error) {
                console.error('Error creating speech utterance:', error);
                reject(error);
            }
        });
    }

    async processQueue() {
        if(this.isSpeaking || this.queue.length === 0) {
            return;
        }

        this.isSpeaking = true;

        while(this.queue.length > 0) {
            const sItem = this.queue.shift();
            try {
                await this.speak(sItem);

                if(this.queue.length > 0 && sItem.priority > this.priorityLevels.EMERGENCY) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error('Error processing speech item:', error);
            }
        }
        this.isSpeaking = false;
    }

    describeRelation = (object) => {
        if(!object || object.length < 2) {
            return [];
        }
    
        const sentence = [];
        const set = new Set();
    
        for(let i = 0; i < object.length; i++) {
            for(let j = i + 1; j < object.length; j++) {
                const a = object[i];
                const b = object[j];
    
                const [ax, ay, aw, ah] = a.bbox;
                const [bx, by, bw, bh] = b.bbox;
    
                const aCX = ax + aw / 2;
                const bCX = bx + bw / 2;
    
                const aCY = ay + ah / 2;
                const bCY = by + bh / 2;
    
                const dx = Math.abs(aCX - bCX);
                const dy = Math.abs(aCY - bCY);
    
                if (dx < 100 && dy < 50) {
                    const key = `${a.class}-next-${b.class}`;
    
                    if (!set.has(key)) {
                        sentence.push(`${a.class} is next to ${b.class}`);
                        set.add(key);
                    }
                }
    
                if (dx < 100 && dy > 50 && aCY < bCY) {
                    const key = `${a.class}-under-${b.class}`;
    
                    if (!set.has(key)) {
                        sentence.push(`${a.class} is under ${b.class}`);
                        set.add(key);
                    }
                }
    
                if (dx < 100 && dy > 50 && aCY > bCY) {
                    const key = `${a.class}-above-${b.class}`;
                   
                    if (!set.has(key)) {
                        sentence.push(`${a.class} is above ${b.class}`);
                        set.add(key);
                    }
                }
            }
        }
        return sentence;
    };
    
    estimateDistance = (width, height) => {
        const area = width * height;
        if (area > 100000) return "very close";
        if (area > 50000) return "close";
        if (area > 20000) return "moderate distance";
        return "far";
    };
    
    describeObject = (object) => {
        const [x, y, w, h] = object.bbox;
        const distance = this.estimateDistance(w, h);
        const area = w * h;
        
        let description = `${object.class}`;
        
        description += ` is ${distance}`;

        if (area > 80000) {
            description += " and appears large";
        } else if (area < 10000) {
            description += " and appears small";
        }
        
        const centerX = x + w / 2;
        if (centerX < 0.33) {
            description += " to your left";
        } else if (centerX > 0.67) {
            description += " to your right";
        } else {
            description += " ahead";
        }
        
        return description;
    };
    
    updateSpeechSettings = (settings) => {
        this.updateVoiceSetting(settings);
    };

    stopSpeaking() {
        if (this.currentUtterance) {
            window.speechSynthesis.cancel();
            this.currentUtterance = null;
        }
        this.isSpeaking = false;
    }

    clearQueue() {
        this.queue = [];
        this.stopSpeaking();
    }

    getQueueStatus() {
        return {
            isSpeaking: this.isSpeaking,
            queueLength: this.queue.length,
            currentUtterance: this.currentUtterance ? this.currentUtterance.text : null
        };
    }
}

export default SpeechQueue;   