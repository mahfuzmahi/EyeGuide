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
}