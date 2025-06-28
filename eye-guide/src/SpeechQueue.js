const q = [];
let time = null;

export const speakObject = (text) => {
    if(!text) {
        return ;
    }
    q.push(text);

    if(time) {
        clearTimeout(time);
    }
    time = setTimeout(() => {
        if(q.length === 0) {
            return;
        }

        const count = {};
        q.forEach(i => {
            if(count[i]) {
                count[i] += 1;
            } else {
                count[i] = 1;
            }
        });

        const p = [];
        for (const key in count) {
            const c = count[key];
            let phrase = c + " " + key;

            if(c > 1) {
                phrase += "s";
            }
            p.push(phrase);
        }

        const utter = new SpeechSynthesisUtterance("You are in front of " + p.join(", "));
        utter.rate = 1;
        window.speechSynthesis.speak(utter);

        q.length = 0;
        time = null;
    }, 5000);
}