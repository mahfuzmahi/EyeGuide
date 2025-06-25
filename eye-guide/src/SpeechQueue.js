import React from "react";

const q = [];

export const speakObject = (t, r = 1) => {
    if(window.speechSynthesis.speaking || q.includes(t)) {
        return;
    }

    q.push(t);
    const utter = new SpeechSynthesisUtterance(t);
    utter.rate = r;

    utter.onend = () => {
        q.shift();
    };

    window.speechSynthesis.speak(utter);
}