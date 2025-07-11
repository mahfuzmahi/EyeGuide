import React, {useEffect, useRef} from "react";

const map = {
    kitchen: ["oven", "sink", "microwave", "refrigerator", "toaster", "faucet"],
    bathroom: ["toilet", "sink", "towel", "bathtub", "shower", "mirror"],
    bedroom: ["bed", "pillow", "blanket", "dresser", "nightstand"],
    livingroom: ["couch", "sofa", "tv", "remote", "coffee table", "lamp", "bookshelf"],
    office: ["keyboard", "laptop", "mouse", "desk", "chair", "monitor"],
}

function SceneryGuesser({detectedObjects, speak}) {
    const lastScene = useRef("");
    const time = useRef(Date.now());

    useEffect(() => {
        if(detectedObjects || detectedObjects.length === 0) {
            return;
        }

        const now = Date.now();
        if(now - time.current < 30000) {
            return;
        }

        const oClass = detectedObjects.map(o => o.class);
        const score = {};

        for(const [s, i] of Object.entries(map)) {
            score[s] = i.filter(item => oClass.includes(item).length);
        }

        const best = Object.entries(score).sort((a,b) => b[1] - a[1]);

        if(best && best[1] >= 2 && best[0] !== lastScene.current) {
            speak(`You seem to be in a ${best[0]}`);
            lastScene.current = best[0];
            time.current = now;
        }
    }, [detectedObjects, speak])
    return null;
}

export default SceneryGuesser;