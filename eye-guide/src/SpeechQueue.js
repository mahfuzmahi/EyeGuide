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
        queue.forEach(t => {
            count[t] = (count[t] || 0) + 1;
        });
    }, timeout);
}