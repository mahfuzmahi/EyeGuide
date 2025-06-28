import React from "react";

const q = [];
const time = null;

export const speakObject = (t, r = 1) => {
    if(!t) {
        return ;
    }
    q.push(t);

    if(t) {
        clearTimeout(t);
    }
    t = setTimeout(() => {
        if(q.length === 0) {
            return;
        }

        const count = {};
        q.forEach(t => {
            count[t] = (count[t] || 0) + 1;
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
    }, timeout);
}