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
    })
}