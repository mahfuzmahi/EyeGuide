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
            const dy = Math.abs(bCX - bCY);

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