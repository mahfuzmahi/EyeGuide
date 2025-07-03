export const speakObject = (text) => {
    if (!text) {
        return;
    }

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.1;
    utter.pitch = 1.1;
    window.speechSynthesis.speak(utter);
};

export const describeRelation = (object) => {
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
            const dy = Math.abs(bCX - bCx);

        }
    }
}